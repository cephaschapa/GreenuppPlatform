import { db } from "../db.js";
import {
  users,
  oauthProviders,
  twoFactorAuth,
  deviceSessions,
  loginAttempts,
  securityEvents,
  verificationTokens,
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { logger } from "../lib/logger.js";
import { getIPLocation } from "./ipGeolocationService.js";

const scryptAsync = promisify(scrypt);

export interface OAuthProfile {
  provider: string;
  providerUserId: string;
  providerEmail: string;
  providerName: string;
  providerPicture?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface DeviceInfo {
  deviceName?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  geoPath?: string;
  country?: string;
  city?: string;
  state?: string;
}

export interface LoginAttempt {
  userId?: number;
  email: string;
  ipAddress: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  provider: string;
}

export class AuthService {
  // Password hashing and verification
  static async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  static async comparePasswords(
    supplied: string,
    stored: string
  ): Promise<boolean> {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  }

  // Password attempt tracking
  static async recordFailedLoginAttempt(userId: number): Promise<void> {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .then((rows) => rows[0]);

    if (!user) return;

    const failedAttempts = (user.failedLoginAttempts || 0) + 1;
    const maxAttempts = 5; // Lock after 5 failed attempts
    const lockDurationMinutes = 15; // Lock for 15 minutes

    let accountLockedUntil = null;
    if (failedAttempts >= maxAttempts) {
      accountLockedUntil = new Date(
        Date.now() + lockDurationMinutes * 60 * 1000
      );
    }

    await db
      .update(users)
      .set({
        failedLoginAttempts: failedAttempts,
        lastFailedLoginAt: new Date(),
        accountLockedUntil: accountLockedUntil,
      })
      .where(eq(users.id, userId));

    logger.info(
      `User ${userId} failed login attempt ${failedAttempts}/${maxAttempts}${
        accountLockedUntil
          ? ` - Account locked until ${accountLockedUntil}`
          : ""
      }`
    );
  }

  static async clearFailedLoginAttempts(userId: number): Promise<void> {
    await db
      .update(users)
      .set({
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
        accountLockedUntil: null,
      })
      .where(eq(users.id, userId));

    logger.info(`User ${userId} failed login attempts cleared`);
  }

  static async isAccountLocked(userId: number): Promise<boolean> {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .then((rows) => rows[0]);

    if (!user || !user.accountLockedUntil) return false;

    const now = new Date();
    const lockedUntil = new Date(user.accountLockedUntil);

    // If lock has expired, clear the lock
    if (now >= lockedUntil) {
      await this.clearFailedLoginAttempts(userId);
      return false;
    }

    return true;
  }

  static async getRemainingLockTime(userId: number): Promise<number | null> {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .then((rows) => rows[0]);

    if (!user || !user.accountLockedUntil) return null;

    const now = new Date();
    const lockedUntil = new Date(user.accountLockedUntil);
    const remainingMs = lockedUntil.getTime() - now.getTime();

    return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : null; // Return seconds
  }

  static async unlockAccount(userId: number): Promise<void> {
    await this.clearFailedLoginAttempts(userId);
    logger.info(`User ${userId} account manually unlocked`);
  }

  // OAuth provider management
  static async linkOAuthProvider(
    userId: number,
    profile: OAuthProfile
  ): Promise<void> {
    await db.insert(oauthProviders).values({
      userId,
      provider: profile.provider,
      providerUserId: profile.providerUserId,
      providerEmail: profile.providerEmail,
      providerName: profile.providerName,
      providerPicture: profile.providerPicture,
      accessToken: profile.accessToken,
      refreshToken: profile.refreshToken,
    });
  }

  static async findUserByOAuthProvider(
    provider: string,
    providerUserId: string
  ) {
    const [oauthProvider] = await db
      .select()
      .from(oauthProviders)
      .where(
        and(
          eq(oauthProviders.provider, provider),
          eq(oauthProviders.providerUserId, providerUserId)
        )
      );

    if (!oauthProvider) return null;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, oauthProvider.userId));

    return user;
  }

  static async getUserOAuthProviders(userId: number) {
    return await db
      .select()
      .from(oauthProviders)
      .where(eq(oauthProviders.userId, userId));
  }

  static async unlinkOAuthProvider(
    userId: number,
    provider: string
  ): Promise<void> {
    await db
      .delete(oauthProviders)
      .where(
        and(
          eq(oauthProviders.userId, userId),
          eq(oauthProviders.provider, provider)
        )
      );
  }

  // Two-factor authentication
  static async generate2FASecret(
    userId: number
  ): Promise<{ secret: string; qrCode: string }> {
    const secret = speakeasy.generateSecret({
      name: `Greenupp (${userId})`,
      issuer: "Greenupp",
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32!,
      qrCode,
    };
  }

  static async setup2FA(
    userId: number,
    secret: string,
    backupCodes: string[]
  ): Promise<void> {
    await db.insert(twoFactorAuth).values({
      userId,
      secret,
      backupCodes,
      isEnabled: true,
    });
  }

  static async verify2FA(userId: number, token: string): Promise<boolean> {
    const [twoFactor] = await db
      .select()
      .from(twoFactorAuth)
      .where(eq(twoFactorAuth.userId, userId));

    if (!twoFactor || !twoFactor.isEnabled) return false;

    // Verify TOTP token
    const isValid = speakeasy.totp.verify({
      secret: twoFactor.secret!,
      encoding: "base32",
      token,
      window: 2, // Allow 2 time steps for clock skew
    });

    if (isValid) {
      // Update last used timestamp
      await db
        .update(twoFactorAuth)
        .set({ lastUsedAt: new Date() })
        .where(eq(twoFactorAuth.userId, userId));
    }

    return isValid;
  }

  static async verifyBackupCode(
    userId: number,
    backupCode: string
  ): Promise<boolean> {
    const [twoFactor] = await db
      .select()
      .from(twoFactorAuth)
      .where(eq(twoFactorAuth.userId, userId));

    if (!twoFactor || !twoFactor.isEnabled || !twoFactor.backupCodes)
      return false;

    const isValid = twoFactor.backupCodes.includes(backupCode);

    if (isValid) {
      // Remove used backup code
      const updatedBackupCodes = twoFactor.backupCodes.filter(
        (code) => code !== backupCode
      );
      await db
        .update(twoFactorAuth)
        .set({
          backupCodes: updatedBackupCodes,
          lastUsedAt: new Date(),
        })
        .where(eq(twoFactorAuth.userId, userId));
    }

    return isValid;
  }

  static async is2FAEnabled(userId: number): Promise<boolean> {
    const [twoFactor] = await db
      .select()
      .from(twoFactorAuth)
      .where(eq(twoFactorAuth.userId, userId));

    return !!(twoFactor && twoFactor.isEnabled);
  }

  static async disable2FA(userId: number): Promise<void> {
    await db
      .update(twoFactorAuth)
      .set({
        isEnabled: false,
        secret: null,
        backupCodes: null,
      })
      .where(eq(twoFactorAuth.userId, userId));
  }

  // Check if this is a new device/location for the user
  static async checkIfNewDevice(
    userId: number,
    deviceInfo: DeviceInfo
  ): Promise<boolean> {
    const existingSessions = await db
      .select()
      .from(deviceSessions)
      .where(eq(deviceSessions.userId, userId))
      .limit(10);

    if (existingSessions.length === 0) {
      return true; // First time login
    }

    // Check if we've seen this device/location combination before
    const similarSession = existingSessions.find((session) => {
      const sameDevice =
        session.browser === deviceInfo.browser &&
        session.os === deviceInfo.os &&
        session.deviceType === deviceInfo.deviceType;

      // Consider it the same location if within ~50km (rough IP geolocation accuracy)
      const sameLocation =
        session.ipAddress === deviceInfo.ipAddress ||
        (session.city === deviceInfo.city &&
          session.country === deviceInfo.country);

      return sameDevice && sameLocation;
    });

    return !similarSession; // New device if no similar session found
  }

  // Create in-app notification for new device login
  static async createInAppNewDeviceNotification(
    userId: number,
    deviceInfo: DeviceInfo
  ): Promise<void> {
    try {
      const { createNewDeviceNotification } = await import(
        "./notifications.js"
      );
      await createNewDeviceNotification(userId, deviceInfo);
    } catch (error) {
      logger.error("Failed to create in-app new device notification:", error);
    }
  }

  // Send new device login notification
  static async sendNewDeviceNotification(
    userId: number,
    deviceInfo: DeviceInfo
  ): Promise<void> {
    try {
      const { sendEmail, generateHtmlEmail } = await import("./email.js");

      // Get user email
      const [user] = await db
        .select({ email: users.email, firstName: users.firstName })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) return;

      const deviceName =
        deviceInfo.deviceName || `${deviceInfo.browser} on ${deviceInfo.os}`;
      const location =
        deviceInfo.geoPath ||
        deviceInfo.city ||
        deviceInfo.ipAddress ||
        "Unknown location";
      const loginTime = new Date().toLocaleString();

      const html = generateHtmlEmail(
        "New Device Login Alert",
        `We detected a login to your GreenUpp account from a new device or location.<br><br>
        <strong>Device:</strong> ${deviceName}<br>
        <strong>Location:</strong> ${location}<br>
        <strong>Time:</strong> ${loginTime}<br><br>
        If this was you, you can safely ignore this email. If you don't recognize this login, please secure your account immediately by changing your password.`,
        `${process.env.FRONTEND_URL || "https://www.greenupp.earth"}/auth`,
        "Secure My Account",
        "If you did not sign in, please contact our support team immediately."
      );

      await sendEmail({
        to: user.email,
        subject: "New Device Login - GreenUpp",
        html,
      });

      logger.info(
        `New device notification sent to user ${userId} at ${user.email}`
      );
    } catch (error) {
      logger.error("Failed to send new device notification:", error);
    }
  }

  // Device session management
  static async createDeviceSession(
    userId: number,
    sessionId: string,
    deviceInfo: DeviceInfo,
    expiresAt: Date
  ): Promise<void> {
    // Check if this is a new device/location before creating session
    const isNewDevice = await this.checkIfNewDevice(userId, deviceInfo);

    // Mark all other sessions as not current
    await db
      .update(deviceSessions)
      .set({ isCurrent: false })
      .where(eq(deviceSessions.userId, userId));

    // Get IP geolocation data if IP address is available
    let enhancedDeviceInfo = { ...deviceInfo };
    if (deviceInfo.ipAddress && deviceInfo.ipAddress !== "unknown") {
      try {
        const ipLocation = await getIPLocation(deviceInfo.ipAddress);
        enhancedDeviceInfo = {
          ...deviceInfo,
          latitude: ipLocation.lat,
          longitude: ipLocation.lon,
          geoPath: ipLocation.geoPath,
          country: ipLocation.country,
          city: ipLocation.city,
          state: ipLocation.state,
          location: ipLocation.geoPath, // Update location with full geo path
        };
      } catch (error) {
        logger.error(
          `Error getting IP location for ${deviceInfo.ipAddress}:`,
          error
        );
        // Continue with original device info if geolocation fails
      }
    }

    // Create new session
    await db.insert(deviceSessions).values({
      userId,
      sessionId,
      deviceName: enhancedDeviceInfo.deviceName || "Unknown Device",
      deviceType: enhancedDeviceInfo.deviceType || "desktop",
      browser: enhancedDeviceInfo.browser,
      os: enhancedDeviceInfo.os,
      ipAddress: enhancedDeviceInfo.ipAddress,
      userAgent: enhancedDeviceInfo.userAgent,
      location: enhancedDeviceInfo.location,
      latitude: enhancedDeviceInfo.latitude,
      longitude: enhancedDeviceInfo.longitude,
      geoPath: enhancedDeviceInfo.geoPath,
      country: enhancedDeviceInfo.country,
      city: enhancedDeviceInfo.city,
      state: enhancedDeviceInfo.state,
      isCurrent: true,
      expiresAt,
    });

    // Send notification if this is a new device/location
    if (isNewDevice) {
      // Send email and in-app notifications asynchronously to avoid blocking login
      Promise.all([
        this.sendNewDeviceNotification(userId, enhancedDeviceInfo),
        this.createInAppNewDeviceNotification(userId, enhancedDeviceInfo),
      ]).catch((error) => {
        logger.error("Failed to send new device notifications:", error);
      });
    }
  }

  static async getDeviceSessions(userId: number) {
    return await db
      .select()
      .from(deviceSessions)
      .where(eq(deviceSessions.userId, userId))
      .orderBy(desc(deviceSessions.lastActiveAt));
  }

  static async updateDeviceSession(sessionId: string): Promise<void> {
    await db
      .update(deviceSessions)
      .set({ lastActiveAt: new Date() })
      .where(eq(deviceSessions.sessionId, sessionId));
  }

  static async revokeDeviceSession(sessionId: string): Promise<void> {
    await db
      .delete(deviceSessions)
      .where(eq(deviceSessions.sessionId, sessionId));
  }

  static async revokeAllOtherSessions(
    userId: number,
    currentSessionId: string
  ): Promise<void> {
    await db
      .delete(deviceSessions)
      .where(
        and(
          eq(deviceSessions.userId, userId),
          eq(deviceSessions.sessionId, currentSessionId)
        )
      );
  }

  static async markDeviceAsTrusted(sessionId: string): Promise<void> {
    await db
      .update(deviceSessions)
      .set({ isTrusted: true })
      .where(eq(deviceSessions.sessionId, sessionId));
  }

  // Login attempt tracking
  static async recordLoginAttempt(attempt: LoginAttempt): Promise<void> {
    await db.insert(loginAttempts).values(attempt);
  }

  static async getRecentLoginAttempts(email: string, hours: number = 24) {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    return await db
      .select()
      .from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.email, email)
          // Add time filter when we have the timestamp column
        )
      )
      .orderBy(desc(loginAttempts.createdAt))
      .limit(10);
  }

  // Security event logging
  static async logSecurityEvent(
    userId: number,
    eventType: string,
    description: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await db.insert(securityEvents).values({
      userId,
      eventType,
      description,
      ipAddress,
      userAgent,
      metadata,
    });
  }

  // Utility functions
  static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(randomBytes(4).toString("hex").toUpperCase());
    }
    return codes;
  }

  static parseUserAgent(userAgent: string): {
    browser?: string;
    os?: string;
    deviceType?: string;
  } {
    const ua = userAgent.toLowerCase();

    let browser: string | undefined;
    let os: string | undefined;
    let deviceType: string | undefined;

    // Browser detection
    if (ua.includes("chrome")) browser = "Chrome";
    else if (ua.includes("firefox")) browser = "Firefox";
    else if (ua.includes("safari")) browser = "Safari";
    else if (ua.includes("edge")) browser = "Edge";

    // OS detection
    if (ua.includes("windows")) os = "Windows";
    else if (ua.includes("mac")) os = "macOS";
    else if (ua.includes("linux")) os = "Linux";
    else if (ua.includes("android")) os = "Android";
    else if (ua.includes("ios")) os = "iOS";

    // Device type detection
    if (ua.includes("mobile")) deviceType = "mobile";
    else if (ua.includes("tablet")) deviceType = "tablet";
    else deviceType = "desktop";

    return { browser, os, deviceType };
  }

  // Email verification methods
  static async generateEmailVerificationToken(userId: number): Promise<string> {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in database (you'll need to create a table for this)
    await db.insert(verificationTokens).values({
      userId,
      token,
      type: "email_verification",
      expiresAt,
    });

    return token;
  }

  static async verifyEmailToken(token: string): Promise<number | null> {
    const [verificationToken] = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.token, token),
          eq(verificationTokens.type, "email_verification"),
          eq(verificationTokens.used, false)
        )
      )
      .limit(1);

    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      return null;
    }

    // Mark token as used
    await db
      .update(verificationTokens)
      .set({ used: true })
      .where(eq(verificationTokens.id, verificationToken.id));

    return verificationToken.userId;
  }

  static async sendVerificationEmail(
    email: string,
    verificationUrl: string
  ): Promise<void> {
    const { sendEmail, generateHtmlEmail } = await import("./email.js");

    const html = generateHtmlEmail(
      "Verify Your Email Address",
      "Please click the button below to verify your email address and complete your account setup.",
      verificationUrl,
      "Verify Email Address",
      "This verification link will expire in 24 hours. If you did not create an account, you can safely ignore this email."
    );

    await sendEmail({
      to: email,
      subject: "Verify Your Email Address - GreenUpp",
      html,
    });
  }

  // Password reset methods
  static async generatePasswordResetToken(userId: number): Promise<string> {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(verificationTokens).values({
      userId,
      token,
      type: "password_reset",
      expiresAt,
    });

    return token;
  }

  static async verifyPasswordResetToken(token: string): Promise<number | null> {
    const [resetToken] = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.token, token),
          eq(verificationTokens.type, "password_reset"),
          eq(verificationTokens.used, false)
        )
      )
      .limit(1);

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return null;
    }

    // Mark token as used
    await db
      .update(verificationTokens)
      .set({ used: true })
      .where(eq(verificationTokens.id, resetToken.id));

    return resetToken.userId;
  }

  static async sendPasswordResetEmail(
    email: string,
    resetUrl: string
  ): Promise<void> {
    const { sendEmail, generateHtmlEmail } = await import("./email.js");

    const html = generateHtmlEmail(
      "Reset Your Password",
      "We received a request to reset your password. Click the button below to create a new password.",
      resetUrl,
      "Reset Password",
      "This reset link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email."
    );

    await sendEmail({
      to: email,
      subject: "Reset Your Password - GreenUpp",
      html,
    });
  }

  static async revokeAllUserSessions(userId: number): Promise<void> {
    await db.delete(deviceSessions).where(eq(deviceSessions.userId, userId));
  }
}
