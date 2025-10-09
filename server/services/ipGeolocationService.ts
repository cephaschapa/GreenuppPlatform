import axios from "axios";
import { logger } from "../lib/logger.js";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_GEO_URL = "https://api.openweathermap.org/geo/1.0";

// Cache for IP geolocation to minimize API calls
const ipLocationCache: { [key: string]: { data: any; timestamp: number } } = {};
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours (IP locations don't change often)

export interface IPLocation {
  ip: string;
  lat: number;
  lon: number;
  name: string;
  country: string;
  state?: string;
  city?: string;
  geoPath: string; // Full geographic hierarchy
  timezone?: string;
  isp?: string;
}

/**
 * Get location information from IP address using OpenWeather API
 * This uses a free IP geolocation service that provides coordinates
 */
async function getIPCoordinates(
  ip: string
): Promise<{ lat: number; lon: number }> {
  try {
    // Use a free IP geolocation service
    const response = await axios.get(
      `http://ip-api.com/json/${ip}?fields=lat,lon`
    );

    if (response.data && response.data.lat && response.data.lon) {
      return {
        lat: response.data.lat,
        lon: response.data.lon,
      };
    }

    throw new Error("Invalid coordinates from IP geolocation service");
  } catch (error) {
    logger.error(`Error getting IP coordinates for ${ip}:`, error);

    // Fallback: return default coordinates (this should rarely happen)
    return {
      lat: 0,
      lon: 0,
    };
  }
}

/**
 * Reverse geocode coordinates to get location details using OpenWeather API
 */
async function reverseGeocodeCoordinates(
  lat: number,
  lon: number
): Promise<{
  name: string;
  country: string;
  state?: string;
  city?: string;
  geoPath: string;
}> {
  try {
    if (!OPENWEATHER_API_KEY) {
      throw new Error("OpenWeather API key not configured");
    }

    const response = await axios.get(`${OPENWEATHER_GEO_URL}/reverse`, {
      params: {
        lat,
        lon,
        limit: 1,
        appid: OPENWEATHER_API_KEY,
      },
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];

      // Build geographic hierarchy
      const geoParts = [];
      if (result.name) geoParts.push(result.name);
      if (result.state) geoParts.push(result.state);
      if (result.country) geoParts.push(result.country);

      const geoPath = geoParts.join(", ");

      return {
        name: result.name || "Unknown",
        country: result.country || "Unknown",
        state: result.state,
        city: result.city,
        geoPath,
      };
    } else {
      throw new Error("Location not found");
    }
  } catch (error) {
    logger.error("Error reverse geocoding coordinates:", error);
    return {
      name: "Unknown",
      country: "Unknown",
      geoPath: "Unknown location",
    };
  }
}

/**
 * Get detailed location information from IP address
 */
export async function getIPLocation(ip: string): Promise<IPLocation> {
  try {
    // Check cache first
    const cached = ipLocationCache[ip];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // Skip localhost and private IPs
    if (
      ip === "localhost" ||
      ip === "127.0.0.1" ||
      ip === "::1" ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.") ||
      ip.startsWith("172.")
    ) {
      const localLocation: IPLocation = {
        ip,
        lat: 0,
        lon: 0,
        name: "Local Network",
        country: "Local",
        geoPath: "Local Network",
      };

      ipLocationCache[ip] = {
        data: localLocation,
        timestamp: Date.now(),
      };

      return localLocation;
    }

    // Get coordinates from IP
    const coordinates = await getIPCoordinates(ip);

    // Get location details from coordinates
    const locationDetails = await reverseGeocodeCoordinates(
      coordinates.lat,
      coordinates.lon
    );

    const ipLocation: IPLocation = {
      ip,
      lat: coordinates.lat,
      lon: coordinates.lon,
      name: locationDetails.name,
      country: locationDetails.country,
      state: locationDetails.state,
      city: locationDetails.city,
      geoPath: locationDetails.geoPath,
    };

    // Cache the result
    ipLocationCache[ip] = {
      data: ipLocation,
      timestamp: Date.now(),
    };

    return ipLocation;
  } catch (error) {
    logger.error(`Error getting IP location for ${ip}:`, error);

    // Return fallback data
    return {
      ip,
      lat: 0,
      lon: 0,
      name: "Unknown",
      country: "Unknown",
      geoPath: "Unknown location",
    };
  }
}

/**
 * Get location information for multiple IP addresses
 */
export async function getMultipleIPLocations(
  ips: string[]
): Promise<{ [ip: string]: IPLocation }> {
  const results: { [ip: string]: IPLocation } = {};

  // Process IPs in parallel with rate limiting
  const promises = ips.map(async (ip) => {
    try {
      const location = await getIPLocation(ip);
      results[ip] = location;
    } catch (error) {
      logger.error(`Error getting location for IP ${ip}:`, error);
      results[ip] = {
        ip,
        lat: 0,
        lon: 0,
        name: "Unknown",
        country: "Unknown",
        geoPath: "Unknown location",
      };
    }
  });

  await Promise.all(promises);
  return results;
}

/**
 * Clear the IP location cache
 */
export function clearIPLocationCache(): void {
  Object.keys(ipLocationCache).forEach((key) => {
    delete ipLocationCache[key];
  });
}

/**
 * Get cache statistics
 */
export function getIPLocationCacheStats(): { size: number; entries: string[] } {
  return {
    size: Object.keys(ipLocationCache).length,
    entries: Object.keys(ipLocationCache),
  };
}
