import { Router, Request, Response } from "express";
import {
  getHyperlocalWeather,
  getMultipleNeighborhoodWeather,
  searchZambianLocations,
} from "../services/hyperlocalWeatherService.js";
import {
  getLocationsByCity,
  getLocationsByProvince,
} from "../data/zambian-locations.js";
import { isAuthenticated } from "../middleware/auth.js";
import { logger } from "../lib/logger.js";

const router = Router();

// Apply authentication to all routes
router.use(isAuthenticated);

/**
 * GET /api/hyperlocal-weather
 * Get precise weather for a specific neighborhood/compound
 *
 * Query params:
 * - location: "Chalala - Lusaka" or "Kalingalinga"
 * - OR lat & lon: -15.3856, 28.3189
 * - OR city: "Lusaka"
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { location, lat, lon, city } = req.query;

    if (!location && (!lat || !lon) && !city) {
      return res.status(400).json({
        message:
          "Please provide either location name, coordinates (lat & lon), or city",
      });
    }

    const query = {
      location: location as string | undefined,
      lat: lat ? parseFloat(lat as string) : undefined,
      lon: lon ? parseFloat(lon as string) : undefined,
      city: city as string | undefined,
    };

    const result = await getHyperlocalWeather(query);

    res.json({
      success: true,
      location: {
        name: result.location.name,
        city: result.location.city,
        province: result.location.province,
        type: result.location.type,
        coordinates: result.location.coordinates,
        description: result.location.description,
      },
      weather: result.weather,
      meta: {
        source: result.source,
        precision: result.precision,
        message:
          result.precision === "neighborhood"
            ? `Weather data for ${result.location.name} neighborhood`
            : result.precision === "city"
            ? `Weather data for ${result.location.city} city`
            : "Approximate weather data for this area",
      },
    });
  } catch (error) {
    logger.error("Error fetching hyperlocal weather:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve hyperlocal weather",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/hyperlocal-weather/search
 * Search for Zambian locations (autocomplete)
 *
 * Query params:
 * - q: search query (e.g., "cha" returns Chalala, Chawama, etc.)
 * - limit: max results (default: 10)
 */
router.get("/search", async (req: Request, res: Response) => {
  try {
    const { q, limit } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({
        message: "Please provide a search query (q parameter)",
      });
    }

    const maxLimit = limit ? parseInt(limit as string, 10) : 10;
    const results = searchZambianLocations(q, maxLimit);

    res.json({
      success: true,
      query: q,
      count: results.length,
      locations: results.map((loc) => ({
        name: loc.name,
        city: loc.city,
        province: loc.province,
        type: loc.type,
        coordinates: loc.coordinates,
        fullName: `${loc.name}, ${loc.city}`,
        description: loc.description,
      })),
    });
  } catch (error) {
    logger.error("Error searching locations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search locations",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/hyperlocal-weather/city/:cityName
 * Get all neighborhoods/compounds in a specific city
 */
router.get("/city/:cityName", async (req: Request, res: Response) => {
  try {
    const { cityName } = req.params;

    if (!cityName) {
      return res.status(400).json({
        message: "Please provide a city name",
      });
    }

    const locations = getLocationsByCity(cityName);

    if (locations.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No locations found for city: ${cityName}`,
      });
    }

    res.json({
      success: true,
      city: cityName,
      count: locations.length,
      locations: locations.map((loc) => ({
        name: loc.name,
        type: loc.type,
        coordinates: loc.coordinates,
        description: loc.description,
      })),
    });
  } catch (error) {
    logger.error(`Error fetching locations for city ${req.params.cityName}:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve city locations",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/hyperlocal-weather/city/:cityName/weather
 * Get weather for all neighborhoods in a city
 */
router.get("/city/:cityName/weather", async (req: Request, res: Response) => {
  try {
    const { cityName } = req.params;

    if (!cityName) {
      return res.status(400).json({
        message: "Please provide a city name",
      });
    }

    const results = await getMultipleNeighborhoodWeather(cityName);

    res.json({
      success: true,
      city: cityName,
      count: results.length,
      neighborhoods: results.map((result) => ({
        location: {
          name: result.location.name,
          type: result.location.type,
          coordinates: result.location.coordinates,
        },
        weather: {
          current: result.weather.current,
          forecast: result.weather.forecast.slice(0, 3), // Only next 3 days
        },
        precision: result.precision,
      })),
    });
  } catch (error) {
    logger.error(`Error fetching weather for city ${req.params.cityName}:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve city weather",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/hyperlocal-weather/province/:provinceName
 * Get all locations in a province
 */
router.get("/province/:provinceName", async (req: Request, res: Response) => {
  try {
    const { provinceName } = req.params;

    if (!provinceName) {
      return res.status(400).json({
        message: "Please provide a province name",
      });
    }

    const locations = getLocationsByProvince(provinceName);

    if (locations.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No locations found for province: ${provinceName}`,
      });
    }

    res.json({
      success: true,
      province: provinceName,
      count: locations.length,
      locations: locations.map((loc) => ({
        name: loc.name,
        city: loc.city,
        type: loc.type,
        coordinates: loc.coordinates,
        description: loc.description,
      })),
    });
  } catch (error) {
    logger.error(`Error fetching locations for province ${req.params.provinceName}:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve province locations",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;

