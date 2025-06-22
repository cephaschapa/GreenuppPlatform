import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import multer from "multer";
import {
  insertMarketplaceListingSchema,
  insertMarketplaceReviewSchema,
  insertMarketplaceFavoriteSchema,
  insertMarketplaceMessageSchema,
} from "@shared/schema";
import { logger } from "../lib/logger";
import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
} from "../lib/errors";

// Configure multer for file uploads
function setupMarketplaceRoutes(app: Express) {
  // Debug middleware for marketplace routes
  app.use(
    "/api/marketplace*",
    (req: Request, res: Response, next: NextFunction) => {
      logger.debug(`Marketplace route hit: ${req.method} ${req.originalUrl}`);
      logger.debug("  Path:", req.path);
      logger.debug(
        "  Auth:",
        req.isAuthenticated() ? `User ${req.user?.id}` : "Not authenticated"
      );

      // Store the original path in case we need to debug later
      (req as any).originalMarketplacePath = req.path;

      next();
    }
  );

  // Configure multer for file uploads with error handling
  const multerStorage = multer.memoryStorage();
  const upload = multer({
    storage: multerStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
      files: 5, // Maximum of 5 files at once
    },
  });

  // Middleware to check authentication - marketplace specific
  function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
      return next();
    }
    throw new AuthenticationError();
  }

  // ---- MARKETPLACE TEST ENDPOINTS ----

  // Test marketplace endpoint
  app.post("/api/test-marketplace", isAuthenticated, async (req, res) => {
    logger.info("TEST MARKETPLACE endpoint hit");
    res
      .status(200)
      .json({ success: true, message: "Test marketplace endpoint working" });
  });

  // Direct test for marketplace listings endpoint
  app.post(
    "/api/marketplace-listings-test",
    isAuthenticated,
    async (req, res) => {
      logger.info("DIRECT TEST marketplace listings endpoint hit");
      try {
        if (!req.user) {
          throw new AuthenticationError();
        }

        logger.info("User authenticated in test:", req.user.id);
        logger.info("Request body:", req.body);

        res.status(200).json({
          success: true,
          message: "Test marketplace listings endpoint working",
          user: req.user.id,
        });
      } catch (error) {
        logger.error("Error in test endpoint:", error);
        res.status(500).json({ message: "Test endpoint error" });
      }
    }
  );

  // ---- MARKETPLACE LISTINGS ENDPOINTS ----

  // Get all marketplace listings
  app.get("/api/marketplace/listings", async (req, res) => {
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

      const listings = await storage.getMarketplaceListings(filters);

      res.json(listings);
    } catch (error) {
      logger.error("Error fetching marketplace listings:", error);
      res.status(500).json({ message: "Failed to retrieve listings" });
    }
  });

  // Get search suggestions for autocomplete
  app.get("/api/marketplace/search/suggestions", async (req, res) => {
    try {
      const { query, limit = "10" } = req.query;

      if (!query || typeof query !== "string") {
        return res.json([]);
      }

      const limitNum = parseInt(limit as string);
      const searchTerm = query.toLowerCase();

      // Get all listings for suggestions
      const allListings = await storage.getMarketplaceListings();

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
  });

  // Get listings by location (proximity search)
  app.get("/api/marketplace/listings/by-location", async (req, res) => {
    try {
      const { latitude, longitude, distance, category } = req.query;

      if (!latitude || !longitude) {
        throw new ValidationError("Latitude and longitude are required");
      }

      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);
      const dist = distance ? parseFloat(distance as string) : 50; // Default 50km radius

      if (isNaN(lat) || isNaN(lon) || isNaN(dist)) {
        throw new ValidationError("Invalid coordinates or distance");
      }

      // Optional category filter
      const categoryFilter =
        category && category !== "all"
          ? { category: category as string }
          : undefined;

      const listings = await storage.getMarketplaceListingsByLocation(
        lat,
        lon,
        dist,
        categoryFilter
      );

      res.json(listings);
    } catch (error) {
      logger.error("Error fetching listings by location:", error);
      res.status(500).json({ message: "Failed to retrieve listings" });
    }
  });

  // Get listings by seller's location proximity
  app.get(
    "/api/marketplace/listings/by-seller-location/:sellerId",
    async (req, res) => {
      try {
        const { distance } = req.query;
        const sellerId = parseInt(req.params.sellerId);

        if (isNaN(sellerId)) {
          throw new ValidationError("Invalid seller ID");
        }

        const dist = distance ? parseFloat(distance as string) : 50; // Default 50km radius

        if (isNaN(dist)) {
          throw new ValidationError("Invalid distance");
        }

        const listings = await storage.getMarketplaceListingsBySellerLocation(
          sellerId,
          dist
        );

        res.json(listings);
      } catch (error) {
        logger.error("Error fetching listings by seller location:", error);
        res.status(500).json({ message: "Failed to retrieve listings" });
      }
    }
  );

  // Get listings by seller ID
  app.get("/api/marketplace/sellers/:sellerId/listings", async (req, res) => {
    try {
      const sellerId = parseInt(req.params.sellerId);

      if (isNaN(sellerId)) {
        throw new ValidationError("Invalid seller ID");
      }

      const listings = await storage.getMarketplaceListingsBySeller(sellerId);

      res.json(listings);
    } catch (error) {
      logger.error("Error fetching seller listings:", error);
      res.status(500).json({ message: "Failed to retrieve seller listings" });
    }
  });

  // Get a specific listing by ID
  app.get("/api/marketplace/listings/:id", async (req, res, next) => {
    try {
      const listingId = parseInt(req.params.id);

      if (isNaN(listingId)) {
        throw new ValidationError("Invalid listing ID");
      }

      const listing = await storage.getMarketplaceListing(listingId);

      if (!listing) {
        throw new NotFoundError("Listing not found");
      }

      res.json(listing);
    } catch (error) {
      next(error);
    }
  });

  // Create listing (authenticated users only)
  app.post(
    "/api/marketplace/listings",
    isAuthenticated,
    upload.array("images", 5),
    async (req, res, next) => {
      try {
        // Debug logging
        console.log("Marketplace listing creation - Auth debug:", {
          hasUser: !!req.user,
          userId: req.user?.id,
          sessionId: req.sessionID,
          isAuthenticated: req.isAuthenticated(),
          session: req.session
            ? {
                hasPassport: !!req.session.passport,
                passportUser: req.session.passport?.user,
              }
            : "No session",
        });

        // Process files if any
        let images: string[] = [];
        const files = req.files as Express.Multer.File[] | undefined;

        if (files && files.length > 0) {
          // Convert Buffer to base64 string for storage
          images = files.map((file) => {
            const base64 = file.buffer.toString("base64");
            return `data:${file.mimetype};base64,${base64}`;
          });
        }

        // Validate listing data
        const listingData = insertMarketplaceListingSchema.parse({
          ...req.body,
          sellerId: parseInt(req.body.sellerId),
          images: images.length > 0 ? images : undefined,
        });

        // Create the listing with sellerId from the request body
        const newListing = await storage.createMarketplaceListing(listingData);

        res.status(201).json(newListing);
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          next(new ValidationError(validationError.message));
        } else {
          next(error);
        }
      }
    }
  );

  // Update listing (authenticated users only, must be seller)
  app.patch(
    "/api/marketplace/listings/:id",
    isAuthenticated,
    upload.array("images", 5),
    async (req, res, next) => {
      try {
        if (!req.user) {
          throw new AuthenticationError();
        }

        const listingId = parseInt(req.params.id);
        if (isNaN(listingId)) {
          throw new ValidationError("Invalid listing ID");
        }

        const existingListing = await storage.getMarketplaceListing(listingId);
        if (!existingListing) {
          throw new NotFoundError("Listing not found");
        }

        // Check if the user is the seller
        if (existingListing.sellerId !== req.user.id) {
          throw new AuthorizationError(
            "You don't have permission to update this listing"
          );
        }

        // Process files if any
        let images: string[] = [];
        const files = req.files as Express.Multer.File[] | undefined;

        if (files && files.length > 0) {
          // Convert Buffer to base64 string for storage
          images = files.map((file) => {
            const base64 = file.buffer.toString("base64");
            return `data:${file.mimetype};base64,${base64}`;
          });
        }

        // Validate listing data
        const listingData = insertMarketplaceListingSchema.partial().parse({
          ...req.body,
          images: images.length > 0 ? images : undefined,
        });

        // Ensure user cannot change sellerId
        delete listingData.sellerId;

        const updatedListing = await storage.updateMarketplaceListing(
          listingId,
          listingData
        );
        res.json(updatedListing);
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          next(new ValidationError(validationError.message));
        } else {
          next(error);
        }
      }
    }
  );

  // Delete listing (authenticated users only, must be seller)
  app.delete(
    "/api/marketplace/listings/:id",
    isAuthenticated,
    async (req, res) => {
      try {
        if (!req.user) {
          throw new AuthenticationError();
        }

        const listingId = parseInt(req.params.id);
        if (isNaN(listingId)) {
          throw new ValidationError("Invalid listing ID");
        }

        const existingListing = await storage.getMarketplaceListing(listingId);
        if (!existingListing) {
          throw new NotFoundError("Listing not found");
        }

        // Check if the user is the seller
        if (existingListing.sellerId !== req.user.id) {
          throw new AuthorizationError(
            "You don't have permission to delete this listing"
          );
        }

        const success = await storage.deleteMarketplaceListing(listingId);

        if (success) {
          res.json({ success: true, message: "Listing deleted successfully" });
        } else {
          res.status(500).json({ message: "Failed to delete listing" });
        }
      } catch (error) {
        logger.error("Error deleting marketplace listing:", error);
        res.status(500).json({ message: "Failed to delete listing" });
      }
    }
  );

  // ---- MARKETPLACE REVIEWS ----

  // Get reviews for a listing or seller
  app.get("/api/marketplace/reviews", async (req, res) => {
    try {
      const { listingId, sellerId } = req.query;

      if (!listingId && !sellerId) {
        throw new ValidationError("Either listingId or sellerId is required");
      }

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

      const reviews = await storage.getMarketplaceReviews(
        listingIdParam,
        sellerIdParam
      );

      res.json(reviews);
    } catch (error) {
      logger.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to retrieve reviews" });
    }
  });

  // Create review (authenticated users only)
  app.post("/api/marketplace/reviews", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const reviewData = insertMarketplaceReviewSchema.parse({
        ...req.body,
        reviewerId: req.user.id,
      });

      // Check if user is reviewing their own listing
      if (reviewData.sellerId === req.user.id) {
        throw new AuthorizationError("You cannot review your own listing");
      }

      const newReview = await storage.createMarketplaceReview(reviewData);

      res.status(201).json(newReview);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        logger.error("Error creating review:", error);
        res.status(500).json({ message: "Failed to create review" });
      }
    }
  });

  // Update review (authenticated users only, must be reviewer)
  app.patch(
    "/api/marketplace/reviews/:id",
    isAuthenticated,
    async (req, res) => {
      try {
        if (!req.user) {
          throw new AuthenticationError();
        }

        const reviewId = parseInt(req.params.id);
        if (isNaN(reviewId)) {
          throw new ValidationError("Invalid review ID");
        }

        const existingReview = await storage.getMarketplaceReview(reviewId);
        if (!existingReview) {
          throw new NotFoundError("Review not found");
        }

        // Check if the user is the reviewer
        if (existingReview.reviewerId !== req.user.id) {
          throw new AuthorizationError(
            "You don't have permission to update this review"
          );
        }

        const reviewData = insertMarketplaceReviewSchema
          .partial()
          .parse(req.body);

        // Ensure user cannot change reviewer ID or seller ID
        delete reviewData.reviewerId;
        delete reviewData.sellerId;

        const updatedReview = await storage.updateMarketplaceReview(
          reviewId,
          reviewData
        );

        res.json(updatedReview);
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          res.status(400).json({ message: validationError.message });
        } else {
          logger.error("Error updating review:", error);
          res.status(500).json({ message: "Failed to update review" });
        }
      }
    }
  );

  // Delete review (authenticated users only, must be reviewer)
  app.delete(
    "/api/marketplace/reviews/:id",
    isAuthenticated,
    async (req, res) => {
      try {
        if (!req.user) {
          throw new AuthenticationError();
        }

        const reviewId = parseInt(req.params.id);
        if (isNaN(reviewId)) {
          throw new ValidationError("Invalid review ID");
        }

        const existingReview = await storage.getMarketplaceReview(reviewId);
        if (!existingReview) {
          throw new NotFoundError("Review not found");
        }

        // Check if the user is the reviewer
        if (existingReview.reviewerId !== req.user.id) {
          throw new AuthorizationError(
            "You don't have permission to delete this review"
          );
        }

        const success = await storage.deleteMarketplaceReview(reviewId);

        if (success) {
          res.json({ success: true, message: "Review deleted successfully" });
        } else {
          res.status(500).json({ message: "Failed to delete review" });
        }
      } catch (error) {
        logger.error("Error deleting review:", error);
        res.status(500).json({ message: "Failed to delete review" });
      }
    }
  );

  // ---- MARKETPLACE FAVORITES ----

  // Get user's favorites (authenticated users only)
  app.get("/api/marketplace/favorites", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const favorites = await storage.getMarketplaceFavorites(req.user.id);

      res.json(favorites);
    } catch (error) {
      logger.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to retrieve favorites" });
    }
  });

  // Add listing to favorites (authenticated users only)
  app.post("/api/marketplace/favorites", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const favoriteData = insertMarketplaceFavoriteSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const newFavorite = await storage.createMarketplaceFavorite(favoriteData);

      res.status(201).json(newFavorite);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        logger.error("Error adding favorite:", error);
        res.status(500).json({ message: "Failed to add favorite" });
      }
    }
  });

  // Remove listing from favorites (authenticated users only)
  app.delete(
    "/api/marketplace/favorites/:id",
    isAuthenticated,
    async (req, res) => {
      try {
        if (!req.user) {
          throw new AuthenticationError();
        }

        const favoriteId = parseInt(req.params.id);
        if (isNaN(favoriteId)) {
          throw new ValidationError("Invalid favorite ID");
        }

        const existingFavorite = await storage.getMarketplaceFavorite(
          favoriteId
        );
        if (!existingFavorite) {
          throw new NotFoundError("Favorite not found");
        }

        // Check if the user owns this favorite
        if (existingFavorite.userId !== req.user.id) {
          throw new AuthorizationError(
            "You don't have permission to remove this favorite"
          );
        }

        const success = await storage.deleteMarketplaceFavorite(favoriteId);

        if (success) {
          res.json({ success: true, message: "Favorite removed successfully" });
        } else {
          res.status(500).json({ message: "Failed to remove favorite" });
        }
      } catch (error) {
        logger.error("Error removing favorite:", error);
        res.status(500).json({ message: "Failed to remove favorite" });
      }
    }
  );

  // ---- MARKETPLACE MESSAGES ----

  // Get conversations (authenticated users only)
  app.get("/api/marketplace/messages", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { senderId, recipientId, listingId } = req.query;

      let senderIdParam: number | undefined;
      let recipientIdParam: number | undefined;
      let listingIdParam: number | undefined;

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

      if (listingId) {
        listingIdParam = parseInt(listingId as string);
        if (isNaN(listingIdParam)) {
          throw new ValidationError("Invalid listing ID");
        }
      }

      // Ensure user can only access their own conversations
      if (
        senderIdParam &&
        senderIdParam !== req.user.id &&
        recipientIdParam &&
        recipientIdParam !== req.user.id
      ) {
        throw new AuthorizationError(
          "You can only access your own conversations"
        );
      }

      // If no sender or recipient specified, default to user as either
      if (!senderIdParam && !recipientIdParam) {
        const sentMessages = await storage.getMarketplaceMessages(
          req.user.id,
          undefined,
          listingIdParam
        );
        const receivedMessages = await storage.getMarketplaceMessages(
          undefined,
          req.user.id,
          listingIdParam
        );

        // Combine and sort by date
        const allMessages = [...sentMessages, ...receivedMessages].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return res.json(allMessages);
      }

      const messages = await storage.getMarketplaceMessages(
        senderIdParam,
        recipientIdParam,
        listingIdParam
      );

      res.json(messages);
    } catch (error) {
      logger.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to retrieve messages" });
    }
  });

  // Get unread message count
  app.get(
    "/api/marketplace/messages/unread/count",
    isAuthenticated,
    async (req, res) => {
      try {
        if (!req.user) {
          throw new AuthenticationError();
        }

        const count = await storage.getUnreadMessageCount(req.user.id);

        res.json({ count });
      } catch (error) {
        logger.error("Error fetching unread message count:", error);
        res
          .status(500)
          .json({ message: "Failed to retrieve unread message count" });
      }
    }
  );

  // Send message (authenticated users only)
  app.post("/api/marketplace/messages", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const messageData = insertMarketplaceMessageSchema.parse({
        ...req.body,
        senderId: req.user.id,
      });

      // Check if user is sending message to themselves
      if (messageData.recipientId === req.user.id) {
        throw new AuthorizationError("You cannot send a message to yourself");
      }

      const newMessage = await storage.createMarketplaceMessage(messageData);

      res.status(201).json(newMessage);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        logger.error("Error sending message:", error);
        res.status(500).json({ message: "Failed to send message" });
      }
    }
  });

  // Mark message as read (authenticated users only, must be recipient)
  app.patch(
    "/api/marketplace/messages/:id/read",
    isAuthenticated,
    async (req, res) => {
      try {
        if (!req.user) {
          throw new AuthenticationError();
        }

        const messageId = parseInt(req.params.id);
        if (isNaN(messageId)) {
          throw new ValidationError("Invalid message ID");
        }

        const existingMessage = await storage.getMarketplaceMessage(messageId);
        if (!existingMessage) {
          throw new NotFoundError("Message not found");
        }

        // Check if the user is the recipient
        if (existingMessage.recipientId !== req.user.id) {
          throw new AuthorizationError(
            "You don't have permission to mark this message as read"
          );
        }

        const success = await storage.markMessageAsRead(messageId);

        if (success) {
          const updatedMessage = await storage.getMarketplaceMessage(messageId);
          res.json(updatedMessage);
        } else {
          res.status(500).json({ message: "Failed to mark message as read" });
        }
      } catch (error) {
        logger.error("Error marking message as read:", error);
        res.status(500).json({ message: "Failed to mark message as read" });
      }
    }
  );

  // Delete message (authenticated users only, must be sender or recipient)
  app.delete(
    "/api/marketplace/messages/:id",
    isAuthenticated,
    async (req, res) => {
      try {
        if (!req.user) {
          throw new AuthenticationError();
        }

        const messageId = parseInt(req.params.id);
        if (isNaN(messageId)) {
          throw new ValidationError("Invalid message ID");
        }

        const existingMessage = await storage.getMarketplaceMessage(messageId);
        if (!existingMessage) {
          throw new NotFoundError("Message not found");
        }

        // Check if the user is the sender or recipient
        if (
          existingMessage.senderId !== req.user.id &&
          existingMessage.recipientId !== req.user.id
        ) {
          throw new AuthorizationError(
            "You don't have permission to delete this message"
          );
        }

        const success = await storage.deleteMarketplaceMessage(messageId);

        if (success) {
          res.json({ success: true, message: "Message deleted successfully" });
        } else {
          res.status(500).json({ message: "Failed to delete message" });
        }
      } catch (error) {
        logger.error("Error deleting message:", error);
        res.status(500).json({ message: "Failed to delete message" });
      }
    }
  );

  // Debug catch-all for marketplace routes that fall through - add at the end
  app.use("/api/marketplace*", (req, res) => {
    logger.debug(
      `FALLTHROUGH: No handler found for ${req.method} ${req.originalUrl}`
    );
    res.status(404).json({
      message: "API endpoint not found",
      requestedPath: req.originalUrl,
      method: req.method,
      auth: req.isAuthenticated() ? "Authenticated" : "Not authenticated",
    });
  });
}

export default setupMarketplaceRoutes;
