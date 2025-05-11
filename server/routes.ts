import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import setupMarketplaceRoutes from "./routes/marketplace";
import cartRoutes from "./routes/cart";
import sellerRoutes from "./routes/seller";
import cropTraceRoutes from "./routes/croptrace";
import notificationRoutes from "./routes/notifications";
import testNotificationRouter from "./routes/test-notification";
import emailRoutes from "./routes/email";
import { greenSocialsRouter, setIsAuthenticatedMiddleware } from "./routes/green-socials";
import { uploadRouter } from './routes/upload-routes';
import { testUploadRouter } from './routes/test-upload';
import { testUploadPostRouter } from './routes/test-upload-to-post';
import { testRouter } from './routes/test-routes';
import { testEmailRouter } from './routes/test-email-notifications';
import publicEmailTestRouter from './routes/test-public-email-notifications';
import chatRoutes from './routes/chat-routes';
import streamChatRoutes from './routes/stream-chat-routes';
import farmingAssistantRoutes from './routes/farming-assistant';
import { setWebSocketNotifier } from './services/websocket-notifier';

import { 
  contactFormSchema, 
  insertFarmerProfileSchema, 
  insertFieldSchema,
  insertCropSchema,
  insertCropActivitySchema,
  insertWeatherPreferencesSchema,
  insertFarmerTaskSchema,
  insertCropYieldPredictionSchema,
  insertPlantAnalysisSchema,
  insertLocationSchema,
  insertMarketplaceListingSchema,
  insertMarketplaceReviewSchema,
  insertMarketplaceFavoriteSchema,
  insertMarketplaceMessageSchema,
  fields, crops, cropActivities,
  weatherPreferences, farmerTasks, cropYieldPredictions,
  plantAnalyses, locations, marketplaceListings, marketplaceReviews,
  marketplaceFavorites, marketplaceMessages
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";
import { eq } from "drizzle-orm";

// Note: We rely on the User type definition
// that's already declared in auth.ts

import multer from "multer";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to handle subdomain routing
  app.use((req, res, next) => {
    // Get the host from the request
    const host = req.hostname;
    
    // Check if we're on a subdomain (app.yourdomain.com)
    if (host.startsWith('app.')) {
      // Add a property to the request object to identify app/dashboard requests
      (req as any).isDashboard = true;
    } else {
      // This is the main domain (yourdomain.com) - landing page
      (req as any).isDashboard = false;
    }
    
    next();
  });
  console.log("Registering all API routes...");
  
  // Set up authentication and get the isAuthenticated middleware
  const { isAuthenticated } = setupAuth(app);
  
  // Set the isAuthenticated middleware for the Green Socials router
  setIsAuthenticatedMiddleware(isAuthenticated);
  console.log("Initialized Green Socials with consistent authentication middleware");
  
  // Set up seller routes FIRST
  // IMPORTANT: We need to register this BEFORE the marketplace routes 
  // to prevent route conflicts with the marketplace catchall middleware
  app.use("/api/marketplace/sellers", sellerRoutes);
  
  // Set up marketplace routes
  setupMarketplaceRoutes(app);
  
  // Set up cart routes
  app.use("/api/cart", cartRoutes);
  
  // Set up crop traceability routes
  app.use("/api/croptrace", cropTraceRoutes);
  
  // Public crop trace verification route
  app.use("/api/trace", cropTraceRoutes);
  
  // Set up notification routes
  app.use("/api/notifications", notificationRoutes);
  
  // Set up test notification route
  app.use(testNotificationRouter);
  
  // Set up email routes
  app.use(emailRoutes);
  
  // Set up Green Socials routes
  app.use("/api/social", greenSocialsRouter);
  
  // Set up file upload routes
  app.use("/api/uploads", uploadRouter);
  
  // Set up test upload route
  app.use(testUploadRouter);
  
  // Set up test upload-to-post integration route
  app.use("/api/test/upload-post", testUploadPostRouter);
  
  // Set up comprehensive test routes
  app.use("/api/test", testRouter);
  
  // Set up test email notification routes
  app.use("/api/test", testEmailRouter);
  
  // Set up public email test routes (no auth required)
  app.use("/api/test", publicEmailTestRouter);
  
  // Set up chat routes
  // Always use standard chat routes instead of Redis
  console.log("Using standard database-only chat implementation (Redis disabled)");
  app.use("/api/chat", chatRoutes);
  
  // Set up Stream Chat routes
  console.log("Setting up Stream Chat routes");
  app.use("/api/stream-chat", streamChatRoutes);
  
  // Set up AI farming assistant routes
  console.log("Setting up AI farming assistant routes");
  app.use("/api/farming-assistant", farmingAssistantRoutes);

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

  // We're using the isAuthenticated middleware from auth.ts

  // Middleware to check user role
  function hasRole(role: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (req.isAuthenticated() && req.user && req.user.role === role) {
        return next();
      }
      res.status(403).json({ message: "Unauthorized access" });
    };
  }

  // Test endpoints moved to marketplace.ts
  
  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const data = contactFormSchema.parse(req.body);
      const result = await storage.saveContactInquiry(data);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ success: false, error: validationError.message });
      } else {
        console.error("Error handling contact form submission:", error);
        res.status(500).json({ success: false, error: "Failed to process your request" });
      }
    }
  });

  // User profile endpoints
  
  // Update user information
  app.patch("/api/user", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user.id;
      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user information" });
    }
  });
  
  // Farmer profile endpoints
  
  // Get farmer profile
  app.get("/api/farmer-profile", isAuthenticated, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'farmer') {
        return res.status(403).json({ message: "Only farmers can access profiles" });
      }
      
      const profile = await storage.getFarmerProfile(req.user.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching farmer profile:", error);
      res.status(500).json({ message: "Failed to retrieve profile" });
    }
  });
  
  // Create farmer profile
  app.post("/api/farmer-profile", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Check if profile already exists
      const existingProfile = await storage.getFarmerProfile(req.user.id);
      if (existingProfile) {
        return res.status(409).json({ message: "Farmer profile already exists" });
      }
      
      // Validate and create profile
      const profileData = insertFarmerProfileSchema.parse(req.body);
      const newProfile = await storage.createFarmerProfile({
        ...profileData,
        userId: req.user.id
      });
      
      res.status(201).json(newProfile);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating farmer profile:", error);
        res.status(500).json({ message: "Failed to create profile" });
      }
    }
  });
  
  // Update farmer profile
  app.patch("/api/farmer-profile", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Check if profile exists
      const existingProfile = await storage.getFarmerProfile(req.user.id);
      if (!existingProfile) {
        return res.status(404).json({ message: "Farmer profile not found" });
      }
      
      // Validate and update profile
      const profileData = insertFarmerProfileSchema.partial().parse(req.body);
      const updatedProfile = await storage.updateFarmerProfile(req.user.id, profileData);
      
      res.status(200).json(updatedProfile);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error updating farmer profile:", error);
        res.status(500).json({ message: "Failed to update profile" });
      }
    }
  });

  // Field Management Routes
  
  // Get all fields for the authenticated farmer
  app.get("/api/fields", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const fields = await storage.getFields(req.user.id);
      res.json(fields);
    } catch (error) {
      console.error("Error fetching fields:", error);
      res.status(500).json({ message: "Failed to retrieve fields" });
    }
  });
  
  // Get a specific field by ID
  app.get("/api/fields/:id", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const fieldId = parseInt(req.params.id);
      if (isNaN(fieldId)) {
        return res.status(400).json({ message: "Invalid field ID" });
      }
      
      const field = await storage.getField(fieldId);
      if (!field) {
        return res.status(404).json({ message: "Field not found" });
      }
      
      // Ensure the field belongs to the authenticated user
      if (field.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this field" });
      }
      
      res.json(field);
    } catch (error) {
      console.error("Error fetching field:", error);
      res.status(500).json({ message: "Failed to retrieve field" });
    }
  });
  
  // Create a new field
  app.post("/api/fields", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Validate and create field
      const fieldData = insertFieldSchema.parse(req.body);
      const newField = await storage.createField({
        ...fieldData,
        userId: req.user.id
      });
      
      res.status(201).json(newField);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating field:", error);
        res.status(500).json({ message: "Failed to create field" });
      }
    }
  });
  
  // Update a field
  app.patch("/api/fields/:id", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const fieldId = parseInt(req.params.id);
      if (isNaN(fieldId)) {
        return res.status(400).json({ message: "Invalid field ID" });
      }
      
      // Check if field exists and belongs to user
      const existingField = await storage.getField(fieldId);
      if (!existingField) {
        return res.status(404).json({ message: "Field not found" });
      }
      
      if (existingField.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this field" });
      }
      
      // Validate and update field
      const fieldData = insertFieldSchema.partial().parse(req.body);
      const updatedField = await storage.updateField(fieldId, fieldData);
      
      res.json(updatedField);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error updating field:", error);
        res.status(500).json({ message: "Failed to update field" });
      }
    }
  });
  
  // Delete a field
  app.delete("/api/fields/:id", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const fieldId = parseInt(req.params.id);
      if (isNaN(fieldId)) {
        return res.status(400).json({ message: "Invalid field ID" });
      }
      
      // Check if field exists and belongs to user
      const existingField = await storage.getField(fieldId);
      if (!existingField) {
        return res.status(404).json({ message: "Field not found" });
      }
      
      if (existingField.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this field" });
      }
      
      // Delete field
      const success = await storage.deleteField(fieldId);
      
      if (success) {
        res.json({ success: true, message: "Field deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete field" });
      }
    } catch (error) {
      console.error("Error deleting field:", error);
      res.status(500).json({ message: "Failed to delete field" });
    }
  });
  
  // Settings endpoints
  app.get("/api/settings", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // In a real implementation, this would fetch settings from a database
      // For now, we'll just return a default settings object
      res.json({
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          weatherAlerts: true,
          marketPriceAlerts: false,
          taskReminders: true,
        },
        display: {
          theme: "dark",
          fontSize: 100,
          reducedMotion: false,
          highContrast: false,
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: "never",
          loginNotifications: true,
        },
        privacy: {
          shareData: true,
          profileVisibility: "public",
          locationSharing: true,
        },
        units: {
          temperatureUnit: "celsius",
          distanceUnit: "metric",
          weightUnit: "metric",
          dateFormat: "DMY",
        }
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to retrieve settings" });
    }
  });
  
  // Update settings endpoint
  app.patch("/api/settings", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { type, settings } = req.body;
      
      if (!type || !settings) {
        return res.status(400).json({ message: "Missing type or settings data" });
      }
      
      // In a real implementation, this would update settings in a database
      // For now, we'll just return the updated settings object
      // In a real app, we would save these settings to the database
      
      // Return the full settings object with the updated section
      res.json({
        notifications: type === 'notifications' ? settings : {
          emailNotifications: true,
          pushNotifications: true,
          weatherAlerts: true,
          marketPriceAlerts: false,
          taskReminders: true,
        },
        display: type === 'display' ? settings : {
          theme: "dark",
          fontSize: 100,
          reducedMotion: false,
          highContrast: false,
        },
        security: type === 'security' ? settings : {
          twoFactorAuth: false,
          sessionTimeout: "never",
          loginNotifications: true,
        },
        privacy: type === 'privacy' ? settings : {
          shareData: true,
          profileVisibility: "public",
          locationSharing: true,
        },
        units: type === 'units' ? settings : {
          temperatureUnit: "celsius",
          distanceUnit: "metric",
          weightUnit: "metric",
          dateFormat: "DMY",
        }
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });
  
  // Weather API endpoint
  app.get("/api/weather", isAuthenticated, async (req, res) => {
    try {
      const { location } = req.query;
      
      if (!location) {
        return res.status(400).json({ message: "Location parameter is required" });
      }
      
      // Use our dedicated weather service
      const { getWeatherData } = await import('./weather');
      const weatherData = await getWeatherData(location as string);
      
      res.json(weatherData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      if (error instanceof Error && error.message === 'OpenWeather API key not configured') {
        res.status(503).json({ 
          message: "Weather service is not properly configured. Please contact system administrator.",
          details: "API key missing"
        });
      } else {
        res.status(500).json({ message: "Failed to retrieve weather data" });
      }
    }
  });
  
  // Historical weather data endpoint
  app.get("/api/weather/historical", isAuthenticated, async (req, res) => {
    try {
      const { location, startDate, endDate } = req.query;
      
      if (!location) {
        return res.status(400).json({ message: "Location parameter is required" });
      }
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start and end dates are required" });
      }
      
      const { getHistoricalWeatherData } = await import('./weather');
      const historicalData = await getHistoricalWeatherData(
        location as string, 
        new Date(startDate as string), 
        new Date(endDate as string)
      );
      
      res.json(historicalData);
    } catch (error) {
      console.error("Error fetching historical weather data:", error);
      if (error instanceof Error && error.message === 'OpenWeather API key not configured') {
        res.status(503).json({ 
          message: "Weather service is not properly configured. Please contact system administrator.",
          details: "API key missing"
        });
      } else {
        res.status(500).json({ message: "Failed to retrieve historical weather data" });
      }
    }
  });
  
  // Climate data endpoint
  app.get("/api/weather/climate", isAuthenticated, async (req, res) => {
    try {
      const { location } = req.query;
      
      if (!location) {
        return res.status(400).json({ message: "Location parameter is required" });
      }
      
      const { getClimateData } = await import('./weather');
      const climateData = await getClimateData(location as string);
      
      res.json(climateData);
    } catch (error) {
      console.error("Error fetching climate data:", error);
      res.status(500).json({ message: "Failed to retrieve climate data" });
    }
  });
  
  // Crop recommendations based on weather and climate
  app.get("/api/crop-recommendations", isAuthenticated, async (req, res) => {
    try {
      const { location } = req.query;
      
      if (!location) {
        return res.status(400).json({ message: "Location parameter is required" });
      }
      
      const { getCropRecommendations } = await import('./weather');
      const recommendations = await getCropRecommendations(location as string);
      
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching crop recommendations:", error);
      res.status(500).json({ message: "Failed to generate crop recommendations" });
    }
  });
  
  // Generate and save crop yield prediction
  app.post("/api/crop-yield-predictions", isAuthenticated, async (req, res) => {
    try {
      const { cropId, location } = req.body;
      
      if (!cropId || !location) {
        return res.status(400).json({ message: "CropId and location are required" });
      }
      
      const { generateCropYieldPrediction, saveCropYieldPrediction } = await import('./weather');
      const prediction = await generateCropYieldPrediction(cropId, location);
      const savedPrediction = await saveCropYieldPrediction(prediction);
      
      res.status(201).json(savedPrediction);
    } catch (error) {
      console.error("Error generating crop yield prediction:", error);
      res.status(500).json({ message: "Failed to generate crop yield prediction" });
    }
  });

  // Crop Management Routes
  
  // Get all crops for the authenticated farmer
  app.get("/api/crops", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const crops = await storage.getCrops(req.user.id);
      res.json(crops);
    } catch (error) {
      console.error("Error fetching crops:", error);
      res.status(500).json({ message: "Failed to retrieve crops" });
    }
  });
  
  // Get crops for a specific field
  app.get("/api/fields/:fieldId/crops", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const fieldId = parseInt(req.params.fieldId);
      if (isNaN(fieldId)) {
        return res.status(400).json({ message: "Invalid field ID" });
      }
      
      // Verify field belongs to user
      const field = await storage.getField(fieldId);
      if (!field) {
        return res.status(404).json({ message: "Field not found" });
      }
      
      if (field.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this field" });
      }
      
      const crops = await storage.getCropsByField(fieldId);
      res.json(crops);
    } catch (error) {
      console.error("Error fetching crops for field:", error);
      res.status(500).json({ message: "Failed to retrieve crops" });
    }
  });
  
  // Get a specific crop
  app.get("/api/crops/:id", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const cropId = parseInt(req.params.id);
      if (isNaN(cropId)) {
        return res.status(400).json({ message: "Invalid crop ID" });
      }
      
      const crop = await storage.getCrop(cropId);
      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }
      
      // Ensure the crop belongs to the authenticated user
      if (crop.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this crop" });
      }
      
      res.json(crop);
    } catch (error) {
      console.error("Error fetching crop:", error);
      res.status(500).json({ message: "Failed to retrieve crop" });
    }
  });
  
  // Create a new crop
  app.post("/api/crops", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Validate and create crop
      const cropData = insertCropSchema.parse(req.body);
      
      // If fieldId is provided, ensure it belongs to the user
      if (cropData.fieldId) {
        const field = await storage.getField(cropData.fieldId);
        if (!field) {
          return res.status(404).json({ message: "Field not found" });
        }
        
        if (field.userId !== req.user.id) {
          return res.status(403).json({ message: "You don't have permission to use this field" });
        }
      }
      
      const newCrop = await storage.createCrop({
        ...cropData,
        userId: req.user.id
      });
      
      res.status(201).json(newCrop);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating crop:", error);
        res.status(500).json({ message: "Failed to create crop" });
      }
    }
  });
  
  // Update a crop
  app.patch("/api/crops/:id", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const cropId = parseInt(req.params.id);
      if (isNaN(cropId)) {
        return res.status(400).json({ message: "Invalid crop ID" });
      }
      
      // Check if crop exists and belongs to user
      const existingCrop = await storage.getCrop(cropId);
      if (!existingCrop) {
        return res.status(404).json({ message: "Crop not found" });
      }
      
      if (existingCrop.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this crop" });
      }
      
      // Validate and update crop
      const cropData = insertCropSchema.partial().parse(req.body);
      
      // If changing the field, verify the new field belongs to the user
      if (cropData.fieldId && cropData.fieldId !== existingCrop.fieldId) {
        const field = await storage.getField(cropData.fieldId);
        if (!field) {
          return res.status(404).json({ message: "Field not found" });
        }
        
        if (field.userId !== req.user.id) {
          return res.status(403).json({ message: "You don't have permission to use this field" });
        }
      }
      
      const updatedCrop = await storage.updateCrop(cropId, cropData);
      
      res.json(updatedCrop);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error updating crop:", error);
        res.status(500).json({ message: "Failed to update crop" });
      }
    }
  });
  
  // Delete a crop
  app.delete("/api/crops/:id", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const cropId = parseInt(req.params.id);
      if (isNaN(cropId)) {
        return res.status(400).json({ message: "Invalid crop ID" });
      }
      
      // Check if crop exists and belongs to user
      const existingCrop = await storage.getCrop(cropId);
      if (!existingCrop) {
        return res.status(404).json({ message: "Crop not found" });
      }
      
      if (existingCrop.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this crop" });
      }
      
      // Delete crop
      const success = await storage.deleteCrop(cropId);
      
      if (success) {
        res.json({ success: true, message: "Crop deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete crop" });
      }
    } catch (error) {
      console.error("Error deleting crop:", error);
      res.status(500).json({ message: "Failed to delete crop" });
    }
  });
  
  // Crop Activity Management Routes
  
  // Get all activities for a crop
  app.get("/api/crops/:cropId/activities", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const cropId = parseInt(req.params.cropId);
      if (isNaN(cropId)) {
        return res.status(400).json({ message: "Invalid crop ID" });
      }
      
      // Verify crop belongs to user
      const crop = await storage.getCrop(cropId);
      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }
      
      if (crop.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this crop" });
      }
      
      const activities = await storage.getCropActivities(cropId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching crop activities:", error);
      res.status(500).json({ message: "Failed to retrieve activities" });
    }
  });
  
  // Get a specific activity
  app.get("/api/crop-activities/:id", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "Invalid activity ID" });
      }
      
      const activity = await storage.getCropActivity(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      // Verify the activity's crop belongs to the user
      const crop = await storage.getCrop(activity.cropId);
      if (!crop || crop.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this activity" });
      }
      
      res.json(activity);
    } catch (error) {
      console.error("Error fetching crop activity:", error);
      res.status(500).json({ message: "Failed to retrieve activity" });
    }
  });
  
  // Create a new activity for a crop
  app.post("/api/crops/:cropId/activities", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const cropId = parseInt(req.params.cropId);
      if (isNaN(cropId)) {
        return res.status(400).json({ message: "Invalid crop ID" });
      }
      
      // Verify crop belongs to user
      const crop = await storage.getCrop(cropId);
      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }
      
      if (crop.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to add activities to this crop" });
      }
      
      // Validate and create activity
      const activityData = insertCropActivitySchema.parse({
        ...req.body,
        cropId
      });
      
      const newActivity = await storage.createCropActivity(activityData);
      
      res.status(201).json(newActivity);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating crop activity:", error);
        res.status(500).json({ message: "Failed to create activity" });
      }
    }
  });
  
  // Update an activity
  app.patch("/api/crop-activities/:id", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "Invalid activity ID" });
      }
      
      // Check if activity exists
      const existingActivity = await storage.getCropActivity(activityId);
      if (!existingActivity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      // Verify the activity's crop belongs to the user
      const crop = await storage.getCrop(existingActivity.cropId);
      if (!crop || crop.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this activity" });
      }
      
      // Validate and update activity
      const activityData = insertCropActivitySchema.partial().parse(req.body);
      
      // Ensure the crop ID hasn't changed
      if (activityData.cropId && activityData.cropId !== existingActivity.cropId) {
        return res.status(400).json({ message: "Cannot change the crop an activity belongs to" });
      }
      
      const updatedActivity = await storage.updateCropActivity(activityId, activityData);
      
      res.json(updatedActivity);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error updating crop activity:", error);
        res.status(500).json({ message: "Failed to update activity" });
      }
    }
  });
  
  // Delete an activity
  app.delete("/api/crop-activities/:id", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "Invalid activity ID" });
      }
      
      // Check if activity exists
      const activity = await storage.getCropActivity(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      // Verify the activity's crop belongs to the user
      const crop = await storage.getCrop(activity.cropId);
      if (!crop || crop.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this activity" });
      }
      
      // Delete activity
      const success = await storage.deleteCropActivity(activityId);
      
      if (success) {
        res.json({ success: true, message: "Activity deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete activity" });
      }
    } catch (error) {
      console.error("Error deleting crop activity:", error);
      res.status(500).json({ message: "Failed to delete activity" });
    }
  });
  
  // Weather Preferences Routes
  
  // Get weather preferences
  app.get("/api/weather-preferences", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const preferences = await storage.getWeatherPreferences(req.user.id);
      
      // If no preferences are found, return an empty default object instead of 404
      if (!preferences) {
        return res.json({
          id: 0,
          userId: req.user.id,
          locations: [],
          alertsEnabled: true,
          temperatureUnit: "celsius",
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching weather preferences:", error);
      res.status(500).json({ message: "Failed to retrieve weather preferences" });
    }
  });
  
  // Create weather preferences
  app.post("/api/weather-preferences", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Check if preferences already exist
      const existingPrefs = await storage.getWeatherPreferences(req.user.id);
      
      // Validate the request data
      const prefsData = insertWeatherPreferencesSchema.parse(req.body);
      
      if (existingPrefs) {
        // Update existing preferences
        const updatedPrefs = await storage.updateWeatherPreferences(req.user.id, prefsData);
        return res.json(updatedPrefs);
      } else {
        // Create new preferences
        const newPrefs = await storage.createWeatherPreferences({
          ...prefsData,
          userId: req.user.id
        });
        
        res.status(201).json(newPrefs);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating weather preferences:", error);
        res.status(500).json({ message: "Failed to create weather preferences" });
      }
    }
  });
  
  // Update weather preferences
  app.patch("/api/weather-preferences", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // First check if preferences exist, create if they don't
      let prefs = await storage.getWeatherPreferences(req.user.id);
      
      // Parse the update data
      const prefsData = insertWeatherPreferencesSchema.partial().parse(req.body);
      
      if (!prefs) {
        // Create new preferences with the provided data
        const newPrefsData = {
          userId: req.user.id,
          ...prefsData,
          locations: prefsData.locations || [],
          alertsEnabled: prefsData.alertsEnabled ?? true,
          temperatureUnit: prefsData.temperatureUnit || 'celsius'
        };
        
        console.log("Creating new weather preferences:", newPrefsData);
        const createdPrefs = await storage.createWeatherPreferences(newPrefsData);
        return res.status(201).json(createdPrefs);
      }
      
      // Update existing preferences
      console.log("Updating weather preferences for user", req.user.id, "with data:", prefsData);
      const updatedPrefs = await storage.updateWeatherPreferences(req.user.id, prefsData);
      
      if (!updatedPrefs) {
        return res.status(500).json({ message: "Failed to update weather preferences" });
      }
      
      res.json(updatedPrefs);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error updating weather preferences:", error);
        res.status(500).json({ message: "Failed to update weather preferences" });
      }
    }
  });
  
  // Task Management Routes
  
  // Get all tasks for the authenticated farmer
  app.get("/api/tasks", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const tasks = await storage.getTasks(req.user.id);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to retrieve tasks" });
    }
  });
  
  // Get tasks by date
  app.get("/api/tasks/date/:date", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const dateParam = req.params.date;
      
      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }
      
      const date = new Date(dateParam);
      const tasks = await storage.getTasksByDate(req.user.id, date);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks by date:", error);
      res.status(500).json({ message: "Failed to retrieve tasks" });
    }
  });
  
  // Get tasks by date range
  app.get("/api/tasks/range/:startDate/:endDate", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const startDateParam = req.params.startDate;
      const endDateParam = req.params.endDate;
      
      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(startDateParam) || !/^\d{4}-\d{2}-\d{2}$/.test(endDateParam)) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }
      
      const startDate = new Date(startDateParam);
      const endDate = new Date(endDateParam);
      
      if (startDate > endDate) {
        return res.status(400).json({ message: "Start date must be before end date" });
      }
      
      const tasks = await storage.getTasksByDateRange(req.user.id, startDate, endDate);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks by date range:", error);
      res.status(500).json({ message: "Failed to retrieve tasks" });
    }
  });
  
  // Get tasks by priority
  app.get("/api/tasks/priority/:priority", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const priority = req.params.priority;
      if (!['low', 'medium', 'high'].includes(priority)) {
        return res.status(400).json({ message: "Invalid priority. Must be 'low', 'medium', or 'high'" });
      }
      
      const tasks = await storage.getTasksByPriority(req.user.id, priority);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks by priority:", error);
      res.status(500).json({ message: "Failed to retrieve tasks" });
    }
  });
  
  // Get tasks by crop
  app.get("/api/crops/:cropId/tasks", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const cropId = parseInt(req.params.cropId);
      if (isNaN(cropId)) {
        return res.status(400).json({ message: "Invalid crop ID" });
      }
      
      // Verify crop belongs to user
      const crop = await storage.getCrop(cropId);
      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }
      
      if (crop.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access tasks for this crop" });
      }
      
      const tasks = await storage.getTasksByCrop(cropId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks for crop:", error);
      res.status(500).json({ message: "Failed to retrieve tasks" });
    }
  });
  
  // Get tasks by field
  app.get("/api/fields/:fieldId/tasks", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const fieldId = parseInt(req.params.fieldId);
      if (isNaN(fieldId)) {
        return res.status(400).json({ message: "Invalid field ID" });
      }
      
      // Verify field belongs to user
      const field = await storage.getField(fieldId);
      if (!field) {
        return res.status(404).json({ message: "Field not found" });
      }
      
      if (field.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access tasks for this field" });
      }
      
      const tasks = await storage.getTasksByField(fieldId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks for field:", error);
      res.status(500).json({ message: "Failed to retrieve tasks" });
    }
  });
  
  // Get a specific task
  app.get("/api/tasks/:id", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Ensure the task belongs to the authenticated user
      if (task.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this task" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to retrieve task" });
    }
  });
  
  // Create a new task
  app.post("/api/tasks", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Validate and create task
      const taskData = insertFarmerTaskSchema.parse(req.body);
      
      // If relatedCropId is provided, ensure it belongs to the user
      if (taskData.relatedCropId) {
        const crop = await storage.getCrop(taskData.relatedCropId);
        if (!crop) {
          return res.status(404).json({ message: "Related crop not found" });
        }
        
        if (crop.userId !== req.user.id) {
          return res.status(403).json({ message: "You don't have permission to associate tasks with this crop" });
        }
      }
      
      // If relatedFieldId is provided, ensure it belongs to the user
      if (taskData.relatedFieldId) {
        const field = await storage.getField(taskData.relatedFieldId);
        if (!field) {
          return res.status(404).json({ message: "Related field not found" });
        }
        
        if (field.userId !== req.user.id) {
          return res.status(403).json({ message: "You don't have permission to associate tasks with this field" });
        }
      }
      
      const newTask = await storage.createTask({
        ...taskData,
        userId: req.user.id
      });
      
      res.status(201).json(newTask);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Failed to create task" });
      }
    }
  });
  
  // Update a task
  app.patch("/api/tasks/:id", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      // Check if task exists and belongs to user
      const existingTask = await storage.getTask(taskId);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (existingTask.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this task" });
      }
      
      // Validate and update task
      const taskData = insertFarmerTaskSchema.partial().parse(req.body);
      
      // If relatedCropId is changed, ensure it belongs to the user
      if (taskData.relatedCropId && taskData.relatedCropId !== existingTask.relatedCropId) {
        const crop = await storage.getCrop(taskData.relatedCropId);
        if (!crop) {
          return res.status(404).json({ message: "Related crop not found" });
        }
        
        if (crop.userId !== req.user.id) {
          return res.status(403).json({ message: "You don't have permission to associate tasks with this crop" });
        }
      }
      
      // If relatedFieldId is changed, ensure it belongs to the user
      if (taskData.relatedFieldId && taskData.relatedFieldId !== existingTask.relatedFieldId) {
        const field = await storage.getField(taskData.relatedFieldId);
        if (!field) {
          return res.status(404).json({ message: "Related field not found" });
        }
        
        if (field.userId !== req.user.id) {
          return res.status(403).json({ message: "You don't have permission to associate tasks with this field" });
        }
      }
      
      const updatedTask = await storage.updateTask(taskId, taskData);
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Failed to update task" });
      }
    }
  });
  
  // Delete a task
  app.delete("/api/tasks/:id", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      // Check if task exists and belongs to user
      const existingTask = await storage.getTask(taskId);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (existingTask.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this task" });
      }
      
      // Delete task
      const success = await storage.deleteTask(taskId);
      
      if (success) {
        res.json({ success: true, message: "Task deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete task" });
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });
  
  // Complete a task
  app.post("/api/tasks/:id/complete", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      // Check if task exists and belongs to user
      const existingTask = await storage.getTask(taskId);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (existingTask.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to complete this task" });
      }
      
      // Complete task
      const completedTask = await storage.completeTask(taskId);
      
      if (completedTask) {
        res.json({ success: true, message: "Task completed successfully", task: completedTask });
      } else {
        res.status(500).json({ message: "Failed to complete task" });
      }
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(500).json({ message: "Failed to complete task" });
    }
  });
  
  // Crop Yield Prediction Routes
  
  // Get all yield predictions for a crop
  app.get("/api/crops/:cropId/predictions", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const cropId = parseInt(req.params.cropId);
      if (isNaN(cropId)) {
        return res.status(400).json({ message: "Invalid crop ID" });
      }
      
      // Verify crop belongs to user
      const crop = await storage.getCrop(cropId);
      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }
      
      if (crop.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access predictions for this crop" });
      }
      
      const predictions = await storage.getCropYieldPredictions(cropId);
      res.json(predictions);
    } catch (error) {
      console.error("Error fetching yield predictions:", error);
      res.status(500).json({ message: "Failed to retrieve yield predictions" });
    }
  });
  
  // Create a yield prediction for a crop
  app.post("/api/crops/:cropId/predictions", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const cropId = parseInt(req.params.cropId);
      if (isNaN(cropId)) {
        return res.status(400).json({ message: "Invalid crop ID" });
      }
      
      // Verify crop belongs to user
      const crop = await storage.getCrop(cropId);
      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }
      
      if (crop.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to create predictions for this crop" });
      }
      
      // Validate prediction data
      const predictionData = insertCropYieldPredictionSchema.parse({
        ...req.body,
        cropId
      });
      
      const newPrediction = await storage.createCropYieldPrediction(predictionData);
      res.status(201).json(newPrediction);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating yield prediction:", error);
        res.status(500).json({ message: "Failed to create yield prediction" });
      }
    }
  });
  
  // Generate a yield prediction using AI
  app.post("/api/crops/:cropId/predictions/generate", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const cropId = parseInt(req.params.cropId);
      if (isNaN(cropId)) {
        return res.status(400).json({ message: "Invalid crop ID" });
      }
      
      // Verify crop belongs to user
      const crop = await storage.getCrop(cropId);
      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }
      
      if (crop.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to create predictions for this crop" });
      }
      
      // Import the AI prediction generator dynamically to avoid circular dependencies
      const { generateCropYieldPrediction } = await import('./ai');
      
      // Get additional field information if available
      const field = crop.fieldId ? await storage.getField(crop.fieldId) : null;
      
      // Additional data from request body (optional)
      const additionalData = req.body || {};
      
      // Prepare data for AI prediction
      const cropData = {
        cropId: crop.id,
        cropType: crop.name,
        plantingDate: crop.plantingDate,
        harvestDate: crop.expectedHarvestDate, // Use the correct field name
        fieldSize: field ? field.size : additionalData.fieldSize,
        fieldLocation: field ? field.location : additionalData.location,
        soilType: field ? field.soilType : additionalData.soilType,
        climate: additionalData.climate,
        irrigation: additionalData.irrigation,
        fertilizers: additionalData.fertilizers
      };
      
      // Generate prediction with OpenAI
      const predictionData = await generateCropYieldPrediction(cropData);
      
      // Save prediction to database
      const newPrediction = await storage.createCropYieldPrediction(predictionData);
      
      res.status(201).json({
        success: true,
        message: "AI-generated yield prediction created successfully",
        prediction: newPrediction
      });
    } catch (error) {
      console.error("Error generating AI yield prediction:", error);
      res.status(500).json({ message: "Failed to generate yield prediction" });
    }
  });
  
  // Plant Disease Analysis Endpoints
  
  // Get all plant analyses for the authenticated farmer
  app.get("/api/plant-analyses", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const analyses = await storage.getPlantAnalyses(req.user.id);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching plant analyses:", error);
      res.status(500).json({ message: "Failed to retrieve plant analyses" });
    }
  });
  
  // Get a specific plant analysis by ID
  app.get("/api/plant-analyses/:id", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const analysisId = parseInt(req.params.id);
      if (isNaN(analysisId)) {
        return res.status(400).json({ message: "Invalid analysis ID" });
      }
      
      const analysis = await storage.getPlantAnalysis(analysisId);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      
      // Ensure the analysis belongs to the authenticated user
      if (analysis.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this analysis" });
      }
      
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching plant analysis:", error);
      res.status(500).json({ message: "Failed to retrieve plant analysis" });
    }
  });
  
  // Get plant analyses for a specific field
  app.get("/api/fields/:fieldId/plant-analyses", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const fieldId = parseInt(req.params.fieldId);
      if (isNaN(fieldId)) {
        return res.status(400).json({ message: "Invalid field ID" });
      }
      
      // Check if field exists and belongs to the user
      const field = await storage.getField(fieldId);
      if (!field) {
        return res.status(404).json({ message: "Field not found" });
      }
      
      if (field.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this field's analyses" });
      }
      
      const analyses = await storage.getPlantAnalysisByField(fieldId);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching field plant analyses:", error);
      res.status(500).json({ message: "Failed to retrieve field plant analyses" });
    }
  });
  
  // Get plant analyses for a specific crop
  app.get("/api/crops/:cropId/plant-analyses", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const cropId = parseInt(req.params.cropId);
      if (isNaN(cropId)) {
        return res.status(400).json({ message: "Invalid crop ID" });
      }
      
      // Check if crop exists and belongs to the user
      const crop = await storage.getCrop(cropId);
      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }
      
      if (crop.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this crop's analyses" });
      }
      
      const analyses = await storage.getPlantAnalysisByCrop(cropId);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching crop plant analyses:", error);
      res.status(500).json({ message: "Failed to retrieve crop plant analyses" });
    }
  });
  
  // Submit a plant image for analysis
  app.post("/api/plant-analyses", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { imageData, plantType, fieldId, cropId, notes } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ message: "Image data is required" });
      }
      
      // Validate field and crop IDs if provided
      if (fieldId) {
        const field = await storage.getField(parseInt(fieldId));
        if (!field) {
          return res.status(404).json({ message: "Field not found" });
        }
        if (field.userId !== req.user.id) {
          return res.status(403).json({ message: "You don't have permission to use this field" });
        }
      }
      
      if (cropId) {
        const crop = await storage.getCrop(parseInt(cropId));
        if (!crop) {
          return res.status(404).json({ message: "Crop not found" });
        }
        if (crop.userId !== req.user.id) {
          return res.status(403).json({ message: "You don't have permission to use this crop" });
        }
      }
      
      // Process the image with AI
      const { analyzePlantImage, createPlantAnalysis } = await import('./services/plant-analysis');
      
      // Analyze the image
      const analysisResult = await analyzePlantImage(
        imageData,
        plantType,
        notes
      );
      
      // Create the database record
      const plantAnalysisData = createPlantAnalysis(
        imageData,
        analysisResult,
        req.user.id,
        plantType,
        fieldId ? parseInt(fieldId) : undefined,
        cropId ? parseInt(cropId) : undefined,
        notes
      );
      
      // Save to database
      const savedAnalysis = await storage.createPlantAnalysis(plantAnalysisData);
      
      res.status(201).json(savedAnalysis);
    } catch (error) {
      console.error("Error analyzing plant image:", error);
      if (error instanceof Error && error.message.includes("OpenAI API")) {
        res.status(503).json({ 
          message: "Plant analysis service is not properly configured. Please contact system administrator.",
          details: "API key missing or invalid"
        });
      } else {
        res.status(500).json({ message: "Failed to analyze plant image" });
      }
    }
  });
  
  // Delete a plant analysis
  app.delete("/api/plant-analyses/:id", isAuthenticated, hasRole('farmer'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const analysisId = parseInt(req.params.id);
      if (isNaN(analysisId)) {
        return res.status(400).json({ message: "Invalid analysis ID" });
      }
      
      // Check if analysis exists and belongs to user
      const existingAnalysis = await storage.getPlantAnalysis(analysisId);
      if (!existingAnalysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      
      if (existingAnalysis.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this analysis" });
      }
      
      // Delete analysis
      const success = await storage.deletePlantAnalysis(analysisId);
      
      if (success) {
        res.json({ success: true, message: "Plant analysis deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete plant analysis" });
      }
    } catch (error) {
      console.error("Error deleting plant analysis:", error);
      res.status(500).json({ message: "Failed to delete plant analysis" });
    }
  });

  // Catch-all route for API errors - must be after all API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
  });
  
  // ================ SHARED API ENDPOINTS ================
  
  // ---- Location Management ----
  // These endpoints are used by multiple features including weather and marketplace
  
  // Get all locations
  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getLocations();
      res.json(locations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ message: "Failed to retrieve locations" });
    }
  });
  
  // Get location by ID
  app.get("/api/locations/:id", async (req, res) => {
    try {
      const locationId = parseInt(req.params.id);
      if (isNaN(locationId)) {
        return res.status(400).json({ message: "Invalid location ID" });
      }
      
      const location = await storage.getLocation(locationId);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      res.json(location);
    } catch (error) {
      console.error("Error fetching location:", error);
      res.status(500).json({ message: "Failed to retrieve location" });
    }
  });
  
  // Search locations by coordinates
  app.get("/api/locations/search/coordinates", async (req, res) => {
    try {
      const { latitude, longitude } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      
      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ message: "Invalid coordinates" });
      }
      
      const location = await storage.getLocationByCoordinates(lat, lng);
      
      if (!location) {
        return res.status(404).json({ message: "No location found for these coordinates" });
      }
      
      res.json(location);
    } catch (error) {
      console.error("Error searching locations by coordinates:", error);
      res.status(500).json({ message: "Failed to search locations" });
    }
  });
  
  // Create location (authenticated users only)
  app.post("/api/locations", isAuthenticated, async (req, res) => {
    try {
      const locationData = insertLocationSchema.parse(req.body);
      const newLocation = await storage.createLocation(locationData);
      
      res.status(201).json(newLocation);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating location:", error);
        res.status(500).json({ message: "Failed to create location" });
      }
    }
  });
  
  // Update location (authenticated users only)
  app.patch("/api/locations/:id", isAuthenticated, async (req, res) => {
    try {
      const locationId = parseInt(req.params.id);
      if (isNaN(locationId)) {
        return res.status(400).json({ message: "Invalid location ID" });
      }
      
      const existingLocation = await storage.getLocation(locationId);
      if (!existingLocation) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      const locationData = insertLocationSchema.partial().parse(req.body);
      const updatedLocation = await storage.updateLocation(locationId, locationData);
      
      res.json(updatedLocation);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error updating location:", error);
        res.status(500).json({ message: "Failed to update location" });
      }
    }
  });
  
  // ---- MARKETPLACE ROUTES MOVED TO SERVER/ROUTES/MARKETPLACE.TS ----

  /* app.get("/api/marketplace/listings", async (req, res) => {
    try {
      const {
        category,
        search,
        sellerId,
        minPrice,
        maxPrice,
        condition,
        status,
        locationId,
        radius,
        sortBy,
        limit,
        offset
      } = req.query;
      
      const params: any = {};
      
      if (category) params.category = category;
      if (search) params.search = search;
      if (sellerId) params.sellerId = parseInt(sellerId as string);
      if (minPrice) params.minPrice = parseFloat(minPrice as string);
      if (maxPrice) params.maxPrice = parseFloat(maxPrice as string);
      if (condition) params.condition = condition;
      if (status) params.status = status;
      if (locationId) params.locationId = parseInt(locationId as string);
      if (radius) params.radius = parseFloat(radius as string);
      if (sortBy) params.sortBy = sortBy;
      if (limit) params.limit = parseInt(limit as string);
      if (offset) params.offset = parseInt(offset as string);
      
      const listings = await storage.getMarketplaceListings(Object.keys(params).length > 0 ? params : undefined);
      
      res.json(listings);
    } catch (error) {
      console.error("Error fetching marketplace listings:", error);
      res.status(500).json({ message: "Failed to retrieve listings" });
    }
  });
  
  // Get listings by location with radius search
  app.get("/api/marketplace/listings/by-location", async (req, res) => {
    try {
      const { latitude, longitude, radius } = req.query;
      
      if (!latitude || !longitude || !radius) {
        return res.status(400).json({ message: "Latitude, longitude, and radius are required" });
      }
      
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const rad = parseFloat(radius as string);
      
      if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
        return res.status(400).json({ message: "Invalid parameters" });
      }
      
      // Extract any additional filter parameters
      const {
        category,
        minPrice,
        maxPrice,
        condition,
        status
      } = req.query;
      
      const filters: any = {};
      
      if (category) filters.category = category;
      if (condition) filters.condition = condition;
      if (status) filters.status = status;
      if (minPrice || maxPrice) {
        // Handle price separately since we can't filter directly by min/max in the function
        filters.minPrice = minPrice ? parseFloat(minPrice as string) : undefined;
        filters.maxPrice = maxPrice ? parseFloat(maxPrice as string) : undefined;
      }
      
      const listings = await storage.getMarketplaceListingsByLocation(lat, lng, rad, 
        Object.keys(filters).length > 0 ? filters : undefined);
      
      res.json(listings);
    } catch (error) {
      console.error("Error fetching listings by location:", error);
      res.status(500).json({ message: "Failed to retrieve listings" });
    }
  });
  
  // Get listings by seller with their location radius
  app.get("/api/marketplace/listings/by-seller-location/:sellerId", async (req, res) => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      if (isNaN(sellerId)) {
        return res.status(400).json({ message: "Invalid seller ID" });
      }
      
      const { radius } = req.query;
      if (!radius) {
        return res.status(400).json({ message: "Radius parameter is required" });
      }
      
      const rad = parseFloat(radius as string);
      if (isNaN(rad)) {
        return res.status(400).json({ message: "Invalid radius" });
      }
      
      const listings = await storage.getMarketplaceListingsBySellerLocation(sellerId, rad);
      
      res.json(listings);
    } catch (error) {
      console.error("Error fetching listings by seller location:", error);
      res.status(500).json({ message: "Failed to retrieve listings" });
    }
  });
  
  // Get specific listing by ID
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
      
      // Increment views count
      await storage.incrementListingViews(listingId);
      
      res.json(listing);
    } catch (error) {
      console.error("Error fetching marketplace listing:", error);
      res.status(500).json({ message: "Failed to retrieve listing" });
    }
  });
  
  // Get listings by seller
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
      res.status(500).json({ message: "Failed to retrieve listings" });
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
      console.log("Request files:", req.files ? (req.files as Express.Multer.File[]).length : "no files");
      
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
  
  // Get unread message count (authenticated users only)
  app.get("/api/marketplace/messages/unread/count", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const count = await storage.getUnreadMessageCount(req.user.id);
      
      res.json({ count });
    } catch (error) {
      console.error("Error getting unread message count:", error);
      res.status(500).json({ message: "Failed to get unread message count" });
    }
  });
  */

  // Log all registered routes for debugging
  console.log("Registered routes:");
  const registeredRoutes: string[] = [];
  
  // Type assertion for Express router stack
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      // Routes registered directly
      const path = middleware.route.path;
      const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
      registeredRoutes.push(`${methods} ${path}`);
    } else if (middleware.name === 'router') {
      // Routes registered via router
      middleware.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          const path = handler.route.path;
          const methods = Object.keys(handler.route.methods).join(', ').toUpperCase();
          registeredRoutes.push(`${methods} ${path}`);
        }
      });
    }
  });
  
  // Sort and log all routes
  registeredRoutes.sort().forEach(route => console.log(`- ${route}`));
  
  // Specifically check for the marketplace route
  if (registeredRoutes.some(r => r.includes("/api/marketplace/listings"))) {
    console.log("✅ Marketplace listings routes are properly registered");
  } else {
    console.log("❌ WARNING: Marketplace listings routes not found in registered routes!");
  }
  
  // Marketplace routes are now handled by the dedicated module

  // Create and return the HTTP server
  const httpServer = createServer(app);
  
  console.log("WebSocket functionality completely disabled as requested");
  
  // Provide a no-op implementation for the WebSocket notifier
  // to prevent errors in code that calls this function
  setWebSocketNotifier(() => {
    // No-op implementation - websockets are disabled
    console.log("WebSocket notification attempted but WebSockets are disabled");
  });
  
  return httpServer;
}
