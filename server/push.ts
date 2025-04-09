import type { Express, Request, Response } from "express";
import webPush from "web-push";
import { storage } from "./storage";
import { PushSubscription } from "@shared/schema";

// VAPID keys should be generated using the web-push library
// and stored securely in environment variables
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || 'BNbKwE3nMX_nOZjKqQHzLN1siXrVYuN6jx3u8TNjc9hYh_NuG37xwF9NF_d4Ajq6OkxZkWn6A2e5_qpB1V8Hmak';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '3KzvKasA2SoCxsp0iIG_o9B0Ozvl1XDwI63JRKNIWBM';

// Set the VAPID details
webPush.setVapidDetails(
  'mailto:contact@greenupp.com',
  vapidPublicKey,
  vapidPrivateKey
);

export function setupPushAPI(app: Express) {
  // Get VAPID public key
  app.get("/api/push/vapid-public-key", (req, res) => {
    res.json({ publicKey: vapidPublicKey });
  });

  // Subscribe to push notifications
  app.post("/api/push/subscribe", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const subscription = req.body;
      
      if (!subscription || !subscription.endpoint || !subscription.keys) {
        return res.status(400).json({ message: "Invalid subscription payload" });
      }

      // Save subscription to database
      await storage.savePushSubscription(req.user.id, subscription);
      
      // Immediately send a welcome notification
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.keys.p256dh,
              auth: subscription.keys.auth
            }
          },
          JSON.stringify({
            title: "Push Notifications Enabled",
            message: "You will now receive important updates from Greenupp.",
            icon: "/icons/icon-192.png"
          })
        );
      } catch (error) {
        console.warn("Error sending welcome notification:", error);
        // Continue even if welcome notification fails
      }

      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      if (req.user) {
        await storage.deletePushSubscription(req.user.id, req.body.endpoint);
      }
      res.status(500).json({ success: false, message: "Failed to subscribe to push notifications" });
    }
  });

  // Unsubscribe from push notifications
  app.post("/api/push/unsubscribe", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { endpoint } = req.body;

      if (!endpoint) {
        return res.status(400).json({ message: "Invalid request: endpoint is required" });
      }

      // Remove subscription from database
      const result = await storage.deletePushSubscription(req.user.id, endpoint);
      res.json({ success: result });
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      res.status(500).json({ success: false, message: "Failed to unsubscribe from push notifications" });
    }
  });

  // Get subscription status
  app.get("/api/push/status", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const subscriptions = await storage.getUserPushSubscriptions(req.user.id);
      res.json({
        subscribed: subscriptions.length > 0,
        count: subscriptions.length
      });
    } catch (error) {
      console.error("Error checking push notification status:", error);
      res.status(500).json({ message: "Failed to check subscription status" });
    }
  });

  // Send test notification
  app.post("/api/push/test", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const subscriptions = await storage.getUserPushSubscriptions(req.user.id);
      
      if (subscriptions.length === 0) {
        return res.status(404).json({ message: "No push subscriptions found" });
      }

      let successCount = 0;
      const errors: string[] = [];

      // Send a test notification to all subscriptions
      await Promise.all(subscriptions.map(async (subscription) => {
        try {
          await webPush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth
              }
            },
            JSON.stringify({
              title: "Test Notification",
              message: "This is a test notification from Greenupp!",
              icon: "/icons/icon-192.png",
              badge: "/icons/badge-72.png",
              timestamp: Date.now()
            })
          );
          successCount++;
        } catch (error) {
          console.error("Error sending test notification:", error);
          
          // If we get a 404 or 410, the subscription is invalid and should be removed
          if (error instanceof webPush.WebPushError && (error.statusCode === 404 || error.statusCode === 410)) {
            await storage.deletePushSubscription(req.user.id, subscription.endpoint);
            errors.push(`Subscription removed (${error.statusCode}): ${subscription.endpoint}`);
          } else if (error instanceof Error) {
            errors.push(`Failed to send: ${error.message}`);
          } else {
            errors.push('Failed to send notification: Unknown error');
          }
        }
      }));

      res.json({
        success: successCount > 0,
        sent: successCount,
        total: subscriptions.length,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({ message: "Failed to send test notification" });
    }
  });
}

/**
 * Send a notification to a specific user
 */
export async function sendNotificationToUser(
  userId: number, 
  payload: { 
    title: string; 
    message: string; 
    icon?: string;
    badge?: string;
    tag?: string;
    url?: string;
    data?: any;
  }
): Promise<{success: boolean; sent: number; total: number}> {
  try {
    const subscriptions = await storage.getUserPushSubscriptions(userId);
    
    if (subscriptions.length === 0) {
      return { success: false, sent: 0, total: 0 };
    }

    let successCount = 0;

    // Send notification to all user's subscriptions
    await Promise.all(subscriptions.map(async (subscription) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth
            }
          },
          JSON.stringify({
            title: payload.title,
            message: payload.message,
            icon: payload.icon || "/icons/icon-192.png",
            badge: payload.badge || "/icons/badge-72.png", 
            tag: payload.tag,
            url: payload.url,
            data: payload.data,
            timestamp: Date.now()
          })
        );
        successCount++;
      } catch (error) {
        console.error(`Error sending notification to ${subscription.endpoint}:`, error);
        
        // If we get a 404 or 410, the subscription is invalid and should be removed
        if (error instanceof webPush.WebPushError && (error.statusCode === 404 || error.statusCode === 410)) {
          await storage.deletePushSubscription(userId, subscription.endpoint);
        }
      }
    }));

    return {
      success: successCount > 0,
      sent: successCount,
      total: subscriptions.length
    };
  } catch (error) {
    console.error("Error sending notification to user:", error);
    return { success: false, sent: 0, total: 0 };
  }
}