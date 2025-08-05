import { Router } from "express";
import { hasRole } from "../middleware/auth.js";
import { createNotification } from "../services/notifications.js";
import { sendEmail, generateHtmlEmail } from "../services/email.js";
import { db } from "../db.js";
import { users, farmerProfiles, notificationSettings } from "@shared/schema";
import { eq, inArray, and, or } from "drizzle-orm";
import { logger } from "../lib/logger.js";

const router = Router();

// Apply admin role middleware to all alert routes
router.use(hasRole("admin"));

export interface AlertRequest {
  type:
    | "pest_infestation"
    | "weather_alert"
    | "general_announcement"
    | "emergency";
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  targeting: {
    sendToAll?: boolean;
    roles?: string[]; // ["farmer", "buyer", "seller"]
    locations?: string[]; // City/region names
    specificUsers?: number[]; // User IDs
  };
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
  };
  actionUrl?: string;
  expiresAt?: string; // ISO date string
}

/**
 * POST /api/admin/alerts/send
 * Send alerts to users based on targeting criteria
 */
router.post("/send", async (req, res) => {
  try {
    const alert: AlertRequest = req.body;
    const adminUser = req.user;

    // Validate required fields
    if (!alert.type || !alert.title || !alert.message || !alert.severity) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: type, title, message, severity",
      });
    }

    // Validate alert type
    const validTypes = [
      "pest_infestation",
      "weather_alert",
      "general_announcement",
      "emergency",
    ];
    if (!validTypes.includes(alert.type)) {
      return res.status(400).json({
        success: false,
        error: "Invalid alert type",
      });
    }

    // Get target users based on criteria
    const targetUsers = await getTargetUsers(alert.targeting);

    if (targetUsers.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No users match the targeting criteria",
      });
    }

    // Send alerts to all target users
    const results = await Promise.allSettled(
      targetUsers.map((user) => sendAlertToUser(user, alert, adminUser))
    );

    // Count successes and failures
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    // Log the alert sending
    logger.info(
      `Admin alert sent by ${adminUser?.username || adminUser?.id}: ${
        alert.type
      } - "${alert.title}" to ${successful} users`
    );

    res.json({
      success: true,
      message: `Alert sent successfully to ${successful} users${
        failed > 0 ? ` (${failed} failed)` : ""
      }`,
      stats: {
        totalTargeted: targetUsers.length,
        successful,
        failed,
        alertType: alert.type,
        severity: alert.severity,
      },
    });
  } catch (error) {
    logger.error("Error sending admin alert:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to send alert",
    });
  }
});

/**
 * POST /api/admin/alerts/preview-targets
 * Preview how many users would be targeted by the given criteria
 */
router.post("/preview-targets", async (req, res) => {
  try {
    const targeting = req.body?.targeting;

    if (!targeting) {
      return res.status(400).json({
        success: false,
        error: "Missing targeting criteria",
      });
    }

    const targetUsers = await getTargetUsers(targeting);

    // Get summary stats - handle empty arrays safely
    const roleStats = targetUsers.reduce((acc, user) => {
      const role = user.role || "unknown";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      preview: {
        totalUsers: targetUsers.length,
        roleBreakdown: roleStats,
        sampleUsers: targetUsers.slice(0, 5).map((user) => ({
          id: user.id,
          email: user.email || "No email",
          role: user.role || "unknown",
          location: user.location || "No location",
        })),
      },
    });
  } catch (error) {
    logger.error("Error previewing alert targets:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to preview targets",
    });
  }
});

/**
 * GET /api/admin/alerts/templates
 * Get pre-defined alert templates
 */
