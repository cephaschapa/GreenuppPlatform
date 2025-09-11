import { hyperledgerService } from "./hyperledger";
import { qrCodeService } from "./qrcode";
import { db } from "../db";
import { crops, cropTraceEvents, marketplaceListings } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Service for managing crop traceability
 */
export class CropTraceService {
  /**
   * Initialize a new crop for traceability
   * @param cropId The ID of the crop
   * @param cropData Additional crop data
   */
  async initializeCropTraceability(
    cropId: number,
    cropData: any
  ): Promise<{
    batchId: string;
    qrCode: string;
    blockchainTxId: string;
    blockchainTxHash: string;
  }> {
    // Generate a unique batch ID using the same format as manual generation
    const location = (cropData.location?.slice(0, 3) || "GEN").toUpperCase();
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const serial = Math.floor(1000 + Math.random() * 9000);
    const batchId = `${location}-${date}-${serial}`;

    // Record the crop on the blockchain
    const { txId, txHash } = await hyperledgerService.createCropBatch(
      cropId,
      batchId,
      cropData
    );

    // Generate QR code for traceability
    const qrCode = await qrCodeService.generateCropTraceQRCode(cropId, batchId);

    // Update the crop record in the database with blockchain info
    await db
      .update(crops)
      .set({
        batchId,
        blockchainTxId: txId,
        traceabilityQrCode: qrCode,
      })
      .where(eq(crops.id, cropId));

    return {
      batchId,
      qrCode,
      blockchainTxId: txId,
      blockchainTxHash: txHash,
    };
  }

  /**
   * Record an event in the crop's lifecycle
   * @param cropId The ID of the crop
   * @param eventType The type of event (planting, fertilizing, etc.)
   * @param eventData Details about the event
   * @param userId The ID of the user recording the event
   */
  async recordCropEvent(
    cropId: number,
    eventType: string,
    eventData: any,
    userId: number
  ): Promise<{
    eventId: number;
    blockchainTxId: string;
    blockchainTxHash: string;
  }> {
    // Get the crop to ensure it exists and get its batch ID
    const [crop] = await db.select().from(crops).where(eq(crops.id, cropId));

    if (!crop) {
      throw new Error(`Crop with ID ${cropId} not found`);
    }

    // Record the event on the blockchain
    const { txId, txHash } = await hyperledgerService.recordCropEvent(
      cropId,
      eventType,
      eventData,
      userId
    );

    // Record the event in the database
    const [eventRecord] = await db
      .insert(cropTraceEvents)
      .values({
        cropId,
        eventType,
        description: eventData.description || eventType,
        performedBy: userId,
        inputMaterials: eventData.inputMaterials || null,
        outputQuantity: eventData.outputQuantity || null,
        outputUnit: eventData.outputUnit || null,
        blockchainTxId: txId,
        blockchainTxHash: txHash,
        attachments: eventData.attachments || [],
        metadata: eventData.metadata || {},
      })
      .returning();

    return {
      eventId: eventRecord.id,
      blockchainTxId: txId,
      blockchainTxHash: txHash,
    };
  }

