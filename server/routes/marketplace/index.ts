import type { Express, Request, Response, NextFunction } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "../../storage";
import {
  insertMarketplaceListingSchema,
  insertMarketplaceReviewSchema,
  insertMarketplaceFavoriteSchema,
  insertMarketplaceMessageSchema,
} from "@shared/schema";

/**
 * Register all marketplace-related routes
 */
export function registerMarketplaceRoutes(app: Express, isAuthenticated: (req: Request, res: Response, next: NextFunction) => void) {
  // Configure multer for file uploads with error handling
  const multerStorage = multer.memoryStorage();
  const upload = multer({ 
    storage: multerStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // Reduced to 5MB limit
      files: 5 // Maximum of 5 files at once
    }
  }).fields([
    { name: 'images', maxCount: 5 }
  ]);

  // DEBUG middleware for marketplace routes
  app.use('/api/marketplace*', (req, res, next) => {
    console.log(`DEBUG [${req.method}]: Marketplace route hit: ${req.originalUrl}`);
    console.log('  Path:', req.path);
    console.log('  Auth:', req.isAuthenticated() ? `User ${req.user?.id}` : 'Not authenticated');
    
    // Store the original path in case we need to debug later
    req.originalMarketplacePath = req.path;
    
    // Continue to the actual route handler
    next();
  });

  // TEST endpoint
  app.post("/api/marketplace-listings-test", isAuthenticated, async (req, res) => {
    console.log("DIRECT TEST marketplace listings endpoint hit");
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      console.log("User authenticated in test:", req.user.id);
      console.log("Request body:", req.body);
      
      res.status(200).json({ 
        success: true, 
        message: "Test marketplace listings endpoint working",
        user: req.user.id
      });
    } catch (error) {
      console.error("Error in test endpoint:", error);
      res.status(500).json({ message: "Test endpoint error" });
    }
  });

  // ---- Marketplace Listings ----
  
  // Get all listings or filtered by criteria
  app.get("/api/marketplace/listings", async (req, res) => {
    try {
      const { category, search, minPrice, maxPrice, sellerId } = req.query;
      
      let sellerIdParam: number | undefined;
      let minPriceParam: number | undefined;
      let maxPriceParam: number | undefined;
      
      if (sellerId) {
        sellerIdParam = parseInt(sellerId as string);
        if (isNaN(sellerIdParam)) {
          return res.status(400).json({ message: "Invalid seller ID" });
        }
      }
      
      if (minPrice) {
        minPriceParam = parseFloat(minPrice as string);
        if (isNaN(minPriceParam)) {
          return res.status(400).json({ message: "Invalid minimum price" });
        }
      }
      
      if (maxPrice) {
        maxPriceParam = parseFloat(maxPrice as string);
        if (isNaN(maxPriceParam)) {
          return res.status(400).json({ message: "Invalid maximum price" });
        }
      }
      
      const listings = await storage.getMarketplaceListings({
        category: category as string,
        search: search as string,
        minPrice: minPriceParam,
        maxPrice: maxPriceParam,
        sellerId: sellerIdParam
      });
      
      res.json(listings);
    } catch (error) {
      console.error("Error fetching marketplace listings:", error);
      res.status(500).json({ message: "Failed to retrieve listings" });
    }
  });
  
  // Get listings by location - proximity search
  app.get("/api/marketplace/listings/by-location", async (req, res) => {
    try {
      const { latitude, longitude, distance } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      let latitudeParam: number;
      let longitudeParam: number;
      let distanceParam: number = 50; // Default 50km radius
      
      latitudeParam = parseFloat(latitude as string);
      longitudeParam = parseFloat(longitude as string);
      
      if (isNaN(latitudeParam) || isNaN(longitudeParam)) {
        return res.status(400).json({ message: "Invalid coordinates" });
      }
      
      if (distance) {
        distanceParam = parseFloat(distance as string);
        if (isNaN(distanceParam)) {
          return res.status(400).json({ message: "Invalid distance" });
        }
      }
      
      const listings = await storage.getMarketplaceListingsByLocation(latitudeParam, longitudeParam, distanceParam);
      
      res.json(listings);
    } catch (error) {
      console.error("Error fetching listings by location:", error);
      res.status(500).json({ message: "Failed to retrieve listings by location" });
    }
  });
  
  // Get listings by seller's location
  app.get("/api/marketplace/listings/by-seller-location/:sellerId", async (req, res) => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      if (isNaN(sellerId)) {
        return res.status(400).json({ message: "Invalid seller ID" });
      }
      
      const listings = await storage.getMarketplaceListingsBySellerLocation(sellerId);
      
      res.json(listings);
    } catch (error) {
      console.error("Error fetching listings by seller location:", error);
      res.status(500).json({ message: "Failed to retrieve listings by seller location" });
    }
  });
  
  // Get all listings by seller
  app.get("/api/marketplace/sellers/:sellerId/listings", async (req, res) => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      if (isNaN(sellerId)) {
        return res.status(400).json({ message: "Invalid seller ID" });
      }
      
      const listings = await storage.getMarketplaceListingsBySeller(sellerId);
      
      res.json(listings);
    } catch (error) {
      console.error("Error fetching seller listings:", error);
      res.status(500).json({ message: "Failed to retrieve seller listings" });
    }
  });
  
  // Get a specific listing by ID
  app.get("/api/marketplace/listings/:id", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      if (isNaN(listingId)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      const listing = await storage.getMarketplaceListing(listingId);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      res.json(listing);
    } catch (error) {
      console.error("Error fetching listing:", error);
      res.status(500).json({ message: "Failed to retrieve listing" });
    }
  });
  
  // Create listing (authenticated users only)
  app.post("/api/marketplace/listings", isAuthenticated, (req, res, next) => {
    console.log("Starting marketplace listings POST handler");
    
    // Wrap multer in try/catch to prevent server crashes
    try {
      upload(req, res, (err) => {
        if (err) {
          console.error("Multer error:", err);
          return res.status(400).json({ 
            message: "File upload error", 
            details: err.message 
          });
        }
        next();
      });
    } catch (error) {
      console.error("Critical error in file upload middleware:", error);
      return res.status(500).json({ message: "Server error processing file upload" });
    }
  }, async (req, res) => {
    console.log("POST /api/marketplace/listings endpoint hit");
    try {
      if (!req.user) {
        console.log("User not authenticated in marketplace listings POST");
        return res.status(401).json({ message: "Not authenticated" });
      }
      console.log("User authenticated:", req.user.id);
      console.log("Request body:", req.body);
      console.log("Request files:", req.files ? "Has files" : "no files");
      
      console.log("Request body:", req.body);
      console.log("Files:", req.files);
      
      // Process files if any
      let images: string[] = [];
      // Handle multer.fields() format
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      
      if (files && files.images && files.images.length > 0) {
        // Convert Buffer to base64 string for storage
        images = files.images.map(file => {
          const base64 = file.buffer.toString('base64');
          return `data:${file.mimetype};base64,${base64}`;
        });
      }
      
      // Combine form data with processed images
      const listingData = insertMarketplaceListingSchema.parse({
        ...req.body,
        sellerId: req.user.id,
        images: images.length > 0 ? images : undefined
      });
      
      const newListing = await storage.createMarketplaceListing(listingData);
      
      res.status(201).json(newListing);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating marketplace listing:", error);
        res.status(500).json({ message: "Failed to create listing" });
      }
    }
  });
  
  // Update listing (authenticated users only, must be seller)
  app.patch("/api/marketplace/listings/:id", isAuthenticated, (req, res, next) => {
    console.log("Starting marketplace listings PATCH handler");
    
    // Wrap multer in try/catch to prevent server crashes
    try {
      upload(req, res, (err) => {
        if (err) {
          console.error("Multer error:", err);
          return res.status(400).json({ 
            message: "File upload error", 
            details: err.message 
          });
        }
        next();
      });
    } catch (error) {
      console.error("Critical error in file upload middleware:", error);
      return res.status(500).json({ message: "Server error processing file upload" });
    }
  }, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const listingId = parseInt(req.params.id);
      if (isNaN(listingId)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      const existingListing = await storage.getMarketplaceListing(listingId);
      if (!existingListing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Check if the user is the seller
      if (existingListing.sellerId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this listing" });
      }
      
      // Process files if any
      let images: string[] | undefined;
      // Handle multer.fields() format
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      
      if (files && files.images && files.images.length > 0) {
        // Convert Buffer to base64 string for storage
        const newImages = files.images.map(file => {
          const base64 = file.buffer.toString('base64');
          return `data:${file.mimetype};base64,${base64}`;
        });
        
        // Combine with existing images if needed
        if (req.body.keepExistingImages === 'true' && existingListing.images) {
          images = [...existingListing.images, ...newImages];
        } else {
          images = newImages;
        }
      }
      
      const listingData = insertMarketplaceListingSchema.partial().parse({
        ...req.body,
        images
      });
      
      // Ensure user cannot change sellerId
      delete listingData.sellerId;
      
      const updatedListing = await storage.updateMarketplaceListing(listingId, listingData);
      
      res.json(updatedListing);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error updating marketplace listing:", error);
        res.status(500).json({ message: "Failed to update listing" });
      }
    }
  });
  
  // Delete listing (authenticated users only, must be seller)
  app.delete("/api/marketplace/listings/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const listingId = parseInt(req.params.id);
      if (isNaN(listingId)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      const existingListing = await storage.getMarketplaceListing(listingId);
      if (!existingListing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Check if the user is the seller
      if (existingListing.sellerId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this listing" });
      }
      
      const success = await storage.deleteMarketplaceListing(listingId);
      
      if (success) {
        res.json({ success: true, message: "Listing deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete listing" });
      }
    } catch (error) {
      console.error("Error deleting marketplace listing:", error);
      res.status(500).json({ message: "Failed to delete listing" });
    }
  });

  // ---- Marketplace Reviews ----
  
  // Get reviews for a listing or seller
  app.get("/api/marketplace/reviews", async (req, res) => {
    try {
      const { listingId, sellerId } = req.query;
      
      if (!listingId && !sellerId) {
        return res.status(400).json({ message: "Either listingId or sellerId is required" });
      }
      
      let listingIdParam: number | undefined;
      let sellerIdParam: number | undefined;
      
      if (listingId) {
        listingIdParam = parseInt(listingId as string);
        if (isNaN(listingIdParam)) {
          return res.status(400).json({ message: "Invalid listing ID" });
        }
      }
      
      if (sellerId) {
        sellerIdParam = parseInt(sellerId as string);
        if (isNaN(sellerIdParam)) {
          return res.status(400).json({ message: "Invalid seller ID" });
        }
      }
      
      const reviews = await storage.getMarketplaceReviews(listingIdParam, sellerIdParam);
      
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to retrieve reviews" });
    }
  });
  
  // Create review (authenticated users only)
  app.post("/api/marketplace/reviews", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const reviewData = insertMarketplaceReviewSchema.parse({
        ...req.body,
        reviewerId: req.user.id
      });
      
      // Check if user is reviewing their own listing
      if (reviewData.sellerId === req.user.id) {
        return res.status(400).json({ message: "You cannot review your own listing" });
      }
      
      const newReview = await storage.createMarketplaceReview(reviewData);
      
      res.status(201).json(newReview);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating review:", error);
        res.status(500).json({ message: "Failed to create review" });
      }
    }
  });
  
  // Update review (authenticated users only, must be reviewer)
  app.patch("/api/marketplace/reviews/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const reviewId = parseInt(req.params.id);
      if (isNaN(reviewId)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }
      
      const existingReview = await storage.getMarketplaceReview(reviewId);
      if (!existingReview) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      // Check if the user is the reviewer
      if (existingReview.reviewerId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this review" });
      }
      
      const reviewData = insertMarketplaceReviewSchema.partial().parse(req.body);
      
      // Ensure user cannot change reviewer ID or seller ID
      delete reviewData.reviewerId;
      delete reviewData.sellerId;
      
      const updatedReview = await storage.updateMarketplaceReview(reviewId, reviewData);
      
      res.json(updatedReview);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error updating review:", error);
        res.status(500).json({ message: "Failed to update review" });
      }
    }
  });
  
  // Delete review (authenticated users only, must be reviewer)
  app.delete("/api/marketplace/reviews/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const reviewId = parseInt(req.params.id);
      if (isNaN(reviewId)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }
      
      const existingReview = await storage.getMarketplaceReview(reviewId);
      if (!existingReview) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      // Check if the user is the reviewer
      if (existingReview.reviewerId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this review" });
      }
      
      const success = await storage.deleteMarketplaceReview(reviewId);
      
      if (success) {
        res.json({ success: true, message: "Review deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete review" });
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });
  
  // ---- Marketplace Favorites ----
  
  // Get user's favorites (authenticated users only)
  app.get("/api/marketplace/favorites", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const favorites = await storage.getMarketplaceFavorites(req.user.id);
      
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to retrieve favorites" });
    }
  });
  
  // Add listing to favorites (authenticated users only)
  app.post("/api/marketplace/favorites", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const favoriteData = insertMarketplaceFavoriteSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const newFavorite = await storage.createMarketplaceFavorite(favoriteData);
      
      res.status(201).json(newFavorite);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error adding favorite:", error);
        res.status(500).json({ message: "Failed to add favorite" });
      }
    }
  });
  
  // Remove listing from favorites (authenticated users only)
  app.delete("/api/marketplace/favorites/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const favoriteId = parseInt(req.params.id);
      if (isNaN(favoriteId)) {
        return res.status(400).json({ message: "Invalid favorite ID" });
      }
      
      const existingFavorite = await storage.getMarketplaceFavorite(favoriteId);
      if (!existingFavorite) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      // Check if the user owns this favorite
      if (existingFavorite.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to remove this favorite" });
      }
      
      const success = await storage.deleteMarketplaceFavorite(favoriteId);
      
      if (success) {
        res.json({ success: true, message: "Favorite removed successfully" });
      } else {
        res.status(500).json({ message: "Failed to remove favorite" });
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });
  
  // ---- Marketplace Messages ----
  
  // Get conversations (authenticated users only)
  app.get("/api/marketplace/messages", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { senderId, recipientId, listingId } = req.query;
      
      let senderIdParam: number | undefined;
      let recipientIdParam: number | undefined;
      let listingIdParam: number | undefined;
      
      if (senderId) {
        senderIdParam = parseInt(senderId as string);
        if (isNaN(senderIdParam)) {
          return res.status(400).json({ message: "Invalid sender ID" });
        }
      }
      
      if (recipientId) {
        recipientIdParam = parseInt(recipientId as string);
        if (isNaN(recipientIdParam)) {
          return res.status(400).json({ message: "Invalid recipient ID" });
        }
      }
      
      if (listingId) {
        listingIdParam = parseInt(listingId as string);
        if (isNaN(listingIdParam)) {
          return res.status(400).json({ message: "Invalid listing ID" });
        }
      }
      
      // Ensure user can only access their own conversations
      if ((senderIdParam && senderIdParam !== req.user.id) && 
          (recipientIdParam && recipientIdParam !== req.user.id)) {
        return res.status(403).json({ message: "You can only access your own conversations" });
      }
      
      // If no sender or recipient specified, default to user as either
      if (!senderIdParam && !recipientIdParam) {
        const sentMessages = await storage.getMarketplaceMessages(req.user.id, undefined, listingIdParam);
        const receivedMessages = await storage.getMarketplaceMessages(undefined, req.user.id, listingIdParam);
        
        // Combine and sort by date
        const allMessages = [...sentMessages, ...receivedMessages].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        return res.json(allMessages);
      }
      
      const messages = await storage.getMarketplaceMessages(senderIdParam, recipientIdParam, listingIdParam);
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to retrieve messages" });
    }
  });
  
  // Get unread message count
  app.get("/api/marketplace/messages/unread/count", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const count = await storage.getUnreadMessageCount(req.user.id);
      
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread message count:", error);
      res.status(500).json({ message: "Failed to retrieve unread message count" });
    }
  });
  
  // Send message (authenticated users only)
  app.post("/api/marketplace/messages", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const messageData = insertMarketplaceMessageSchema.parse({
        ...req.body,
        senderId: req.user.id
      });
      
      // Check if user is sending message to themselves
      if (messageData.recipientId === req.user.id) {
        return res.status(400).json({ message: "You cannot send a message to yourself" });
      }
      
      const newMessage = await storage.createMarketplaceMessage(messageData);
      
      res.status(201).json(newMessage);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Failed to send message" });
      }
    }
  });
  
  // Mark message as read (authenticated users only, must be recipient)
  app.patch("/api/marketplace/messages/:id/read", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const messageId = parseInt(req.params.id);
      if (isNaN(messageId)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }
      
      const existingMessage = await storage.getMarketplaceMessage(messageId);
      if (!existingMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Check if the user is the recipient
      if (existingMessage.recipientId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to mark this message as read" });
      }
      
      const success = await storage.markMessageAsRead(messageId);
      
      if (success) {
        const updatedMessage = await storage.getMarketplaceMessage(messageId);
        res.json(updatedMessage);
      } else {
        res.status(500).json({ message: "Failed to mark message as read" });
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });
  
  // Delete message (authenticated users only, must be sender or recipient)
  app.delete("/api/marketplace/messages/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const messageId = parseInt(req.params.id);
      if (isNaN(messageId)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }
      
      const existingMessage = await storage.getMarketplaceMessage(messageId);
      if (!existingMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Check if the user is the sender or recipient
      if (existingMessage.senderId !== req.user.id && existingMessage.recipientId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this message" });
      }
      
      const success = await storage.deleteMarketplaceMessage(messageId);
      
      if (success) {
        res.json({ success: true, message: "Message deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete message" });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  // Debug catch-all handler MUST be last
  app.use('/api/marketplace*', (req, res) => {
    console.log(`FALLTHROUGH: No handler found for ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
      message: "API endpoint not found",
      requestedPath: req.originalUrl,
      method: req.method,
      auth: req.isAuthenticated() ? 'Authenticated' : 'Not authenticated'
    });
  });

  console.log("✅ Marketplace routes registered");
}