router.get("/templates", async (req, res) => {
  try {
    const templates = {
      pest_infestation: [
        {
          title: "🐛 Pest Alert: {PEST_NAME} Detected in {LOCATION}",
          message:
            "Farmers in {LOCATION}, we've received reports of {PEST_NAME} infestations. Please inspect your crops immediately and take preventive measures. Early detection is key to protecting your harvest.",
          severity: "high",
          actionUrl: "/farmer/{USER_ID}/diagnose",
        },
        {
          title: "⚠️ Critical Pest Outbreak: Immediate Action Required",
          message:
            "URGENT: A severe {PEST_NAME} outbreak has been confirmed in your area. This pest can cause significant crop damage. Please implement control measures immediately and contact local agricultural extension services.",
          severity: "critical",
          actionUrl: "/farmer/{USER_ID}/experts",
        },
      ],
      weather_alert: [
        {
          title: "🌧️ Heavy Rain Warning - Protect Your Crops",
          message:
            "Heavy rainfall is expected in your area over the next 48 hours. Ensure proper drainage in your fields and consider protective measures for sensitive crops. Monitor weather updates closely.",
          severity: "medium",
          actionUrl: "/farmer/{USER_ID}/weather",
        },
        {
          title: "🌡️ Extreme Heat Advisory",
          message:
            "Temperatures are expected to exceed 35°C for the next 3 days. Increase irrigation frequency, provide shade for livestock, and avoid working during peak heat hours. Stay hydrated and safe.",
          severity: "high",
          actionUrl: "/farmer/{USER_ID}/weather",
        },
        {
          title: "❄️ Frost Warning - Immediate Crop Protection Needed",
          message:
            "FROST ALERT: Temperatures will drop below 0°C tonight. Cover sensitive plants, run irrigation systems, and use frost protection methods immediately. Act now to save your crops.",
          severity: "critical",
          actionUrl: "/farmer/{USER_ID}/tasks",
        },
      ],
      general_announcement: [
        {
          title: "📢 New GreenUpp Features Available",
          message:
            "We've released exciting new features to help optimize your farming operations! Check out the enhanced crop analysis tools, improved weather forecasting, and new marketplace features.",
          severity: "low",
          actionUrl: "/farmer/{USER_ID}/dashboard",
        },
        {
          title: "🎓 Free Agricultural Training Webinar",
          message:
            "Join our expert-led webinar on sustainable farming practices this Friday at 2 PM. Learn about soil health, pest management, and maximizing crop yields. Registration is free!",
          severity: "medium",
          actionUrl: "https://greenupp.earth/webinar",
        },
      ],
      emergency: [
        {
          title: "🚨 Emergency: System Maintenance Tonight",
          message:
            "URGENT: The GreenUpp platform will undergo emergency maintenance tonight from 11 PM to 3 AM. Please save your work and plan accordingly. We apologize for any inconvenience.",
          severity: "high",
          actionUrl: "/farmer/{USER_ID}/dashboard",
        },
      ],
    };

    res.json({
      success: true,
      templates,
    });
  } catch (error) {
    logger.error("Error getting alert templates:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get templates",
    });
  }
});

/**
 * Helper function to get target users based on criteria
 */
async function getTargetUsers(targeting: AlertRequest["targeting"]) {
  // Ensure targeting object has default values
  const safeTargeting = {
    sendToAll: targeting?.sendToAll ?? true,
    roles: targeting?.roles ?? [],
    locations: targeting?.locations ?? [],
    specificUsers: targeting?.specificUsers ?? [],
  };

  let query = db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      phone: users.phone,
      location: farmerProfiles.farmLocation,
    })
    .from(users)
    .leftJoin(farmerProfiles, eq(users.id, farmerProfiles.userId));

  // Build where conditions
  const conditions = [];

  if (safeTargeting.sendToAll) {
    // No additional conditions needed - return all users
  } else {
    // Only add conditions if we have valid data
    if (safeTargeting.roles && safeTargeting.roles.length > 0) {
      conditions.push(inArray(users.role, safeTargeting.roles));
    }

    if (safeTargeting.locations && safeTargeting.locations.length > 0) {
      // Search in farmer profile location
      const locationConditions = safeTargeting.locations
        .filter((location) => location && location.trim()) // Filter out empty locations
        .map((location) => eq(farmerProfiles.farmLocation, location));

      if (locationConditions.length > 0) {
        if (locationConditions.length === 1) {
          conditions.push(locationConditions[0]);
        } else {
          conditions.push(or(...locationConditions));
        }
      }
    }

    if (safeTargeting.specificUsers && safeTargeting.specificUsers.length > 0) {
      // Filter out invalid user IDs
      const validUserIds = safeTargeting.specificUsers.filter(
        (id) => typeof id === "number" && id > 0
      );
      if (validUserIds.length > 0) {
        conditions.push(inArray(users.id, validUserIds));
      }
    }
  }

  // Apply conditions if any exist
  if (conditions.length > 0) {
    if (conditions.length === 1) {
      query = query.where(conditions[0]);
    } else {
      query = query.where(and(...conditions));
    }
  }

  try {
    const result = await query;
    return result || [];
  } catch (error) {
    logger.error("Error executing target users query:", error);
    logger.error("Query conditions:", conditions);
    logger.error("Safe targeting:", safeTargeting);
    throw new Error("Failed to fetch target users");
  }
}

