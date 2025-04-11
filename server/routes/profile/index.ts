import type { Express, Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "../../storage";
import { 
  contactFormSchema, 
  insertFarmerProfileSchema 
} from "@shared/schema";

/**
 * Register all profile-related routes
 */
export function registerProfileRoutes(app: Express, isAuthenticated: (req: Request, res: Response, next: NextFunction) => void, hasRole: (role: string) => (req: Request, res: Response, next: NextFunction) => void) {
  
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

  console.log("✅ Profile routes registered");
}