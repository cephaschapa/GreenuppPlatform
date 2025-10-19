/**
 * Hyperlocal Weather Service for Zambian Locations
 * Provides precise weather data for neighborhoods and compounds
 */

import {
  findZambianLocation,
  findNearestLocation,
  getLocationsByCity,
  zambianLocations,
  type ZambianLocation,
} from "../data/zambian-locations.js";
import { getWeatherData, geocodeLocation, reverseGeocode } from "../weather.js";
import { logger } from "../lib/logger.js";

export interface HyperlocalWeatherQuery {
  location?: string; // e.g., "Chalala - Lusaka" or "Kalingalinga"
  lat?: number;
  lon?: number;
  city?: string; // Optional: "Lusaka"
}

export interface HyperlocalWeatherResponse {
  location: ZambianLocation;
  weather: any; // Weather data from OpenWeather
  source: "zambian_database" | "openweather_geocode" | "coordinates";
  precision: "neighborhood" | "city" | "approximate";
}

/**
 * Get hyperlocal weather data for Zambian locations
 * Prioritizes our database for precise neighborhood-level data
 */
export async function getHyperlocalWeather(
  query: HyperlocalWeatherQuery
): Promise<HyperlocalWeatherResponse> {
  let zambianLocation: ZambianLocation | null = null;
  let source: "zambian_database" | "openweather_geocode" | "coordinates" =
    "openweather_geocode";
  let precision: "neighborhood" | "city" | "approximate" = "approximate";

  // Strategy 1: Search in our Zambian database by location name
  if (query.location) {
    zambianLocation = findZambianLocation(query.location);

    if (zambianLocation) {
      logger.info(
        `Found location in Zambian database: ${zambianLocation.name}, ${zambianLocation.city}`
      );
      source = "zambian_database";
      precision =
        zambianLocation.type === "compound" ||
        zambianLocation.type === "neighborhood"
          ? "neighborhood"
          : zambianLocation.type === "city"
          ? "city"
          : "approximate";

      // Get weather using precise coordinates from our database
      const weatherData = await getWeatherData(
        `${zambianLocation.coordinates.lat},${zambianLocation.coordinates.lon}`
      );

      return {
        location: zambianLocation,
        weather: weatherData,
        source,
        precision,
      };
    }

    // If not found in database, try OpenWeather geocoding as fallback
    try {
      logger.info(
        `Location not in database, trying OpenWeather geocoding: ${query.location}`
      );
      const geoData = await geocodeLocation(query.location);

      // Try to find nearest Zambian location to these coordinates
      const nearestResult = findNearestLocation(geoData.lat, geoData.lon);

      if (nearestResult) {
        zambianLocation = nearestResult.location;
        const distance = nearestResult.distance;

        logger.info(
          `Found nearest Zambian location: ${zambianLocation.name}, ${
            zambianLocation.city
          } (${distance.toFixed(2)}km away)`
        );
        source = "zambian_database";

        // Set precision based on distance
        if (distance < 0.5) {
          precision =
            zambianLocation.type === "compound" ||
            zambianLocation.type === "neighborhood"
              ? "neighborhood"
              : "city";
        } else if (distance < 2) {
          precision = "city";
        } else {
          precision = "approximate";
        }
      }

      const weatherData = await getWeatherData(query.location);

      return {
        location: zambianLocation || {
          name: geoData.name,
          city: geoData.name,
          province: geoData.state || "Unknown",
          type: "city",
          coordinates: { lat: geoData.lat, lon: geoData.lon },
        },
        weather: weatherData,
        source: zambianLocation ? "zambian_database" : "openweather_geocode",
        precision: zambianLocation ? "approximate" : "city",
      };
    } catch (error) {
      logger.error(`Failed to geocode location: ${query.location}`, error);
      throw new Error(
        `Unable to find weather data for location: ${query.location}`
      );
    }
  }

  // Strategy 2: Use coordinates directly (for GPS auto-detect)
  if (query.lat !== undefined && query.lon !== undefined) {
    // Find nearest Zambian location to these coordinates (within 200km radius)
    const nearestResult = findNearestLocation(query.lat, query.lon);

    if (nearestResult) {
      zambianLocation = nearestResult.location;
      const distance = nearestResult.distance;

      logger.info(
        `Found nearest Zambian location to GPS coordinates: ${
          zambianLocation.name
        }, ${zambianLocation.city} (${distance.toFixed(2)}km away)`
      );
      source = "zambian_database";

      // Set precision based on distance from detected GPS to database location
      if (distance < 0.5) {
        // Within 500m - very precise
        precision =
          zambianLocation.type === "compound" ||
          zambianLocation.type === "neighborhood"
            ? "neighborhood"
            : "city";
        logger.info(`🎯 High precision match - ${distance.toFixed(2)}km away`);
      } else if (distance < 2) {
        // Within 2km - city level
        precision = "city";
        logger.info(`📍 City-level match - ${distance.toFixed(2)}km away`);
      } else {
        // More than 2km - approximate
        precision = "approximate";
        logger.info(`📌 Approximate match - ${distance.toFixed(2)}km away`);
      }
    } else {
      // No Zambian location within 200km - use OpenWeather for actual location
      logger.info(
        `No Zambian location found within 200km of coordinates (${query.lat}, ${query.lon}). Using OpenWeather geocoding for actual location.`
      );
      try {
        const geoData = await reverseGeocode(query.lat, query.lon);
        zambianLocation = {
          name: geoData.name,
          city: geoData.name,
          province: geoData.state || "Unknown",
          type: "city",
          coordinates: { lat: geoData.lat, lon: geoData.lon },
        };
        source = "openweather_geocode";
        precision = "city";
        logger.info(
          `Using OpenWeather reverse geocode: ${geoData.name}, ${
            geoData.state || "Unknown"
          }, ${geoData.country}`
        );
      } catch (error) {
        logger.error("Failed to reverse geocode coordinates", error);
        throw new Error("Unable to find weather data for coordinates");
      }
    }

    // Get weather using the coordinates
    const weatherData = await getWeatherData(`${query.lat},${query.lon}`);

    return {
      location: zambianLocation,
      weather: weatherData,
      source,
      precision,
    };
  }

  // Strategy 3: List all locations in a city
  if (query.city) {
    const cityLocations = getLocationsByCity(query.city);

    if (cityLocations.length > 0) {
      // Return weather for the main city center
      const cityCenter = cityLocations.find(
        (loc) =>
          loc.type === "city" ||
          loc.name.toLowerCase().includes("center") ||
          loc.name.toLowerCase().includes("cbd")
      );

      zambianLocation = cityCenter || cityLocations[0];

      const weatherData = await getWeatherData(
        `${zambianLocation.coordinates.lat},${zambianLocation.coordinates.lon}`
      );

      return {
        location: zambianLocation,
        weather: weatherData,
        source: "zambian_database",
        precision: "city",
      };
    }

    // Fallback to OpenWeather if city not in database
    try {
      const weatherData = await getWeatherData(query.city);
      const geoData = await geocodeLocation(query.city);

      return {
        location: {
          name: geoData.name,
          city: geoData.name,
          province: geoData.state || "Unknown",
          type: "city",
          coordinates: { lat: geoData.lat, lon: geoData.lon },
        },
        weather: weatherData,
        source: "openweather_geocode",
        precision: "city",
      };
    } catch (error) {
      logger.error(`Failed to get weather for city: ${query.city}`, error);
      throw new Error(`Unable to find weather data for city: ${query.city}`);
    }
  }

  throw new Error(
    "Invalid query: must provide location name, coordinates, or city"
  );
}

