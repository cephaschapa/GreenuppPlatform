import { Router } from "express";
import { testEmail } from "../services/email";
import { sendSms } from "../services/sms";
import { createNotification } from "../services/notifications";
import { db } from "../db";
import { users, notificationSettings } from "@shared/schema";
import { eq, inArray } from "drizzle-orm";

const router = Router();

// Test email endpoint
router.post("/api/test-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const success = await testEmail(email);

    if (success) {
      res.json({
        success: true,
        message: `Test email sent to ${email}`,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send test email",
      });
    }
  } catch (error) {
    console.error("Error sending test email:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Test SMS endpoint
router.post("/api/test-sms", async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Ensure phone is in E.164 format (Twilio requirement)
    const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;

    const result = await sendSms(formattedPhone, message);

    if (result) {
      res.json({
        success: true,
        message: `Test SMS sent to ${formattedPhone}`,
        sid: result.sid,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send test SMS",
      });
    }
  } catch (error) {
    console.error("Error sending test SMS:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Test notification with SMS
router.post("/api/test-notification-sms", async (req, res) => {
  try {
    const { userId, title, message, enableSms = false } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    // Get user to verify they exist
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If SMS is enabled, update user's notification settings
    if (enableSms) {
      await db
        .update(notificationSettings)
        .set({ smsEnabled: true })
        .where(eq(notificationSettings.userId, userId));
    }

    // Create notification (this will send SMS if enabled)
    const notification = await createNotification({
      userId,
      type: "system_notification",
      title,
      message,
      data: { testType: "sms-test" },
      sendEmail: false,
    });

    res.json({
      success: true,
      message: "Test notification created successfully",
      notification,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error creating test notification:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Broadcast SMS to all users with SMS enabled
router.post("/api/broadcast-sms", async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    // Get all notification settings with SMS enabled
    console.log("Getting users with SMS enabled...");
    const smsSettings = await db
      .select({
        userId: notificationSettings.userId,
        smsEnabled: notificationSettings.smsEnabled,
      })
      .from(notificationSettings)
      .where(eq(notificationSettings.smsEnabled, true));

    if (smsSettings.length === 0) {
      return res.json({
        success: true,
        message: "No users have SMS notifications enabled",
        sent: 0,
        failed: 0,
      });
    }

    // Get user details for those with SMS enabled
    const userIds = smsSettings.map((setting) => setting.userId);
    const usersWithSms = await db
      .select({
        id: users.id,
        email: users.email,
        phone: users.phone,
      })
      .from(users)
      .where(inArray(users.id, userIds));

    if (usersWithSms.length === 0) {
      return res.json({
        success: true,
        message: "No users with SMS enabled found",
        sent: 0,
        failed: 0,
      });
    }

    const results = [];
    let sent = 0;
    let failed = 0;

    // Send SMS to each user
    for (const user of usersWithSms) {
      try {
        if (user.phone) {
          const formattedPhone = user.phone.startsWith("+")
            ? user.phone
            : `+${user.phone}`;
          const result = await sendSms(formattedPhone, `${title}: ${message}`);

          if (result) {
            sent++;
            results.push({
              userId: user.id,
              phone: formattedPhone,
              status: "sent",
              sid: result.sid,
            });
          } else {
            failed++;
            results.push({
              userId: user.id,
              phone: formattedPhone,
              status: "failed",
              error: "SMS service returned false",
            });
          }
        } else {
          failed++;
          results.push({
            userId: user.id,
            phone: null,
            status: "failed",
            error: "No phone number",
          });
        }
      } catch (error) {
        failed++;
        results.push({
          userId: user.id,
          phone: user.phone,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    res.json({
      success: true,
      message: `SMS broadcast completed: ${sent} sent, ${failed} failed`,
      sent,
      failed,
      results,
    });
  } catch (error) {
    console.error("Error broadcasting SMS:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
