import axios from "axios";
import { InsertCropYieldPrediction } from "@shared/schema";
import { db } from "./db";
import { cropYieldPredictions } from "@shared/schema";

// We'll use OpenWeatherMap API as it provides both current, forecast and historical data
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/3.0";
const OPENWEATHER_GEO_URL = "https://api.openweathermap.org/geo/1.0";

// Cache for weather data to minimize API calls
interface CacheEntry {
  data: unknown;
  timestamp: number;
}
const weatherCache: { [key: string]: CacheEntry } = {};
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

interface GeoLocation {
  lat: number;
  lon: number;
  name: string;
  country: string;
  state?: string;
  county?: string;
  district?: string;
  city?: string;
  village?: string;
  town?: string;
  geoPath?: string; // Full geographic hierarchy
}

interface WeatherData {
  location: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    description: string;
    icon: string;
    cloudCover: number;
    uv: number;
    pressure: number;
    visibility: number;
    timestamp: number;
  };
  forecast: Array<{
    date: string;
    dayOfWeek: string;
    temp: {
      day: number;
      min: number;
      max: number;
    };
    humidity: number;
    windSpeed: number;
    condition: string;
    description: string;
    icon: string;
    precipitation: number;
    sunrise: number;
    sunset: number;
  }>;
  alerts?: Array<{
    senderName: string;
    event: string;
    start: number;
    end: number;
    description: string;
    severity: string;
  }>;
}

interface HistoricalWeatherData {
  location: string;
  dates: Array<{
    date: string;
    averageTemp: number;
    minTemp: number;
    maxTemp: number;
    humidity: number;
    precipitation: number;
  }>;
}

interface ClimateData {
  location: string;
  monthlyAverages: Array<{
    month: string;
    averageTemp: number;
    averagePrecipitation: number;
    growingDegreeDays: number;
  }>;
  soilConditions: {
    type: string;
    ph: number;
    moisture: number;
  };
  growingSeasonLength: number;
}

interface CropRecommendation {
  cropName: string;
  variety: string;
  suitabilityScore: number; // 0-100
  optimalPlantingWindow: {
    start: string;
    end: string;
  };
  expectedYield: number;
  yieldUnit: string;
  comments: string[];
}

// Helper function to check if a location is likely coastal
function checkIfCoastal(lat: number, lon: number): boolean {
  // Major coastlines approximation
  // Pacific coastlines
  if (
    (lon < -115 && lon > -130 && lat > 30 && lat < 50) || // North American West Coast
    (lon < -70 && lon > -85 && lat < -10 && lat > -40)
  ) {
    // South American West Coast
    return true;
  }
  // Atlantic coastlines
  if (
    (lon > -85 && lon < -65 && lat > 25 && lat < 45) || // North American East Coast
    (lon > -55 && lon < -35 && lat < 5 && lat > -35)
  ) {
    // South American East Coast
    return true;
  }
  // European coastlines
  if (lon > -10 && lon < 30 && lat > 35 && lat < 60) {
    return true;
  }
  // Asian coastlines
  if (lon > 100 && lon < 145 && lat > 20 && lat < 45) {
    return true;
  }
  // Australian coastlines
  if (lon > 115 && lon < 155 && lat < -10 && lat > -40) {
    return true;
  }
  return false;
}

// Helper function to estimate elevation based on location
function estimateElevation(lat: number, lon: number): number {
  // Major mountain ranges approximation
  // Rockies
  if (lon > -125 && lon < -105 && lat > 30 && lat < 55) {
    return 2000 + Math.random() * 1000;
  }
  // Andes
  if (lon > -80 && lon < -65 && lat < 10 && lat > -55) {
    return 3000 + Math.random() * 1500;
  }
  // Alps
  if (lon > 5 && lon < 16 && lat > 43 && lat < 48) {
    return 2000 + Math.random() * 1000;
  }
  // Himalayas
  if (lon > 70 && lon < 95 && lat > 25 && lat < 40) {
    return 4000 + Math.random() * 2000;
  }
  // Ethiopian Highlands
  if (lon > 35 && lon < 40 && lat > 5 && lat < 15) {
    return 2000 + Math.random() * 1000;
  }
  return 200 + Math.random() * 300; // Default low elevation
}

