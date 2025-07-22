import express, { Request, Response } from "express";
import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markNotificationAsArchived,
  getUserNotificationSettings,
  updateNotificationSettings,
  countUnreadNotifications,
  createDefaultNotificationSettings,
} from "../services/notifications";
import { testEmail } from "../services/email";
import { isAuthenticated } from "../middleware/auth.js";

import { z } from "zod";

const router = express.Router();

// Get all notifications for the current user
router.get("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || req.session?.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "User not authenticated properly" });
    }

    // Parse query parameters
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const status = (req.query.status as string) || "unread";

    // Validate status
    const validStatuses = ["unread", "read", "archived", "all"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Optional type filter
    const type = req.query.type as string;
    // Define valid notification types
    const validTypes = [
      "weather_alert",
      "task_reminder",
      "market_price_alert",
      "system_notification",
      "message",
      "crop_update",
    ];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({
        message: `Invalid notification type. Must be one of: ${validTypes.join(
          ", "
        )}`,
      });
    }

    const notifications = await getUserNotifications(userId, {
      limit,
      offset,
      status: status as any,
      type: type as any,
    });

    res.json(notifications);
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: error.message });
  }
});

// Count unread notifications
router.get(
  "/unread/count",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json({ message: "User not authenticated properly" });
      }

      const count = await countUnreadNotifications(userId);
      res.json({ count });
    } catch (error: any) {
      console.error("Error counting unread notifications:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Get notification settings
router.get(
  "/settings",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json({ message: "User not authenticated properly" });
      }

      let settings = await getUserNotificationSettings(userId);

      if (!settings) {
        // Create default settings if none exist
        settings = await createDefaultNotificationSettings(userId);
      }

      res.json(settings);
    } catch (error: any) {
      console.error("Error fetching notification settings:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Mark a notification as read
router.patch(
  "/:id/read",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json({ message: "User not authenticated properly" });
      }

      const notificationId = parseInt(req.params.id);

      if (isNaN(notificationId)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }

      const notification = await markNotificationAsRead(notificationId, userId);

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json(notification);
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Mark a notification as archived
router.patch(
  "/:id/archive",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json({ message: "User not authenticated properly" });
      }

      const notificationId = parseInt(req.params.id);

      if (isNaN(notificationId)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }

      const notification = await markNotificationAsArchived(
        notificationId,
        userId
      );

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json(notification);
    } catch (error: any) {
      console.error("Error archiving notification:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Update notification settings
router.patch(
  "/settings",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json({ message: "User not authenticated properly" });
      }

      // Define validation schema for settings update
      const updateSchema = z.object({
        emailEnabled: z.boolean().optional(),
        pushEnabled: z.boolean().optional(),
        weatherAlerts: z.boolean().optional(),
        taskReminders: z.boolean().optional(),
        marketPriceAlerts: z.boolean().optional(),
        systemNotifications: z.boolean().optional(),
        messageNotifications: z.boolean().optional(),
        emailFrequency: z.enum(["instant", "daily", "weekly"]).optional(),
        emailDigestDay: z.number().min(0).max(6).optional(),
        emailDigestTime: z.number().min(0).max(23).optional(),
      });

      // Validate request body
      const validation = updateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Invalid settings data",
          errors: validation.error.errors,
        });
      }

      // Update settings
      const settings = await updateNotificationSettings(
        userId,
        validation.data
      );

      res.json(settings);
    } catch (error: any) {
      console.error("Error updating notification settings:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Create a new notification (admin/system only)
router.post("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Only allow admins or system to create notifications for others
    const userId = req.user?.id || req.session?.user?.id;
    const userRole = req.user?.role || req.session?.user?.role;
    const isAdmin = userRole === "admin";

    if (!userId) {
      return res
        .status(401)
        .json({ message: "User not authenticated properly" });
    }

    // Define validation schema
    const validTypes = [
      "weather_alert",
      "task_reminder",
      "market_price_alert",
      "system_notification",
      "message",
      "crop_update",
    ];
    const createSchema = z.object({
      userId: z.number().optional(), // Optional: if not provided, use current user ID
      type: z.enum(validTypes as [string, ...string[]]),
      title: z.string().min(1).max(255),
      message: z.string().min(1),
      data: z.record(z.any()).optional(),
      actionUrl: z.string().url().optional(),
      expiresAt: z.string().datetime().optional(),
      sendEmail: z.boolean().optional(),
    });

    // Validate request body
    const validation = createSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Invalid notification data",
        errors: validation.error.errors,
      });
    }

    const data = validation.data;

    // If userId is provided, ensure only admins can create notifications for others
    if (data.userId && data.userId !== userId && !isAdmin) {
      return res.status(403).json({
        message: "Only admins can create notifications for other users",
      });
    }

    // Use current user ID if none provided
    const targetUserId = data.userId || userId;

    // Parse expiresAt if provided
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : undefined;

    // Create notification
    const notification = await createNotification({
      userId: targetUserId,
      type: data.type as any,
      title: data.title,
      message: data.message,
      data: data.data,
      actionUrl: data.actionUrl,
      expiresAt,
      sendEmail: data.sendEmail,
    });

    res.status(201).json(notification);
  } catch (error: any) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: error.message });
  }
});

// Test email sending (admin only)
router.post(
  "/test-email",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      // Only allow admins to send test emails
      const userRole = req.user?.role || req.session?.user?.role;
      if (userRole !== "admin") {
        return res
          .status(403)
          .json({ message: "Only admins can send test emails" });
      }

      const email = req.body.email || req.user.email;
      if (!email) {
        return res.status(400).json({ message: "No email address provided" });
      }

      const success = await testEmail(email);

      if (success) {
        res.json({ message: `Test email sent to ${email}` });
      } else {
        res.status(500).json({ message: "Failed to send test email" });
      }
    } catch (error: any) {
      console.error("Error sending test email:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
