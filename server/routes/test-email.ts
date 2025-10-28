import { Router } from "express";
import { testEmail } from "../services/email.js";
import { logger } from "../lib/logger.js";

const router = Router();

// Test email endpoint (for development/testing only)
router.post("/test-email", async (req, res) => {
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

    logger.info(`Testing email functionality with ${email}`);

    const result = await testEmail(email);

    if (result.success) {
      logger.info(`Test email sent successfully to ${email}`);
      res.json({
        success: true,
        message: `Test email sent to ${email}`,
        details: result.error || "Email sent via SMTP",
      });
    } else {
      logger.error(`Failed to send test email to ${email}: ${result.error}`);
      res.status(500).json({
        success: false,
        message: "Failed to send test email",
        error: result.error,
      });
    }
  } catch (error) {
    logger.error("Error in test email endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// SMTP configuration status endpoint
router.get("/email-config-status", (req, res) => {
  const smtpConfigured = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );

  res.json({
    smtpConfigured,
    config: {
      host: process.env.SMTP_HOST ? "SET" : "NOT SET",
      user: process.env.SMTP_USER ? "SET" : "NOT SET",
      pass: process.env.SMTP_PASS ? "SET" : "NOT SET",
      from: process.env.SMTP_FROM || "NOT SET",
      port: process.env.SMTP_PORT || "587 (default)",
    },
    message: smtpConfigured
      ? "SMTP is properly configured"
      : "SMTP configuration is missing - emails will only be logged to console",
  });
});

export default router;