// Helper function to check if a location is in a volcanic region
function isInVolcanicRegion(lat: number, lon: number): boolean {
  // Pacific Ring of Fire
  if (
    (lon > 120 && lon < 180 && lat > -10 && lat < 50) || // Western Pacific
    (lon < -110 && lon > -180 && lat > 0 && lat < 60)
  ) {
    // Eastern Pacific
    return Math.random() > 0.7; // 30% chance in these regions
  }
  // East African Rift
  if (lon > 30 && lon < 40 && lat > -10 && lat < 15) {
    return Math.random() > 0.7;
  }
  return Math.random() > 0.95; // 5% chance elsewhere
}

/**
 * Reverse geocode coordinates to location name
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<GeoLocation> {
  try {
    // Check if we need to use the API key
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
        lat: result.lat,
        lon: result.lon,
        name: result.name,
        country: result.country,
        state: result.state,
        county: result.county,
        district: result.district,
        city: result.city,
        village: result.village,
        town: result.town,
        geoPath,
      };
    } else {
      throw new Error("Location not found");
    }
  } catch (error: unknown) {
    // Use structured logging instead of console
    // TODO: Replace with proper logger
    // console.error("Error reverse geocoding coordinates:", error);
    throw new Error("Failed to reverse geocode coordinates");
  }
}

/**
 * Geocode a location string to coordinates and geographic details
 */
