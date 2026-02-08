import { Request, Response } from "express";
import { WeatherModel } from "../models/WeatherModel.js";
import { insertWeatherPreferencesSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { logger } from "../lib/logger.js";

export class WeatherController {
  static async getWeather(req: Request, res: Response) {
    try {
      const { location } = req.query;
      if (!location) {
        return res
          .status(400)
          .json({ message: "Location parameter is required" });
      }
      const locStr = String(location);
      const isCoords = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(locStr.trim());
      logger.info("GET /api/weather", { location: isCoords ? "lat,lon" : locStr.slice(0, 80), isCoords });
      const data = await WeatherModel.getWeatherData(locStr);
      res.json(data);
    } catch (error) {
      res.status(500).json({
        message: "Failed to retrieve weather data",
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  static async getHistoricalWeather(req: Request, res: Response) {
    try {
      const { location, startDate, endDate } = req.query;
      if (!location || !startDate || !endDate) {
        return res
          .status(400)
          .json({ message: "Location, startDate, and endDate are required" });
      }
      const data = await WeatherModel.getHistoricalWeatherData(
        location as string,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(data);
    } catch (error) {
      res.status(500).json({
        message: "Failed to retrieve historical weather data",
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  static async getClimate(req: Request, res: Response) {
    try {
      const { location } = req.query;
      if (!location) {
        return res
          .status(400)
          .json({ message: "Location parameter is required" });
      }
      const data = await WeatherModel.getClimateData(location as string);
      res.json(data);
    } catch (error) {
      res.status(500).json({
        message: "Failed to retrieve climate data",
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  static async reverseGeocode(req: Request, res: Response) {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) {
        return res
          .status(400)
          .json({ message: "Latitude and longitude parameters are required" });
      }
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      if (isNaN(latitude) || isNaN(longitude)) {
        return res
          .status(400)
          .json({ message: "Invalid latitude or longitude values" });
      }
      const data = await WeatherModel.reverseGeocode(latitude, longitude);
      res.json(data);
    } catch (error) {
      res.status(500).json({
        message: "Failed to reverse geocode coordinates",
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  static async geocode(req: Request, res: Response) {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      const data = await WeatherModel.geocode(query as string);
      res.json({ results: data });
    } catch (error) {
      res.status(500).json({
        message: "Failed to search locations",
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  static async getCropRecommendations(req: Request, res: Response) {
    try {
      const { location } = req.query;
      if (!location) {
        return res
          .status(400)
          .json({ message: "Location parameter is required" });
      }
      const data = await WeatherModel.getCropRecommendations(
        location as string
      );
      res.json(data);
    } catch (error) {
      res.status(500).json({
        message: "Failed to retrieve crop recommendations",
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  static async getPreferences(req: Request, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const prefs = await WeatherModel.getWeatherPreferences(req.user.id);
      if (!prefs) {
        return res.json({
          id: 0,
          userId: req.user.id,
          locations: [],
          alertsEnabled: true,
          temperatureUnit: "celsius",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      res.json(prefs);
    } catch (error) {
      res.status(500).json({
        message: "Failed to retrieve weather preferences",
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  static async createPreferences(req: Request, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if preferences already exist
      const existing = await WeatherModel.getWeatherPreferences(req.user.id);
      const prefsData = insertWeatherPreferencesSchema.parse(req.body);
      if (existing) {
        // Update
        const updated = await WeatherModel.updateWeatherPreferences(
          req.user.id,
          prefsData
        );
        return res.json(updated);
      } else {
        // Create
        const created = await WeatherModel.createWeatherPreferences({
          ...prefsData,
          userId: req.user.id,
        });
        return res.status(201).json(created);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({
          message: "Failed to create/update weather preferences",
          error: error instanceof Error ? error.message : error,
        });
      }
    }
  }

  static async updatePreferences(req: Request, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if preferences exist, create if not
      const prefs = await WeatherModel.getWeatherPreferences(req.user.id);
      const prefsData = insertWeatherPreferencesSchema
        .partial()
        .parse(req.body);
      if (!prefs) {
        // Create new
        const created = await WeatherModel.createWeatherPreferences({
          userId: req.user.id,
          ...prefsData,
          locations: prefsData.locations || [],
          alertsEnabled: prefsData.alertsEnabled ?? true,
          temperatureUnit: prefsData.temperatureUnit || "celsius",
        });
        return res.status(201).json(created);
      }
      // Update existing
      const updated = await WeatherModel.updateWeatherPreferences(
        req.user.id,
        prefsData
      );
      if (!updated) {
        return res
          .status(500)
          .json({ message: "Failed to update weather preferences" });
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({
          message: "Failed to update weather preferences",
          error: error instanceof Error ? error.message : error,
        });
      }
    }
  }
}
