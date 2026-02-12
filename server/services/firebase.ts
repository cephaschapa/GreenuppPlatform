import admin from "firebase-admin";
import { logger } from "../lib/logger.js";
import { db } from "../db.js";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Initialize Firebase Admin SDK
let firebaseApp: admin.app.App | null = null;

/**
 * Get the correct frontend URL based on environment
 */
function getFrontendUrl(): string {
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (isDevelopment) {
    return "http://localhost:3000";
  }

  // In production, use the configured frontend URL
  return (
    process.env.FRONTEND_URL ||
    "https://greenuppplatform-production.up.railway.app"
  );
}

/**
 * Initialize Firebase Admin SDK
 */
export function initializeFirebase(): void {
  try {
    // Check if Firebase credentials are available
    if (
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_PRIVATE_KEY ||
      !process.env.FIREBASE_CLIENT_EMAIL
    ) {
      logger.warn(
        "⚠️ Firebase credentials not found. Push notifications will be disabled."
      );
      return;
    }

    // Initialize Firebase Admin SDK
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });

    logger.info("✅ Firebase Admin SDK initialized successfully");
  } catch (error) {
    logger.error("❌ Failed to initialize Firebase Admin SDK:", error);
    firebaseApp = null;
  }
}

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

function isExpoPushToken(token: string): boolean {
  return token.startsWith("ExponentPushToken[");
}

/**
 * Send push via Expo Push API (for Expo / React Native app tokens)
 */
async function sendExpoPush(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify({
        to: token,
        title,
        body,
        sound: "default",
        data: data ? { ...data } : undefined,
      }),
    });
    const json = (await res.json()) as {
      data?: Array<{ status: string; id?: string; message?: string }>;
      errors?: Array<{ code: string; message: string }>;
    };
    if (!res.ok) {
      logger.error("Expo push request failed:", res.status, json);
      return false;
    }
    if (json.errors?.length) {
      logger.error("Expo push errors:", json.errors);
      return false;
    }
    const ticket = json.data?.[0];
    if (ticket?.status === "ok") {
      logger.info("✅ Expo push sent successfully");
      return true;
    }
    // Log full ticket so you can see InvalidCredentials, DeviceNotRegistered, etc.
    logger.warn("Expo push ticket (not ok):", JSON.stringify(ticket));
    logger.warn("Expo push full response:", JSON.stringify(json));
    if (ticket?.message) {
      logger.warn(`Expo push error message: ${ticket.message}`);
    }
    return false;
  } catch (error) {
    logger.error("Expo push send failed:", error);
    return false;
  }
}

/**
 * Send push notification to a specific user
 * Supports both FCM tokens and Expo push tokens (ExponentPushToken[...])
 */
