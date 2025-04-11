import type { Express, Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "../../storage";
import { insertWeatherPreferencesSchema } from "@shared/schema";
import * as weatherService from "../../services/weather";

/**
 * Register all weather-related routes
 */
export function registerWeatherRoutes(app: Express, isAuthenticated: (req: Request, res: Response, next: NextFunction) => void) {
  
  // Get weather for user's preferred or specified location
  app.get("/api/weather", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get location from query params or user preferences
      const { location } = req.query;
      
      // If location is specified, use it; otherwise, get from user preferences
      let locationToUse = location as string | undefined;
      
      if (!locationToUse) {
        const preferences = await storage.getWeatherPreferences(req.user.id);
        if (preferences && preferences.locations && preferences.locations.length > 0) {
          locationToUse = preferences.locations[0];
        } else {
          return res.status(404).json({ message: "No weather location found. Please set your preferences." });
        }
      }
      
      const weatherData = await weatherService.getCurrentWeather(locationToUse);
      res.json(weatherData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      res.status(500).json({ message: "Failed to retrieve weather data" });
    }
  });
  
  // Get historical weather data
  app.get("/api/weather/historical", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { location, start, end } = req.query;
      
      if (!location || !start) {
        return res.status(400).json({ message: "Location and start date are required" });
      }
      
      const historicalData = await weatherService.getHistoricalWeather(
        location as string,
        start as string,
        end as string | undefined
      );
      
      res.json(historicalData);
    } catch (error) {
      console.error("Error fetching historical weather data:", error);
      res.status(500).json({ message: "Failed to retrieve historical weather data" });
    }
  });
  
  // Get climate data
  app.get("/api/weather/climate", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { location } = req.query;
      
      if (!location) {
        return res.status(400).json({ message: "Location is required" });
      }
      
      const climateData = await weatherService.getClimateData(location as string);
      
      res.json(climateData);
    } catch (error) {
      console.error("Error fetching climate data:", error);
      res.status(500).json({ message: "Failed to retrieve climate data" });
    }
  });
  
  // Weather preferences endpoints
  
  // Get user weather preferences
  app.get("/api/weather-preferences", isAuthenticated, async (req, res) => {
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
  app.post("/api/weather-preferences", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Check if preferences already exist
      const existingPreferences = await storage.getWeatherPreferences(req.user.id);
      if (existingPreferences) {
        return res.status(409).json({ message: "Weather preferences already exist" });
      }
      
      // Validate and create preferences
      const preferencesData = insertWeatherPreferencesSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const newPreferences = await storage.createWeatherPreferences(preferencesData);
      
      res.status(201).json(newPreferences);
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
  app.patch("/api/weather-preferences", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Check if preferences exist
      const existingPreferences = await storage.getWeatherPreferences(req.user.id);
      if (!existingPreferences) {
        return res.status(404).json({ message: "Weather preferences not found" });
      }
      
      // Validate and update preferences
      const preferencesData = insertWeatherPreferencesSchema.partial().parse(req.body);
      
      // Ensure userId cannot be changed
      delete preferencesData.userId;
      
      const updatedPreferences = await storage.updateWeatherPreferences(req.user.id, preferencesData);
      
      res.json(updatedPreferences);
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

  console.log("✅ Weather routes registered");
}