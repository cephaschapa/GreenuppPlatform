import express from "express";
import { cropTraceService } from "../services/croptrace";
import type { Request, Response, NextFunction } from "express";
import { db } from "../db";
import {
  crops,
  cropTraceEvents,
  marketplaceListings,
  fields,
} from "@shared/schema";
import { eq, isNotNull } from "drizzle-orm";

const router = express.Router();

// Middleware to check authentication
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
}

// Initialize traceability for a crop
router.post(
  "/crops/:cropId/trace/initialize",
  isAuthenticated,
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const cropId = parseInt(req.params.cropId);
      if (isNaN(cropId)) {
        return res.status(400).json({ message: "Invalid crop ID" });
      }

      // Check if the crop belongs to the user
      const [crop] = await db.select().from(crops).where(eq(crops.id, cropId));

      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }

      if (crop.userId !== req.user.id) {
        return res.status(403).json({ message: "You do not own this crop" });
      }

      // Initialize traceability
      const result = await cropTraceService.initializeCropTraceability(
        cropId,
        req.body
      );

      res.status(200).json(result);
    } catch (error) {
      console.error("Error initializing crop traceability:", error);
      res
        .status(500)
        .json({ message: "Failed to initialize crop traceability" });
    }
  }
);

// Record a crop event
router.post(
  "/crops/:cropId/trace/events",
  isAuthenticated,
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const cropId = parseInt(req.params.cropId);
      if (isNaN(cropId)) {
        return res.status(400).json({ message: "Invalid crop ID" });
      }

      // Check if the crop belongs to the user
      const [crop] = await db.select().from(crops).where(eq(crops.id, cropId));

      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }

      if (crop.userId !== req.user.id) {
        return res.status(403).json({ message: "You do not own this crop" });
      }

      // Validate required fields
      const { eventType, description } = req.body;
      if (!eventType || !description) {
        return res
          .status(400)
          .json({ message: "Event type and description are required" });
      }

      // Record the event
      const result = await cropTraceService.recordCropEvent(
        cropId,
        eventType,
        req.body,
        req.user.id
      );

      res.status(200).json(result);
    } catch (error) {
      console.error("Error recording crop event:", error);
      res.status(500).json({ message: "Failed to record crop event" });
    }
  }
);

// Link a marketplace listing to a crop
router.post(
  "/marketplace/listings/:listingId/trace",
  isAuthenticated,
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const listingId = parseInt(req.params.listingId);
      const { cropId } = req.body;

      if (isNaN(listingId) || !cropId || isNaN(parseInt(cropId))) {
        return res
          .status(400)
          .json({ message: "Invalid listing ID or crop ID" });
      }

      // Check if the listing belongs to the user
      const [listing] = await db
        .select()
        .from(marketplaceListings)
        .where(eq(marketplaceListings.id, listingId));

      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      if (listing.sellerId !== req.user.id) {
        return res.status(403).json({ message: "You do not own this listing" });
      }

      // Check if the crop belongs to the user
      const [crop] = await db
        .select()
        .from(crops)
        .where(eq(crops.id, parseInt(cropId)));

      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }

      if (crop.userId !== req.user.id) {
        return res.status(403).json({ message: "You do not own this crop" });
      }

      // Link the listing to the crop
      const result = await cropTraceService.linkListingToCrop(
        listingId,
        parseInt(cropId)
      );

      res.status(200).json(result);
    } catch (error) {
      console.error("Error linking listing to crop:", error);
      res.status(500).json({ message: "Failed to link listing to crop" });
    }
  }
);

// Get crop traceability history
router.get(
  "/crops/:cropId/trace/history",
  isAuthenticated,
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const cropId = parseInt(req.params.cropId);
      if (isNaN(cropId)) {
        return res.status(400).json({ message: "Invalid crop ID" });
      }

      // Check if the crop belongs to the user
      const [crop] = await db.select().from(crops).where(eq(crops.id, cropId));

      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }

      if (crop.userId !== req.user.id) {
        return res.status(403).json({ message: "You do not own this crop" });
      }

      // Get the traceability history
      const history = await cropTraceService.getCropTraceabilityHistory(cropId);

      res.status(200).json(history);
    } catch (error) {
      console.error("Error getting crop traceability history:", error);
      res
        .status(500)
        .json({ message: "Failed to get crop traceability history" });
    }
  }
);

// Get crop events
router.get(
  "/crops/:cropId/trace/events",
  isAuthenticated,
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const cropId = parseInt(req.params.cropId);
      if (isNaN(cropId)) {
        return res.status(400).json({ message: "Invalid crop ID" });
      }

      // Check if the crop belongs to the user
      const [crop] = await db.select().from(crops).where(eq(crops.id, cropId));

      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }

      if (crop.userId !== req.user.id) {
        return res.status(403).json({ message: "You do not own this crop" });
      }

      // Get the events
      const events = await db
        .select()
        .from(cropTraceEvents)
        .where(eq(cropTraceEvents.cropId, cropId))
        .orderBy(cropTraceEvents.eventDate);

      res.status(200).json(events);
    } catch (error) {
      console.error("Error getting crop events:", error);
      res.status(500).json({ message: "Failed to get crop events" });
    }
  }
);

// Verify a batch ID (internal verification endpoint)
router.get(
  "/verify/:batchId",
  isAuthenticated,
  async (req: Request & { user?: any }, res: Response) => {
    try {
      const { batchId } = req.params;

      if (!batchId) {
        return res.status(400).json({ message: "Batch ID is required" });
      }

      // Get the crop associated with this batch ID
      const [crop] = await db
        .select()
        .from(crops)
        .where(eq(crops.batchId, batchId));

      if (!crop) {
        return res
          .status(404)
          .json({ message: "No crop found with this batch ID" });
      }

      // Check if the crop belongs to the user
      if (crop.userId !== req.user.id) {
        return res.status(403).json({ message: "You do not own this crop" });
      }

      // Verify the batch traceability
      const verificationResult = await cropTraceService.verifyBatchTraceability(
        batchId
      );

      res.status(200).json(verificationResult);
    } catch (error) {
      console.error("Error verifying batch:", error);
      res.status(500).json({ message: "Failed to verify batch" });
    }
  }
);

// Get all scannable products for a user
router.get(
  "/scannable-products",
  isAuthenticated,
  async (req: Request & { user?: any }, res: Response) => {
    try {
      // Get crops with batch IDs
      const cropsWithBatch = await db
        .select()
        .from(crops)
        .where(eq(crops.userId, req.user.id))
        .where(isNotNull(crops.batchId));

      // Get marketplace listings with traceability
      const listingsWithTrace = await db
        .select()
        .from(marketplaceListings)
        .where(eq(marketplaceListings.sellerId, req.user.id))
        .where(eq(marketplaceListings.blockchainVerified, true));

      // Join crops with their fields
      const cropsWithFields = await Promise.all(
        cropsWithBatch.map(async (crop: any) => {
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

      // Join listings with their source crops
      const listingsWithCrops = await Promise.all(
        listingsWithTrace.map(async (listing: any) => {
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

      res.status(200).json({
        crops: cropsWithFields,
        listings: listingsWithCrops,
      });
    } catch (error) {
      console.error("Error getting scannable products:", error);
      res.status(500).json({ message: "Failed to get scannable products" });
    }
  }
);

export default router;