export async function sendPushNotification(
  userId: number,
  title: string,
  body: string,
  data?: Record<string, string>,
  imageUrl?: string
): Promise<boolean> {
  try {
    const token = await getUserFCMToken(userId);
    if (!token) {
      logger.warn(`No push token found for user ${userId}`);
      return false;
    }

    // Expo push token (from React Native / Expo app)
    if (isExpoPushToken(token)) {
      return sendExpoPush(token, title, body, data);
    }

    // FCM token (web / native)
    if (!firebaseApp) {
      logger.warn("Firebase not initialized. Skipping FCM push.");
      return false;
    }

    const message: admin.messaging.Message = {
      token,
      notification: {
        title,
        body,
        imageUrl,
      },
      data: {
        ...data,
        userId: userId.toString(),
        timestamp: new Date().toISOString(),
      },
      android: {
        notification: {
          clickAction: "FLUTTER_NOTIFICATION_CLICK",
          channelId: "greenupp_notifications",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
      webpush: {
        notification: {
          icon: "/favicon.ico",
          badge: "/badge.png",
          actions: [
            {
              action: "view",
              title: "View",
            },
            {
              action: "dismiss",
              title: "Dismiss",
            },
          ],
        },
        fcmOptions: {
          link: data?.actionUrl || getFrontendUrl(),
        },
      },
    };

    const response = await admin.messaging().send(message);
    logger.info(`✅ Push notification sent to user ${userId}: ${response}`);
    return true;
  } catch (error) {
    logger.error(
      `❌ Failed to send push notification to user ${userId}:`,
      error
    );
    return false;
  }
}

/**
 * Send push notification to multiple users
 */
export async function sendPushNotificationToMultiple(
  userIds: number[],
  title: string,
  body: string,
  data?: Record<string, string>,
  imageUrl?: string
): Promise<{ success: number; failed: number }> {
  if (!firebaseApp) {
    logger.warn("Firebase not initialized. Skipping push notifications.");
    return { success: 0, failed: userIds.length };
  }

  try {
    // Get FCM tokens for all users
    const tokens = await Promise.all(
      userIds.map((userId) => getUserFCMToken(userId))
    );

    const validTokens = tokens.filter((token) => token !== null) as string[];

    if (validTokens.length === 0) {
      logger.warn("No valid FCM tokens found for any users");
      return { success: 0, failed: userIds.length };
    }

    const message: admin.messaging.MulticastMessage = {
      tokens: validTokens,
      notification: {
        title,
        body,
        imageUrl,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      android: {
        notification: {
          clickAction: "FLUTTER_NOTIFICATION_CLICK",
          channelId: "greenupp_notifications",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
      webpush: {
        notification: {
          icon: "/favicon.ico",
          badge: "/badge.png",
          actions: [
            {
              action: "view",
              title: "View",
            },
            {
              action: "dismiss",
              title: "Dismiss",
            },
          ],
        },
        fcmOptions: {
          link: data?.actionUrl || getFrontendUrl(),
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    logger.info(
      `✅ Push notifications sent: ${response.successCount} success, ${response.failureCount} failed`
    );

    return {
      success: response.successCount,
      failed: response.failureCount,
    };
  } catch (error) {
    logger.error("❌ Failed to send multicast push notifications:", error);
    return { success: 0, failed: userIds.length };
  }
}

/**
 * Send push notification to topic subscribers
 */
export async function sendPushNotificationToTopic(
  topic: string,
  title: string,
  body: string,
  data?: Record<string, string>,
  imageUrl?: string
): Promise<boolean> {
  if (!firebaseApp) {
    logger.warn("Firebase not initialized. Skipping topic notification.");
    return false;
  }

  try {
    const message: admin.messaging.Message = {
      topic,
      notification: {
        title,
        body,
        imageUrl,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      android: {
        notification: {
          clickAction: "FLUTTER_NOTIFICATION_CLICK",
          channelId: "greenupp_notifications",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
      webpush: {
        notification: {
          icon: "/favicon.ico",
          badge: "/badge.png",
        },
        fcmOptions: {
          link: data?.actionUrl || getFrontendUrl(),
        },
      },
    };

    const response = await admin.messaging().send(message);
    logger.info(`✅ Topic notification sent to ${topic}: ${response}`);
    return true;
  } catch (error) {
    logger.error(`❌ Failed to send topic notification to ${topic}:`, error);
    return false;
  }
}

/**
 * Subscribe user to a topic
 */
export async function subscribeUserToTopic(
  userId: number,
  topic: string
): Promise<boolean> {
  if (!firebaseApp) {
    logger.warn("Firebase not initialized. Cannot subscribe to topic.");
    return false;
  }

  try {
    const fcmToken = await getUserFCMToken(userId);

    if (!fcmToken) {
      logger.warn(`No push token found for user ${userId}`);
      return false;
    }

    await admin.messaging().subscribeToTopic([fcmToken], topic);
    logger.info(`✅ User ${userId} subscribed to topic: ${topic}`);
    return true;
  } catch (error) {
    logger.error(
      `❌ Failed to subscribe user ${userId} to topic ${topic}:`,
      error
    );
    return false;
  }
}

/**
 * Unsubscribe user from a topic
 */
export async function unsubscribeUserFromTopic(
  userId: number,
  topic: string
): Promise<boolean> {
  if (!firebaseApp) {
    logger.warn("Firebase not initialized. Cannot unsubscribe from topic.");
    return false;
  }

  try {
    const fcmToken = await getUserFCMToken(userId);

    if (!fcmToken) {
      logger.warn(`No push token found for user ${userId}`);
      return false;
    }

    await admin.messaging().unsubscribeFromTopic([fcmToken], topic);
    logger.info(`✅ User ${userId} unsubscribed from topic: ${topic}`);
    return true;
  } catch (error) {
    logger.error(
      `❌ Failed to unsubscribe user ${userId} from topic ${topic}:`,
      error
    );
    return false;
  }
}

/**
 * Get user's FCM token from database
 */
async function getUserFCMToken(userId: number): Promise<string | null> {
  try {
    const [user] = await db
      .select({
        fcmToken: users.fcmToken,
        pushNotificationsEnabled: users.pushNotificationsEnabled,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user || !user.pushNotificationsEnabled) {
      return null;
    }

    return user.fcmToken || null;
  } catch (error) {
    logger.error(`Error getting FCM token for user ${userId}:`, error);
    return null;
  }
}

/**
 * Store user's FCM token
 */
export async function storeUserFCMToken(
  userId: number,
  fcmToken: string
): Promise<boolean> {
  try {
    await db
      .update(users)
      .set({
        fcmToken,
        fcmTokenUpdatedAt: new Date(),
        pushNotificationsEnabled: true,
      })
      .where(eq(users.id, userId));

    logger.info(`✅ FCM token stored for user ${userId}`);
    return true;
  } catch (error) {
    logger.error(`❌ Failed to store FCM token for user ${userId}:`, error);
    return false;
  }
}

/**
 * Remove user's FCM token
 */
export async function removeUserFCMToken(userId: number): Promise<boolean> {
  try {
    await db
      .update(users)
      .set({
        fcmToken: null,
        fcmTokenUpdatedAt: new Date(),
        pushNotificationsEnabled: false,
      })
      .where(eq(users.id, userId));

    logger.info(`✅ FCM token removed for user ${userId}`);
    return true;
  } catch (error) {
    logger.error(`❌ Failed to remove FCM token for user ${userId}:`, error);
    return false;
  }
}

/**
 * Update user's push notification preference
 */
export async function updatePushNotificationPreference(
  userId: number,
  enabled: boolean
): Promise<boolean> {
  try {
    await db
      .update(users)
      .set({
        pushNotificationsEnabled: enabled,
        fcmTokenUpdatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    logger.info(
      `✅ Push notifications ${
        enabled ? "enabled" : "disabled"
      } for user ${userId}`
    );
    return true;
  } catch (error) {
    logger.error(
      `❌ Failed to update push notification preference for user ${userId}:`,
      error
    );
    return false;
  }
}

export default {
  initializeFirebase,
  sendPushNotification,
  sendPushNotificationToMultiple,
  sendPushNotificationToTopic,
  subscribeUserToTopic,
  unsubscribeUserFromTopic,
  storeUserFCMToken,
  removeUserFCMToken,
  updatePushNotificationPreference,
};
