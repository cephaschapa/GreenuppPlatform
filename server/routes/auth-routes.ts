import { Router, Request, Response, NextFunction } from "express";
import passport from "passport";
import { AuthService } from "../services/authService.js";
import { storage } from "../storage.js";
import { User } from "@shared/schema";
import { logger } from "../lib/logger.js";
import speakeasy from "speakeasy";

const router = Router();

// Helper function to get client IP
function getClientIP(req: Request): string {
  return (
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection as any).socket?.remoteAddress ||
    "unknown"
  );
}

// Helper function to get device info
function getDeviceInfo(req: Request) {
  const userAgent = req.headers["user-agent"] || "";
  const parsed = AuthService.parseUserAgent(userAgent);

  return {
    deviceType: parsed.deviceType,
    browser: parsed.browser,
    os: parsed.os,
    ipAddress: getClientIP(req),
    userAgent,
  };
}

// Enhanced login with 2FA support
router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, twoFactorToken, backupCode } = req.body;
    const ipAddress = getClientIP(req);
    const userAgent = req.headers["user-agent"] || "";

    try {
      // Find user by email or username
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.getUserByUsername(email);
      }

      if (!user) {
        await AuthService.recordLoginAttempt({
          email,
          ipAddress,
          userAgent,
          success: false,
          failureReason: "user_not_found",
          provider: "local",
        });

        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isPasswordValid = await AuthService.comparePasswords(
        password,
        user.password
      );
      if (!isPasswordValid) {
        await AuthService.recordLoginAttempt({
          userId: user.id,
          email,
          ipAddress,
          userAgent,
          success: false,
          failureReason: "invalid_password",
          provider: "local",
        });

        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if 2FA is enabled
      const is2FAEnabled = await AuthService.is2FAEnabled(user.id);

      if (is2FAEnabled) {
        if (!twoFactorToken && !backupCode) {
          await AuthService.recordLoginAttempt({
            userId: user.id,
            email,
            ipAddress,
            userAgent,
            success: false,
            failureReason: "2fa_required",
            provider: "local",
          });

          return res.status(401).json({
            message: "Two-factor authentication required",
            requires2FA: true,
          });
        }

        let is2FAValid = false;
        if (twoFactorToken) {
          is2FAValid = await AuthService.verify2FA(user.id, twoFactorToken);
        } else if (backupCode) {
          is2FAValid = await AuthService.verifyBackupCode(user.id, backupCode);
        }

        if (!is2FAValid) {
          await AuthService.recordLoginAttempt({
            userId: user.id,
            email,
            ipAddress,
            userAgent,
            success: false,
            failureReason: "invalid_2fa",
            provider: "local",
          });

          return res
            .status(401)
            .json({ message: "Invalid two-factor authentication code" });
        }
      }

      // Login successful
      req.login(user as any, async (err) => {
        if (err) return next(err);

        // Create device session
        const deviceInfo = getDeviceInfo(req);
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

        await AuthService.createDeviceSession(
          user.id,
          req.sessionID!,
          deviceInfo,
          expiresAt
        );

        // Record successful login
        await AuthService.recordLoginAttempt({
          userId: user.id,
          email,
          ipAddress,
          userAgent,
          success: true,
          provider: "local",
        });

        // Log security event
        await AuthService.logSecurityEvent(
          user.id,
          "login_success",
          "User logged in successfully",
          ipAddress,
          userAgent
        );

        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    } catch (error) {
      logger.error("Login error:", error);
      next(error);
    }
  }
);

// OAuth routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth?error=oauth_failed",
  }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as User;
      const deviceInfo = getDeviceInfo(req);
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await AuthService.createDeviceSession(
        user.id,
        req.sessionID!,
        deviceInfo,
        expiresAt
      );

      await AuthService.logSecurityEvent(
        user.id,
        "oauth_login",
        "User logged in via Google OAuth",
        getClientIP(req),
        req.headers["user-agent"]
      );

      res.redirect("/dashboard");
    } catch (error) {
      logger.error("Google OAuth callback error:", error);
      res.redirect("/auth?error=oauth_failed");
    }
  }
);

router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
  })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/auth?error=oauth_failed",
  }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as User;
      const deviceInfo = getDeviceInfo(req);
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await AuthService.createDeviceSession(
        user.id,
        req.sessionID!,
        deviceInfo,
        expiresAt
      );

      await AuthService.logSecurityEvent(
        user.id,
        "oauth_login",
        "User logged in via Facebook OAuth",
        getClientIP(req),
        req.headers["user-agent"]
      );

      res.redirect("/dashboard");
    } catch (error) {
      logger.error("Facebook OAuth callback error:", error);
      res.redirect("/auth?error=oauth_failed");
    }
  }
);

// 2FA routes
router.post("/2fa/setup", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const user = req.user as User;
    const { secret, qrCode } = await AuthService.generate2FASecret(user.id);
    const backupCodes = AuthService.generateBackupCodes();

    res.json({
      secret,
      qrCode,
      backupCodes,
    });
  } catch (error) {
    logger.error("2FA setup error:", error);
    res.status(500).json({ message: "Failed to setup 2FA" });
  }
});