/**
 * Helper function to send alert to a specific user
 */
async function sendAlertToUser(
  user: any,
  alert: AlertRequest,
  adminUser: any
): Promise<void> {
  // Replace placeholders in message
  let processedTitle = alert.title.replace(/\{USER_ID\}/g, user.id.toString());
  let processedMessage = alert.message.replace(
    /\{USER_ID\}/g,
    user.id.toString()
  );
  let processedActionUrl = alert.actionUrl?.replace(
    /\{USER_ID\}/g,
    user.id.toString()
  );

  // Create in-app notification if enabled
  if (alert.channels.inApp) {
    await createNotification({
      userId: user.id,
      type: alert.type as any,
      title: processedTitle,
      message: processedMessage,
      data: {
        severity: alert.severity,
        alertType: alert.type,
        sentBy: adminUser?.id,
        sentByAdmin: true,
      },
      actionUrl: processedActionUrl,
      expiresAt: alert.expiresAt ? new Date(alert.expiresAt) : undefined,
      sendEmail: alert.channels.email,
    });
  }

  // Send standalone email if email is enabled but in-app is not
  if (alert.channels.email && !alert.channels.inApp && user.email) {
    const emailHtml = generateAlertEmail(
      alert,
      processedTitle,
      processedMessage,
      processedActionUrl
    );

    await sendEmail({
      to: user.email,
      from: getAlertEmailSender(alert.type),
      subject: processedTitle,
      html: emailHtml,
      text: processedMessage,
    });
  }

  // Note: SMS functionality would be handled by the notification system
  // if alert.channels.sms is true and the user has SMS enabled
}

/**
 * Helper function to generate alert-specific email HTML
 */
function generateAlertEmail(
  alert: AlertRequest,
  title: string,
  message: string,
  actionUrl?: string
): string {
  // Get alert-specific styling and icons
  const alertStyles = getAlertStyles(alert.type, alert.severity);

  return generateHtmlEmail(
    title,
    `<div style="border-left: 4px solid ${
      alertStyles.color
    }; padding-left: 16px; margin: 16px 0;">
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 24px; margin-right: 8px;">${
          alertStyles.icon
        }</span>
        <strong style="color: ${
          alertStyles.color
        }; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">
          ${alert.severity} ${alert.type.replace("_", " ")}
        </strong>
      </div>
      <div style="color: #374151; line-height: 1.6;">
        ${message}
      </div>
    </div>`,
    actionUrl,
    actionUrl ? "Take Action" : undefined,
    `This ${alert.type.replace(
      "_",
      " "
    )} was sent by the GreenUpp admin team. Stay safe and follow recommended guidelines.`
  );
}

/**
 * Helper function to get alert-specific email sender
 * Note: Using environment variable SMTP_FROM as SendGrid requires verified sender identity
 */
function getAlertEmailSender(alertType: string): string {
  // Use the verified SMTP_FROM address for SendGrid compliance
  const verifiedSender = process.env.SMTP_FROM || "noreply@greenupp.earth";

  // Return the verified sender with alert-specific display name
  switch (alertType) {
    case "pest_infestation":
      return `GreenUpp Pest Alerts <${verifiedSender}>`;
    case "weather_alert":
      return `GreenUpp Weather Alerts <${verifiedSender}>`;
    case "emergency":
      return `GreenUpp Emergency Alerts <${verifiedSender}>`;
    default:
      return `GreenUpp Announcements <${verifiedSender}>`;
  }
}

/**
 * Helper function to get alert-specific styling
 */
function getAlertStyles(alertType: string, severity: string) {
  const severityColors = {
    low: "#10B981", // green
    medium: "#F59E0B", // yellow
    high: "#EF4444", // red
    critical: "#DC2626", // dark red
  };

  const typeIcons = {
    pest_infestation: "🐛",
    weather_alert: "🌦️",
    general_announcement: "📢",
    emergency: "🚨",
  };

  return {
    color:
      severityColors[severity as keyof typeof severityColors] ||
      severityColors.medium,
    icon: typeIcons[alertType as keyof typeof typeIcons] || "📢",
  };
}

// Export functions for internal use by pest alert service
export { getTargetUsers, sendAlertToUser };

export default router;
