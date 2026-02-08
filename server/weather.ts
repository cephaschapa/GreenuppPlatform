import axios from "axios";
import {
  InsertCropYieldPrediction,
  cropVarieties,
  CropVariety,
} from "@shared/schema";
import { db } from "./db";
import { cropYieldPredictions } from "@shared/schema";
import { getElevation } from "./services/elevationService";
import { getSoilData } from "./services/soilDataService";
import { eq } from "drizzle-orm";

// Primary: Tomorrow.io (accuracy). Fallback: OpenWeatherMap
const TOMORROW_IO_API_KEY = process.env.TOMORROW_IO_API_KEY;
const TOMORROW_IO_BASE_URL = "https://api.tomorrow.io/v4/weather";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/3.0";
const OPENWEATHER_BASE_URL_FREE = "https://api.openweathermap.org/data/2.5"; // Free tier API
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
    sunrise?: number;
    sunset?: number;
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
// Using distance-based approach instead of hardcoded ranges
function checkIfCoastal(lat: number, lon: number, elevation: number): boolean {
  // If elevation is very low (<50m) and not in known inland areas, likely coastal
  if (elevation < 50) {
    // Exclude known low-lying inland areas (approximate)
    // Amazon Basin
    if (lon > -80 && lon < -45 && lat > -10 && lat < 5) return false;
    // Congo Basin
    if (lon > 10 && lon < 30 && lat > -5 && lat < 5) return false;
    // Ganges Plain
    if (lon > 75 && lon < 90 && lat > 20 && lat < 30) return false;

    return true;
  }
  return false;
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

/** Map Tomorrow.io weatherCode (WMO) to our condition string */
function tomorrowWeatherCodeToCondition(code: number): string {
  const map: Record<number, string> = {
    0: "Unknown",
    1000: "Clear",
    1001: "Cloudy",
    1100: "Mostly Clear",
    1101: "Partly Cloudy",
    1102: "Mostly Cloudy",
    2000: "Fog",
    2100: "Light Fog",
    4000: "Drizzle",
    4001: "Rain",
    4200: "Light Rain",
    4201: "Heavy Rain",
    5000: "Snow",
    5001: "Flurries",
    5100: "Light Snow",
    5101: "Heavy Snow",
    6000: "Freezing Drizzle",
    6001: "Freezing Rain",
    6200: "Light Freezing Rain",
    6201: "Heavy Freezing Rain",
    7000: "Ice Pellets",
    7101: "Heavy Ice Pellets",
    8000: "Thunderstorm",
  };
  return map[code] ?? "Partly Cloudy";
}

/**
 * Fetch current conditions from Tomorrow.io realtime (so "current" is actually current, not a daily bucket).
 */
async function getTomorrowRealtime(lat: number, lon: number): Promise<{
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  weatherCode: number;
  cloudCover?: number;
  uv?: number;
  pressure?: number;
  visibility?: number;
} | null> {
  if (!TOMORROW_IO_API_KEY) return null;
  const locationParam = `${lat},${lon}`;
  try {
    const response = await axios.get(`${TOMORROW_IO_BASE_URL}/realtime`, {
      params: {
        location: locationParam,
        apikey: TOMORROW_IO_API_KEY,
        units: "metric",
      },
      timeout: 10000,
    });
    const data = response.data?.data ?? response.data;
    const v = data?.values ?? data;
    if (!v || typeof v.temperature !== "number") return null;
    return {
      temp: v.temperature,
      feelsLike: v.temperatureApparent ?? v.temperature,
      humidity: v.humidity ?? 60,
      windSpeed: v.windSpeed ?? 0,
      condition: tomorrowWeatherCodeToCondition(v.weatherCode ?? 1101),
      weatherCode: v.weatherCode ?? 1101,
      cloudCover: v.cloudCover,
      uv: v.uvIndex ?? v.uv,
      pressure: v.pressureSurfaceLevel,
      visibility: v.visibility != null ? v.visibility * 1000 : undefined,
    };
  } catch (_) {
    return null;
  }
}

/**
 * Fetch weather from Tomorrow.io (primary – better accuracy).
 * Uses realtime for current conditions and forecast for daily; throws on failure so caller can fall back to OpenWeather.
 */
async function getWeatherDataTomorrow(geoData: GeoLocation): Promise<WeatherData> {
  if (!TOMORROW_IO_API_KEY) throw new Error("Tomorrow.io API key not configured");
  const locationParam = `${geoData.lat},${geoData.lon}`;
  const locationName = `${geoData.name}, ${geoData.country}`;

  // 1) Get real current conditions from realtime endpoint (not first daily bucket)
  const realtime = await getTomorrowRealtime(geoData.lat, geoData.lon);

  // 2) Get daily forecast
  const forecastResponse = await axios.get(`${TOMORROW_IO_BASE_URL}/forecast`, {
    params: {
      location: locationParam,
      apikey: TOMORROW_IO_API_KEY,
      units: "metric",
      timesteps: "1d",
    },
    timeout: 15000,
  });

  const data = forecastResponse.data?.data ?? forecastResponse.data;

  // v4 can return timelines.daily, timelines[0].intervals, or data.daily
  let daily: Array<{ time: string; startTime?: string; values: Record<string, number> }> = [];
  if (data?.timelines?.daily) {
    daily = data.timelines.daily;
  } else if (Array.isArray(data?.timelines) && data.timelines[0]?.intervals) {
    daily = data.timelines[0].intervals.map((i: any) => ({
      time: i.startTime ?? i.time,
      startTime: i.startTime,
      values: i.values ?? i,
    }));
  } else if (Array.isArray(data?.daily)) {
    daily = data.daily.map((d: any) => ({ time: d.time, values: d.values ?? d }));
  }
  if (daily.length === 0) throw new Error("Tomorrow.io: no daily forecast");

  const first = daily[0];
  const v = first.values || (first as any);

  // Prefer realtime for "current"; otherwise use first day's values
  const current = realtime
    ? {
        temp: realtime.temp,
        feelsLike: realtime.feelsLike,
        humidity: realtime.humidity,
        windSpeed: realtime.windSpeed,
        condition: realtime.condition,
        description: realtime.condition,
        icon: "",
        cloudCover: realtime.cloudCover ?? 0,
        uv: realtime.uv ?? 0,
        pressure: realtime.pressure ?? 1013,
        visibility: realtime.visibility ?? 10000,
        timestamp: Math.floor(Date.now() / 1000),
        sunrise: undefined,
        sunset: undefined,
      }
    : {
        temp: v.temperature ?? v.temperatureMax ?? v.temperatureMin ?? 20,
        feelsLike: v.temperatureApparent ?? v.temperature ?? 20,
        humidity: v.humidity ?? 60,
        windSpeed: v.windSpeed ?? 0,
        condition: tomorrowWeatherCodeToCondition(v.weatherCode ?? 1101),
        description: tomorrowWeatherCodeToCondition(v.weatherCode ?? 1101),
        icon: "",
        cloudCover: v.cloudCover ?? 0,
        uv: v.uvIndex ?? 0,
        pressure: v.pressureSurfaceLevel ?? 1013,
        visibility: (v.visibility ?? 10) * 1000,
        timestamp: Math.floor(new Date(first.time || first.startTime).getTime() / 1000),
        sunrise: v.sunriseTime,
        sunset: v.sunsetTime,
      };

  const forecast = daily.slice(0, 14).map((day: any) => {
    const vals = day.values ?? day;
    const date = new Date(day.time || day.startTime);
    const precip = vals.precipitationProbability ?? vals.precipitation ?? 0;
    const precipPct = precip <= 1 ? precip * 100 : precip;
    const dayCondition = tomorrowWeatherCodeToCondition(vals.weatherCode ?? 1101);
    return {
      date: date.toLocaleDateString(),
      dayOfWeek: date.toLocaleDateString("en-US", { weekday: "short" }),
      temp: {
        day: vals.temperature ?? vals.temperatureMax ?? 20,
        min: vals.temperatureMin ?? 18,
        max: vals.temperatureMax ?? 25,
      },
      humidity: vals.humidity ?? 60,
      windSpeed: vals.windSpeed ?? 0,
      condition: dayCondition,
      description: dayCondition,
      icon: "",
      precipitation: precipPct,
      sunrise: 0,
      sunset: 0,
    };
  });

  return {
    location: locationName,
    coordinates: { lat: geoData.lat, lon: geoData.lon },
    current,
    forecast,
  };
}

/**
 * Get weather data using FREE tier OpenWeather API (current + 5-day forecast)
 * This is a fallback when One Call API 3.0 is not available
 */
async function getWeatherDataFreeTier(
  lat: number,
  lon: number,
  locationName: string
): Promise<WeatherData> {
  // Fetch current weather
  const currentResponse = await axios.get(
    `${OPENWEATHER_BASE_URL_FREE}/weather`,
    {
      params: {
        lat,
        lon,
        units: "metric",
        appid: OPENWEATHER_API_KEY,
      },
    }
  );

  // Fetch 5-day forecast (3-hour intervals)
  const forecastResponse = await axios.get(
    `${OPENWEATHER_BASE_URL_FREE}/forecast`,
    {
      params: {
        lat,
        lon,
        units: "metric",
        appid: OPENWEATHER_API_KEY,
      },
    }
  );

  const current = currentResponse.data;
  const forecastData = forecastResponse.data;

  // Group forecast by day
  const dailyForecasts: { [key: string]: any[] } = {};

  forecastData.list.forEach((item: any) => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    if (!dailyForecasts[date]) {
      dailyForecasts[date] = [];
    }
    dailyForecasts[date].push(item);
  });

  // Process daily forecasts
  const forecast = Object.entries(dailyForecasts)
    .slice(0, 7)
    .map(([date, items]) => {
      const temps = items.map((item: any) => item.main.temp);
      const minTemp = Math.min(...temps);
      const maxTemp = Math.max(...temps);
      const avgTemp =
        temps.reduce((sum: number, t: number) => sum + t, 0) / temps.length;

      const avgHumidity =
        items.reduce((sum: number, item: any) => sum + item.main.humidity, 0) /
        items.length;
      const avgWindSpeed =
        items.reduce((sum: number, item: any) => sum + item.wind.speed, 0) /
        items.length;

      // Get most common weather condition
      const conditions = items.map((item: any) => item.weather[0].main);
      const mostCommonCondition = conditions
        .sort(
          (a: string, b: string) =>
            conditions.filter((c: string) => c === a).length -
            conditions.filter((c: string) => c === b).length
        )
        .pop();

      const firstItem = items[0];

      return {
        date: date,
        dayOfWeek: new Date(firstItem.dt * 1000).toLocaleDateString("en-US", {
          weekday: "short",
        }),
        temp: {
          day: avgTemp,
          min: minTemp,
          max: maxTemp,
        },
        humidity: avgHumidity,
        windSpeed: avgWindSpeed,
        condition: mostCommonCondition || firstItem.weather[0].main,
        description: firstItem.weather[0].description,
        icon: firstItem.weather[0].icon,
        precipitation: (firstItem.pop || 0) * 100,
        sunrise: current.sys.sunrise,
        sunset: current.sys.sunset,
      };
    });

  const weatherData: WeatherData = {
    location: locationName,
    coordinates: {
      lat,
      lon,
    },
    current: {
      temp: current.main.temp,
      feelsLike: current.main.feels_like,
      humidity: current.main.humidity,
      windSpeed: current.wind.speed,
      condition: current.weather[0].main,
      description: current.weather[0].description,
      icon: current.weather[0].icon,
      cloudCover: current.clouds.all,
      uv: 0, // Not available in free tier
      pressure: current.main.pressure,
      visibility: current.visibility,
      timestamp: current.dt,
      sunrise: current.sys?.sunrise,
      sunset: current.sys?.sunset,
    },
    forecast,
  };

  return weatherData;
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
      return cached.data as unknown as WeatherData;
    }

    // If not in cache, fetch from API
    // Check if location is in "lat,lon" format
    let geoData: GeoLocation;
    const coordsMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);

    if (coordsMatch) {
      // Location is already in coordinate format (e.g., "-15.3856,28.3189")
      const lat = parseFloat(coordsMatch[1]);
      const lon = parseFloat(coordsMatch[2]);

      // Try to reverse geocode to get a friendly name
      try {
        geoData = await reverseGeocode(lat, lon);
      } catch (error) {
        // If reverse geocoding fails, use coordinates as name
        geoData = {
          lat,
          lon,
          name: "Unknown Location",
          country: "ZM",
          geoPath: `${lat}, ${lon}`,
        };
      }
    } else {
      // Location is a place name, geocode it
      geoData = await geocodeLocation(location);
    }

    // Log resolved coords so we can verify correct location (e.g. device vs farm)
    console.log("weather location resolved", { lat: geoData.lat, lon: geoData.lon, name: geoData.name, requested: location.slice(0, 60) });

    let weatherData: WeatherData;

    // Primary: Tomorrow.io (better accuracy)
    if (TOMORROW_IO_API_KEY) {
      try {
        weatherData = await getWeatherDataTomorrow(geoData);
        weatherCache[cacheKey] = { data: weatherData, timestamp: Date.now() };
        return weatherData;
      } catch (tomorrowErr: any) {
        console.warn("Tomorrow.io weather failed, falling back to OpenWeather:", tomorrowErr?.message ?? tomorrowErr);
      }
    }

    // Fallback: OpenWeather
    if (!OPENWEATHER_API_KEY) {
      throw new Error("Weather API key not configured (set TOMORROW_IO_API_KEY or OPENWEATHER_API_KEY)");
    }

    // Try One Call API 3.0 first (paid tier)
    try {
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
      weatherData = {
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
          sunrise: data.current.sunrise,
          sunset: data.current.sunset,
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
    } catch (onecallError: any) {
      // If One Call API fails (401 = subscription required), fallback to free tier
      if (
        onecallError.response?.status === 401 ||
        onecallError.response?.status === 403
      ) {
        console.log("One Call API not available, using free tier API");
        weatherData = await getWeatherDataFreeTier(
          geoData.lat,
          geoData.lon,
          `${geoData.name}, ${geoData.country}`
        );
      } else {
        throw onecallError;
      }
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
      if (
        error.response.status === 401 &&
        !error.response.config.url.includes("/forecast")
      ) {
        throw new Error(
          "Weather data unavailable - API key issue. Please check your OpenWeather API key."
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
    // Check if location is in "lat,lon" format
    let geoData: GeoLocation;
    const coordsMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);

    if (coordsMatch) {
      // Location is already in coordinate format
      const lat = parseFloat(coordsMatch[1]);
      const lon = parseFloat(coordsMatch[2]);

      // Try to reverse geocode to get a friendly name
      try {
        geoData = await reverseGeocode(lat, lon);
      } catch (error) {
        // If reverse geocoding fails, use coordinates as name
        geoData = {
          lat,
          lon,
          name: "Unknown Location",
          country: "Unknown",
          geoPath: `${lat}, ${lon}`,
        };
      }
    } else {
      // Location is a place name, geocode it
      geoData = await geocodeLocation(location);
    }

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
    // Check if location is in "lat,lon" format
    let geoData: GeoLocation;
    const coordsMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);

    if (coordsMatch) {
      // Location is already in coordinate format
      const lat = parseFloat(coordsMatch[1]);
      const lon = parseFloat(coordsMatch[2]);

      // Try to reverse geocode to get a friendly name
      try {
        geoData = await reverseGeocode(lat, lon);
      } catch (error) {
        // If reverse geocoding fails, use coordinates as name
        geoData = {
          lat,
          lon,
          name: "Unknown Location",
          country: "Unknown",
          geoPath: `${lat}, ${lon}`,
        };
      }
    } else {
      // Location is a place name, geocode it
      geoData = await geocodeLocation(location);
    }

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

    // Use real elevation and soil data instead of estimates
    const lat = geoData.lat;
    const lon = geoData.lon;

    // Get real elevation data
    let elevation = 300; // Default fallback
    try {
      const elevationData = await getElevation(lat, lon);
      elevation = elevationData.elevation;
    } catch (error) {
      console.error("Error fetching elevation data:", error);
    }

    const isCoastalLocation = checkIfCoastal(lat, lon, elevation);

    // Get real soil data from SoilGrids API
    let soilType = "Loam"; // Default
    let soilPH = 6.5; // Default
    let soilMoisture = 50; // Default

    try {
      const soilData = await getSoilData(lat, lon);
      soilType = soilData.soilType;
      soilPH = soilData.ph;

      // Calculate moisture based on soil texture and recent climate
      const recentMonths = monthlyData.slice(
        Math.max(0, monthlyData.length - 3)
      );
      const recentPrecipitation =
        recentMonths.reduce((sum, m) => sum + m.averagePrecipitation, 0) / 3;
      const recentTemp =
        recentMonths.reduce((sum, m) => sum + m.averageTemp, 0) / 3;

      // Base moisture on actual soil texture
      let moistureBase = 30 + (recentPrecipitation / 200) * 50;

      // Clay soils retain more water
      if (soilData.claycontent > 35) {
        moistureBase += 15;
      }
      // Sandy soils drain quickly
      else if (soilData.sandcontent > 60) {
        moistureBase -= 15;
      }

      // Adjust for temperature (higher temps = more evaporation)
      moistureBase -= (recentTemp - 15) * 0.8;

      // Ensure moisture stays in reasonable range
      soilMoisture = Math.min(85, Math.max(25, moistureBase));
    } catch (error) {
      console.error("Error fetching soil data:", error);
      // Use fallback moisture calculation
      const recentMonths = monthlyData.slice(
        Math.max(0, monthlyData.length - 3)
      );
      const recentPrecipitation =
        recentMonths.reduce((sum, m) => sum + m.averagePrecipitation, 0) / 3;
      const recentTemp =
        recentMonths.reduce((sum, m) => sum + m.averageTemp, 0) / 3;

      let moistureBase = 30 + (recentPrecipitation / 200) * 50;
      moistureBase -= (recentTemp - 15) * 0.8;
      soilMoisture = Math.min(85, Math.max(25, moistureBase));
    }

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

    // Fetch crop varieties from database
    const cropVarietiesFromDb = await db
      .select()
      .from(cropVarieties)
      .where(eq(cropVarieties.isActive, true));

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

    // Calculate suitability score for each crop from database
    const recommendations: CropRecommendation[] = cropVarietiesFromDb.map(
      (crop) => {
        // Convert string values to numbers
        const tempMin = parseFloat(crop.tempMin as unknown as string);
        const tempOpt = parseFloat(crop.tempOptimal as unknown as string);
        const tempMax = parseFloat(crop.tempMax as unknown as string);
        const soilPhMin = parseFloat(crop.soilPhMin as unknown as string);
        const soilPhMax = parseFloat(crop.soilPhMax as unknown as string);

        // Temperature suitability (0-40)
        const tempSuitability =
          avgTemp < tempMin
            ? 0
            : avgTemp > tempMax
            ? 0
            : avgTemp === tempOpt
            ? 40
            : 40 - (Math.abs(avgTemp - tempOpt) / (tempMax - tempMin)) * 40;

        // Growing season suitability (0-30)
        const seasonSuitability =
          climateData.growingSeasonLength < crop.growingDaysMin
            ? 0
            : 30 *
              Math.min(
                1,
                climateData.growingSeasonLength / crop.growingDaysMax
              );

        // Soil suitability (0-20)
        const soilTypeSuitability = crop.soilTypes.includes(
          climateData.soilConditions.type
        )
          ? 20
          : 10;

        // Soil pH suitability (0-10)
        const phSuitability =
          climateData.soilConditions.ph < soilPhMin
            ? 0
            : climateData.soilConditions.ph > soilPhMax
            ? 0
            : 10;

        // Total suitability score (0-100)
        const suitabilityScore = Math.round(
          tempSuitability +
            seasonSuitability +
            soilTypeSuitability +
            phSuitability
        );

        // Determine optimal planting window
        const seasonToMonthMap: Record<string, string[]> = {
          Spring: ["March", "April", "May"],
          Summer: ["June", "July", "August"],
          Fall: ["September", "October", "November"],
          Winter: ["December", "January", "February"],
          Perennial: ["January"], // Just a placeholder for perennial crops
        };

        const plantingMonths = crop.plantingSeasons
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

        if (avgTemp < tempMin) {
          comments.push("Climate may be too cool for optimal growth.");
        } else if (avgTemp > tempMax) {
          comments.push("Climate may be too warm for optimal growth.");
        }

        if (climateData.growingSeasonLength < crop.growingDaysMin) {
          comments.push("Growing season may be too short.");
        }

        // Use expected yield from database if available
        const expectedYieldMin = crop.expectedYieldMin
          ? parseFloat(crop.expectedYieldMin as unknown as string)
          : 0;
        const expectedYieldMax = crop.expectedYieldMax
          ? parseFloat(crop.expectedYieldMax as unknown as string)
          : 0;
        const expectedYield =
          expectedYieldMin > 0
            ? expectedYieldMin +
              (expectedYieldMax - expectedYieldMin) * (suitabilityScore / 100)
            : suitabilityScore / 20;

        return {
          cropName: crop.name,
          variety: crop.variety,
          suitabilityScore,
          optimalPlantingWindow: {
            start: startMonth,
            end: endMonth,
          },
          expectedYield,
          yieldUnit: "tons/hectare",
          comments,
        };
      }
    );

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
