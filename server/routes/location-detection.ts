import { Router, Request, Response } from "express";
import {
  detectLocationFromCoordinates,
  searchLocation,
  formatLocation,
} from "../services/locationService.js";
import { isAuthenticated } from "../middleware/auth.js";
import { logger } from "../lib/logger.js";

const router = Router();

// Apply authentication to all routes
router.use(isAuthenticated);

/**
 * POST /api/location/detect
 * Detect location from GPS coordinates
 *
 * Body:
 * {
 *   "lat": -33.9249,
 *   "lon": 18.4241
 * }
 *
 * Returns accurate global location with enhanced precision for Zambian locations
 */
router.post("/detect", async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.body;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude values",
      });
    }

    const location = await detectLocationFromCoordinates(latitude, longitude);

    res.json({
      success: true,
      location: {
        name: location.name,
        city: location.city,
        state: location.state,
        country: location.country,
        coordinates: location.coordinates,
        formatted: formatLocation(location),
      },
      meta: {
        precision: location.precision,
        source: location.source,
        isZambian: location.isZambian,
        zambianDetails: location.zambianDetails,
      },
    });
  } catch (error) {
    logger.error("Error detecting location from coordinates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to detect location",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/location/search?q=Cape Town
 * Search for a location by name
 */
router.get("/search", async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({
        success: false,
        message: "Search query (q) is required",
      });
    }

    const location = await searchLocation(q);

    res.json({
      success: true,
      location: {
        name: location.name,
        city: location.city,
        state: location.state,
        country: location.country,
        coordinates: location.coordinates,
        formatted: formatLocation(location),
      },
      meta: {
        precision: location.precision,
        source: location.source,
        isZambian: location.isZambian,
        zambianDetails: location.zambianDetails,
      },
    });
  } catch (error) {
    logger.error(`Error searching for location: ${req.query.q}`, error);
    res.status(500).json({
      success: false,
      message: "Failed to search for location",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
