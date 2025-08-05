import { logger } from "../lib/logger.js";
import {
  PestDiseaseType,
  PestOutbreak,
  PestReport,
} from "../models/PestDiseaseModel.js";

interface PestAlertData {
  type: "pest_outbreak" | "disease_outbreak" | "risk_assessment";
  pestInfo: PestDiseaseType;
  outbreak: PestOutbreak;
  triggerReport: PestReport;
  recentReports: PestReport[];
  severity: "watch" | "advisory" | "warning" | "emergency";
}

/**
 * Send automated pest/disease outbreak alert to admins
 */
export async function sendAdminAlert(alertData: PestAlertData): Promise<void> {
  try {
    // Import the admin alert functions directly
    const { sendAlertToUser, getTargetUsers } = await import(
      "../routes/admin-alerts.js"
    );
    const { sendEmail } = await import("./email.js");

    // Generate alert content based on pest/disease info
    const alertContent = generateAlertContent(alertData);

    // Determine targeting (send to all admins)
    const targeting = {
      sendToAll: false,
      roles: ["admin"],
      locations: [alertData.triggerReport.location], // Also notify local admins if any
      specificUsers: [],
    };

    // Determine delivery channels based on severity
    const channels = {
      inApp: true,
      email: true,
      sms: alertData.severity === "emergency", // SMS only for emergencies
    };

    // Create alert payload
    const alertPayload = {
      type: "pest_infestation", // Maps to existing alert type
      title: alertContent.title,
      message: alertContent.message,
      severity: mapSeverityToAlertLevel(alertData.severity),
      targeting,
      channels,
      actionUrl: `/admin/pest-outbreaks/${alertData.outbreak.id}`,
      expiresAt: getExpirationDate(alertData.severity),
    };

    logger.info(`🐛 Sending pest alert: ${alertContent.title}`);

    // Get target users (admins)
    const targetUsers = await getTargetUsers(targeting);
    logger.info(`📧 Found ${targetUsers.length} admin users to notify`);

    // Send alerts to each target user
    let successCount = 0;
    // Create a system admin user object for the alert
    const systemAdmin = {
      id: 0,
      email: "kefas.chapa@gmail.com",
      firstName: "Kefas",
      lastName: "Chapa",
    };

    for (const user of targetUsers) {
      try {
        await sendAlertToUser(user, alertPayload, systemAdmin);
        successCount++;
      } catch (userError) {
        logger.error(`Failed to send alert to user ${user.id}:`, userError);
      }
    }

    logger.info(
      `✅ Pest alert sent successfully to ${successCount}/${targetUsers.length} admins`
    );

    // Also send detailed email to agricultural experts
    await sendExpertNotification(alertData);
  } catch (error) {
    logger.error("Error sending pest alert:", error);
    // Don't throw - we don't want pest reporting to fail if alerts fail
  }
}

/**
 * Generate alert content based on pest/disease information
 */
function generateAlertContent(alertData: PestAlertData): {
  title: string;
  message: string;
} {
  const { pestInfo, outbreak, triggerReport, recentReports, severity } =
    alertData;

  const severityEmoji = {
    watch: "👀",
    advisory: "⚠️",
    warning: "🚨",
    emergency: "🆘",
  };

  const categoryEmoji = {
    pest: "🐛",
    disease: "🦠",
    fungal: "🍄",
    bacterial: "🦠",
    viral: "🦠",
  };

  const emoji = severityEmoji[severity];
  const categoryIcon =
    categoryEmoji[pestInfo.category as keyof typeof categoryEmoji] || "🐛";

  // Generate title based on severity and pest type
  let title = "";
  if (severity === "emergency") {
    title = `${emoji} EMERGENCY: ${pestInfo.name} Outbreak in ${triggerReport.location}`;
  } else if (severity === "warning") {
    title = `${emoji} WARNING: ${pestInfo.name} Spreading in ${triggerReport.location}`;
  } else if (severity === "advisory") {
    title = `${emoji} ADVISORY: ${pestInfo.name} Detected in ${triggerReport.location}`;
  } else {
    title = `${emoji} WATCH: ${pestInfo.name} Reported in ${triggerReport.location}`;
  }

  // Generate detailed message
  const message = generateDetailedMessage(alertData);

  return { title, message };
}

/**
 * Generate detailed alert message
 */
