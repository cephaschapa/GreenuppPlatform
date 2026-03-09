import type { Request, Response } from "express";
import fs from "fs";
import { MarketplaceModel } from "../models/MarketplaceModel";
import { InventoryModel } from "../models/InventoryModel";
import { logger } from "../lib/logger";
import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
} from "../lib/errors";
import {
  insertMarketplaceListingSchema,
  insertMarketplaceReviewSchema,
  insertMarketplaceFavoriteSchema,
  insertMarketplaceMessageSchema,
} from "@shared/schema";
import { CloudinaryService } from "../services/cloudinaryService.js";

const MARKETPLACE_IMAGE_FOLDER = "marketplace";

/**
 * Process uploaded listing images: upload to Cloudinary when configured,
 * otherwise return local /uploads URLs.
 */
async function processListingImages(
  req: Request
): Promise<string[]> {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return [];
  }
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? `${req.protocol}://${req.get("host")}`
      : `${req.protocol}://${req.get("host")}`;
  const urls: string[] = [];
  for (const file of req.files as Express.Multer.File[]) {
    try {
      if (CloudinaryService.isConfigured()) {
        const result = await CloudinaryService.uploadImage(
          file.path,
          MARKETPLACE_IMAGE_FOLDER
        );
        urls.push(result.url);
        try {
          fs.unlinkSync(file.path);
        } catch {
          logger.warn("Failed to delete temp file after Cloudinary upload:", file.path);
        }
      } else {
        urls.push(`${baseUrl}/uploads/${file.filename}`);
      }
    } catch (err) {
      logger.error("Error processing listing image:", err);
      // Fallback to local URL so listing still saves
      urls.push(`${baseUrl}/uploads/${file.filename}`);
    }
  }
  return urls;
}

export class MarketplaceController {
  private model: MarketplaceModel;
  private inventoryModel: InventoryModel;

  constructor() {
    this.model = new MarketplaceModel();
    this.inventoryModel = new InventoryModel();
  }

