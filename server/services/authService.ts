import { db } from "../db.js";
import {
  users,
  oauthProviders,
  twoFactorAuth,
  deviceSessions,
  loginAttempts,
  securityEvents,
} from "@shared/schema";
import { eq, and, or, desc } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { logger } from "../lib/logger.js";
import { getIPLocation, IPLocation } from "./ipGeolocationService.js";

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

  // Device session management
  static async createDeviceSession(
    userId: number,
    sessionId: string,
    deviceInfo: DeviceInfo,
    expiresAt: Date
  ): Promise<void> {
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
}
