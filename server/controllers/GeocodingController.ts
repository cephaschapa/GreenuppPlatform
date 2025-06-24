import type { Request, Response } from "express";
import { logger } from "../lib/logger";
import { ValidationError } from "../lib/errors";
import fetch from "node-fetch";

export class GeocodingController {
  // Reverse geocoding using Nominatim
  async reverseGeocode(req: Request, res: Response): Promise<void> {
    try {
      const { lat, lon, zoom = 18, addressdetails = 1 } = req.query;

      if (!lat || !lon) {
        throw new ValidationError("Latitude and longitude are required");
      }

      const latNum = parseFloat(lat as string);
      const lonNum = parseFloat(lon as string);

      if (isNaN(latNum) || isNaN(lonNum)) {
        throw new ValidationError("Invalid latitude or longitude");
      }

      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latNum}&lon=${lonNum}&zoom=${zoom}&addressdetails=${addressdetails}`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Greenupp/1.0", // Required by Nominatim's usage policy
          "Accept-Language": "en",
        },
      });

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.statusText}`);
      }

      const data = await response.json();

      logger.info(
        `Reverse geocoding completed for coordinates: ${latNum}, ${lonNum}`
      );
      res.json(data);
    } catch (error) {
      logger.error("Geocoding error:", error);
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to fetch location data" });
      }
    }
  }

  // Forward geocoding (search by address)
  async forwardGeocode(req: Request, res: Response): Promise<void> {
    try {
      const { q, limit = 10, countrycodes } = req.query;

      if (!q) {
        throw new ValidationError("Search query is required");
      }

      let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q as string
      )}&limit=${limit}`;

      if (countrycodes) {
        url += `&countrycodes=${countrycodes}`;
      }

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Greenupp/1.0",
          "Accept-Language": "en",
        },
      });

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.statusText}`);
      }

      const data = await response.json();

      logger.info(`Forward geocoding completed for query: ${q}`);
      res.json(data);
    } catch (error) {
      logger.error("Forward geocoding error:", error);
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to search location data" });
      }
    }
  }
}