/**
 * Get weather for multiple neighborhoods in a city
 * Useful for comparing weather across different parts of a city
 */
export async function getMultipleNeighborhoodWeather(
  city: string
): Promise<HyperlocalWeatherResponse[]> {
  const locations = getLocationsByCity(city);

  if (locations.length === 0) {
    throw new Error(`No locations found for city: ${city}`);
  }

  // Get weather for each neighborhood
  const weatherPromises = locations.map(async (location) => {
    try {
      const weatherData = await getWeatherData(
        `${location.coordinates.lat},${location.coordinates.lon}`
      );

      return {
        location,
        weather: weatherData,
        source: "zambian_database" as const,
        precision:
          location.type === "compound" || location.type === "neighborhood"
            ? ("neighborhood" as const)
            : ("city" as const),
      };
    } catch (error) {
      logger.error(
        `Failed to get weather for ${location.name}, ${location.city}`,
        error
      );
      return null;
    }
  });

  const results = await Promise.all(weatherPromises);

  // Filter out failed requests
  return results.filter(
    (result) => result !== null
  ) as HyperlocalWeatherResponse[];
}

/**
 * Search for Zambian locations with autocomplete
 */
export function searchZambianLocations(
  query: string,
  limit: number = 10
): ZambianLocation[] {
  const normalizedQuery = query.toLowerCase().trim();

  if (normalizedQuery.length < 2) {
    return [];
  }

  const results: Array<{ location: ZambianLocation; score: number }> = [];

  for (const location of zambianLocations) {
    const locationName = location.name.toLowerCase();
    const cityName = location.city.toLowerCase();
    const fullName = `${locationName}, ${cityName}`;

    let score = 0;

    // Exact match gets highest score
    if (locationName === normalizedQuery || fullName === normalizedQuery) {
      score = 100;
    }
    // Starts with query
    else if (locationName.startsWith(normalizedQuery)) {
      score = 80;
    }
    // Contains query
    else if (locationName.includes(normalizedQuery)) {
      score = 60;
    }
    // City matches
    else if (cityName.includes(normalizedQuery)) {
      score = 40;
    }
    // Alias matches
    else if (
      location.aliases?.some((alias) =>
        alias.toLowerCase().includes(normalizedQuery)
      )
    ) {
      score = 50;
    }

    if (score > 0) {
      results.push({ location, score });
    }
  }

  // Sort by score (highest first) and return limited results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.location);
}
