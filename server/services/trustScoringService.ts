/**
 * Trust Scoring System
 * Calculates trust scores for farmers and their products
 */

import { db } from "../db.js";
import { crops, users, farmerProfiles, qrScanEvents } from "@shared/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { logger } from "../lib/logger.js";
import { blockchainService } from "./blockchainService.js";

export interface TrustScore {
  overallScore: number; // 0-100
  factors: {
    completeTraceability: number; // 0-25
    verifiedSales: number; // 0-20
    consumerEngagement: number; // 0-20
    certifications: number; // 0-15
    consistency: number; // 0-20
  };
  badgeLevel: "Bronze" | "Silver" | "Gold" | "Platinum" | "None";
  strengths: string[];
  improvementAreas: string[];
}

export interface ProductTrustScore {
  score: number; // 0-100
  factors: {
    completeData: boolean; // Has all required data
    blockchainVerified: boolean; // Has blockchain records
    qrCodeGenerated: boolean; // Has QR code
    scanned: boolean; // Has been scanned
    popularProduct: boolean; // High scan count
  };
  status: "Excellent" | "Good" | "Fair" | "Poor";
}

export class TrustScoringService {
  /**
   * Calculate trust score for a farmer
   */
  async calculateFarmerTrustScore(userId: number): Promise<TrustScore> {
    try {
      logger.info(`Calculating trust score for user ${userId}`);

      // Get user and farmer profile
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      if (!user) {
        throw new Error("User not found");
      }

      const [farmerProfile] = await db
        .select()
        .from(farmerProfiles)
        .where(eq(farmerProfiles.userId, userId))
        .limit(1);

      // Get all user's crops
      const userCrops = await db
        .select()
        .from(crops)
        .where(eq(crops.userId, userId));

      // Calculate each factor
      const completeTraceability = await this.calculateTraceabilityScore(
        userCrops
      );
      const verifiedSales = await this.calculateVerifiedSalesScore(userCrops);
      const consumerEngagement = await this.calculateEngagementScore(userCrops);
      const certifications = this.calculateCertificationScore(
        userCrops,
        farmerProfile
      );
      const consistency = await this.calculateConsistencyScore(userCrops);

      const factors = {
        completeTraceability,
        verifiedSales,
        consumerEngagement,
        certifications,
        consistency,
      };

      const overallScore =
        completeTraceability +
        verifiedSales +
        consumerEngagement +
        certifications +
        consistency;

      const badgeLevel = this.getBadgeLevel(overallScore);
      const { strengths, improvementAreas } = this.getScoreInsights(
        factors,
        overallScore
      );

      logger.info(
        `Trust score calculated for user ${userId}: ${overallScore}/100 (${badgeLevel})`
      );

      return {
        overallScore,
        factors,
        badgeLevel,
        strengths,
        improvementAreas,
      };
    } catch (error) {
      logger.error(`Error calculating trust score for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate trust score for a specific product/crop
   */
  async calculateProductTrustScore(cropId: number): Promise<ProductTrustScore> {
    try {
      const [crop] = await db
        .select()
        .from(crops)
        .where(eq(crops.id, cropId))
        .limit(1);

      if (!crop) {
        throw new Error("Crop not found");
      }

      // Check factors
      const hasBasicData = !!(crop.name && crop.variety && crop.status);
      const hasTraceData = !!(
        crop.batchId &&
        crop.seedSource &&
        crop.seedVariety
      );
      const completeData = hasBasicData && hasTraceData;

      // Check if actually on blockchain (not just has txId)
      let blockchainVerified = false;
      if (crop.blockchainTxId && blockchainService.isEnabled()) {
        blockchainVerified = await blockchainService.verifyTransaction(
          crop.blockchainTxId
        );
      }
      const qrCodeGenerated = !!crop.traceabilityQrCode;
      const scanned = (crop.qrScanCount || 0) > 0;
      const popularProduct = (crop.qrScanCount || 0) >= 10;

      const factors = {
        completeData,
        blockchainVerified,
        qrCodeGenerated,
        scanned,
        popularProduct,
      };

      // Calculate score
      let score = 0;
      if (completeData) score += 30;
      if (blockchainVerified) score += 20;
      if (qrCodeGenerated) score += 20;
      if (scanned) score += 20;
      if (popularProduct) score += 10;

      const status =
        score >= 80
          ? "Excellent"
          : score >= 60
          ? "Good"
          : score >= 40
          ? "Fair"
          : "Poor";

      return {
        score,
        factors,
        status,
      };
    } catch (error) {
      logger.error(
        `Error calculating product trust score for crop ${cropId}:`,
        error
      );
      throw error;
    }
  }

  // Private helper methods
  private async calculateTraceabilityScore(userCrops: any[]): Promise<number> {
    if (userCrops.length === 0) return 0;

    let completeCount = 0;
    for (const crop of userCrops) {
      const hasBasicData = !!(crop.name && crop.variety && crop.status);
      const hasTraceData = !!(
        crop.batchId &&
        crop.seedSource &&
        crop.seedVariety
      );
      const hasQR = !!crop.traceabilityQrCode;

      if (hasBasicData && hasTraceData && hasQR) {
        completeCount++;
      }
    }

    const percentage = (completeCount / userCrops.length) * 100;
    return Math.round((percentage / 100) * 25); // Max 25 points
  }

  private async calculateVerifiedSalesScore(userCrops: any[]): Promise<number> {
    const cropsWithQR = userCrops.filter((c) => c.traceabilityQrCode);
    const totalCrops = userCrops.length;

    if (totalCrops === 0) return 0;

    const percentage = (cropsWithQR.length / totalCrops) * 100;
    return Math.round((percentage / 100) * 20); // Max 20 points
  }

  private async calculateEngagementScore(userCrops: any[]): Promise<number> {
    const totalScans = userCrops.reduce(
      (sum, crop) => sum + (crop.qrScanCount || 0),
      0
    );

    // Score based on total scans
    // 0 scans = 0 points
    // 50+ scans = 10 points
    // 100+ scans = 15 points
    // 200+ scans = 20 points
    if (totalScans === 0) return 0;
    if (totalScans < 50) return Math.round((totalScans / 50) * 10);
    if (totalScans < 100) return 10 + Math.round(((totalScans - 50) / 50) * 5);
    if (totalScans < 200)
      return 15 + Math.round(((totalScans - 100) / 100) * 5);
    return 20;
  }

  private calculateCertificationScore(
    userCrops: any[],
    farmerProfile: any
  ): number {
    let score = 0;

    // Organic certification
    const organicCrops = userCrops.filter((c) => c.organicCertified);
    if (organicCrops.length > 0) {
      score += 10;
    }

    // Farmer profile completeness
    if (farmerProfile) {
      const hasCompleteProfile =
        farmerProfile.farmName &&
        farmerProfile.farmLocation &&
        farmerProfile.bio &&
        farmerProfile.mainCrops &&
        farmerProfile.establishedYear;

      if (hasCompleteProfile) {
        score += 5;
      }
    }

    return Math.min(score, 15); // Max 15 points
  }

  private async calculateConsistencyScore(userCrops: any[]): Promise<number> {
    if (userCrops.length < 2) return 10; // Give some initial credit

    // Check consistency in using traceability features
    const cropsWithQR = userCrops.filter((c) => c.traceabilityQrCode);
    const consistencyRate = (cropsWithQR.length / userCrops.length) * 100;

    // Check recency of activity (crops created in last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentCrops = userCrops.filter(
      (c) => new Date(c.createdAt) >= sixMonthsAgo
    );
    const recentActivityBonus = recentCrops.length > 0 ? 5 : 0;

    const baseScore = Math.round((consistencyRate / 100) * 15);
    return Math.min(baseScore + recentActivityBonus, 20); // Max 20 points
  }

  private getBadgeLevel(
    score: number
  ): "Bronze" | "Silver" | "Gold" | "Platinum" | "None" {
    if (score >= 90) return "Platinum";
    if (score >= 75) return "Gold";
    if (score >= 60) return "Silver";
    if (score >= 40) return "Bronze";
    return "None";
  }

  private getScoreInsights(
    factors: TrustScore["factors"],
    overallScore: number
  ): { strengths: string[]; improvementAreas: string[] } {
    const strengths: string[] = [];
    const improvementAreas: string[] = [];

    // Analyze each factor
    if (factors.completeTraceability >= 20) {
      strengths.push("Excellent traceability record keeping");
    } else if (factors.completeTraceability < 10) {
      improvementAreas.push("Add complete traceability data to more crops");
    }

    if (factors.verifiedSales >= 15) {
      strengths.push("High rate of verified product sales");
    } else if (factors.verifiedSales < 8) {
      improvementAreas.push("Enable QR codes for more products");
    }

    if (factors.consumerEngagement >= 15) {
      strengths.push("Strong consumer engagement and trust");
    } else if (factors.consumerEngagement < 5) {
      improvementAreas.push("Promote QR code scanning to consumers");
    }

    if (factors.certifications >= 10) {
      strengths.push("Quality certifications and complete profile");
    } else {
      improvementAreas.push(
        "Add organic certifications or complete your profile"
      );
    }

    if (factors.consistency >= 15) {
      strengths.push("Consistent use of traceability features");
    } else if (factors.consistency < 8) {
      improvementAreas.push("Use traceability features more consistently");
    }

    return { strengths, improvementAreas };
  }
}

export const trustScoringService = new TrustScoringService();
