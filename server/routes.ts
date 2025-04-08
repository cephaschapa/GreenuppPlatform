import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { contactFormSchema, insertFarmerProfileSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";

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

  // Catch-all route for API errors
  app.use("/api/*", (req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