function generateDetailedMessage(alertData: PestAlertData): string {
  const { pestInfo, outbreak, triggerReport, recentReports, severity } =
    alertData;

  let message = `${pestInfo.category.toUpperCase()} ALERT: ${pestInfo.name}`;

  if (pestInfo.scientificName) {
    message += ` (${pestInfo.scientificName})`;
  }

  message += `\n\n📍 LOCATION: ${triggerReport.location}`;
  message += `\n📊 SEVERITY: ${severity.toUpperCase()}`;
  message += `\n🏠 AFFECTED FARMS: ${recentReports.length}`;
  message += `\n📈 OUTBREAK STATUS: ${outbreak.severity.toUpperCase()}`;

  if (triggerReport.affectedArea) {
    message += `\n🌾 AFFECTED AREA: ${triggerReport.affectedArea} hectares`;
  }

  message += `\n🌱 CROPS AT RISK: ${pestInfo.affectedCrops.join(", ")}`;

  // Add urgency-based information
  if (severity === "emergency" || severity === "warning") {
    message += `\n\n🚨 IMMEDIATE ACTION REQUIRED:`;
    message += `\n• Economic Impact: ${pestInfo.economicImpact.toUpperCase()}`;
    message += `\n• Spread Rate: ${pestInfo.spreadRate
      .replace("_", " ")
      .toUpperCase()}`;

    if (pestInfo.isQuarantinable) {
      message += `\n• ⚠️ QUARANTINE MEASURES MAY BE REQUIRED`;
    }
  }

  // Add key symptoms
  message += `\n\n🔍 KEY SYMPTOMS:`;
  pestInfo.symptoms.slice(0, 3).forEach((symptom) => {
    message += `\n• ${symptom}`;
  });

  // Add treatment recommendations
  message += `\n\n💊 RECOMMENDED ACTIONS:`;
  pestInfo.treatmentRecommendations.slice(0, 3).forEach((treatment) => {
    message += `\n• ${treatment}`;
  });

  // Add recent activity summary
  const criticalReports = recentReports.filter(
    (r) => r.severity === "critical"
  ).length;
  const highConfidenceReports = recentReports.filter(
    (r) => r.confidence >= 80
  ).length;

  message += `\n\n📈 RECENT ACTIVITY (Last 30 days):`;
  message += `\n• Total Reports: ${recentReports.length}`;
  message += `\n• Critical Cases: ${criticalReports}`;
  message += `\n• High Confidence: ${highConfidenceReports}`;
  message += `\n• First Detected: ${new Date(
    triggerReport.reportedAt
  ).toLocaleDateString()}`;

  // Add prevention measures for lower severity alerts
  if (severity === "watch" || severity === "advisory") {
    message += `\n\n🛡️ PREVENTION MEASURES:`;
    pestInfo.preventionMeasures.slice(0, 2).forEach((measure) => {
      message += `\n• ${measure}`;
    });
  }

  message += `\n\n📱 View detailed outbreak information and coordinate response in the admin dashboard.`;

  return message;
}

/**
 * Map pest alert severity to admin alert system severity
 */
function mapSeverityToAlertLevel(
  severity: string
): "low" | "medium" | "high" | "critical" {
  switch (severity) {
    case "watch":
      return "low";
    case "advisory":
      return "medium";
    case "warning":
      return "high";
    case "emergency":
      return "critical";
    default:
      return "medium";
  }
}

/**
 * Get expiration date based on severity
 */
function getExpirationDate(severity: string): string {
  const now = new Date();
  let hoursToAdd = 72; // Default 3 days

  switch (severity) {
    case "emergency":
      hoursToAdd = 24; // 1 day
      break;
    case "warning":
      hoursToAdd = 48; // 2 days
      break;
    case "advisory":
      hoursToAdd = 72; // 3 days
      break;
    case "watch":
      hoursToAdd = 168; // 1 week
      break;
  }

  now.setHours(now.getHours() + hoursToAdd);
  return now.toISOString();
}

/**
 * Send detailed notification to agricultural experts
 */
