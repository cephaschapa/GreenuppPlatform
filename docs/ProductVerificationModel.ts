import { db } from "../server/db.js";
import {
  crops,
  cropTraceEvents,
  marketplaceListings,
  fields,
  users,
  farmerProfiles,
} from "@shared/schema";
import { eq, isNotNull } from "drizzle-orm";
import type {
  Crop,
  MarketplaceListing,
  Field,
  User,
  FarmerProfile,
} from "@shared/schema";
import { scanTrackingService } from "../server/services/scanTrackingService.js";
import { blockchainService } from "../server/services/blockchainService.js";
import { logger } from "../server/lib/logger.js";

export interface VerificationResult {
  crop: Crop;
  blockchainHistory: any[];
  verificationResults: any[];
  allVerified: boolean;
  blockchainStatus: "simulated" | "live";
  disclaimer: string;
  farmer?: {
    name: string;
    farmName?: string;
    farmLocation?: string;
    bio?: string;
    mainCrops?: string[];
    establishedYear?: number;
  };
  field?: Field;
  analytics?: {
    totalScans: number;
    firstScan?: Date;
    lastScan?: Date;
    scansLast7Days: number;
    scansLast30Days: number;
    uniqueLocations: number;
  };
}

export interface ScannableProducts {
  crops: (Crop & { field?: Field })[];
  listings: (MarketplaceListing & { crop?: Crop })[];
}

export class ProductVerificationModel {
  static async getCropByBatchId(batchId: string): Promise<Crop | undefined> {
    const [crop] = await db
      .select()
      .from(crops)
      .where(eq(crops.batchId, batchId));
    return crop;
  }

  static async getCropWithField(
    cropId: number
  ): Promise<(Crop & { field?: Field }) | undefined> {
    const [crop] = await db.select().from(crops).where(eq(crops.id, cropId));

    if (!crop) return undefined;

    if (crop.fieldId) {
      const [field] = await db
        .select()
        .from(fields)
        .where(eq(fields.id, crop.fieldId));
      return { ...crop, field };
    }

    return crop;
  }

  static async getCropTraceabilityHistory(cropId: number): Promise<any[]> {
    return db
      .select()
      .from(cropTraceEvents)
      .where(eq(cropTraceEvents.cropId, cropId))
      .orderBy(cropTraceEvents.eventDate);
  }

  static async getScannableCrops(
    userId: number
  ): Promise<(Crop & { field?: Field })[]> {
    const cropsWithBatch = await db
      .select()
      .from(crops)
      .where(eq(crops.userId, userId))
      .where(isNotNull(crops.batchId));

    // Join crops with their fields
    const cropsWithFields = await Promise.all(
      cropsWithBatch.map(async (crop: Crop) => {
        if (crop.fieldId) {
          const [field] = await db
            .select()
            .from(fields)
            .where(eq(fields.id, crop.fieldId));
          return { ...crop, field };
        }
        return crop;
      })
    );

    return cropsWithFields;
  }

  static async getScannableListings(
    userId: number
  ): Promise<(MarketplaceListing & { crop?: Crop })[]> {
    const listingsWithTrace = await db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.sellerId, userId))
      .where(eq(marketplaceListings.blockchainVerified, true));

    // Join listings with their source crops
    const listingsWithCrops = await Promise.all(
      listingsWithTrace.map(async (listing: MarketplaceListing) => {
        if (listing.sourceCropId) {
          const [crop] = await db
            .select()
            .from(crops)
            .where(eq(crops.id, listing.sourceCropId));
          return { ...listing, crop };
        }
        return listing;
      })
    );

    return listingsWithCrops;
  }

  static async getScannableProducts(
    userId: number
  ): Promise<ScannableProducts> {
    const [crops, listings] = await Promise.all([
      this.getScannableCrops(userId),
      this.getScannableListings(userId),
    ]);

    return { crops, listings };
  }

  static async verifyBatchTraceability(
    batchId: string
  ): Promise<VerificationResult> {
    // Get the crop associated with this batch ID
    const crop = await this.getCropByBatchId(batchId);
    if (!crop) {
      throw new Error("No crop found with this batch ID");
    }

    // Get traceability history
    const blockchainHistory = await this.getCropTraceabilityHistory(crop.id);

    // Perform verification checks
    const verificationResults = [
      {
        check: "Batch ID exists",
        passed: !!crop.batchId,
        details: crop.batchId ? "Batch ID is present" : "No batch ID found",
      },
      {
        check: "Blockchain transactions",
        passed: blockchainHistory.length > 0,
        details: `${blockchainHistory.length} blockchain transactions found`,
      },
      {
        check: "QR Code generated",
        passed: !!crop.traceabilityQrCode,
        details: crop.traceabilityQrCode
          ? "QR code is available"
          : "No QR code found",
      },
      {
        check: "Crop status valid",
        passed: [
          "planning",
          "planted",
          "growing",
          "harvesting",
          "completed",
        ].includes(crop.status),
        details: `Crop status: ${crop.status}`,
      },
    ];

    const allVerified = verificationResults.every((result) => result.passed);

    // Get farmer profile information
    let farmerInfo;
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, crop.userId))
        .limit(1);

      if (user) {
        const [farmerProfile] = await db
          .select()
          .from(farmerProfiles)
          .where(eq(farmerProfiles.userId, user.id))
          .limit(1);

        farmerInfo = {
          name:
            user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.username,
          farmName: farmerProfile?.farmName,
          farmLocation: farmerProfile?.farmLocation,
          bio: farmerProfile?.bio,
          mainCrops: farmerProfile?.mainCrops,
          establishedYear: farmerProfile?.establishedYear,
        };
      }
    } catch (error) {
      logger.error("Failed to fetch farmer profile", error);
    }

    // Get field information
    let fieldInfo;
    if (crop.fieldId) {
      try {
        const [field] = await db
          .select()
          .from(fields)
          .where(eq(fields.id, crop.fieldId))
          .limit(1);
        fieldInfo = field;
      } catch (error) {
        logger.error("Failed to fetch field information", error);
      }
    }

    // Get scan analytics if available
    let analytics;
    try {
      const scanData = await scanTrackingService.getCropScanAnalytics(crop.id);
      analytics = {
        totalScans: scanData.totalScans,
        firstScan: scanData.firstScan,
        lastScan: scanData.lastScan,
        scansLast7Days: scanData.scansLast7Days,
        scansLast30Days: scanData.scansLast30Days,
        uniqueLocations: scanData.uniqueLocations,
      };
    } catch (error) {
      // Analytics failed, but don't block verification
      logger.error("Failed to fetch scan analytics", error);
    }

    // Check if blockchain is actually enabled
    const isBlockchainEnabled = blockchainService.isEnabled();
    const blockchainStatus: "live" | "simulated" = isBlockchainEnabled
      ? "live"
      : "simulated";
    const disclaimer = isBlockchainEnabled
      ? "All transactions are recorded on Polygon blockchain for permanent, tamper-proof traceability."
      : "Traceability data is stored securely in our database. Enable blockchain for immutable records.";

    return {
      crop,
      blockchainHistory,
      verificationResults,
      allVerified,
      blockchainStatus,
      disclaimer,
      farmer: farmerInfo,
      field: fieldInfo,
      analytics,
    };
  }
}
