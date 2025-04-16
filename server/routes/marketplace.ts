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

// Configure multer for file uploads
function setupMarketplaceRoutes(app: Express) {
  // Debug middleware for marketplace routes
  app.use('/api/marketplace*', (req: Request, res: Response, next: NextFunction) => {
    console.log(`DEBUG [${req.method}]: Marketplace route hit: ${req.originalUrl}`);
    console.log('  Path:', req.path);
    console.log('  Auth:', req.isAuthenticated() ? `User ${req.user?.id}` : 'Not authenticated');
    
    // Store the original path in case we need to debug later
    (req as any).originalMarketplacePath = req.path;
    
    // Continue to the actual route handler
    next();
  });

  // Configure multer for file uploads with error handling
  const multerStorage = multer.memoryStorage();
  const upload = multer({ 
    storage: multerStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
      files: 5 // Maximum of 5 files at once
    }
  }).fields([
    { name: 'images', maxCount: 5 }
  ]);

  // Middleware to check authentication - marketplace specific
  function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Not authenticated" });
  }

  // ---- MARKETPLACE TEST ENDPOINTS ----

  // Test marketplace endpoint
  app.post("/api/test-marketplace", isAuthenticated, async (req, res) => {
    console.log("TEST MARKETPLACE endpoint hit");
    res.status(200).json({ success: true, message: "Test marketplace endpoint working" });
  });
  
  // Direct test for marketplace listings endpoint
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

  // ---- MARKETPLACE LISTINGS ENDPOINTS ----

  // Get all marketplace listings
  app.get("/api/marketplace/listings", async (req, res) => {
    try {
      const { category, query, priceMin, priceMax, sellerId } = req.query;
      
      let sellerIdParam: number | undefined;
      if (sellerId) {
        sellerIdParam = parseInt(sellerId as string);
        if (isNaN(sellerIdParam)) {
          return res.status(400).json({ message: "Invalid seller ID" });
        }
      }
      
      // Basic filters for now, can be expanded later
      const filters: Record<string, any> = {};
      
      if (category && category !== 'all') {
        filters.category = category;
      }
      
      if (priceMin) {
        const min = parseFloat(priceMin as string);
        if (!isNaN(min)) {
          filters.priceMin = min;
        }
      }
      
      if (priceMax) {
        const max = parseFloat(priceMax as string);
        if (!isNaN(max)) {
          filters.priceMax = max;
        }
      }
      
      if (sellerIdParam) {
        filters.sellerId = sellerIdParam;
      }
      
      if (query) {
        filters.query = query;
      }
      
      const listings = await storage.getMarketplaceListings(filters);
      
      res.json(listings);
    } catch (error) {
      console.error("Error fetching marketplace listings:", error);
      res.status(500).json({ message: "Failed to retrieve listings" });
    }
  });
  
  // Get listings by location (proximity search)
  app.get("/api/marketplace/listings/by-location", async (req, res) => {
    try {
      const { latitude, longitude, distance, category } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);
      const dist = distance ? parseFloat(distance as string) : 50; // Default 50km radius
      
      if (isNaN(lat) || isNaN(lon) || isNaN(dist)) {
        return res.status(400).json({ message: "Invalid coordinates or distance" });
      }
      
      // Optional category filter
      const categoryFilter = category && category !== 'all' ? category as string : undefined;
      
      const listings = await storage.getMarketplaceListingsByLocation(lat, lon, dist, categoryFilter);
      
      res.json(listings);
    } catch (error) {
      console.error("Error fetching listings by location:", error);
      res.status(500).json({ message: "Failed to retrieve listings" });
    }
  });
  
  // Get listings by seller's location proximity
  app.get("/api/marketplace/listings/by-seller-location/:sellerId", async (req, res) => {
    try {
      const { latitude, longitude, distance } = req.query;
      const sellerId = parseInt(req.params.sellerId);
      
      if (isNaN(sellerId)) {
        return res.status(400).json({ message: "Invalid seller ID" });
      }
      
      if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);
      const dist = distance ? parseFloat(distance as string) : 50; // Default 50km radius
      
      if (isNaN(lat) || isNaN(lon) || isNaN(dist)) {
        return res.status(400).json({ message: "Invalid coordinates or distance" });
      }
      
      const listings = await storage.getMarketplaceListingsBySellerLocation(sellerId, lat, lon, dist);
      
      res.json(listings);
    } catch (error) {
      console.error("Error fetching listings by seller location:", error);
      res.status(500).json({ message: "Failed to retrieve listings" });
    }
  });
  
  // Get listings by seller ID
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
      console.error("Error fetching marketplace listing:", error);
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
      
      // Check if location data is included in the request
      let locationId: number | undefined = undefined;
      
      if (req.body.latitude && req.body.longitude) {
        console.log("Location data detected, creating location record");
        try {
          // Create location record
          const locationData = {
            country: req.body.country || "Zambia",
            region: req.body.region || "",
            city: req.body.city || "",
            neighborhood: req.body.neighborhood || "",
            postalCode: req.body.postalCode || "",
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            formattedAddress: req.body.formattedAddress || "",
            placeId: req.body.placeId || "",
          };
          
          const location = await storage.createLocation(locationData);
          locationId = location.id;
          console.log("Created location record with ID:", locationId);
        } catch (error) {
          console.error("Error creating location:", error);
          // Continue without location if there's an error
        }
      }
      
      // Combine form data with processed images and location ID
      const listingData = insertMarketplaceListingSchema.parse({
        ...req.body,
        sellerId: req.user.id,
        locationId: locationId,
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
  
  // ---- MARKETPLACE REVIEWS ----
  
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
  
  // ---- MARKETPLACE FAVORITES ----
  
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
  
  // ---- MARKETPLACE MESSAGES ----
  
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

  // Debug catch-all for marketplace routes that fall through - add at the end
  app.use('/api/marketplace*', (req, res) => {
    console.log(`FALLTHROUGH: No handler found for ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
      message: "API endpoint not found",
      requestedPath: req.originalUrl,
      method: req.method,
      auth: req.isAuthenticated() ? 'Authenticated' : 'Not authenticated'
    });
  });
}

export default setupMarketplaceRoutes;