  // Listings methods
  async getListings(req: Request, res: Response): Promise<void> {
    try {
      const {
        category,
        query,
        search,
        priceMin,
        priceMax,
        sellerId,
        condition,
        status,
        sortBy,
        limit,
        offset,
      } = req.query;

      let sellerIdParam: number | undefined;
      if (sellerId) {
        sellerIdParam = parseInt(sellerId as string);
        if (isNaN(sellerIdParam)) {
          throw new ValidationError("Invalid seller ID");
        }
      }

      // Build filters object
      const filters: Record<string, any> = {};

      if (category && category !== "all") {
        filters.category = category;
      }

      if (priceMin) {
        const min = parseFloat(priceMin as string);
        if (!isNaN(min)) {
          filters.minPrice = min;
        }
      }

      if (priceMax) {
        const max = parseFloat(priceMax as string);
        if (!isNaN(max)) {
          filters.maxPrice = max;
        }
      }

      if (sellerIdParam) {
        filters.sellerId = sellerIdParam;
      }

      // Handle search query - support both 'query' and 'search' parameters
      if (query || search) {
        filters.search = query || search;
      }

      if (condition) {
        filters.condition = condition;
      }

      if (status) {
        filters.status = status;
      }

      if (sortBy) {
        filters.sortBy = sortBy;
      }

      if (limit) {
        const limitNum = parseInt(limit as string);
        if (!isNaN(limitNum)) {
          filters.limit = limitNum;
        }
      }

      if (offset) {
        const offsetNum = parseInt(offset as string);
        if (!isNaN(offsetNum)) {
          filters.offset = offsetNum;
        }
      }

      const listings = await this.model.getListings(filters);
      res.json(listings);
    } catch (error) {
      logger.error("Error fetching marketplace listings:", error);
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to retrieve listings" });
      }
    }
  }

  async getListingsByLocation(req: Request, res: Response): Promise<void> {
    try {
      const { lat, lng, radius = "50" } = req.query;

      if (!lat || !lng) {
        throw new ValidationError("Latitude and longitude are required");
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const radiusKm = parseFloat(radius as string);

      if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) {
        throw new ValidationError("Invalid coordinates or radius");
      }

      const listings = await this.model.getListingsByLocation(
        latitude,
        longitude,
        radiusKm
      );

      res.json(listings);
    } catch (error) {
      logger.error("Error fetching listings by location:", error);
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to retrieve listings" });
      }
    }
  }

  async getListingsBySeller(req: Request, res: Response): Promise<void> {
    try {
      const { sellerId } = req.params;
      const sellerIdNum = parseInt(sellerId);

      if (isNaN(sellerIdNum)) {
        throw new ValidationError("Invalid seller ID");
      }

      const listings = await this.model.getListingsBySeller(sellerIdNum);
      res.json(listings);
    } catch (error) {
      logger.error("Error fetching seller listings:", error);
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to retrieve listings" });
      }
    }
  }

  async getListing(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const listingId = parseInt(id);

      if (isNaN(listingId)) {
        throw new ValidationError("Invalid listing ID");
      }

      const listing = await this.model.getListing(listingId);

      if (!listing) {
        throw new NotFoundError("Listing not found");
      }

      res.json(listing);
    } catch (error) {
      logger.error("Error fetching marketplace listing:", error);
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to retrieve listing" });
      }
    }
  }

  async createListing(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      // Debug: Log what we're receiving
      console.log("=== CREATE LISTING DEBUG ===");
      console.log("Content-Type:", req.headers["content-type"]);
      console.log("req.body:", req.body);
      console.log("req.body type:", typeof req.body);
      console.log("req.body keys:", Object.keys(req.body || {}));
      console.log("req.files:", req.files);

      // Handle FormData vs JSON
      let parsedData = req.body;

      // If it's FormData, we need to handle it differently
      if (req.headers["content-type"]?.includes("multipart/form-data")) {
        console.log("Processing FormData...");

        // Upload images to Cloudinary (or keep local URLs)
        const imageUrls = await processListingImages(req);

        // FormData should already be parsed by multer middleware
        // But let's ensure we have the right structure
        parsedData = {
          ...req.body,
          // Convert string arrays back to arrays if they were sent as FormData
          tags: req.body.tags
            ? Array.isArray(req.body.tags)
              ? req.body.tags
              : [req.body.tags]
            : undefined,
          // Use uploaded file URLs instead of the original images field
          images: imageUrls.length > 0 ? imageUrls : undefined,
        };
      }

      console.log("Parsed data:", parsedData);

      const listingData = insertMarketplaceListingSchema.parse({
        ...parsedData,
        sellerId: req.user.id,
      });

      console.log("Validated listing data:", listingData);

      // Helper function to validate and clean dates
      const cleanDate = (date: any) => {
        if (!date) return undefined;
        if (date instanceof Date) {
          return isNaN(date.getTime()) ? undefined : date;
        }
        const parsed = new Date(date);
        return isNaN(parsed.getTime()) ? undefined : parsed;
      };

      // Helper function to validate and clean numbers
      const cleanNumber = (num: any) => {
        if (num === null || num === undefined || num === "") return undefined;
        const parsed = typeof num === "number" ? num : parseFloat(num);
        return isNaN(parsed) ? undefined : parsed;
      };

      // Convert null values to undefined for the model
      const modelData = {
        ...listingData,
        condition: listingData.condition || undefined,
        description: listingData.description || undefined,
        price: cleanNumber(listingData.price),
        quantity: cleanNumber(listingData.quantity),
        quantityUnit: listingData.quantityUnit || undefined,
        locationId: listingData.locationId || undefined,
        contactPhone: listingData.contactPhone || undefined,
        deliveryAvailable: listingData.deliveryAvailable ?? false,
        isNegotiable: listingData.isNegotiable ?? false,
        isFeatured: listingData.isFeatured ?? false,
        expiresAt: cleanDate(listingData.expiresAt),
        harvestDate: cleanDate(listingData.harvestDate),
        expiryDate: cleanDate(listingData.expiryDate),
        farmEstablishedYear: cleanNumber(listingData.farmEstablishedYear),
        carbonFootprint: cleanNumber(listingData.carbonFootprint),
        waterUsage: cleanNumber(listingData.waterUsage),
        trustScore: cleanNumber(listingData.trustScore),
        averageRating: cleanNumber(listingData.averageRating),
        sustainabilityScore: cleanNumber(listingData.sustainabilityScore),
        sellerRating: cleanNumber(listingData.sellerRating),
        qualityScore: cleanNumber(listingData.qualityScore),
        status: listingData.status || "active",
        images: listingData.images || undefined,
        tags: listingData.tags || undefined,
        sourceCropId: listingData.sourceCropId || undefined,
        traceabilityQrCode: listingData.traceabilityQrCode || undefined,
        certifications: listingData.certifications || undefined,
        blockchainVerified: listingData.blockchainVerified ?? false,
        traceabilityBatchId: listingData.traceabilityBatchId || undefined,
      };

      console.log("Model data:", modelData);

      const newListing = await this.model.createListing(modelData);

      // If sourceCropId is provided, automatically link traceability data
      if (modelData.sourceCropId) {
        try {
          const { db } = await import("../db.js");
          const { crops } = await import("@shared/schema");
          const { eq } = await import("drizzle-orm");

          const [sourceCrop] = await db
            .select()
            .from(crops)
            .where(eq(crops.id, modelData.sourceCropId))
            .limit(1);

          if (
            sourceCrop &&
            sourceCrop.batchId &&
            sourceCrop.traceabilityQrCode
          ) {
            // Update the listing with traceability info from the crop
            const { marketplaceListings } = await import("@shared/schema");
            await db
              .update(marketplaceListings)
              .set({
                traceabilityBatchId: sourceCrop.batchId,
                traceabilityQrCode: sourceCrop.traceabilityQrCode,
                blockchainVerified: !!sourceCrop.blockchainTxId,
              })
              .where(eq(marketplaceListings.id, newListing.id));

            // Fetch updated listing to return
            const [updatedListing] = await db
              .select()
              .from(marketplaceListings)
              .where(eq(marketplaceListings.id, newListing.id))
              .limit(1);

            logger.info(
              `Marketplace listing ${newListing.id} linked to crop ${sourceCrop.id} with batch ${sourceCrop.batchId}`
            );

            return res.status(201).json(updatedListing || newListing);
          }
        } catch (linkError) {
          logger.warn("Failed to auto-link traceability data:", linkError);
          // Continue anyway, listing was created successfully
        }
      }

      logger.info(
        `New marketplace listing created: ${newListing.id} by user ${req.user.id}`
      );
      res.status(201).json(newListing);
    } catch (error: unknown) {
      logger.error("Error creating marketplace listing:", error);
      res.status(500).json({ message: "Failed to create marketplace listing" });
    }
  }

  async updateListing(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { id } = req.params;
      const listingId = parseInt(id);

      if (isNaN(listingId)) {
        throw new ValidationError("Invalid listing ID");
      }

      const existingListing = await this.model.getListing(listingId);

      if (!existingListing) {
        throw new NotFoundError("Listing not found");
      }

      if (existingListing.sellerId !== req.user.id) {
        throw new AuthorizationError("You can only update your own listings");
      }

      // Handle FormData vs JSON
      let parsedData = req.body;

      // If it's FormData, handle uploaded files (Cloudinary or local)
      if (req.headers["content-type"]?.includes("multipart/form-data")) {
        const imageUrls = await processListingImages(req);
        parsedData = {
          ...req.body,
          images: imageUrls.length > 0 ? imageUrls : existingListing.images,
        };
      }

      const listingData = insertMarketplaceListingSchema
        .partial()
        .parse(parsedData);

      // Helper function to validate and clean dates
      const cleanDate = (date: any) => {
        if (!date) return undefined;
        if (date instanceof Date) {
          return isNaN(date.getTime()) ? undefined : date;
        }
        const parsed = new Date(date);
        return isNaN(parsed.getTime()) ? undefined : parsed;
      };

      // Helper function to validate and clean numbers
      const cleanNumber = (num: any) => {
        if (num === null || num === undefined || num === "") return undefined;
        const parsed = typeof num === "number" ? num : parseFloat(num);
        return isNaN(parsed) ? undefined : parsed;
      };

      // Convert null values to undefined for the model
      const modelData = {
        ...listingData,
        condition: listingData.condition || undefined,
        description: listingData.description || undefined,
        price: cleanNumber(listingData.price),
        quantity: cleanNumber(listingData.quantity),
        farmEstablishedYear: cleanNumber(listingData.farmEstablishedYear),
        carbonFootprint: cleanNumber(listingData.carbonFootprint),
        waterUsage: cleanNumber(listingData.waterUsage),
        trustScore: cleanNumber(listingData.trustScore),
        averageRating: cleanNumber(listingData.averageRating),
        sustainabilityScore: cleanNumber(listingData.sustainabilityScore),
        sellerRating: cleanNumber(listingData.sellerRating),
        quantityUnit: listingData.quantityUnit || undefined,
        locationId: listingData.locationId || undefined,
        contactPhone: listingData.contactPhone || undefined,
        deliveryAvailable: listingData.deliveryAvailable ?? undefined,
        isNegotiable: listingData.isNegotiable ?? undefined,
        isFeatured: listingData.isFeatured ?? undefined,
        expiresAt: cleanDate(listingData.expiresAt),
        harvestDate: cleanDate(listingData.harvestDate),
        expiryDate: cleanDate(listingData.expiryDate),
        status: listingData.status || undefined,
        images: listingData.images || undefined,
        tags: listingData.tags || undefined,
        sourceCropId: listingData.sourceCropId || undefined,
        traceabilityQrCode: listingData.traceabilityQrCode || undefined,
        certifications: listingData.certifications || undefined,
        blockchainVerified: listingData.blockchainVerified ?? undefined,
        traceabilityBatchId: listingData.traceabilityBatchId || undefined,
      };

      const updatedListing = await this.model.updateListing(
        listingId,
        modelData
      );

      if (!updatedListing) {
        throw new DatabaseError("Failed to update listing");
      }

      logger.info(
        `Marketplace listing updated: ${listingId} by user ${req.user.id}`
      );
      res.json(updatedListing);
    } catch (error) {
      logger.error("Error updating marketplace listing:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ message: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update listing" });
      }
    }
  }

  async deleteListing(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { id } = req.params;
      const listingId = parseInt(id);

      if (isNaN(listingId)) {
        throw new ValidationError("Invalid listing ID");
      }

      const existingListing = await this.model.getListing(listingId);

      if (!existingListing) {
        throw new NotFoundError("Listing not found");
      }

      if (existingListing.sellerId !== req.user.id) {
        throw new AuthorizationError("You can only delete your own listings");
      }

      const success = await this.model.deleteListing(listingId);

      if (!success) {
        throw new DatabaseError("Failed to delete listing");
      }

      logger.info(
        `Marketplace listing deleted: ${listingId} by user ${req.user.id}`
      );
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting marketplace listing:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ message: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to delete listing" });
      }
    }
  }

  // Reviews methods
  async getReviews(req: Request, res: Response): Promise<void> {
    try {
      const { listingId, sellerId } = req.query;

      let listingIdParam: number | undefined;
      let sellerIdParam: number | undefined;

      if (listingId) {
        listingIdParam = parseInt(listingId as string);
        if (isNaN(listingIdParam)) {
          throw new ValidationError("Invalid listing ID");
        }
      }

      if (sellerId) {
        sellerIdParam = parseInt(sellerId as string);
        if (isNaN(sellerIdParam)) {
          throw new ValidationError("Invalid seller ID");
        }
      }

      const reviews = await this.model.getReviews(
        listingIdParam,
        sellerIdParam
      );
      res.json(reviews);
    } catch (error) {
      logger.error("Error fetching marketplace reviews:", error);
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to retrieve reviews" });
      }
    }
  }

  async createReview(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const reviewData = insertMarketplaceReviewSchema.parse({
        ...req.body,
        reviewerId: req.user.id,
      });

      // Convert null values to undefined for the model
      const modelData = {
        ...reviewData,
        listingId: reviewData.listingId || undefined,
        review: reviewData.review || undefined,
      };

      const newReview = await this.model.createReview(modelData);

      logger.info(
        `New marketplace review created: ${newReview.id} by user ${req.user.id}`
      );
      res.status(201).json(newReview);
    } catch (error) {
      logger.error("Error creating marketplace review:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create review" });
      }
    }
  }

  async updateReview(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { id } = req.params;
      const reviewId = parseInt(id);

      if (isNaN(reviewId)) {
        throw new ValidationError("Invalid review ID");
      }

      const existingReview = await this.model.getReview(reviewId);

      if (!existingReview) {
        throw new NotFoundError("Review not found");
      }

      if (existingReview.reviewerId !== req.user.id) {
        throw new AuthorizationError("You can only update your own reviews");
      }

      const reviewData = insertMarketplaceReviewSchema
        .partial()
        .pick({ rating: true, review: true })
        .parse(req.body);

      // Convert null values to undefined for the model
      const modelData = {
        ...reviewData,
        review: reviewData.review || undefined,
      };

      const updatedReview = await this.model.updateReview(reviewId, modelData);

      if (!updatedReview) {
        throw new DatabaseError("Failed to update review");
      }

      logger.info(
        `Marketplace review updated: ${reviewId} by user ${req.user.id}`
      );
      res.json(updatedReview);
    } catch (error) {
      logger.error("Error updating marketplace review:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ message: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update review" });
      }
    }
  }

  async deleteReview(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { id } = req.params;
      const reviewId = parseInt(id);

      if (isNaN(reviewId)) {
        throw new ValidationError("Invalid review ID");
      }

      const existingReview = await this.model.getReview(reviewId);

      if (!existingReview) {
        throw new NotFoundError("Review not found");
      }

      if (existingReview.reviewerId !== req.user.id) {
        throw new AuthorizationError("You can only delete your own reviews");
      }

      const success = await this.model.deleteReview(reviewId);

      if (!success) {
        throw new DatabaseError("Failed to delete review");
      }

      logger.info(
        `Marketplace review deleted: ${reviewId} by user ${req.user.id}`
      );
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting marketplace review:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ message: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to delete review" });
      }
    }
  }

  // Favorites methods
  async getFavorites(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const favorites = await this.model.getFavorites(req.user.id);
      res.json(favorites);
    } catch (error) {
      logger.error("Error fetching marketplace favorites:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else {
        res.status(500).json({ message: "Failed to retrieve favorites" });
      }
    }
  }

  async createFavorite(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const favoriteData = insertMarketplaceFavoriteSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const newFavorite = await this.model.createFavorite(favoriteData);

      logger.info(
        `New marketplace favorite created: ${newFavorite.id} by user ${req.user.id}`
      );
      res.status(201).json(newFavorite);
    } catch (error) {
      logger.error("Error creating marketplace favorite:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create favorite" });
      }
    }
  }

  async deleteFavorite(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { id } = req.params;
      const favoriteId = parseInt(id);

      if (isNaN(favoriteId)) {
        throw new ValidationError("Invalid favorite ID");
      }

      const existingFavorite = await this.model.getFavorite(favoriteId);

      if (!existingFavorite) {
        throw new NotFoundError("Favorite not found");
      }

      if (existingFavorite.userId !== req.user.id) {
        throw new AuthorizationError("You can only delete your own favorites");
      }

      const success = await this.model.deleteFavorite(favoriteId);

      if (!success) {
        throw new DatabaseError("Failed to delete favorite");
      }

      logger.info(
        `Marketplace favorite deleted: ${favoriteId} by user ${req.user.id}`
      );
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting marketplace favorite:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ message: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to delete favorite" });
      }
    }
  }

  // Messages methods
  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { listingId, senderId, recipientId } = req.query;

      let listingIdParam: number | undefined;
      let senderIdParam: number | undefined;
      let recipientIdParam: number | undefined;

      if (listingId) {
        listingIdParam = parseInt(listingId as string);
        if (isNaN(listingIdParam)) {
          throw new ValidationError("Invalid listing ID");
        }
      }

      if (senderId) {
        senderIdParam = parseInt(senderId as string);
        if (isNaN(senderIdParam)) {
          throw new ValidationError("Invalid sender ID");
        }
      }

      if (recipientId) {
        recipientIdParam = parseInt(recipientId as string);
        if (isNaN(recipientIdParam)) {
          throw new ValidationError("Invalid recipient ID");
        }
      }

      const messages = await this.model.getMessages({
        listingId: listingIdParam,
        senderId: senderIdParam,
        recipientId: recipientIdParam,
        userId: req.user.id,
      });

      res.json(messages);
    } catch (error) {
      logger.error("Error fetching marketplace messages:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to retrieve messages" });
      }
    }
  }

  async createMessage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const messageData = insertMarketplaceMessageSchema.parse({
        ...req.body,
        senderId: req.user.id,
      });

      // Convert null values to undefined for the model
      const modelData = {
        ...messageData,
        listingId: messageData.listingId || undefined,
      };

      const newMessage = await this.model.createMessage(modelData);

      logger.info(
        `New marketplace message created: ${newMessage.id} by user ${req.user.id}`
      );
      res.status(201).json(newMessage);
    } catch (error) {
      logger.error("Error creating marketplace message:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create message" });
      }
    }
  }

  async updateMessage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { id } = req.params;
      const messageId = parseInt(id);

      if (isNaN(messageId)) {
        throw new ValidationError("Invalid message ID");
      }

      const existingMessage = await this.model.getMessage(messageId);

      if (!existingMessage) {
        throw new NotFoundError("Message not found");
      }

      if (existingMessage.senderId !== req.user.id) {
        throw new AuthorizationError("You can only update your own messages");
      }

      const messageData = insertMarketplaceMessageSchema
        .partial()
        .pick({ message: true })
        .parse(req.body);

      const updatedMessage = await this.model.updateMessage(
        messageId,
        messageData
      );

      if (!updatedMessage) {
        throw new DatabaseError("Failed to update message");
      }

      logger.info(
        `Marketplace message updated: ${messageId} by user ${req.user.id}`
      );
      res.json(updatedMessage);
    } catch (error) {
      logger.error("Error updating marketplace message:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ message: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update message" });
      }
    }
  }

  async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { id } = req.params;
      const messageId = parseInt(id);

      if (isNaN(messageId)) {
        throw new ValidationError("Invalid message ID");
      }

      const existingMessage = await this.model.getMessage(messageId);

      if (!existingMessage) {
        throw new NotFoundError("Message not found");
      }

      if (existingMessage.senderId !== req.user.id) {
        throw new AuthorizationError("You can only delete your own messages");
      }

      const success = await this.model.deleteMessage(messageId);

      if (!success) {
        throw new DatabaseError("Failed to delete message");
      }

      logger.info(
        `Marketplace message deleted: ${messageId} by user ${req.user.id}`
      );
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting marketplace message:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ message: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to delete message" });
      }
    }
  }

  // Utility methods
  async getUnreadMessageCount(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const count = await this.model.getUnreadMessageCount(req.user.id);
      res.json({ count });
    } catch (error) {
      logger.error("Error fetching unread message count:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else {
        res.status(500).json({ message: "Failed to retrieve unread count" });
      }
    }
  }

  async getSellerStats(req: Request, res: Response): Promise<void> {
    try {
      const { sellerId } = req.params;
      const sellerIdNum = parseInt(sellerId);

      if (isNaN(sellerIdNum)) {
        throw new ValidationError("Invalid seller ID");
      }

      const stats = await this.model.getSellerStats(sellerIdNum);
      res.json(stats);
    } catch (error) {
      logger.error("Error fetching seller stats:", error);
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to retrieve seller stats" });
      }
    }
  }

  async getSearchSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { query, limit = "10" } = req.query;

      if (!query || typeof query !== "string") {
        res.json([]);
        return;
      }

      const limitNum = parseInt(limit as string);
      const searchTerm = query.toLowerCase();

      // Get all listings for suggestions
      const allListings = await this.model.getListings();

      // Create suggestions from titles and categories
      const suggestions = new Set<string>();

      allListings.forEach((listing) => {
        // Add title words that match the search term
        if (listing.title) {
          const titleWords = listing.title.toLowerCase().split(/\s+/);
          titleWords.forEach((word) => {
            if (word.startsWith(searchTerm) && word.length > 2) {
              suggestions.add(word);
            }
          });
        }

        // Add category if it matches
        if (
          listing.category &&
          listing.category.toLowerCase().includes(searchTerm)
        ) {
          suggestions.add(listing.category);
        }
      });

      // Convert to array and limit results
      const results = Array.from(suggestions)
        .slice(0, limitNum)
        .map((suggestion) => ({
          text: suggestion,
          type: "suggestion",
        }));

      res.json(results);
    } catch (error) {
      logger.error("Error fetching search suggestions:", error);
      res.status(500).json({ message: "Failed to retrieve suggestions" });
    }
  }
}
