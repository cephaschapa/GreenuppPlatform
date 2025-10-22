import axios from "axios";

/**
 * Soil Data Service using SoilGrids API (ISRIC)
 * API: https://rest.isric.org/soilgrids/v2.0/docs
 * - Free, no API key required
 * - Global coverage at 250m resolution
 * - Provides: texture, pH, organic carbon, bulk density, etc.
 */

const SOILGRIDS_API_URL =
  "https://rest.isric.org/soilgrids/v2.0/properties/query";

interface SoilData {
  soilType: string; // Texture classification (Sandy, Clay, Loam, etc.)
  ph: number; // pH value (0-14)
  organicCarbon: number; // g/kg
  bulkDensity: number; // cg/cm³
  claycontent: number; // Percentage
  sandcontent: number; // Percentage
  siltcontent: number; // Percentage
  moisture: number; // Estimated moisture based on texture and climate
  nutrientAvailability: string; // Low, Medium, High
  latitude: number;
  longitude: number;
  depth: string; // Depth layer (0-5cm, 5-15cm, etc.)
}

// Cache to minimize API calls
interface CacheEntry {
  data: SoilData;
  timestamp: number;
}

const soilCache: Map<string, CacheEntry> = new Map();
const CACHE_DURATION = 1000 * 60 * 60 * 24 * 30; // 30 days (soil data is relatively stable)

/**
 * Get real soil data for coordinates from SoilGrids API
 */
export async function getSoilData(
  lat: number,
  lon: number,
  depthLayer: string = "0-5cm" // Top soil layer by default
): Promise<SoilData> {
  // Round coordinates to 3 decimal places for cache key (~111m precision)
  const roundedLat = Math.round(lat * 1000) / 1000;
  const roundedLon = Math.round(lon * 1000) / 1000;
  const cacheKey = `${roundedLat},${roundedLon},${depthLayer}`;

  // Check cache first
  const cached = soilCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // Request multiple soil properties in one call
    const response = await axios.get(SOILGRIDS_API_URL, {
      params: {
        lat: roundedLat,
        lon: roundedLon,
        property: [
          "phh2o", // pH in H2O
          "clay", // Clay content
          "sand", // Sand content
          "silt", // Silt content
          "soc", // Soil organic carbon
          "bdod", // Bulk density
        ],
        depth: depthLayer,
        value: "mean", // Get mean value
      },
      timeout: 10000, // 10 second timeout
    });

    if (response.data && response.data.properties) {
      const props = response.data.properties;

      // Extract values from SoilGrids response
      // Values need to be converted based on SoilGrids units
      const phValue =
        props.phh2o?.mapped_units === "pH*10"
          ? (props.phh2o.layers[0]?.range?.mean || 65) / 10
          : props.phh2o?.layers[0]?.range?.mean || 6.5;

      const clayContent = props.clay?.layers[0]?.range?.mean / 10 || 20; // g/kg to %
      const sandContent = props.sand?.layers[0]?.range?.mean / 10 || 40; // g/kg to %
      const siltContent = props.silt?.layers[0]?.range?.mean / 10 || 40; // g/kg to %
      const organicCarbon = props.soc?.layers[0]?.range?.mean / 10 || 15; // dg/kg to g/kg
      const bulkDensity = props.bdod?.layers[0]?.range?.mean / 100 || 1.4; // cg/cm³

      // Determine soil texture based on clay/sand/silt percentages
      const soilType = determineSoilTexture(
        clayContent,
        sandContent,
        siltContent
      );

      // Estimate moisture based on texture and organic matter
      const moisture = estimateSoilMoisture(
        clayContent,
        sandContent,
        organicCarbon
      );

      // Determine nutrient availability based on pH and organic carbon
      const nutrientAvailability = determineNutrientAvailability(
        phValue,
        organicCarbon
      );

      const soilData: SoilData = {
        soilType,
        ph: phValue,
        organicCarbon,
        bulkDensity,
        claycontent: clayContent,
        sandcontent: sandContent,
        siltcontent: siltContent,
        moisture,
        nutrientAvailability,
        latitude: roundedLat,
        longitude: roundedLon,
        depth: depthLayer,
      };

      // Save to cache
      soilCache.set(cacheKey, {
        data: soilData,
        timestamp: Date.now(),
      });

      return soilData;
    } else {
      throw new Error("Invalid response from SoilGrids API");
    }
  } catch (error: any) {
    console.error("Error fetching soil data:", error.message);

    // Fallback: estimate based on climate/geography (legacy method)
    return estimateSoilDataFallback(lat, lon);
  }
}

