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
    // Try multiple IP geolocation services for better accuracy
    const services = [
      // Primary: ipapi.co (good accuracy, HTTPS)
      {
        url: `https://ipapi.co/${ip}/json/`,
        getCoords: (data: any) => ({ lat: data.latitude, lon: data.longitude }),
        timeout: 3000
      },
      // Secondary: ip-api.com (reliable fallback)
      {
        url: `http://ip-api.com/json/${ip}?fields=lat,lon,status`,
        getCoords: (data: any) => ({ lat: data.lat, lon: data.lon }),
        timeout: 3000
      },
      // Tertiary: ipinfo.io (another reliable service)
      {
        url: `https://ipinfo.io/${ip}/json`,
        getCoords: (data: any) => {
          if (data.loc) {
            const [lat, lon] = data.loc.split(',');
            return { lat: parseFloat(lat), lon: parseFloat(lon) };
          }
          return null;
        },
        timeout: 3000
      }
    ];

    for (const service of services) {
      try {
        const response = await axios.get(service.url, {
          timeout: service.timeout,
          headers: {
            'User-Agent': 'Greenupp/1.0',
            'Accept': 'application/json'
          }
        });

        if (response.data) {
          const coords = service.getCoords(response.data);
          if (coords && coords.lat && coords.lon &&
              !isNaN(coords.lat) && !isNaN(coords.lon) &&
              coords.lat >= -90 && coords.lat <= 90 &&
              coords.lon >= -180 && coords.lon <= 180) {
            return coords;
          }
        }
      } catch (error) {
        logger.warn(`IP geolocation service ${service.url} failed for ${ip}:`, error.message);
        continue; // Try next service
      }
    }

    throw new Error("All IP geolocation services failed");
  } catch (error) {
    logger.error(`Error getting IP coordinates for ${ip}:`, error);

    // Fallback: return default coordinates (Zambia center)
    return {
      lat: -15.3875, // Lusaka coordinates
      lon: 28.3228,
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
      logger.warn("OpenWeather API key not configured, using fallback location");
      // Return default Zambia location
      return {
        name: "Lusaka",
        country: "Zambia",
        state: "Lusaka Province",
        city: "Lusaka",
        geoPath: "Lusaka, Lusaka Province, Zambia",
      };
    }

    const response = await axios.get(`${OPENWEATHER_GEO_URL}/reverse`, {
      params: {
        lat,
        lon,
        limit: 1,
        appid: OPENWEATHER_API_KEY,
      },
      timeout: 5000,
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

    // Smart fallback based on coordinates and regional knowledge
    // Zambia bounds: lat -18 to -8, lon 22 to 34
    if (lat >= -18 && lat <= -8 && lon >= 22 && lon <= 34) {
      // User is likely in Zambia - provide appropriate defaults
      if (lat >= -16 && lat <= -14 && lon >= 27 && lon <= 29) {
        // Central Zambia (Lusaka area)
        return {
          name: "Lusaka",
          country: "Zambia",
          state: "Lusaka Province",
          city: "Lusaka",
          geoPath: "Lusaka, Lusaka Province, Zambia",
        };
      } else if (lat >= -13 && lat <= -11 && lon >= 30 && lon <= 33) {
        // Eastern Zambia (Chipata area)
        return {
          name: "Chipata",
          country: "Zambia",
          state: "Eastern Province",
          city: "Chipata",
          geoPath: "Chipata, Eastern Province, Zambia",
        };
      } else if (lon >= 25 && lon <= 27) {
        // Kabwe/Kabwe area
        return {
          name: "Kabwe",
          country: "Zambia",
          state: "Central Province",
          city: "Kabwe",
          geoPath: "Kabwe, Central Province, Zambia",
        };
      } else {
        // General Zambia location
        return {
          name: "Lusaka",
          country: "Zambia",
          state: "Lusaka Province",
          city: "Lusaka",
          geoPath: "Lusaka, Lusaka Province, Zambia",
        };
      }
    }

    // Check if coordinates are in other African countries (basic regional detection)
    if (lat >= -35 && lat <= 15 && lon >= -20 && lon <= 55) {
      // Africa region - could be various countries
      return {
        name: "Lusaka",
        country: "Zambia",
        state: "Lusaka Province",
        city: "Lusaka",
        geoPath: "Lusaka, Lusaka Province, Zambia",
      };
    }

    // Default fallback
    return {
      name: "Lusaka",
      country: "Zambia",
      state: "Lusaka Province",
      city: "Lusaka",
      geoPath: "Lusaka, Lusaka Province, Zambia",
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