// Get 2FA status
router.get("/2fa/status", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const user = req.user as User;
    const isEnabled = await AuthService.is2FAEnabled(user.id);

    res.json({
      isEnabled,
      userId: user.id,
    });
  } catch (error) {
    logger.error("2FA status error:", error);
    res.status(500).json({ message: "Failed to get 2FA status" });
  }
});

router.post("/2fa/enable", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const user = req.user as User;
    const { secret, backupCodes, token } = req.body;

    logger.info(`2FA enable attempt for user ${user.id}, token: ${token}`);

    // Verify the token against the provided secret (not stored secret)
    const isValid = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token,
      window: 2, // Allow 2 time steps for clock skew
    });

    logger.info(`2FA token verification result: ${isValid}`);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    await AuthService.setup2FA(user.id, secret, backupCodes);

    await AuthService.logSecurityEvent(
      user.id,
      "2fa_enabled",
      "Two-factor authentication enabled",
      getClientIP(req),
      req.headers["user-agent"]
    );

    res.json({ message: "Two-factor authentication enabled successfully" });
  } catch (error) {
    logger.error("2FA enable error:", error);
    res.status(500).json({ message: "Failed to enable 2FA" });
  }
});

router.post("/2fa/disable", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const user = req.user as User;
    const { password } = req.body;

    // Verify password before disabling 2FA
    const isPasswordValid = await AuthService.comparePasswords(
      password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    await AuthService.disable2FA(user.id);

    await AuthService.logSecurityEvent(
      user.id,
      "2fa_disabled",
      "Two-factor authentication disabled",
      getClientIP(req),
      req.headers["user-agent"]
    );

    res.json({ message: "Two-factor authentication disabled successfully" });
  } catch (error) {
    logger.error("2FA disable error:", error);
    res.status(500).json({ message: "Failed to disable 2FA" });
  }
});

// Device management routes
router.get("/devices", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const user = req.user as User;
    const devices = await AuthService.getDeviceSessions(user.id);
    res.json(devices);
  } catch (error) {
    logger.error("Get devices error:", error);
    res.status(500).json({ message: "Failed to get devices" });
  }
});

router.delete("/devices/:sessionId", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const user = req.user as User;
    const { sessionId } = req.params;

    await AuthService.revokeDeviceSession(sessionId);

    await AuthService.logSecurityEvent(
      user.id,
      "device_revoked",
      "Device session revoked",
      getClientIP(req),
      req.headers["user-agent"],
      { sessionId }
    );

    res.json({ message: "Device session revoked successfully" });
  } catch (error) {
    logger.error("Revoke device error:", error);
    res.status(500).json({ message: "Failed to revoke device" });
  }
});

router.post(
  "/devices/:sessionId/trust",
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user as User;
      const { sessionId } = req.params;

      await AuthService.markDeviceAsTrusted(sessionId);

      await AuthService.logSecurityEvent(
        user.id,
        "device_trusted",
        "Device marked as trusted",
        getClientIP(req),
        req.headers["user-agent"],
        { sessionId }
      );

      res.json({ message: "Device marked as trusted" });
    } catch (error) {
      logger.error("Trust device error:", error);
      res.status(500).json({ message: "Failed to trust device" });
    }
  }
);

// OAuth provider management
router.get("/oauth/providers", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const user = req.user as User;
    const providers = await AuthService.getUserOAuthProviders(user.id);
    res.json(providers);
  } catch (error) {
    logger.error("Get OAuth providers error:", error);
    res.status(500).json({ message: "Failed to get OAuth providers" });
  }
});

router.delete(
  "/oauth/providers/:provider",
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user as User;
      const { provider } = req.params;

      await AuthService.unlinkOAuthProvider(user.id, provider);

      await AuthService.logSecurityEvent(
        user.id,
        "oauth_unlinked",
        `OAuth provider ${provider} unlinked`,
        getClientIP(req),
        req.headers["user-agent"],
        { provider }
      );

      res.json({ message: "OAuth provider unlinked successfully" });
    } catch (error) {
      logger.error("Unlink OAuth provider error:", error);
      res.status(500).json({ message: "Failed to unlink OAuth provider" });
    }
  }
);

// Security events
router.get("/security/events", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const user = req.user as User;
    const { limit = 50 } = req.query;

    // This would need to be implemented in the service
    // For now, we'll return a placeholder
    res.json({ message: "Security events endpoint - to be implemented" });
  } catch (error) {
    logger.error("Get security events error:", error);
    res.status(500).json({ message: "Failed to get security events" });
  }
});

// Enhanced logout
router.post(
  "/logout",
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = req.user as User;

      // Log security event
      await AuthService.logSecurityEvent(
        user.id,
        "logout",
        "User logged out",
        getClientIP(req),
        req.headers["user-agent"]
      );

      // Revoke current device session
      if (req.sessionID) {
        await AuthService.revokeDeviceSession(req.sessionID);
      }

      req.logout((err) => {
        if (err) return next(err);
        res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      logger.error("Logout error:", error);
      next(error);
    }
  }
);

export default router;
