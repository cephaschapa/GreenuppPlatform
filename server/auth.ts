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

    if (req.path.startsWith("/api/")) {
      logger.info(`Authentication status for ${req.method} ${req.path}:`, {
        hasSession: !!req.session,
        isAuthenticated: req.isAuthenticated?.() || false,
        sessionID: req.sessionID,
      });
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

          if (
            !user ||
            !(await AuthService.comparePasswords(password, user.password))
          ) {
            return done(null, false, { message: "Invalid credentials" });
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
              user = await storage.getUserByEmail(profile.emails[0].value);

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
              user = await storage.getUserByEmail(profile.emails[0].value);

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
      logger.info(`Deserializing user with ID: ${id}`);
      const user = await storage.getUser(id);

      if (user) {
        logger.info(
          `User found during deserialization: ${user.username} (${user.id})`
        );
        // Ensure we're using the proper User type with valid UserRoleType
        done(null, user as unknown as Express.User);
      } else {
        logger.warn(`⚠️ User with ID ${id} not found during deserialization`);
        done(null, null);
      }
    } catch (error: any) {
      // Use any to avoid TypeScript errors
      logger.error(
        `❌ Error deserializing user: ${error?.message || "Unknown error"}`
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

      // Automatically log the user in after registration
      req.login(user as unknown as Express.User, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  // User login route
  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt:", { email: req.body.email });
    console.log("- Session ID (pre-auth):", req.sessionID);

    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: User | false,
        info: { message: string } | undefined
      ) => {
        if (err) {
          console.log("Login error:", err);
          return next(err);
        }

        if (!user) {
          console.log("Login failed:", info);
          return res
            .status(401)
            .json({ message: info?.message || "Login failed" });
        }

        console.log("User authenticated successfully:", {
          id: user.id,
          username: user.username,
        });

        req.login(user as unknown as Express.User, (loginErr) => {
          if (loginErr) {
            console.log("Login session error:", loginErr);
            return next(loginErr);
          }

          console.log("Session established:");
          console.log("- Session ID:", req.sessionID);
          console.log("- Session cookie:", req.headers.cookie);
          console.log("- Session user:", (req.session as any)?.passport?.user);

          // Remove password from response
          const { password, ...userWithoutPassword } = user;

          // Set a special cookie to track session issues
          res.cookie("greenupp_auth_check", "true", {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: false, // Allow JavaScript to read this cookie for debugging
          });

          console.log("Login successful, returning user data");
          res.json(userWithoutPassword);
        });
      }
    )(req, res, next);
  });

  // User logout route
  app.post("/api/logout", (req, res) => {
    console.log("Logout attempt:");
    console.log("- Session ID:", req.sessionID);
    console.log("- Is authenticated:", req.isAuthenticated());

    if (req.user) {
      console.log("- User being logged out:", {
        id: (req.user as User).id,
        username: (req.user as User).username,
      });
    } else {
      console.log("- No user found in session");
    }

    req.logout((err) => {
      if (err) {
        console.log("❌ Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }

      console.log("✅ User successfully logged out");
      console.log(
        "- Session after logout, isAuthenticated:",
        req.isAuthenticated()
      );
      console.log(
        "- Session user after logout:",
        (req.session as any)?.passport?.user
      );

      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // Get current authenticated user
  app.get("/api/user", (req, res) => {
    // Enhanced debugging always enabled for now
    console.log("GET /api/user - Debug info:");
    console.log("- Session ID:", req.sessionID);
    console.log("- Is authenticated:", req.isAuthenticated());
    console.log("- Session cookie:", req.headers.cookie);

    if (req.session) {
      console.log("- Session exists:", true);
      console.log("- Session user:", (req.session as any)?.passport?.user);
      console.log("- Session cookie maxAge:", req.session.cookie?.maxAge);
    } else {
      console.log("- Session exists:", false);
    }

    if (!req.isAuthenticated()) {
      console.log("- Authentication status: FAILED");
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as User;

    console.log("- Authentication status: SUCCESS");
    console.log("- User found:", {
      id: userWithoutPassword.id,
      username: userWithoutPassword.username,
    });

    res.json(userWithoutPassword);
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
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Return the middleware for use in other routes
  return { isAuthenticated };
}
