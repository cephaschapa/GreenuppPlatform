import type { Request, Response } from "express";
import { LocationModel } from "../models/LocationModel";
import { logger } from "../lib/logger";
import {
  ValidationError,
  AuthenticationError,
  NotFoundError,
} from "../lib/errors";
import { insertLocationSchema } from "@shared/schema";

export class LocationController {
  private model: LocationModel;

  constructor() {
    this.model = new LocationModel();
  }

  // Get all locations
  async getAllLocations(req: Request, res: Response): Promise<void> {
    try {
      const locations = await this.model.getAllLocations();
      res.json(locations);
    } catch (error) {
      logger.error("Error fetching locations:", error);
      res.status(500).json({ message: "Failed to retrieve locations" });
    }
  }

  // Get location by ID
  async getLocation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const locationId = parseInt(id);

      if (isNaN(locationId)) {
        throw new ValidationError("Invalid location ID");
      }

      const location = await this.model.getLocation(locationId);
      if (!location) {
        throw new NotFoundError("Location not found");
      }

      res.json(location);
    } catch (error) {
      logger.error("Error fetching location:", error);
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to retrieve location" });
      }
    }
  }

  // Search locations by coordinates
  async searchLocationsByCoordinates(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { latitude, longitude } = req.query;

      if (!latitude || !longitude) {
        throw new ValidationError("Latitude and longitude are required");
      }

      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);

      if (isNaN(lat) || isNaN(lng)) {
        throw new ValidationError("Invalid coordinates");
      }

      const location = await this.model.getLocationByCoordinates(lat, lng);

      if (!location) {
        throw new NotFoundError("No location found for these coordinates");
      }

      res.json(location);
    } catch (error) {
      logger.error("Error searching locations by coordinates:", error);
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to search locations" });
      }
    }
  }

  // Create location
  async createLocation(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const locationData = insertLocationSchema.parse(req.body);
      const newLocation = await this.model.createLocation(locationData);

      logger.info(`Location created by user ${req.user.id}: ${newLocation.id}`);
      res.status(201).json(newLocation);
    } catch (error) {
      logger.error("Error creating location:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create location" });
      }
    }
  }

  // Update location
  async updateLocation(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { id } = req.params;
      const locationId = parseInt(id);

      if (isNaN(locationId)) {
        throw new ValidationError("Invalid location ID");
      }

      const existingLocation = await this.model.getLocation(locationId);
      if (!existingLocation) {
        throw new NotFoundError("Location not found");
      }

      const locationData = insertLocationSchema.partial().parse(req.body);
      const updatedLocation = await this.model.updateLocation(
        locationId,
        locationData
      );

      if (!updatedLocation) {
        throw new NotFoundError("Failed to update location");
      }

      logger.info(`Location updated by user ${req.user.id}: ${locationId}`);
      res.json(updatedLocation);
    } catch (error) {
      logger.error("Error updating location:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update location" });
      }
    }
  }

  // Search locations by text
  async searchLocations(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q || typeof q !== "string") {
        throw new ValidationError("Search query is required");
      }

      const locations = await this.model.searchLocations(q);
      res.json(locations);
    } catch (error) {
      logger.error("Error searching locations:", error);
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to search locations" });
      }
    }
  }

  // Get locations by country
  async getLocationsByCountry(req: Request, res: Response): Promise<void> {
    try {
      const { country } = req.params;

      if (!country) {
        throw new ValidationError("Country parameter is required");
      }

      const locations = await this.model.getLocationsByCountry(country);
      res.json(locations);
    } catch (error) {
      logger.error("Error fetching locations by country:", error);
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to retrieve locations" });
      }
    }
  }

  // Get locations by region
  async getLocationsByRegion(req: Request, res: Response): Promise<void> {
    try {
      const { region } = req.params;

      if (!region) {
        throw new ValidationError("Region parameter is required");
      }

      const locations = await this.model.getLocationsByRegion(region);
      res.json(locations);
    } catch (error) {
      logger.error("Error fetching locations by region:", error);
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to retrieve locations" });
      }
    }
  }
}
