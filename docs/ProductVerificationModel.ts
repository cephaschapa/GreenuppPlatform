import { db } from "../server/db.js";
import {
  crops,
  cropTraceEvents,
  marketplaceListings,
  fields,
} from "@shared/schema";
import { eq, isNotNull } from "drizzle-orm";
import type { Crop, MarketplaceListing, Field } from "@shared/schema";

export interface VerificationResult {
  crop: Crop;
  blockchainHistory: any[];
  verificationResults: any[];
  allVerified: boolean;
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

    return {
      crop,
      blockchainHistory,
      verificationResults,
      allVerified,
    };
  }
}
