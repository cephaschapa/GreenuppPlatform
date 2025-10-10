import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage.js";
import { User, UserRoleType } from "@shared/schema";
import { logger } from "./lib/logger.js";
import { AuthService } from "./services/authService.js";

// Add passport session type
declare module "express-session" {
  interface SessionData {
    passport: {
      user: number; // User ID stored in session
    };
    // Admin session properties
    userId?: number;
    user?: {
      id: number;
      username: string;
      email: string;
      role: string;
      firstName?: string;
      lastName?: string;
    };
  }
}

// Define a specific interface for Express User to avoid circular reference
interface ExpressUser {
  id: number;
  email: string;
  username: string;
  role: UserRoleType;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    interface User extends ExpressUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Hash a password with a random salt
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Compare a password against a stored hashed password
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Setup authentication middleware and routes
export function setupAuth(app: Express) {
  // Configure session settings
  logger.info(
    "Setting up authentication with session store:",
    !!storage.sessionStore
  );

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "greenupp-secret-key",
    resave: true,
    saveUninitialized: true,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: false, // Set to false for development environment even if NODE_ENV=production
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    },
  };

  // Trust the first proxy in production environments
  app.set("trust proxy", 1);

  // Setup session middleware
  logger.info("Initializing session middleware with the following settings:");
  logger.info(
    "- Secret length:",
    (process.env.SESSION_SECRET || "greenupp-secret-key").length
  );
  logger.info("- Cookie secure:", sessionSettings.cookie?.secure);
  logger.info("- Cookie sameSite:", sessionSettings.cookie?.sameSite);

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Debug middleware to log session info on each request
  app.use((req, res, next) => {
    // Skip authentication logging for health check endpoints
    if (req.path.startsWith("/api/health")) {
      return next();
    }

    // Only log authentication failures for API routes
    if (req.path.startsWith("/api/") && req.path !== "/api/user") {
      // Skip logging for most API routes to reduce noise
      return next();
    }
    next();
  });

  // Configure local strategy for username/password login
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email", // This can be email or username
        passwordField: "password",
      },
      async (emailOrUsername, password, done) => {
        try {
          // Try to find user by email first
          let user = await storage.getUserByEmail(emailOrUsername);

          // If not found by email, try by username
          if (!user) {
            user = await storage.getUserByUsername(emailOrUsername);
          }

          if (!user) {
            return done(null, false, {
              message: "No account found with that email or username",
            });
          }

          // Check if account is locked
          const isLocked = await AuthService.isAccountLocked(user.id);
          if (isLocked) {
            const remainingTime = await AuthService.getRemainingLockTime(
              user.id
            );
            const minutes = remainingTime ? Math.ceil(remainingTime / 60) : 15;
            return done(null, false, {
              message: `Account temporarily locked due to too many failed login attempts. Try again in ${minutes} minutes.`,
              accountLocked: true,
              remainingTime: remainingTime,
            } as any);
          }

          // Verify password
          const passwordValid = await AuthService.comparePasswords(
            password,
            user.password
          );
          if (!passwordValid) {
            // Record failed attempt
            await AuthService.recordFailedLoginAttempt(user.id);
            return done(null, false, { message: "Incorrect password" });
          }

          // Clear any failed attempts on successful login
          await AuthService.clearFailedLoginAttempts(user.id);

          // Check if email is verified
          if (!user.emailVerified) {
            return done(null, false, {
              message: "Please verify your email address before logging in",
              requiresEmailVerification: true,
              email: user.email,
            } as any);
          }

          return done(null, user as unknown as Express.User);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Configure Google OAuth strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    logger.info("✅ Google OAuth credentials found, registering strategy");
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists with this Google account
            let user = await AuthService.findUserByOAuthProvider(
              "google",
              profile.id
            );

            if (user) {
              return done(null, user as unknown as Express.User);
            }

            // Check if user exists with the same email
            if (profile.emails && profile.emails[0]) {
              user =
                (await storage.getUserByEmail(profile.emails[0].value)) || null;

              if (user) {
                // Link existing account to Google
                await AuthService.linkOAuthProvider(user.id, {
                  provider: "google",
                  providerUserId: profile.id,
                  providerEmail: profile.emails[0].value,
                  providerName: profile.displayName,
                  providerPicture: profile.photos?.[0]?.value,
                  accessToken,
                  refreshToken,
                });

                return done(null, user as unknown as Express.User);
              }
            }

            // Create new user
            const username =
              profile.displayName?.replace(/\s+/g, "").toLowerCase() ||
              `user${Date.now()}`;

            user = await storage.createUser({
              username,
              email: profile.emails?.[0]?.value || `${profile.id}@google.com`,
              password: await AuthService.hashPassword(
                Math.random().toString(36)
              ), // Random password
              firstName: profile.name?.givenName,
              lastName: profile.name?.familyName,
              role: "farmer",
            });

            // Link OAuth provider
            await AuthService.linkOAuthProvider(user.id, {
              provider: "google",
              providerUserId: profile.id,
              providerEmail: profile.emails?.[0]?.value || "",
              providerName: profile.displayName,
              providerPicture: profile.photos?.[0]?.value,
              accessToken,
              refreshToken,
            });

            return done(null, user as unknown as Express.User);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  } else {
    logger.warn(
      "⚠️ Google OAuth credentials not found, skipping strategy registration"
    );
    logger.info(
      "To enable Google OAuth, set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables"
    );
  }

  // Configure Facebook OAuth strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    logger.info("✅ Facebook OAuth credentials found, registering strategy");
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: "/api/auth/facebook/callback",
          profileFields: ["id", "emails", "name", "picture"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists with this Facebook account
            let user = await AuthService.findUserByOAuthProvider(
              "facebook",
              profile.id
            );

            if (user) {
              return done(null, user as unknown as Express.User);
            }

            // Check if user exists with the same email
            if (profile.emails && profile.emails[0]) {
              user =
                (await storage.getUserByEmail(profile.emails[0].value)) || null;

              if (user) {
                // Link existing account to Facebook
                await AuthService.linkOAuthProvider(user.id, {
                  provider: "facebook",
                  providerUserId: profile.id,
                  providerEmail: profile.emails[0].value,
                  providerName: `${profile.name?.givenName} ${profile.name?.familyName}`,
                  providerPicture: profile.photos?.[0]?.value,
                  accessToken,
                  refreshToken,
                });

                return done(null, user as unknown as Express.User);
              }
            }

            // Create new user
            const username =
              `${profile.name?.givenName}${profile.name?.familyName}`.toLowerCase() ||
              `user${Date.now()}`;

            user = await storage.createUser({
              username,
              email: profile.emails?.[0]?.value || `${profile.id}@facebook.com`,
              password: await AuthService.hashPassword(
                Math.random().toString(36)
              ), // Random password
              firstName: profile.name?.givenName,
              lastName: profile.name?.familyName,
              role: "farmer",
            });

            // Link OAuth provider
            await AuthService.linkOAuthProvider(user.id, {
              provider: "facebook",
              providerUserId: profile.id,
              providerEmail: profile.emails?.[0]?.value || "",
              providerName: `${profile.name?.givenName} ${profile.name?.familyName}`,
              providerPicture: profile.photos?.[0]?.value,
              accessToken,
              refreshToken,
            });

            return done(null, user as unknown as Express.User);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  } else {
    logger.warn(
      "⚠️ Facebook OAuth credentials not found, skipping strategy registration"
    );
    logger.info(
      "To enable Facebook OAuth, set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET environment variables"
    );
  }

  // Serialize user to session
  passport.serializeUser((user: Express.User, done) => {
    const typedUser = user as unknown as User;
    done(null, typedUser.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);

      if (user) {
        // Ensure we're using the proper User type with valid UserRoleType
        done(null, user as unknown as Express.User);
      } else {
        logger.warn(`User with ID ${id} not found during deserialization`);
        done(null, null);
      }
    } catch (error: any) {
      // Use any to avoid TypeScript errors
      logger.error(
        `Error deserializing user: ${error?.message || "Unknown error"}`
      );
      done(error);
    }
  });

  // Middleware to restrict access to authenticated users
  function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  }

  // User registration route
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(
        req.body.username
      );
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Hash password and create new user
      const hashedPassword = await AuthService.hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      // Send response immediately - don't wait for email
      res.status(201).json({
        message:
          "Registration successful! Please check your email to verify your account before logging in.",
        requiresEmailVerification: true,
        email: user.email,
      });

      // Send verification email in background (non-blocking)
      const sendVerificationEmailAsync = async () => {
      try {
        const verificationToken =
          await AuthService.generateEmailVerificationToken(user.id);

        // Determine frontend URL for verification link
        const isDevelopment = process.env.NODE_ENV !== "production";
        let frontendUrl;

        if (isDevelopment) {
          const protocol = req.secure ? "https" : "http";
          const host = req.get("host") || "localhost:3001";
          frontendUrl =
            host.includes("localhost") || host.includes("127.0.0.1")
              ? "http://localhost:3001"
              : `${protocol}://${host}`;
        } else {
          frontendUrl =
            process.env.FRONTEND_URL ||
            "https://greenuppplatform-production.up.railway.app";
        }

        const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
          
          // Set a timeout for email sending
          await Promise.race([
            AuthService.sendVerificationEmail(user.email, verificationUrl),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error("Email timeout after 15s")), 15000)
            )
          ]);
          
          logger.info(`Verification email sent to ${user.email}`);
      } catch (emailError) {
        logger.error("Failed to send verification email:", emailError);
          // Email failure doesn't affect registration - user is already created
        }
      };

      // Fire and forget - don't await
      sendVerificationEmailAsync();
    } catch (error) {
      next(error);
    }
  });

  // User login route
  app.post("/api/login", (req, res, next) => {
    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: User | false,
        info: { message: string } | undefined
      ) => {
        if (err) {
          logger.error("Login error:", err);
          return next(err);
        }

        if (!user) {
          logger.warn("Login failed:", info?.message || "Invalid credentials");

          // Check if it's an email verification issue
          if ((info as any)?.requiresEmailVerification) {
            return res.status(401).json({
              message: info?.message || "Email verification required",
              requiresEmailVerification: true,
              email: (info as any)?.email,
            });
          }

          // Check if account is locked
          if ((info as any)?.accountLocked) {
            return res.status(423).json({
              message: info?.message || "Account temporarily locked",
              accountLocked: true,
              remainingTime: (info as any)?.remainingTime,
            });
          }

          return res
            .status(401)
            .json({ message: info?.message || "Login failed" });
        }

        req.login(user as unknown as Express.User, (loginErr) => {
          if (loginErr) {
            logger.error("Login session error:", loginErr);
            return next(loginErr);
          }

          // Remove password from response
          const { password, ...userWithoutPassword } = user;

          // Set a special cookie to track session issues
          res.cookie("greenupp_auth_check", "true", {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: false, // Allow JavaScript to read this cookie for debugging
          });

          res.json(userWithoutPassword);
        });
      }
    )(req, res, next);
  });

  // User logout route
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        logger.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }

      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // Get current authenticated user
  app.get("/api/user", (req, res) => {
    // Check for regular Passport authentication
    if (req.isAuthenticated()) {
      // Remove password from response
      const { password, ...userWithoutPassword } = req.user as User;
      return res.json(userWithoutPassword);
    }

    // Check for admin session authentication
    if (req.session && req.session.userId && req.session.user) {
      // Admin session exists, return the user data
      return res.json(req.session.user);
    }

    // No authentication found
    return res.status(401).json({ message: "Not authenticated" });
  });

  // Change password route
  app.post("/api/change-password", isAuthenticated, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          message: "Current password and new password are required",
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          message: "New password must be at least 8 characters long",
        });
      }

      // Get the current user with password
      const user = await storage.getUser((req.user as User).id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isCurrentPasswordValid = await AuthService.comparePasswords(
        currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      // Hash the new password
      const hashedNewPassword = await AuthService.hashPassword(newPassword);

      // Update the user's password
      await storage.updateUser((req.user as User).id, {
        password: hashedNewPassword,
      });

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      logger.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Return the middleware for use in other routes
  return { isAuthenticated };
}
