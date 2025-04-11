import type { Express, Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "../../storage";
import { insertLocationSchema } from "@shared/schema";

/**
 * Register all location-related routes
 */
export function registerLocationRoutes(app: Express, isAuthenticated: (req: Request, res: Response, next: NextFunction) => void) {
  
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
  
  // Get a specific location
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
      const { latitude, longitude, distance } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const latitudeValue = parseFloat(latitude as string);
      const longitudeValue = parseFloat(longitude as string);
      const distanceValue = distance ? parseFloat(distance as string) : 50; // Default 50km radius
      
      if (isNaN(latitudeValue) || isNaN(longitudeValue)) {
        return res.status(400).json({ message: "Invalid coordinates" });
      }
      
      if (isNaN(distanceValue)) {
        return res.status(400).json({ message: "Invalid distance" });
      }
      
      const locations = await storage.getLocationByCoordinates(latitudeValue, longitudeValue);
      
      res.json(locations);
    } catch (error) {
      console.error("Error searching locations:", error);
      res.status(500).json({ message: "Failed to search locations" });
    }
  });
  
  // Create a new location
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
  
  // Update a location
  app.patch("/api/locations/:id", isAuthenticated, async (req, res) => {
    try {
      const locationId = parseInt(req.params.id);
      if (isNaN(locationId)) {
        return res.status(400).json({ message: "Invalid location ID" });
      }
      
      // Check if location exists
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

  console.log("✅ Location routes registered");
}