async function sendExpertNotification(alertData: PestAlertData): Promise<void> {
  try {
    const { sendEmail, generateHtmlEmail } = await import("./email.js");

    // Generate expert-focused email content
    const emailContent = generateExpertEmailContent(alertData);

    // TODO: Get list of agricultural experts from database
    const expertEmails = [
      // Add expert email addresses here
      // "expert1@agricultural-dept.gov",
      // "expert2@university.edu"
    ];

    // Send to each expert
    for (const expertEmail of expertEmails) {
      const html = generateHtmlEmail(
        emailContent.subject,
        emailContent.body,
        `${process.env.FRONTEND_URL}/admin/pest-outbreaks/${alertData.outbreak.id}`,
        "View Outbreak Details",
        "This is an automated alert from the GreenUpp pest monitoring system."
      );

      await sendEmail({
        to: expertEmail,
        from:
          process.env.SMTP_FROM ||
          "GreenUpp Pest Alerts <alerts@greenupp.earth>",
        subject: emailContent.subject,
        html,
        text: emailContent.body,
      });
    }

    logger.info(
      `Expert notifications sent for ${alertData.pestInfo.name} outbreak`
    );
  } catch (error) {
    logger.error("Error sending expert notifications:", error);
  }
}

/**
 * Generate expert-focused email content
 */
function generateExpertEmailContent(alertData: PestAlertData): {
  subject: string;
  body: string;
} {
  const { pestInfo, outbreak, triggerReport, recentReports, severity } =
    alertData;

  const subject = `[${severity.toUpperCase()}] ${pestInfo.name} Outbreak - ${
    triggerReport.location
  }`;

  let body = `Agricultural Expert Alert\n\n`;
  body += `PEST/DISEASE: ${pestInfo.name} (${
    pestInfo.scientificName || "N/A"
  })\n`;
  body += `CATEGORY: ${pestInfo.category.toUpperCase()}\n`;
  body += `RISK LEVEL: ${pestInfo.riskLevel.toUpperCase()}\n`;
  body += `ALERT SEVERITY: ${severity.toUpperCase()}\n\n`;

  body += `OUTBREAK DETAILS:\n`;
  body += `• Location: ${triggerReport.location}\n`;
  body += `• Status: ${outbreak.severity.toUpperCase()}\n`;
  body += `• Affected Farms: ${recentReports.length}\n`;
  body += `• First Reported: ${new Date(
    triggerReport.reportedAt
  ).toLocaleString()}\n`;
  body += `• Confidence Score: ${triggerReport.confidence}%\n\n`;

  body += `AFFECTED CROPS: ${pestInfo.affectedCrops.join(", ")}\n\n`;

  body += `SYMPTOMS REPORTED:\n`;
  pestInfo.symptoms.forEach((symptom, index) => {
    body += `${index + 1}. ${symptom}\n`;
  });

  body += `\nRECOMMENDED TREATMENTS:\n`;
  pestInfo.treatmentRecommendations.forEach((treatment, index) => {
    body += `${index + 1}. ${treatment}\n`;
  });

  body += `\nECONOMIC IMPACT: ${pestInfo.economicImpact.toUpperCase()}\n`;
  body += `SPREAD RATE: ${pestInfo.spreadRate
    .replace("_", " ")
    .toUpperCase()}\n`;

  if (pestInfo.isQuarantinable) {
    body += `\n⚠️ QUARANTINE MEASURES MAY BE REQUIRED\n`;
  }

  body += `\nPlease review the outbreak details and coordinate appropriate response measures.\n`;

  return { subject, body };
}

/**
 * Create pest report from plant analysis result
 */
export async function createPestReportFromAnalysis(
  plantAnalysisId: number,
  analysisResult: any,
  userId: number,
  userLocation: string
): Promise<void> {
  try {
    // Import the model
    const { PestDiseaseModel } = await import("../models/PestDiseaseModel.js");

    // Extract pest/disease information from AI analysis
    const detectedThreats = extractThreatsFromAnalysis(analysisResult);

    for (const threat of detectedThreats) {
      // Check if this pest/disease exists in our database
      const pestInfo = await findPestDiseaseByName(threat.name);

      if (pestInfo) {
        // Create pest report
        const reportData = {
          userId,
          plantAnalysisId,
          pestDiseaseId: pestInfo.id,
          location: userLocation,
          coordinates: threat.coordinates,
          severity: mapConfidenceToSeverity(threat.confidence),
          confidence: threat.confidence,
          affectedArea: threat.affectedArea,
          cropType: analysisResult.cropType || "unknown",
          growthStage: analysisResult.growthStage || "unknown",
          weatherConditions: analysisResult.weatherConditions,
          images: analysisResult.images || [],
          symptoms: threat.symptoms || [],
          farmerNotes: analysisResult.notes,
          verifiedByExpert: false,
          treatmentApplied: [],
          followUpRequired:
            pestInfo.riskLevel === "high" || pestInfo.riskLevel === "critical",
        };

        await PestDiseaseModel.createPestReport(reportData);
        logger.info(
          `Pest report created for ${threat.name} from plant analysis ${plantAnalysisId}`
        );
      }
    }
  } catch (error) {
    logger.error("Error creating pest report from analysis:", error);
  }
}

