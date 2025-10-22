import axios from "axios";

/**
 * Elevation Service using Open-Meteo Elevation API
 * API: https://open-meteo.com/en/docs/elevation-api
 * - Free, no API key required
 * - 90-meter resolution globally
 */

const ELEVATION_API_URL = "https://api.open-meteo.com/v1/elevation";

interface ElevationData {
  elevation: number; // meters above sea level
  latitude: number;
  longitude: number;
}

// Cache to minimize API calls
interface CacheEntry {
  data: ElevationData;
  timestamp: number;
}

const elevationCache: Map<string, CacheEntry> = new Map();
const CACHE_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 days (elevation doesn't change)

/**
 * Get real elevation data for coordinates
 */
export async function getElevation(
  lat: number,
  lon: number
): Promise<ElevationData> {
  // Round coordinates to 4 decimal places for cache key (~11m precision)
  const roundedLat = Math.round(lat * 10000) / 10000;
  const roundedLon = Math.round(lon * 10000) / 10000;
  const cacheKey = `${roundedLat},${roundedLon}`;

  // Check cache first
  const cached = elevationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await axios.get(ELEVATION_API_URL, {
      params: {
        latitude: roundedLat,
        longitude: roundedLon,
      },
      timeout: 5000, // 5 second timeout
    });

    if (response.data && response.data.elevation !== undefined) {
      const elevationData: ElevationData = {
        elevation: Array.isArray(response.data.elevation)
          ? response.data.elevation[0]
          : response.data.elevation,
        latitude: roundedLat,
        longitude: roundedLon,
      };

      // Save to cache
      elevationCache.set(cacheKey, {
        data: elevationData,
        timestamp: Date.now(),
      });

      return elevationData;
    } else {
      throw new Error("Invalid response from elevation API");
    }
  } catch (error: any) {
    console.error("Error fetching elevation data:", error.message);

    // Fallback: estimate based on coordinate ranges (legacy method)
    const elevation = estimateElevationFallback(lat, lon);
    return {
      elevation,
      latitude: roundedLat,
      longitude: roundedLon,
    };
  }
}

/**
 * Fallback elevation estimation (used when API fails)
 * This is the legacy method, kept as a backup
 */
function estimateElevationFallback(lat: number, lon: number): number {
  // Major mountain ranges approximation
  // Rockies
  if (lon > -125 && lon < -105 && lat > 30 && lat < 55) {
    return 2000;
  }
  // Andes
  if (lon > -80 && lon < -65 && lat < 10 && lat > -55) {
    return 3000;
  }
  // Alps
  if (lon > 5 && lon < 16 && lat > 43 && lat < 48) {
    return 2000;
  }
  // Himalayas
  if (lon > 70 && lon < 95 && lat > 25 && lat < 40) {
    return 4000;
  }
  // Ethiopian Highlands
  if (lon > 35 && lon < 40 && lat > 5 && lat < 15) {
    return 2000;
  }
  // Zambezi Plateau (Zambia/Zimbabwe)
  if (lon > 22 && lon < 34 && lat > -18 && lat < -8) {
    return 1200;
  }
  // East African Highlands
  if (lon > 28 && lon < 42 && lat > -5 && lat < 5) {
    return 1500;
  }
  // South African Highveld
  if (lon > 25 && lon < 32 && lat > -30 && lat < -24) {
    return 1500;
  }
  return 300; // Default low elevation
}

/**
 * Batch get elevations for multiple coordinates
 */
export async function getElevationBatch(
  coordinates: Array<{ lat: number; lon: number }>
): Promise<ElevationData[]> {
  const promises = coordinates.map((coord) =>
    getElevation(coord.lat, coord.lon)
  );
  return Promise.all(promises);
}

/**
 * Check if location is at high elevation (> 1500m)
 */
export function isHighElevation(elevation: number): boolean {
  return elevation > 1500;
}

/**
 * Get elevation category
 */
export function getElevationCategory(elevation: number): string {
  if (elevation < 200) return "Low (Coastal/Plains)";
  if (elevation < 500) return "Low to Moderate";
  if (elevation < 1000) return "Moderate";
  if (elevation < 1500) return "Moderate to High";
  if (elevation < 2500) return "High (Highland)";
  if (elevation < 4000) return "Very High (Mountain)";
  return "Extreme (High Mountain)";
}
