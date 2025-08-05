import { db } from "../db.js";
import {
  pestDiseaseTypes,
  pestOutbreaks,
  pestReports,
  riskAssessments,
  users,
  farmerProfiles,
  plantAnalyses,
} from "@shared/schema";
import { eq, desc, count, sql, and, gte, inArray, or } from "drizzle-orm";
import { logger } from "../lib/logger.js";

export interface PestDiseaseType {
  id: number;
  name: string;
  scientificName?: string;
  category: "pest" | "disease" | "fungal" | "bacterial" | "viral";
  riskLevel: "low" | "medium" | "high" | "critical";
  affectedCrops: string[];
  symptoms: string[];
  treatmentRecommendations: string[];
  preventionMeasures: string[];
  imageUrls: string[];
  isQuarantinable: boolean;
  spreadRate: "slow" | "moderate" | "fast" | "very_fast";
  economicImpact: "minimal" | "moderate" | "severe" | "devastating";
  seasonality: string[];
  geographicRisk: string[];
  alertThreshold: number; // Number of cases in area/timeframe to trigger alert
  createdAt: Date;
  updatedAt: Date;
}

export interface PestOutbreak {
  id: number;
  pestDiseaseId: number;
  locationArea: string;
  severity: "isolated" | "localized" | "widespread" | "epidemic";
  status: "active" | "contained" | "resolved" | "monitoring";
  firstReportedAt: Date;
  lastUpdatedAt: Date;
  affectedFarms: number;
  estimatedLosses?: number;
  containmentMeasures: string[];
  adminNotes?: string;
  alertLevel: "watch" | "advisory" | "warning" | "emergency";
}

export interface PestReport {
  id: number;
  userId: number;
  plantAnalysisId?: number;
  pestDiseaseId: number;
  location: string;
  coordinates?: { lat: number; lng: number };
  severity: "mild" | "moderate" | "severe" | "critical";
  confidence: number; // AI confidence score 0-100
  affectedArea?: number; // in hectares
  cropType: string;
  growthStage: string;
  weatherConditions?: string;
  images: string[];
  symptoms: string[];
  farmerNotes?: string;
  verifiedByExpert: boolean;
  expertNotes?: string;
  treatmentApplied?: string[];
  followUpRequired: boolean;
  reportedAt: Date;
  updatedAt: Date;
}

export interface RiskAssessment {
  id: number;
  pestDiseaseId: number;
  location: string;
  riskScore: number; // 0-100
  factors: {
    recentReports: number;
    weatherSuitability: number;
    cropVulnerability: number;
    seasonalRisk: number;
    geographicProximity: number;
  };
  recommendations: string[];
  alertTriggered: boolean;
  assessmentDate: Date;
}

export class PestDiseaseModel {
  /**
   * Get all high-risk pest/disease types
   */
  static async getHighRiskPests(): Promise<PestDiseaseType[]> {
    try {
      return await db
        .select()
        .from(pestDiseaseTypes)
        .where(inArray(pestDiseaseTypes.riskLevel, ["high", "critical"]))
        .orderBy(desc(pestDiseaseTypes.riskLevel));
    } catch (error) {
      logger.error("Error fetching high-risk pests:", error);
      throw new Error("Failed to fetch high-risk pests");
    }
  }

