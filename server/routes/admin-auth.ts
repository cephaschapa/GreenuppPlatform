import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { users, loginAttempts } from "@shared/schema";
import { AuthService } from "../services/authService.js";
import { logger } from "../lib/logger.js";

const router = Router();

// Admin login validation schema
const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  adminCode: z.string().optional(),
});

// Predefined admin users (you can expand this or move to database)
const ADMIN_USERS = [
  {
    email: "cephaschapa@gmail.com",
    password: "D@abase1", // In production, this should be hashed
    role: "admin",
    username: "cephaschapa",
    firstName: "Cephas",
    lastName: "Chapa",
  },
  {
    email: "kefas.chapa@gmail.com",
    password: "D@abase1", // In production, this should be hashed
    role: "admin",
    username: "kefas.chapa",
    firstName: "Kefas",
    lastName: "Chapa",
  },
  // Add more admin users as needed
];

// Optional admin codes for extra security
const VALID_ADMIN_CODES = ["GREENUPP2024", "ADMIN_ACCESS"];

/**
 * POST /api/admin/auth/login
 * Admin-specific login with enhanced security
 */
router.post("/login", async (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress || "unknown";
  const userAgent = req.get("User-Agent") || "unknown";

  try {
    // Validate request body
    const { email, password, adminCode } = adminLoginSchema.parse(req.body);

    logger.info(`Admin login attempt from ${clientIp} for ${email}`);

    // Check if user exists in predefined admin list
    const adminUser = ADMIN_USERS.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    if (!adminUser) {
      // Log failed attempt
      logger.warn(
        `Admin login failed - user not found: ${email} from ${clientIp}`
      );

      // Record failed login attempt
      try {
        await db.insert(loginAttempts).values({
          email,
          ipAddress: clientIp,
          userAgent,
          success: false,
          failureReason: "Admin user not found",
          attemptedAt: new Date(),
        });
      } catch (dbError) {
        logger.error("Failed to record login attempt:", dbError);
      }

      return res.status(401).json({
        message: "Invalid administrator credentials",
      });
    }

    // Verify password (in production, use proper password hashing)
    const isPasswordValid = password === adminUser.password;

    if (!isPasswordValid) {
      logger.warn(
        `Admin login failed - invalid password for ${email} from ${clientIp}`
      );

      // Record failed login attempt
      try {
        await db.insert(loginAttempts).values({
          email,
          ipAddress: clientIp,
          userAgent,
          success: false,
          failureReason: "Invalid password",
          attemptedAt: new Date(),
        });
      } catch (dbError) {
        logger.error("Failed to record login attempt:", dbError);
      }

      return res.status(401).json({
        message: "Invalid administrator credentials",
      });
    }

    // Check admin code if provided
    if (adminCode && !VALID_ADMIN_CODES.includes(adminCode)) {
      logger.warn(
        `Admin login failed - invalid admin code for ${email} from ${clientIp}`
      );

      return res.status(401).json({
        message: "Invalid admin access code",
      });
    }

    // Check if user exists in database, create if not
    let dbUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (dbUser.length === 0) {
      // Create admin user in database
      const hashedPassword = await AuthService.hashPassword(password);

      const [newUser] = await db
        .insert(users)
        .values({
          email: adminUser.email,
          username: adminUser.username,
          password: hashedPassword,
          role: "admin",
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
        })
        .returning();

      dbUser = [newUser];
      logger.info(`Created admin user in database: ${email}`);
    } else {
      // Update user role to admin if not already
      if (dbUser[0].role !== "admin") {
        await db
          .update(users)
          .set({ role: "admin" })
          .where(eq(users.id, dbUser[0].id));

        dbUser[0].role = "admin";
        logger.info(`Updated user role to admin: ${email}`);
      }
    }

    // Handle device session (remove existing session with same ID, then create new one)
    try {
      // First, try to revoke any existing session with the same session ID
      await AuthService.revokeDeviceSession(req.sessionID);
    } catch (error) {
      // Ignore errors if session doesn't exist
      logger.debug(`No existing session to revoke: ${req.sessionID}`);
    }

    // Create device session (30 days expiration for admin sessions)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    try {
      await AuthService.createDeviceSession(
        dbUser[0].id,
        req.sessionID,
        {
          userAgent,
          ipAddress: clientIp,
        },
        expiresAt
      );
    } catch (deviceSessionError) {
      logger.warn(
        `Device session creation failed, continuing with login: ${deviceSessionError.message}`
      );
      // Don't fail the login if device session creation fails
    }

    // Record successful login
    try {
      await db.insert(loginAttempts).values({
        userId: dbUser[0].id,
        email,
        ipAddress: clientIp,
        userAgent,
        success: true,
        attemptedAt: new Date(),
      });
    } catch (dbError) {
      logger.error("Failed to record successful login attempt:", dbError);
    }

    // Set session
    req.session.userId = dbUser[0].id;
    req.session.user = {
      id: dbUser[0].id,
      username: dbUser[0].username,
      email: dbUser[0].email,
      role: dbUser[0].role,
      firstName: dbUser[0].firstName,
      lastName: dbUser[0].lastName,
    };

    logger.info(`Admin login successful for ${email} from ${clientIp}`);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = dbUser[0];

    res.json({
      message: "Admin login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: error.errors,
      });
    }

    logger.error("Admin login error:", error);

    // Record failed attempt due to system error
    try {
      await db.insert(loginAttempts).values({
        email: req.body.email || "unknown",
        ipAddress: clientIp,
        userAgent,
        success: false,
        failureReason: "System error",
        attemptedAt: new Date(),
      });
    } catch (dbError) {
      logger.error("Failed to record login attempt:", dbError);
    }

    res.status(500).json({
      message: "Internal server error during admin authentication",
    });
  }
});

/**
 * POST /api/admin/auth/logout
 * Admin logout
 */
router.post("/logout", async (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress || "unknown";

  try {
    if (req.session.userId) {
      logger.info(
        `Admin logout for user ${req.session.userId} from ${clientIp}`
      );

      // Revoke device session
      if (req.sessionID) {
        await AuthService.revokeDeviceSession(req.sessionID);
      }
    }

    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        logger.error("Error destroying admin session:", err);
        return res.status(500).json({ message: "Error during logout" });
      }

      res.json({ message: "Admin logout successful" });
    });
  } catch (error) {
    logger.error("Admin logout error:", error);
    res.status(500).json({ message: "Error during admin logout" });
  }
});

/**
 * GET /api/admin/auth/status
 * Check admin authentication status
 */
router.get("/status", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        authenticated: false,
        message: "Not authenticated",
      });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, req.session.userId))
      .limit(1);

    if (user.length === 0 || user[0].role !== "admin") {
      return res.status(401).json({
        authenticated: false,
        message: "Not authorized for admin access",
      });
    }

    const { password: _, ...userWithoutPassword } = user[0];

    res.json({
      authenticated: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    logger.error("Admin auth status check error:", error);
    res.status(500).json({
      authenticated: false,
      message: "Error checking authentication status",
    });
  }
});

export default router;