/**
 * Determine soil texture classification using USDA soil texture triangle
 */
function determineSoilTexture(
  clay: number,
  sand: number,
  silt: number
): string {
  // USDA Soil Texture Classification
  if (clay >= 40) {
    if (sand <= 45 && silt < 40) return "Clay";
    if (sand <= 20) return "Silty Clay";
    return "Sandy Clay";
  }

  if (clay >= 27 && clay < 40) {
    if (sand <= 20) return "Silty Clay Loam";
    if (sand > 45) return "Sandy Clay Loam";
    return "Clay Loam";
  }

  if (clay < 27 && sand <= 52) {
    if (silt >= 50 && clay >= 12 && clay < 27) return "Silt Loam";
    if (silt >= 80) return "Silt";
    if (silt >= 50) return "Silt Loam";
    return "Loam";
  }

  if (sand > 52) {
    if (clay < 7 && silt < 50) return "Loamy Sand";
    if (clay < 20 && sand > 52 && silt < 50) return "Sandy Loam";
    if (sand >= 85) return "Sand";
  }

  return "Loam"; // Default
}

/**
 * Estimate soil moisture based on texture and organic matter
 */
function estimateSoilMoisture(
  clay: number,
  sand: number,
  organicCarbon: number
): number {
  // Clay retains more water
  let moisture = 30 + (clay / 100) * 30;

  // Sand drains quickly
  moisture -= (sand / 100) * 15;

  // Organic matter improves water retention
  moisture += Math.min(organicCarbon / 2, 10);

  // Ensure reasonable range
  return Math.max(20, Math.min(85, moisture));
}

/**
 * Determine nutrient availability based on pH and organic carbon
 */
function determineNutrientAvailability(
  ph: number,
  organicCarbon: number
): string {
  // Optimal pH range (6.0-7.0) with good organic matter = High
  if (ph >= 6.0 && ph <= 7.0 && organicCarbon > 20) return "High";

  // Moderate pH with some organic matter = Medium
  if (ph >= 5.5 && ph <= 7.5 && organicCarbon > 10) return "Medium";

  // Poor pH or low organic matter = Low
  return "Low";
}

/**
 * Fallback soil estimation (used when API fails)
 */
function estimateSoilDataFallback(lat: number, lon: number): SoilData {
  // Simple estimation based on climate zones
  const isTropical = Math.abs(lat) < 15;
  const isArid = (lat > 15 && lat < 35) || (lat < -15 && lat > -35);

  let soilType = "Loam";
  let ph = 6.5;
  let clayContent = 20;
  let sandContent = 40;
  let siltContent = 40;

  if (isTropical) {
    soilType = "Clay";
    ph = 5.2;
    clayContent = 45;
    sandContent = 20;
    siltContent = 35;
  } else if (isArid) {
    soilType = "Sandy Loam";
    ph = 7.5;
    clayContent = 15;
    sandContent = 60;
    siltContent = 25;
  }

  return {
    soilType,
    ph,
    organicCarbon: 15,
    bulkDensity: 1.4,
    claycontent: clayContent,
    sandcontent: sandContent,
    siltcontent: siltContent,
    moisture: 50,
    nutrientAvailability: "Medium",
    latitude: lat,
    longitude: lon,
    depth: "0-5cm",
  };
}

/**
 * Get soil quality score (0-100)
 */
export function getSoilQualityScore(soilData: SoilData): number {
  let score = 50; // Base score

  // pH optimization (6.0-7.0 is ideal)
  if (soilData.ph >= 6.0 && soilData.ph <= 7.0) {
    score += 20;
  } else if (soilData.ph >= 5.5 && soilData.ph <= 7.5) {
    score += 10;
  } else {
    score -= 10;
  }

  // Organic carbon (higher is better, up to a point)
  if (soilData.organicCarbon > 30) {
    score += 20;
  } else if (soilData.organicCarbon > 15) {
    score += 10;
  }

  // Texture balance (loam family is best)
  if (soilData.soilType.includes("Loam")) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}
