/**
 * Global Location Detection Service
 * Provides accurate location detection worldwide with enhanced precision for Zambian locations
 */

import { reverseGeocode, geocodeLocation } from "../weather.js";
import { findNearestLocation } from "../data/zambian-locations.js";
import { logger } from "../lib/logger.js";

export interface LocationData {
  name: string;
  city: string;
  state?: string;
  country: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  precision: "neighborhood" | "city" | "region";
  source: "openweather" | "zambian_database";
  isZambian: boolean;
  zambianDetails?: {
    province: string;
    type:
      | "city"
      | "town"
      | "compound"
      | "neighborhood"
      | "village"
      | "district";
    distance: number; // Distance from GPS to database location in km
  };
}

/**
 * Detect location from GPS coordinates
 * Primary method: Uses OpenWeather reverse geocoding for global accuracy
 * Enhancement: Checks Zambian database for neighborhood-level precision if in Zambia
 */
export async function detectLocationFromCoordinates(
  lat: number,
  lon: number
): Promise<LocationData> {
  try {
    logger.info(`Detecting location for coordinates: ${lat}, ${lon}`);

    // STEP 1: Get accurate global location from OpenWeather
    const geoData = await reverseGeocode(lat, lon);

    logger.info(
      `OpenWeather reverse geocode result: ${geoData.name}, ${
        geoData.state || "N/A"
      }, ${geoData.country}`
    );

    // STEP 2: Check if this is in Zambia - if so, enhance with neighborhood precision
    const isInZambia = geoData.country === "ZM" || geoData.country === "Zambia";

    if (isInZambia) {
      // Check Zambian database for precise neighborhood/compound info
      const nearestZambianLocation = findNearestLocation(lat, lon, 50); // 50km threshold for Zambian locations

      if (nearestZambianLocation) {
        const { location: zambianLoc, distance } = nearestZambianLocation;

        logger.info(
          `Enhanced with Zambian database: ${zambianLoc.name}, ${
            zambianLoc.city
          } (${distance.toFixed(2)}km away)`
        );

        // Determine precision based on distance
        let precision: "neighborhood" | "city" | "region" = "city";
        if (distance < 2) {
          precision = "neighborhood"; // Very close - use neighborhood
        } else if (distance < 20) {
          precision = "city"; // Moderate distance - city level
        } else {
          precision = "region"; // Further away - region level
        }

        return {
          name: distance < 2 ? zambianLoc.name : geoData.name, // Use precise name if very close
          city: zambianLoc.city,
          state: zambianLoc.province,
          country: "Zambia",
          coordinates: { lat, lon }, // Use actual GPS coordinates, not database coordinates
          precision,
          source: "zambian_database",
          isZambian: true,
          zambianDetails: {
            province: zambianLoc.province,
            type: zambianLoc.type,
            distance,
          },
        };
      }
    }

    // STEP 3: Return OpenWeather data for non-Zambian or distant locations
    return {
      name: geoData.name,
      city: geoData.name,
      state: geoData.state,
      country: geoData.country,
      coordinates: { lat, lon },
      precision: geoData.state ? "city" : "region",
      source: "openweather",
      isZambian: false,
    };
  } catch (error) {
    logger.error("Failed to detect location from coordinates", error);
    throw new Error("Unable to detect location from GPS coordinates");
  }
}

/**
 * Search for a location by name
 * Returns accurate global results
 */
export async function searchLocation(query: string): Promise<LocationData> {
  try {
    logger.info(`Searching for location: ${query}`);

    const geoData = await geocodeLocation(query);

    logger.info(
      `Found location: ${geoData.name}, ${geoData.state || "N/A"}, ${
        geoData.country
      }`
    );

    // Check if this is in Zambia for potential enhancement
    const isInZambia = geoData.country === "ZM" || geoData.country === "Zambia";

    if (isInZambia) {
      const nearestZambianLocation = findNearestLocation(
        geoData.lat,
        geoData.lon,
        50
      );

      if (nearestZambianLocation) {
        const { location: zambianLoc, distance } = nearestZambianLocation;

        let precision: "neighborhood" | "city" | "region" = "city";
        if (distance < 2) {
          precision = "neighborhood";
        } else if (distance < 20) {
          precision = "city";
        } else {
          precision = "region";
        }

        return {
          name: distance < 2 ? zambianLoc.name : geoData.name,
          city: zambianLoc.city,
          state: zambianLoc.province,
          country: "Zambia",
          coordinates: { lat: geoData.lat, lon: geoData.lon },
          precision,
          source: "zambian_database",
          isZambian: true,
          zambianDetails: {
            province: zambianLoc.province,
            type: zambianLoc.type,
            distance,
          },
        };
      }
    }

    return {
      name: geoData.name,
      city: geoData.name,
      state: geoData.state,
      country: geoData.country,
      coordinates: { lat: geoData.lat, lon: geoData.lon },
      precision: geoData.state ? "city" : "region",
      source: "openweather",
      isZambian: false,
    };
  } catch (error) {
    logger.error(`Failed to search for location: ${query}`, error);
    throw new Error(`Unable to find location: ${query}`);
  }
}

/**
 * Format location for display
 */
export function formatLocation(location: LocationData): string {
  if (location.isZambian && location.zambianDetails) {
    // Format Zambian locations with neighborhood/compound detail
    if (location.precision === "neighborhood") {
      return `${location.name}, ${location.city}, ${location.state}`;
    }
    return `${location.city}, ${location.state}, Zambia`;
  }

  // Format non-Zambian locations
  const parts = [location.name];
  if (location.state && location.state !== location.name) {
    parts.push(location.state);
  }
  parts.push(location.country);

  return parts.join(", ");
}
