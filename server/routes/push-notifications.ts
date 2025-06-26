import { Router } from "express";
import {
  storeUserFCMToken,
  removeUserFCMToken,
  updatePushNotificationPreference,
  sendPushNotification,
  subscribeUserToTopic,
  unsubscribeUserFromTopic,
} from "../services/firebase.js";
import { logger } from "../lib/logger.js";

const router = Router();

// Authentication middleware
function isAuthenticated(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

/**
 * POST /api/push-notifications/register
 * Register user's FCM token for push notifications
 */
router.post("/register", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated properly",
      });
    }

    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: "FCM token is required",
      });
    }

    const success = await storeUserFCMToken(userId, fcmToken);

    if (success) {
      res.json({
        success: true,
        message: "FCM token registered successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to register FCM token",
      });
    }
  } catch (error) {
    logger.error("Error registering FCM token:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * DELETE /api/push-notifications/unregister
 * Remove user's FCM token
 */
router.delete("/unregister", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated properly",
      });
    }

    const success = await removeUserFCMToken(userId);

    if (success) {
      res.json({
        success: true,
        message: "FCM token removed successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to remove FCM token",
      });
    }
  } catch (error) {
    logger.error("Error removing FCM token:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * PATCH /api/push-notifications/preferences
 * Update user's push notification preferences
 */
router.patch("/preferences", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated properly",
      });
    }

    const { enabled } = req.body;

    if (typeof enabled !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "enabled must be a boolean",
      });
    }

    const success = await updatePushNotificationPreference(userId, enabled);

    if (success) {
      res.json({
        success: true,
        message: `Push notifications ${
          enabled ? "enabled" : "disabled"
        } successfully`,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update push notification preferences",
      });
    }
  } catch (error) {
    logger.error("Error updating push notification preferences:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * POST /api/push-notifications/subscribe
 * Subscribe user to a topic
 */
router.post("/subscribe", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated properly",
      });
    }

    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
      });
    }

    const success = await subscribeUserToTopic(userId, topic);

    if (success) {
      res.json({
        success: true,
        message: `Subscribed to topic: ${topic}`,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to subscribe to topic",
      });
    }
  } catch (error) {
    logger.error("Error subscribing to topic:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * POST /api/push-notifications/unsubscribe
 * Unsubscribe user from a topic
 */
router.post("/unsubscribe", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated properly",
      });
    }

    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
      });
    }

    const success = await unsubscribeUserFromTopic(userId, topic);

    if (success) {
      res.json({
        success: true,
        message: `Unsubscribed from topic: ${topic}`,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to unsubscribe from topic",
      });
    }
  } catch (error) {
    logger.error("Error unsubscribing from topic:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * POST /api/push-notifications/test
 * Send a test push notification to the authenticated user
 */
router.post("/test", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated properly",
      });
    }

    const {
      title = "Test Notification",
      body = "This is a test push notification",
    } = req.body;

    const success = await sendPushNotification(userId, title, body, {
      actionUrl: "https://greenupp.app/dashboard",
    });

    if (success) {
      res.json({
        success: true,
        message: "Test push notification sent successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send test push notification",
      });
    }
  } catch (error) {
    logger.error("Error sending test push notification:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