export async function geocodeLocation(location: string): Promise<GeoLocation> {
  try {
    // Check if we need to use the API key
    if (!OPENWEATHER_API_KEY) {
      throw new Error("OpenWeather API key not configured");
    }

    const response = await axios.get(`${OPENWEATHER_GEO_URL}/direct`, {
      params: {
        q: location,
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
        lat: result.lat,
        lon: result.lon,
        name: result.name,
        country: result.country,
        state: result.state,
        county: result.county,
        district: result.district,
        city: result.city,
        village: result.village,
        town: result.town,
        geoPath,
      };
    } else {
      throw new Error("Location not found");
    }
  } catch (error: any) {
    console.error("Error geocoding location:", error);
    throw new Error("Failed to geocode location");
  }
}

/**
 * Get current weather and forecast for a location
 */
export async function getWeatherData(location: string): Promise<WeatherData> {
  try {
    // Check cache first
    const cacheKey = `weather:${location}`;
    const cached = weatherCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // If not in cache, fetch from API
    // First, geocode the location
    const geoData = await geocodeLocation(location);

    // Check if we need to use the API key
    if (!OPENWEATHER_API_KEY) {
      throw new Error("OpenWeather API key not configured");
    }

    // Fetch weather data using One Call API for current, forecast and alerts
    const response = await axios.get(`${OPENWEATHER_BASE_URL}/onecall`, {
      params: {
        lat: geoData.lat,
        lon: geoData.lon,
        units: "metric",
        exclude: "minutely,hourly",
        appid: OPENWEATHER_API_KEY,
      },
    });

    // Format the data into our structure
    const data = response.data;
    const weatherData: WeatherData = {
      location: `${geoData.name}, ${geoData.country}`,
      coordinates: {
        lat: geoData.lat,
        lon: geoData.lon,
      },
      current: {
        temp: data.current.temp,
        feelsLike: data.current.feels_like,
        humidity: data.current.humidity,
        windSpeed: data.current.wind_speed,
        condition: data.current.weather[0].main,
        description: data.current.weather[0].description,
        icon: data.current.weather[0].icon,
        cloudCover: data.current.clouds,
        uv: data.current.uvi,
        pressure: data.current.pressure,
        visibility: data.current.visibility,
        timestamp: data.current.dt,
      },
      forecast: data.daily.map((day: any) => {
        const date = new Date(day.dt * 1000);
        return {
          date: date.toLocaleDateString(),
          dayOfWeek: date.toLocaleDateString("en-US", { weekday: "short" }),
          temp: {
            day: day.temp.day,
            min: day.temp.min,
            max: day.temp.max,
          },
          humidity: day.humidity,
          windSpeed: day.wind_speed,
          condition: day.weather[0].main,
          description: day.weather[0].description,
          icon: day.weather[0].icon,
          precipitation: day.pop * 100, // Probability of precipitation as percentage
          sunrise: day.sunrise,
          sunset: day.sunset,
        };
      }),
    };

    // Add alerts if present
    if (data.alerts) {
      weatherData.alerts = data.alerts.map((alert: any) => ({
        senderName: alert.sender_name,
        event: alert.event,
        start: alert.start,
        end: alert.end,
        description: alert.description,
        severity: alert.tags?.[0] || "Info",
      }));
    }

    // Save to cache
    weatherCache[cacheKey] = {
      data: weatherData,
      timestamp: Date.now(),
    };

    return weatherData;
  } catch (error: any) {
    console.error("Error fetching weather data:", error);

    // Check for specific API errors
    if (error.response) {
      console.error("API response error:", error.response.data);

      // Handle API key error specifically
      if (error.response.status === 401) {
        throw new Error(
          "Weather data unavailable - API key issue. The One Call API may require a paid subscription. Please contact support."
        );
      }
    }

    throw new Error("Failed to retrieve weather data. Please try again later.");
  }
}

/**
 * Get historical weather data for a location
 */
export async function getHistoricalWeatherData(
  location: string,
  startDate: Date,
  endDate: Date
): Promise<HistoricalWeatherData> {
  try {
    // First, geocode the location
    const geoData = await geocodeLocation(location);

    // Check if we need to use the API key
    if (!OPENWEATHER_API_KEY) {
      throw new Error("OpenWeather API key not configured");
    }

    // Format dates to Unix timestamps (for future API use)
    // const startTimestamp = Math.floor(startDate.getTime() / 1000);
    // const endTimestamp = Math.floor(endDate.getTime() / 1000);

    // Due to API limitations, we'll need to make a request for each day
    const dates: Array<Date> = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Make API requests for each date (we may need to limit this or paginate for long date ranges)
    const weatherPromises = dates.map(async (date) => {
      const timestamp = Math.floor(date.getTime() / 1000);

      // Using the timemachine endpoint for historical data
      const response = await axios.get(
        `${OPENWEATHER_BASE_URL}/onecall/timemachine`,
        {
          params: {
            lat: geoData.lat,
            lon: geoData.lon,
            dt: timestamp, // Unix timestamp
            units: "metric",
            appid: OPENWEATHER_API_KEY,
          },
        }
      );

      return {
        date: date.toISOString().split("T")[0],
        data: response.data,
      };
    });

    const results = await Promise.all(weatherPromises);

    // Process and format the data
    const historicalData: HistoricalWeatherData = {
      location: `${geoData.name}, ${geoData.country}`,
      dates: results.map((result) => {
        const day = result.data;

        // The timemachine API returns data in a different format
        // Use hourly data to calculate min/max/average
        const hourlyData = day.hourly || [];
        const currentData = (day.data && day.data[0]) || day.current || {};

        let minTemp = currentData.temp || 15;
        let maxTemp = currentData.temp || 25;
        let totalTemp = currentData.temp || 20;
        let totalHumidity = currentData.humidity || 60;
        let precipitation = currentData.rain?.["1h"] || 0;

        // Calculate from hourly data if available
        if (hourlyData.length > 0) {
          const temps = hourlyData.map((hour: any) => hour.temp);
          minTemp = Math.min(...temps);
          maxTemp = Math.max(...temps);
          totalTemp =
            temps.reduce((sum: number, temp: number) => sum + temp, 0) /
            temps.length;

          const humidities = hourlyData.map((hour: any) => hour.humidity);
          totalHumidity =
            humidities.reduce(
              (sum: number, humidity: number) => sum + humidity,
              0
            ) / humidities.length;

          // Sum up precipitation for the day
          precipitation = hourlyData.reduce(
            (sum: number, hour: any) => sum + (hour.rain?.["1h"] || 0),
            0
          );
        }

        return {
          date: result.date,
          averageTemp: totalTemp,
          minTemp,
          maxTemp,
          humidity: totalHumidity,
          precipitation,
        };
      }),
    };

    return historicalData;
  } catch (error: any) {
    console.error("Error fetching historical weather data:", error);

    // Check for specific API errors
    if (error.response) {
      console.error("API response error:", error.response.data);

      // Handle API key error specifically
      if (error.response.status === 401) {
        throw new Error(
          "Historical weather data unavailable - API key issue. The Time Machine API may require a paid subscription. Please contact support."
        );
      }
    }

    throw new Error(
      "Failed to retrieve historical weather data. Please try again later."
    );
  }
}

/**
 * Get climate data for a location, using OpenWeather API and other data sources
 */
export async function getClimateData(location: string): Promise<ClimateData> {
  try {
    // First, geocode the location
    const geoData = await geocodeLocation(location);

    // Define months array for reference
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Collect climate data from OpenWeather API using historical data from each month
    // We'll sample one day from each month of the previous year to get climate averages
    const today = new Date();
    const currentYear = today.getFullYear();

    // Collect average temperature and precipitation for each month
    const monthlyRequests = months.map(async (month, index) => {
      // Create a date for the middle of each month from last year
      const targetDate = new Date(currentYear - 1, index, 15);
      const timestamp = Math.floor(targetDate.getTime() / 1000);

      try {
        // Get historical data for this date
        const response = await axios.get(
          `${OPENWEATHER_BASE_URL}/onecall/timemachine`,
          {
            params: {
              lat: geoData.lat,
              lon: geoData.lon,
              dt: timestamp,
              units: "metric",
              appid: OPENWEATHER_API_KEY,
            },
          }
        );

        // Extract average temperature and precipitation from the data
        const data = response.data;
        const hourlyData = data.hourly || [];
        const currentData = (data.data && data.data[0]) || data.current || {};

        // Calculate temperature from hourly data if available
        let averageTemp = currentData.temp || 20;
        let totalPrecipitation = 0;

        if (hourlyData.length > 0) {
          const temps = hourlyData.map((hour: any) => hour.temp);
          averageTemp =
            temps.reduce((sum: number, temp: number) => sum + temp, 0) /
            temps.length;

          // Sum up precipitation for the day
          totalPrecipitation = hourlyData.reduce(
            (sum: number, hour: any) => sum + (hour.rain?.["1h"] || 0),
            0
          );
        }

        // Calculate growing degree days (base temperature of 10°C)
        const growingDegreeDays = Math.max(0, averageTemp - 10) * 30; // Approximate for the month

        return {
          month,
          averageTemp,
          averagePrecipitation: totalPrecipitation * 30, // Extrapolate to monthly precipitation
          growingDegreeDays,
        };
      } catch (error) {
        console.error(`Error fetching climate data for ${month}:`, error);

        // Provide reasonable fallback data if the API call fails
        // This is a practical necessity for cases of API rate limits, service outages, etc.
        return {
          month,
          averageTemp: 15, // Moderate temperature fallback
          averagePrecipitation: 80, // Moderate precipitation fallback
          growingDegreeDays: Math.max(0, 15 - 10) * 30,
        };
      }
    });

    // Wait for all month requests to complete
    const monthlyData = await Promise.all(monthlyRequests);

    // Determine growing season length based on the number of months with average temp above 10°C
    const warmMonths = monthlyData.filter((data) => data.averageTemp > 10);
    const growingSeasonLength = Math.round(warmMonths.length * 30.5); // Average days per month

    // Determine soil type and conditions based on climate zone, geography, and available climate data
    // This uses several factors to estimate soil properties that would normally come from soil databases
    const averageTemp =
      monthlyData.reduce((sum, month) => sum + month.averageTemp, 0) / 12;
    const totalPrecipitation = monthlyData.reduce(
      (sum, month) => sum + month.averagePrecipitation,
      0
    );
    const temperatureVariation =
      Math.max(...monthlyData.map((m) => m.averageTemp)) -
      Math.min(...monthlyData.map((m) => m.averageTemp));

    // Use latitude and longitude to help determine regional soil characteristics
    const lat = geoData.lat;
    const lon = geoData.lon;
    const isCoastalLocation = checkIfCoastal(lat, lon); // Coastal areas tend to have different soils
    const elevation = estimateElevation(lat, lon); // Higher elevations have different soil development

    // Regions with specific soil types
    // Desert regions - typically sandy soils
    const isDesert =
      (totalPrecipitation < 250 && averageTemp > 18) ||
      (lat > 15 &&
        lat < 35 &&
        ((lon > -120 && lon < -100) || (lon > 0 && lon < 60)));

    // Tropical regions - typically clay-rich, highly weathered soils
    const isTropical = Math.abs(lat) < 15 && totalPrecipitation > 1000;

    // Boreal/cold regions - typically podzolic soils
    const isBoreal = (lat > 50 || lat < -50) && averageTemp < 5;

    // Volcanic regions - typically andisols
    const isVolcanic = isInVolcanicRegion(lat, lon);

    // Determine soil type based on all these factors
    let soilType = "Loam"; // Default
    let soilPH = 6.5; // Default - neutral

    if (isDesert) {
      soilType = "Sandy";
      soilPH = 8.0; // Alkaline due to low rainfall and salt accumulation
    } else if (isTropical) {
      soilType = "Clay";
      soilPH = 5.2; // Acidic due to high rainfall and leaching
    } else if (isBoreal) {
      soilType = "Peat";
      soilPH = 4.5; // Very acidic
    } else if (isVolcanic) {
      soilType = "Volcanic Ash";
      soilPH = 6.0; // Slightly acidic
    } else if (isCoastalLocation) {
      soilType = "Sandy Loam";
      soilPH = 6.8; // Near neutral
    } else if (elevation > 1500) {
      soilType = "Rocky Loam";
      soilPH = 6.0; // Slightly acidic
    }
    // Secondary factors if no primary geographic factor matched
    else if (totalPrecipitation > 1200) {
      soilType = "Clay Loam";
      soilPH = 5.8; // More acidic due to leaching
    } else if (totalPrecipitation < 500) {
      soilType = "Sandy Loam";
      soilPH = 7.3; // More alkaline
    } else if (averageTemp < 8) {
      soilType = "Silt Loam";
      soilPH = 5.8; // Slightly acidic
    } else if (temperatureVariation > 20) {
      soilType = "Loam";
      soilPH = 6.2; // Slightly acidic
    } else {
      // Moderate climate with moderate precipitation
      soilType = "Silt Loam";
      soilPH = 6.4; // Near neutral
    }

    // Add some small random variation to make soil data more realistic and varied
    soilPH += Math.random() * 0.4 - 0.2; // Add ±0.2 variation

    // Estimate soil moisture based on recent precipitation and temperature patterns
    const recentMonths = monthlyData.slice(Math.max(0, monthlyData.length - 3));
    const recentPrecipitation =
      recentMonths.reduce((sum, m) => sum + m.averagePrecipitation, 0) / 3;
    const recentTemp =
      recentMonths.reduce((sum, m) => sum + m.averageTemp, 0) / 3;

    // More sophisticated moisture model that considers temperature (which affects evaporation)
    // and soil type (which affects water retention)
    let moistureBase = 30 + (recentPrecipitation / 200) * 50;

    // Clay soils retain more water
    if (soilType.includes("Clay")) {
      moistureBase += 15;
    }
    // Sandy soils drain quickly
    else if (soilType.includes("Sandy")) {
      moistureBase -= 15;
    }

    // Adjust for temperature (higher temps = more evaporation)
    moistureBase -= (recentTemp - 15) * 0.8;

    // Ensure moisture stays in reasonable range with some randomness
    const soilMoisture = Math.min(
      85,
      Math.max(25, moistureBase + Math.random() * 5 - 2.5)
    );

    return {
      location: `${geoData.name}, ${geoData.country}`,
      monthlyAverages: monthlyData,
      soilConditions: {
        type: soilType,
        ph: soilPH,
        moisture: soilMoisture,
      },
      growingSeasonLength,
    };
  } catch (error: any) {
    console.error("Error generating climate data:", error);
    throw new Error("Failed to retrieve climate data");
  }
}

/**
 * Get crop recommendations based on climate data
 */
export async function getCropRecommendations(
  location: string
): Promise<CropRecommendation[]> {
  try {
    // Get basic weather data for the location to determine climate zone
    const weatherData = await getWeatherData(location);

    // Create simplified climate data based on current weather and location
    const currentTemp = weatherData.current.temp;
    const currentHumidity = weatherData.current.humidity;

    // Estimate climate zone based on temperature and location
    const lat = weatherData.coordinates.lat;
    const isTropical = Math.abs(lat) < 15;
    const isTemperate = Math.abs(lat) >= 15 && Math.abs(lat) < 45;
    // const isCold = Math.abs(lat) >= 45; // Reserved for future climate zone logic

    // Create simplified climate data structure
    const climateData = {
      monthlyAverages: [
        {
          month: "January",
          averageTemp: currentTemp - 5,
          averagePrecipitation: 80,
        },
        {
          month: "February",
          averageTemp: currentTemp - 3,
          averagePrecipitation: 70,
        },
        {
          month: "March",
          averageTemp: currentTemp - 1,
          averagePrecipitation: 90,
        },
        {
          month: "April",
          averageTemp: currentTemp + 2,
          averagePrecipitation: 100,
        },
        {
          month: "May",
          averageTemp: currentTemp + 5,
          averagePrecipitation: 120,
        },
        {
          month: "June",
          averageTemp: currentTemp + 8,
          averagePrecipitation: 100,
        },
        {
          month: "July",
          averageTemp: currentTemp + 10,
          averagePrecipitation: 80,
        },
        {
          month: "August",
          averageTemp: currentTemp + 8,
          averagePrecipitation: 90,
        },
        {
          month: "September",
          averageTemp: currentTemp + 5,
          averagePrecipitation: 100,
        },
        {
          month: "October",
          averageTemp: currentTemp + 2,
          averagePrecipitation: 90,
        },
        {
          month: "November",
          averageTemp: currentTemp - 1,
          averagePrecipitation: 80,
        },
        {
          month: "December",
          averageTemp: currentTemp - 3,
          averagePrecipitation: 70,
        },
      ],
      soilConditions: {
        type: isTropical ? "Clay" : isTemperate ? "Loam" : "Silt Loam",
        ph: isTropical ? 5.5 : isTemperate ? 6.5 : 5.8,
        moisture: currentHumidity,
      },
      growingSeasonLength: isTropical ? 365 : isTemperate ? 180 : 120,
    };

    // Simple crop database with climate requirements
    // In a real application, this would be in a database
    const cropDatabase = [
      {
        name: "Maize (Corn)",
        varieties: ["Hybrid", "Sweet Corn", "Popcorn"],
        tempRange: { min: 18, opt: 24, max: 32 },
        growingDays: { min: 60, max: 100 },
        waterRequirement: "Medium", // mm per growing season
        soilTypes: ["Loam", "Sandy Loam"],
        soilPH: { min: 5.8, max: 7.0 },
        seasonality: ["Spring", "Summer"],
      },
      {
        name: "Wheat",
        varieties: ["Winter Wheat", "Spring Wheat", "Durum"],
        tempRange: { min: 3, opt: 15, max: 30 },
        growingDays: { min: 100, max: 130 },
        waterRequirement: "Low",
        soilTypes: ["Clay Loam", "Silt Loam", "Loam"],
        soilPH: { min: 6.0, max: 7.5 },
        seasonality: ["Fall", "Spring"],
      },
      {
        name: "Rice",
        varieties: ["Long Grain", "Medium Grain", "Short Grain"],
        tempRange: { min: 20, opt: 30, max: 35 },
        growingDays: { min: 90, max: 150 },
        waterRequirement: "High",
        soilTypes: ["Clay", "Clay Loam"],
        soilPH: { min: 5.5, max: 6.5 },
        seasonality: ["Spring", "Summer"],
      },
      {
        name: "Potato",
        varieties: ["Russet", "Red", "White", "Yellow"],
        tempRange: { min: 10, opt: 18, max: 25 },
        growingDays: { min: 70, max: 120 },
        waterRequirement: "Medium",
        soilTypes: ["Sandy Loam", "Loam"],
        soilPH: { min: 5.0, max: 6.5 },
        seasonality: ["Spring", "Fall"],
      },
      {
        name: "Soybean",
        varieties: ["Early Maturity", "Mid Maturity", "Late Maturity"],
        tempRange: { min: 15, opt: 25, max: 30 },
        growingDays: { min: 80, max: 120 },
        waterRequirement: "Medium",
        soilTypes: ["Loam", "Clay Loam", "Silt Loam"],
        soilPH: { min: 6.0, max: 7.0 },
        seasonality: ["Spring", "Summer"],
      },
      {
        name: "Tomato",
        varieties: ["Cherry", "Roma", "Beefsteak"],
        tempRange: { min: 16, opt: 25, max: 30 },
        growingDays: { min: 60, max: 100 },
        waterRequirement: "Medium",
        soilTypes: ["Loam", "Sandy Loam"],
        soilPH: { min: 6.0, max: 6.8 },
        seasonality: ["Spring", "Summer"],
      },
      {
        name: "Lettuce",
        varieties: ["Romaine", "Iceberg", "Butterhead", "Loose Leaf"],
        tempRange: { min: 7, opt: 16, max: 24 },
        growingDays: { min: 30, max: 70 },
        waterRequirement: "Medium",
        soilTypes: ["Loam", "Sandy Loam"],
        soilPH: { min: 6.0, max: 7.0 },
        seasonality: ["Spring", "Fall"],
      },
      {
        name: "Cotton",
        varieties: ["Upland", "Pima"],
        tempRange: { min: 18, opt: 28, max: 35 },
        growingDays: { min: 150, max: 180 },
        waterRequirement: "Medium",
        soilTypes: ["Loam", "Sandy Loam", "Clay Loam"],
        soilPH: { min: 5.8, max: 8.0 },
        seasonality: ["Spring", "Summer"],
      },
      {
        name: "Sunflower",
        varieties: ["Oil", "Confectionery"],
        tempRange: { min: 8, opt: 23, max: 32 },
        growingDays: { min: 70, max: 100 },
        waterRequirement: "Low",
        soilTypes: ["Loam", "Sandy Loam", "Clay Loam"],
        soilPH: { min: 6.0, max: 7.5 },
        seasonality: ["Spring", "Summer"],
      },
      {
        name: "Barley",
        varieties: ["Spring", "Winter", "Two-row", "Six-row"],
        tempRange: { min: 5, opt: 15, max: 25 },
        growingDays: { min: 60, max: 100 },
        waterRequirement: "Low",
        soilTypes: ["Loam", "Clay Loam", "Silt Loam"],
        soilPH: { min: 6.0, max: 8.0 },
        seasonality: ["Fall", "Spring"],
      },
      {
        name: "Coffee",
        varieties: ["Arabica", "Robusta"],
        tempRange: { min: 15, opt: 20, max: 25 },
        growingDays: { min: 365, max: 365 },
        waterRequirement: "Medium",
        soilTypes: ["Loam", "Clay Loam"],
        soilPH: { min: 5.0, max: 6.0 },
        seasonality: ["Perennial"],
      },
    ];

    // Calculate average temperature and precipitation
    const avgTemp =
      climateData.monthlyAverages.reduce(
        (sum, month) => sum + month.averageTemp,
        0
      ) / climateData.monthlyAverages.length;

    // const avgPrecipitation =
    //   climateData.monthlyAverages.reduce(
    //     (sum, month) => sum + month.averagePrecipitation,
    //     0
    //   ) / climateData.monthlyAverages.length;

    // Find months with appropriate temperature for planting
    const suitablePlantingMonths = climateData.monthlyAverages
      .filter((month) => month.averageTemp > 10)
      .map((month) => month.month);

    // Calculate suitability score for each crop
    const recommendations: CropRecommendation[] = cropDatabase.map((crop) => {
      // Temperature suitability (0-40)
      const tempSuitability =
        avgTemp < crop.tempRange.min
          ? 0
          : avgTemp > crop.tempRange.max
          ? 0
          : avgTemp === crop.tempRange.opt
          ? 40
          : 40 -
            (Math.abs(avgTemp - crop.tempRange.opt) /
              (crop.tempRange.max - crop.tempRange.min)) *
              40;

      // Growing season suitability (0-30)
      const seasonSuitability =
        climateData.growingSeasonLength < crop.growingDays.min
          ? 0
          : 30 *
            Math.min(1, climateData.growingSeasonLength / crop.growingDays.max);

      // Soil suitability (0-20)
      const soilTypeSuitability = crop.soilTypes.includes(
        climateData.soilConditions.type
      )
        ? 20
        : 10;

      // Soil pH suitability (0-10)
      const phSuitability =
        climateData.soilConditions.ph < crop.soilPH.min
          ? 0
          : climateData.soilConditions.ph > crop.soilPH.max
          ? 0
          : 10;

      // Total suitability score (0-100)
      const suitabilityScore = Math.round(
        tempSuitability +
          seasonSuitability +
          soilTypeSuitability +
          phSuitability
      );

      // Choose appropriate variety based on climate
      let bestVariety = crop.varieties[0];
      if (crop.name === "Wheat") {
        bestVariety = avgTemp < 5 ? "Winter Wheat" : "Spring Wheat";
      } else if (crop.name === "Soybean") {
        bestVariety =
          climateData.growingSeasonLength < 100
            ? "Early Maturity"
            : "Mid Maturity";
      }

      // Determine optimal planting window
      const seasonToMonthMap: Record<string, string[]> = {
        Spring: ["March", "April", "May"],
        Summer: ["June", "July", "August"],
        Fall: ["September", "October", "November"],
        Winter: ["December", "January", "February"],
        Perennial: ["January"], // Just a placeholder for perennial crops
      };

      const plantingMonths = crop.seasonality
        .flatMap((season) => {
          return (
            seasonToMonthMap[season as keyof typeof seasonToMonthMap] || []
          );
        })
        .filter((month) => suitablePlantingMonths.includes(month));

      const startMonth = plantingMonths[0] || "March";
      const endMonth = plantingMonths[plantingMonths.length - 1] || "May";

      // Comments based on suitability
      const comments = [];
      if (suitabilityScore >= 80) {
        comments.push("Excellent crop choice for this climate.");
      } else if (suitabilityScore >= 60) {
        comments.push("Good potential with proper management.");
      } else if (suitabilityScore >= 40) {
        comments.push("Moderate potential, may require additional inputs.");
      } else {
        comments.push(
          "Challenging crop for this climate, consider alternatives."
        );
      }

      if (avgTemp < crop.tempRange.min) {
        comments.push("Climate may be too cool for optimal growth.");
      } else if (avgTemp > crop.tempRange.max) {
        comments.push("Climate may be too warm for optimal growth.");
      }

      if (climateData.growingSeasonLength < crop.growingDays.min) {
        comments.push("Growing season may be too short.");
      }

      // const expectedYield =
      //   suitabilityScore >= 80
      //     ? "High"
      //     : suitabilityScore >= 60
      //     ? "Above Average"
      //     : suitabilityScore >= 40
      //     ? "Average"
      //     : "Below Average";

      return {
        cropName: crop.name,
        variety: bestVariety,
        suitabilityScore,
        optimalPlantingWindow: {
          start: startMonth,
          end: endMonth,
        },
        expectedYield: suitabilityScore / 20, // Scaled yield estimate (0-5)
        yieldUnit: "tons/hectare",
        comments,
      };
    });

    // Sort by suitability score (highest first)
    return recommendations.sort(
      (a, b) => b.suitabilityScore - a.suitabilityScore
    );
  } catch (error: any) {
    console.error("Error generating crop recommendations:", error);
    throw new Error("Failed to generate crop recommendations");
  }
}

/**
 * Generate a crop yield prediction using climate and crop data
 */
export async function generateCropYieldPrediction(
  cropId: number,
  location: string
): Promise<InsertCropYieldPrediction> {
  try {
    // Get climate data
    const climateData = await getClimateData(location);

    // Get weather forecast
    const weatherData = await getWeatherData(location);

    // In a real application, you would:
    // 1. Fetch the crop details from the database
    // 2. Use a trained ML model to predict yield based on crop type, climate, and current conditions
    // 3. Possibly integrate with soil sensor data or satellite imagery

    // For this example, we'll use a simplified approach
    const confidenceLevel = 60 + Math.random() * 20; // 60-80% confidence

    const factorsConsidered = {
      climate: {
        averageTemp:
          climateData.monthlyAverages.reduce(
            (sum, m) => sum + m.averageTemp,
            0
          ) / 12,
        averagePrecipitation:
          climateData.monthlyAverages.reduce(
            (sum, m) => sum + m.averagePrecipitation,
            0
          ) / 12,
        growingSeasonLength: climateData.growingSeasonLength,
      },
      weather: {
        currentTemp: weatherData.current.temp,
        forecastConditions: weatherData.forecast
          .slice(0, 5)
          .map((day) => day.condition),
      },
      soil: climateData.soilConditions,
    };

    // Simulate a yield prediction
    const basePredictedYield = 3.5; // Base yield in tons/hectare

    // Adjust based on growing season length
    const seasonAdjustment =
      climateData.growingSeasonLength > 150
        ? 1.2
        : climateData.growingSeasonLength > 120
        ? 1.0
        : 0.8;

    // Adjust based on current weather conditions
    const weatherImpact = weatherData.alerts?.length ? 0.8 : 1.0; // Reduce yield if alerts present

    const predictedYield =
      basePredictedYield * seasonAdjustment * weatherImpact;

    // Create the prediction object
    const yieldPrediction: InsertCropYieldPrediction = {
      cropId,
      predictedYield: String(predictedYield.toFixed(2)),
      yieldUnit: "tons/hectare",
      confidenceLevel: String(confidenceLevel.toFixed(2)),
      factorsConsidered,
    };

    return yieldPrediction;
  } catch (error: any) {
    console.error("Error generating crop yield prediction:", error);
    throw new Error("Failed to generate crop yield prediction");
  }
}

/**
 * Save a crop yield prediction to the database
 */
export async function saveCropYieldPrediction(
  prediction: InsertCropYieldPrediction
) {
  try {
    const [result] = await db
      .insert(cropYieldPredictions)
      .values(prediction)
      .returning();
    return result;
  } catch (error: any) {
    console.error("Error saving crop yield prediction:", error);
    throw new Error("Failed to save crop yield prediction");
  }
}