  /**
   * Create a new pest report from plant analysis
   */
  static async createPestReport(
    reportData: Omit<PestReport, "id" | "reportedAt" | "updatedAt">
  ): Promise<PestReport> {
    try {
      const [newReport] = await db
        .insert(pestReports)
        .values({
          ...reportData,
          reportedAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Trigger risk assessment
      await this.assessRiskAndTriggerAlerts(newReport);

      return newReport;
    } catch (error) {
      logger.error("Error creating pest report:", error);
      throw new Error("Failed to create pest report");
    }
  }

  /**
   * Assess risk and trigger alerts if thresholds are met
   */
  static async assessRiskAndTriggerAlerts(report: PestReport): Promise<void> {
    try {
      // Get pest/disease information
      const [pestInfo] = await db
        .select()
        .from(pestDiseaseTypes)
        .where(eq(pestDiseaseTypes.id, report.pestDiseaseId));

      if (!pestInfo) return;

      // Check if this is a high-risk pest/disease
      if (pestInfo.riskLevel === "high" || pestInfo.riskLevel === "critical") {
        // Count recent reports in the area (within 50km and last 30 days)
        const recentReports = await this.getRecentReportsInArea(
          report.location,
          report.pestDiseaseId,
          30 // days
        );

        // Check if alert threshold is exceeded
        if (recentReports.length >= pestInfo.alertThreshold) {
          await this.triggerOutbreakAlert(pestInfo, report, recentReports);
        }
      }

      // Create risk assessment
      await this.createRiskAssessment(report, pestInfo);
    } catch (error) {
      logger.error("Error assessing risk:", error);
    }
  }

  /**
   * Get recent reports in geographical area
   */
  static async getRecentReportsInArea(
    location: string,
    pestDiseaseId: number,
    daysBack: number = 30
  ): Promise<PestReport[]> {
    try {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - daysBack);

      return await db
        .select()
        .from(pestReports)
        .where(
          and(
            eq(pestReports.pestDiseaseId, pestDiseaseId),
            eq(pestReports.location, location), // TODO: Implement geographical distance calculation
            gte(pestReports.reportedAt, dateThreshold)
          )
        )
        .orderBy(desc(pestReports.reportedAt));
    } catch (error) {
      logger.error("Error fetching recent reports:", error);
      return [];
    }
  }

  /**
   * Trigger outbreak alert to admins
   */
  static async triggerOutbreakAlert(
    pestInfo: PestDiseaseType,
    triggerReport: PestReport,
    recentReports: PestReport[]
  ): Promise<void> {
    try {
      // Import alert service
      const { sendAdminAlert } = await import(
        "../services/pest-alert-service.js"
      );

      // Determine alert severity
      const alertSeverity = this.determineAlertSeverity(
        pestInfo,
        recentReports
      );

      // Create or update outbreak record
      const outbreak = await this.createOrUpdateOutbreak(
        pestInfo,
        triggerReport,
        recentReports
      );

      // Send alert to admins
      await sendAdminAlert({
        type: "pest_outbreak",
        pestInfo,
        outbreak,
        triggerReport,
        recentReports,
        severity: alertSeverity,
      });

      logger.info(
        `Outbreak alert triggered for ${pestInfo.name} in ${triggerReport.location}`
      );
    } catch (error) {
      logger.error("Error triggering outbreak alert:", error);
    }
  }

  /**
   * Determine alert severity based on pest info and reports
   */
  static determineAlertSeverity(
    pestInfo: PestDiseaseType,
    reports: PestReport[]
  ): "watch" | "advisory" | "warning" | "emergency" {
    const reportCount = reports.length;
    const criticalReports = reports.filter(
      (r) => r.severity === "critical"
    ).length;
    const averageConfidence =
      reports.reduce((sum, r) => sum + r.confidence, 0) / reports.length;

    if (pestInfo.riskLevel === "critical" && criticalReports > 0) {
      return "emergency";
    } else if (pestInfo.riskLevel === "critical" || reportCount >= 10) {
      return "warning";
    } else if (pestInfo.riskLevel === "high" || reportCount >= 5) {
      return "advisory";
    } else {
      return "watch";
    }
  }

  /**
   * Create or update outbreak record
   */
  static async createOrUpdateOutbreak(
    pestInfo: PestDiseaseType,
    triggerReport: PestReport,
    recentReports: PestReport[]
  ): Promise<PestOutbreak> {
    try {
      // Check if outbreak already exists for this pest in this location
      const [existingOutbreak] = await db
        .select()
        .from(pestOutbreaks)
        .where(
          and(
            eq(pestOutbreaks.pestDiseaseId, pestInfo.id),
            eq(pestOutbreaks.locationArea, triggerReport.location),
            inArray(pestOutbreaks.status, ["active", "monitoring"])
          )
        );

      const severity = this.determineSeverity(recentReports);
      const alertLevel = this.determineAlertSeverity(pestInfo, recentReports);

      if (existingOutbreak) {
        // Update existing outbreak
        const [updatedOutbreak] = await db
          .update(pestOutbreaks)
          .set({
            severity,
            alertLevel,
            lastUpdatedAt: new Date(),
            affectedFarms: recentReports.length,
          })
          .where(eq(pestOutbreaks.id, existingOutbreak.id))
          .returning();

        return updatedOutbreak;
      } else {
        // Create new outbreak
        const [newOutbreak] = await db
          .insert(pestOutbreaks)
          .values({
            pestDiseaseId: pestInfo.id,
            locationArea: triggerReport.location,
            severity,
            status: "active",
            alertLevel,
            firstReportedAt: new Date(),
            lastUpdatedAt: new Date(),
            affectedFarms: recentReports.length,
            containmentMeasures: pestInfo.treatmentRecommendations,
          })
          .returning();

        return newOutbreak;
      }
    } catch (error) {
      logger.error("Error creating/updating outbreak:", error);
      throw new Error("Failed to manage outbreak record");
    }
  }

  /**
   * Determine outbreak severity
   */
  static determineSeverity(
    reports: PestReport[]
  ): "isolated" | "localized" | "widespread" | "epidemic" {
    const reportCount = reports.length;
    const criticalCount = reports.filter(
      (r) => r.severity === "critical"
    ).length;

    if (reportCount >= 20 || criticalCount >= 10) {
      return "epidemic";
    } else if (reportCount >= 10 || criticalCount >= 5) {
      return "widespread";
    } else if (reportCount >= 5) {
      return "localized";
    } else {
      return "isolated";
    }
  }

  /**
   * Create risk assessment
   */
  static async createRiskAssessment(
    report: PestReport,
    pestInfo: PestDiseaseType
  ): Promise<void> {
    try {
      // Calculate risk factors (simplified - can be enhanced with weather APIs, etc.)
      const recentReports = await this.getRecentReportsInArea(
        report.location,
        report.pestDiseaseId,
        7
      );

      const riskFactors = {
        recentReports: Math.min(recentReports.length * 10, 100),
        weatherSuitability: 50, // TODO: Integrate with weather data
        cropVulnerability: pestInfo.affectedCrops.includes(report.cropType)
          ? 80
          : 20,
        seasonalRisk: 60, // TODO: Calculate based on seasonality data
        geographicProximity: 40, // TODO: Calculate based on known outbreak locations
      };

      const riskScore = Math.round(
        riskFactors.recentReports * 0.3 +
          riskFactors.weatherSuitability * 0.2 +
          riskFactors.cropVulnerability * 0.25 +
          riskFactors.seasonalRisk * 0.15 +
          riskFactors.geographicProximity * 0.1
      );

      const recommendations = this.generateRecommendations(
        riskScore,
        pestInfo,
        riskFactors
      );

      await db.insert(riskAssessments).values({
        pestDiseaseId: report.pestDiseaseId,
        location: report.location,
        riskScore,
        factors: riskFactors,
        recommendations,
        alertTriggered: riskScore >= 70,
        assessmentDate: new Date(),
      });
    } catch (error) {
      logger.error("Error creating risk assessment:", error);
    }
  }

  /**
   * Generate recommendations based on risk assessment
   */
  static generateRecommendations(
    riskScore: number,
    pestInfo: PestDiseaseType,
    factors: any
  ): string[] {
    const recommendations: string[] = [];

    if (riskScore >= 80) {
      recommendations.push(
        "IMMEDIATE ACTION REQUIRED: Implement emergency control measures"
      );
      recommendations.push(
        "Contact local agricultural extension services immediately"
      );
    } else if (riskScore >= 60) {
      recommendations.push(
        "HIGH RISK: Increase monitoring frequency to daily inspections"
      );
      recommendations.push("Prepare treatment materials and equipment");
    } else if (riskScore >= 40) {
      recommendations.push("MODERATE RISK: Monitor crops twice weekly");
      recommendations.push("Review and implement preventive measures");
    } else {
      recommendations.push("LOW RISK: Continue routine monitoring");
    }

    // Add pest-specific recommendations
    recommendations.push(...pestInfo.preventionMeasures.slice(0, 3));

    if (factors.cropVulnerability > 60) {
      recommendations.push(
        `Your ${pestInfo.affectedCrops[0]} crops are particularly vulnerable to this threat`
      );
    }

    return recommendations;
  }

  /**
   * Get active outbreaks
   */
  static async getActiveOutbreaks(): Promise<any[]> {
    try {
      const results = await db
        .select({
          outbreak: pestOutbreaks,
          pestInfo: pestDiseaseTypes,
        })
        .from(pestOutbreaks)
        .innerJoin(
          pestDiseaseTypes,
          eq(pestOutbreaks.pestDiseaseId, pestDiseaseTypes.id)
        )
        .where(inArray(pestOutbreaks.status, ["active", "monitoring"]))
        .orderBy(
          desc(pestOutbreaks.alertLevel),
          desc(pestOutbreaks.lastUpdatedAt)
        );

      // Flatten the structure to match frontend expectations
      return results.map(({ outbreak, pestInfo }) => ({
        ...outbreak,
        pestInfo,
      }));
    } catch (error) {
      logger.error("Error fetching active outbreaks:", error);
      throw new Error("Failed to fetch active outbreaks");
    }
  }

  /**
   * Get outbreak statistics
   */
  static async getOutbreakStats(): Promise<any> {
    try {
      const [totalActive] = await db
        .select({ count: count() })
        .from(pestOutbreaks)
        .where(eq(pestOutbreaks.status, "active"));

      const [criticalOutbreaks] = await db
        .select({ count: count() })
        .from(pestOutbreaks)
        .where(
          and(
            eq(pestOutbreaks.status, "active"),
            inArray(pestOutbreaks.alertLevel, ["warning", "emergency"])
          )
        );

      const [reportsThisWeek] = await db
        .select({ count: count() })
        .from(pestReports)
        .where(
          gte(
            pestReports.reportedAt,
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          )
        );

      return {
        activeOutbreaks: totalActive.count,
        criticalOutbreaks: criticalOutbreaks.count,
        reportsThisWeek: reportsThisWeek.count,
      };
    } catch (error) {
      logger.error("Error fetching outbreak stats:", error);
      throw new Error("Failed to fetch outbreak statistics");
    }
  }
}
