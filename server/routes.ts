import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  contactFormSchema, 
  insertFarmerProfileSchema, 
  insertFieldSchema,
  insertCropSchema,
  insertCropActivitySchema,
  insertWeatherPreferencesSchema,
  insertFarmerTaskSchema,
  insertCropYieldPredictionSchema,
  fields, crops, cropActivities,
  weatherPreferences, farmerTasks, cropYieldPredictions
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";
import { eq } from "drizzle-orm";

// Note: We rely on the User type definition
// that's already declared in auth.ts

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication 
  setupAuth(app);

  // Middleware to check authentication
  function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Not authenticated" });
  }

  // Middleware to check user role
  function hasRole(role: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (req.isAuthenticated() && req.user && req.user.role === role) {
        return next();
      }
      res.status(403).json({ message: "Unauthorized access" });
    };
  }

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
  
  // Weather API endpoint
  app.get("/api/weather", isAuthenticated, async (req, res) => {
    try {
      const { location } = req.query;
      
      if (!location) {
        return res.status(400).json({ message: "Location parameter is required" });
      }
      
      // In a real application, you would make a call to a weather API service here
      // For now, we'll return simulated weather data
      const weatherData = {
        location: location,
        current: {
          temp: 22,
          humidity: 65,
          wind_speed: 12,
          weather: [{ description: 'Partly cloudy' }]
        },
        daily: [
          { 
            date: new Date(Date.now()).toLocaleDateString(), 
            temp: { day: 22, min: 16, max: 24 }, 
            humidity: 65, 
            weather: [{ description: 'Partly cloudy' }] 
          },
          { 
            date: new Date(Date.now() + 86400000).toLocaleDateString(), 
            temp: { day: 24, min: 18, max: 26 }, 
            humidity: 60, 
            weather: [{ description: 'Sunny' }] 
          },
          { 
            date: new Date(Date.now() + 86400000 * 2).toLocaleDateString(), 
            temp: { day: 21, min: 15, max: 23 }, 
            humidity: 70, 
            weather: [{ description: 'Light rain' }] 
          },
          { 
            date: new Date(Date.now() + 86400000 * 3).toLocaleDateString(), 
            temp: { day: 20, min: 14, max: 22 }, 
            humidity: 75, 
            weather: [{ description: 'Showers' }] 
          },
          { 
            date: new Date(Date.now() + 86400000 * 4).toLocaleDateString(), 
            temp: { day: 23, min: 17, max: 25 }, 
            humidity: 55, 
            weather: [{ description: 'Clear sky' }] 
          }
        ]
      };
      
      res.json(weatherData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      res.status(500).json({ message: "Failed to retrieve weather data" });
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
      if (!preferences) {
        return res.status(404).json({ message: "Weather preferences not found" });
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
      if (existingPrefs) {
        return res.status(409).json({ message: "Weather preferences already exist" });
      }
      
      // Validate and create preferences
      const prefsData = insertWeatherPreferencesSchema.parse(req.body);
      const newPrefs = await storage.createWeatherPreferences({
        ...prefsData,
        userId: req.user.id
      });
      
      res.status(201).json(newPrefs);
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
      
      // Validate and update preferences
      const prefsData = insertWeatherPreferencesSchema.partial().parse(req.body);
      const updatedPrefs = await storage.updateWeatherPreferences(req.user.id, prefsData);
      
      if (!updatedPrefs) {
        return res.status(404).json({ message: "Weather preferences not found" });
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
  
  // Catch-all route for API errors
  app.use("/api/*", (req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