  /**
   * Link a marketplace listing to a source crop for traceability
   * @param listingId The ID of the marketplace listing
   * @param cropId The ID of the source crop
   */
  async linkListingToCrop(
    listingId: number,
    cropId: number
  ): Promise<{
    qrCode: string;
    blockchainTxId: string;
    blockchainTxHash: string;
  }> {
    // Get the crop to ensure it exists and get its batch ID
    const [crop] = await db.select().from(crops).where(eq(crops.id, cropId));

    if (!crop) {
      throw new Error(`Crop with ID ${cropId} not found`);
    }

    if (!crop.batchId) {
      // If the crop doesn't have a batch ID yet, initialize it
      await this.initializeCropTraceability(cropId, {
        name: crop.name,
        variety: crop.variety,
        status: crop.status,
      });

      // Fetch the crop again to get the batch ID
      const [updatedCrop] = await db
        .select()
        .from(crops)
        .where(eq(crops.id, cropId));

      if (!updatedCrop || !updatedCrop.batchId) {
        throw new Error("Failed to initialize crop traceability");
      }

      crop.batchId = updatedCrop.batchId;
    }

    // Record the link on the blockchain
    const { txId, txHash } = await hyperledgerService.linkListingToCrop(
      listingId,
      cropId,
      crop.batchId
    );

    // Generate QR code for the marketplace listing
    const qrCode = await qrCodeService.generateMarketplaceQRCode(
      listingId,
      crop.batchId
    );

    // Update the marketplace listing with traceability info
    await db
      .update(marketplaceListings)
      .set({
        sourceCropId: cropId,
        traceabilityQrCode: qrCode,
        traceabilityBatchId: crop.batchId,
        blockchainVerified: true,
      })
      .where(eq(marketplaceListings.id, listingId));

    // Record this as an event in the crop's lifecycle
    await this.recordCropEvent(
      cropId,
      "marketplace_listing",
      {
        description: `Crop listed on marketplace (ID: ${listingId})`,
        metadata: {
          listingId,
          timestamp: new Date().toISOString(),
        },
      },
      crop.userId
    );

    return {
      qrCode,
      blockchainTxId: txId,
      blockchainTxHash: txHash,
    };
  }

  /**
   * Get the complete traceability history for a crop
   * @param cropId The ID of the crop
   */
  async getCropTraceabilityHistory(cropId: number): Promise<any> {
    // Get the crop and its batch ID
    const [crop] = await db.select().from(crops).where(eq(crops.id, cropId));

    if (!crop) {
      throw new Error(`Crop with ID ${cropId} not found`);
    }

    // Get all events from the database
    const events = await db
      .select()
      .from(cropTraceEvents)
      .where(eq(cropTraceEvents.cropId, cropId))
      .orderBy(cropTraceEvents.eventDate);

    // Get any linked marketplace listings
    const listings = await db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.sourceCropId, cropId));

    // Get the blockchain history if available
    let blockchainHistory = [];
    if (crop.batchId) {
      blockchainHistory = await hyperledgerService.getCropHistory(
        cropId,
        crop.batchId
      );
    }

    return {
      crop,
      events,
      listings,
      blockchainHistory,
    };
  }

  /**
   * Verify a crop's traceability info from its batch ID
   * @param batchId The batch ID to verify
   */
  async verifyBatchTraceability(batchId: string): Promise<any> {
    // Get the crop associated with this batch ID
    const [crop] = await db
      .select()
      .from(crops)
      .where(eq(crops.batchId, batchId));

    if (!crop) {
      throw new Error(`No crop found with batch ID ${batchId}`);
    }

    // Get the blockchain history
    const blockchainHistory = await hyperledgerService.getCropHistory(
      crop.id,
      batchId
    );

    // Get all events from the database for verification
    const events = await db
      .select()
      .from(cropTraceEvents)
      .where(eq(cropTraceEvents.cropId, crop.id))
      .orderBy(cropTraceEvents.eventDate);

    // Verify blockchain transaction IDs
    const verificationPromises = events.map(async (event) => {
      if (event.blockchainTxId && event.blockchainTxHash) {
        const isVerified = await hyperledgerService.verifyTransaction(
          event.blockchainTxId,
          event.blockchainTxHash
        );
        return {
          eventId: event.id,
          eventType: event.eventType,
          verified: isVerified,
        };
      }
      return {
        eventId: event.id,
        eventType: event.eventType,
        verified: false,
      };
    });

    const verificationResults = await Promise.all(verificationPromises);

    return {
      crop,
      blockchainHistory,
      verificationResults,
      allVerified: verificationResults.every((result) => result.verified),
    };
  }
}

export const cropTraceService = new CropTraceService();
