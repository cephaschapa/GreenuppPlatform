import { Request, Response } from "express";
import { WeatherModel } from "../models/WeatherModel.js";
import { insertWeatherPreferencesSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { getIPLocation } from "../services/ipGeolocationService.js";

export class WeatherController {
  static async getWeather(req: Request, res: Response) {
    try {
      const { location } = req.query;
      if (!location) {
        return res
          .status(400)
          .json({ message: "Location parameter is required" });
      }
      const data = await WeatherModel.getWeatherData(location as string);
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

  static async detectLocationFromIP(req: Request, res: Response) {
    try {
      // Get the user's IP address with better detection
      let ip = req.headers['x-forwarded-for'] as string;
      if (ip) {
        // Handle comma-separated values (multiple proxies)
        ip = ip.split(',')[0].trim();
      } else {
        ip = req.headers['x-real-ip'] as string ||
             req.headers['x-client-ip'] as string ||
             req.headers['cf-connecting-ip'] as string ||
             req.socket.remoteAddress ||
             req.connection.remoteAddress ||
             'unknown';
      }

      // Remove IPv6 prefix if present
      if (ip && ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
      }

      console.log('Detected IP for geolocation:', ip);

      // If we can't get a valid IP, provide a default location
      if (!ip || ip === 'unknown' || ip === '127.0.0.1' || ip === '::1') {
        console.log('Using default location for unknown IP');
        res.json({
          lat: -15.3875,
          lon: 28.3228,
          name: 'Lusaka',
          country: 'Zambia',
          state: 'Lusaka Province',
          city: 'Lusaka',
          geoPath: 'Lusaka, Lusaka Province, Zambia',
        });
        return;
      }

      // Get location from IP
      const locationData = await getIPLocation(ip);

      // If IP geolocation failed (returned unknown), provide default
      if (locationData.name === 'Unknown' || locationData.lat === 0) {
        console.log('IP geolocation failed, using default location');
        res.json({
          lat: -15.3875,
          lon: 28.3228,
          name: 'Lusaka',
          country: 'Zambia',
          state: 'Lusaka Province',
          city: 'Lusaka',
          geoPath: 'Lusaka, Lusaka Province, Zambia',
        });
        return;
      }

      // Return location information in the same format as reverse-geocode
      res.json({
        lat: locationData.lat,
        lon: locationData.lon,
        name: locationData.name,
        country: locationData.country,
        state: locationData.state,
        city: locationData.city,
        geoPath: locationData.geoPath,
      });
    } catch (error) {
      console.error('IP geolocation error:', error);

      // Provide fallback location instead of error
      res.json({
        lat: -15.3875,
        lon: 28.3228,
        name: 'Lusaka',
        country: 'Zambia',
        state: 'Lusaka Province',
        city: 'Lusaka',
        geoPath: 'Lusaka, Lusaka Province, Zambia',
      });
    }
  }
}
