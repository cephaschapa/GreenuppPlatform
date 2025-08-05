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

    const result = await testEmail(email);

    if (result.success) {
      res.json({
        success: true,
        message: `Test email sent to ${email}`,
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error || "Failed to send test email",
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

// Test professional email template endpoint
router.post("/api/test-professional-email", async (req, res) => {
  try {
    const { email, type = "welcome" } = req.body;

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

    const { sendEmail, generateHtmlEmail } = await import("../services/email");

    // Different email templates based on type
    let title, message, actionUrl, actionText, footerText;

    switch (type) {
      case "welcome":
        title = "Welcome to GreenUpp! 🌱";
        message = `Thank you for joining GreenUpp, the future of agricultural intelligence!<br><br>
        Your account has been successfully created and you're now part of a community of forward-thinking farmers who are leveraging technology to optimize their farming operations.<br><br>
        <strong>What you can do with GreenUpp:</strong><br>
        🌾 Monitor crop health with AI-powered analysis<br>
        📊 Track market prices and trends<br>
        🌤️ Get personalized weather alerts<br>
        💬 Connect with other farmers in your region<br>
        📈 Optimize your farming operations with data insights`;
        actionUrl = "https://www.greenupp.earth/dashboard";
        actionText = "Explore Your Dashboard";
        footerText =
          "Welcome to the future of farming! If you have any questions, our support team is here to help.";
        break;

      case "verification":
        title = "Verify Your Email Address";
        message = `Please click the button below to verify your email address and complete your account setup.<br><br>
        Once verified, you'll have full access to all GreenUpp features including AI crop analysis, market insights, and community features.`;
        actionUrl =
          "https://www.greenupp.earth/verify-email?token=sample_token";
        actionText = "Verify Email Address";
        footerText =
          "This verification link will expire in 24 hours. If you did not create an account, you can safely ignore this email.";
        break;

      case "password_reset":
        title = "Reset Your Password";
        message = `We received a request to reset your password. Click the button below to create a new password.<br><br>
        If you didn't request this password reset, please ignore this email. Your account remains secure.`;
        actionUrl =
          "https://www.greenupp.earth/reset-password?token=sample_token";
        actionText = "Reset Password";
        footerText =
          "This reset link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.";
        break;

      case "security_alert":
        title = "New Device Login Alert 🔐";
        message = `We detected a login to your GreenUpp account from a new device or location.<br><br>
        <strong>Device:</strong> Chrome on Windows<br>
        <strong>Location:</strong> New York, United States<br>
        <strong>Time:</strong> ${new Date().toLocaleString()}<br><br>
        If this was you, you can safely ignore this email. If you don't recognize this login, please secure your account immediately.`;
        actionUrl = "https://www.greenupp.earth/security";
        actionText = "Secure My Account";
        footerText =
          "If you did not sign in, please contact our support team immediately.";
        break;

      default:
        title = "Professional Email Template Demo";
        message = `This is a demonstration of our new professional email template system.<br><br>
        The template features:<br>
        ✨ Modern, responsive design<br>
        🎨 Professional branding with GreenUpp colors<br>
        📱 Mobile-optimized layout<br>
        🔗 Social media integration<br>
        📞 Complete contact information`;
        actionUrl = "https://www.greenupp.earth";
        actionText = "Visit GreenUpp";
        footerText =
          "This is a test email to showcase our professional email template design.";
    }

    const html = generateHtmlEmail(
      title,
      message,
      actionUrl,
      actionText,
      footerText
    );

    const result = await sendEmail({
      to: email,
      from: "GreenUpp <support@greenupp.earth>",
      subject: `${title} - GreenUpp`,
      html,
      text: message.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, ""), // Strip HTML for text version
    });

    if (result.success) {
      res.json({
        success: true,
        message: `Professional ${type} email sent to ${email}`,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send professional email",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error sending professional email:", error);
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