/**
 * Extract threat information from AI analysis result
 */
function extractThreatsFromAnalysis(analysisResult: any): any[] {
  const threats = [];

  logger.info("🔍 Extracting threats from analysis result:", {
    hasDisease: !!analysisResult.disease,
    diseaseName: analysisResult.disease?.name,
    confidence: analysisResult.disease?.confidence,
  });

  // Check the single disease/pest field from our AI analysis format
  if (analysisResult.disease && analysisResult.disease.name) {
    const threat = analysisResult.disease;

    // Only process high-confidence detections (>70% for critical pests, >60% for others)
    const minConfidence = isHighRiskPest(threat.name) ? 70 : 60;

    if (threat.confidence >= minConfidence) {
      logger.info(
        `✅ High-confidence threat detected: ${threat.name} (${threat.confidence}%)`
      );

      threats.push({
        name: threat.name,
        confidence: threat.confidence,
        symptoms: threat.description ? [threat.description] : [],
        affectedArea: analysisResult.estimatedAffectedArea || 1.0, // Default to 1 sq meter
        coordinates: analysisResult.coordinates,
      });
    } else {
      logger.info(
        `⚠️ Low-confidence detection skipped: ${threat.name} (${threat.confidence}%)`
      );
    }
  }

  // Also check for additional observations that might contain pest mentions
  if (analysisResult.additionalObservations) {
    for (const observation of analysisResult.additionalObservations) {
      const pestMatches = findPestMentionsInText(observation);
      for (const pestName of pestMatches) {
        // Add with medium confidence since it's from observations
        threats.push({
          name: pestName,
          confidence: 75,
          symptoms: [observation],
          affectedArea: analysisResult.estimatedAffectedArea || 1.0,
          coordinates: analysisResult.coordinates,
        });
      }
    }
  }

  logger.info(`🎯 Extracted ${threats.length} threats from analysis`);
  return threats;
}

/**
 * Check if a pest name is considered high-risk
 */
function isHighRiskPest(name: string): boolean {
  const highRiskPests = [
    "fall armyworm",
    "army worm",
    "armyworm",
    "desert locust",
    "locust",
    "cassava mosaic",
    "maize lethal necrosis",
    "tuta absoluta",
    "banana xanthomonas",
  ];

  return highRiskPests.some((pest) =>
    name.toLowerCase().includes(pest.toLowerCase())
  );
}

/**
 * Find pest mentions in text observations
 */
function findPestMentionsInText(text: string): string[] {
  const commonPests = [
    "armyworm",
    "army worm",
    "fall armyworm",
    "aphid",
    "whitefly",
    "thrip",
    "bollworm",
    "cutworm",
    "stem borer",
    "locust",
  ];

  const matches = [];
  const lowerText = text.toLowerCase();

  for (const pest of commonPests) {
    if (lowerText.includes(pest.toLowerCase())) {
      // Capitalize first letter of each word
      matches.push(
        pest
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      );
    }
  }

  return matches;
}

/**
 * Find pest/disease in database by name
 */
async function findPestDiseaseByName(name: string): Promise<any> {
  try {
    const { db } = await import("../db.js");
    const { pestDiseaseTypes } = await import("@shared/schema");
    const { eq, or, ilike } = await import("drizzle-orm");

    // Try exact match first, then fuzzy match
    const [result] = await db
      .select()
      .from(pestDiseaseTypes)
      .where(
        or(
          eq(pestDiseaseTypes.name, name),
          ilike(pestDiseaseTypes.name, `%${name}%`)
        )
      )
      .limit(1);

    return result;
  } catch (error) {
    logger.error("Error finding pest/disease by name:", error);
    return null;
  }
}

/**
 * Map AI confidence to severity level
 */
function mapConfidenceToSeverity(
  confidence: number
): "mild" | "moderate" | "severe" | "critical" {
  if (confidence >= 90) return "critical";
  if (confidence >= 80) return "severe";
  if (confidence >= 70) return "moderate";
  return "mild";
}
