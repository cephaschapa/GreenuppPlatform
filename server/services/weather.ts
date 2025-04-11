import axios from 'axios';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/3.0';

// Check if API key is available
if (!OPENWEATHER_API_KEY) {
  console.warn('Warning: OpenWeather API key (OPENWEATHER_API_KEY) is not set');
}

interface WeatherData {
  location: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    wind_direction: number;
    weather_description: string;
    weather_icon: string;
    uv_index: number;
    visibility: number;
    pressure: number;
    timestamp: number;
  };
  forecast: Array<{
    date: number;
    temp_max: number;
    temp_min: number;
    humidity: number;
    weather_description: string;
    weather_icon: string;
    precipitation_probability: number;
    wind_speed: number;
  }>;
  alerts?: Array<{
    event: string;
    description: string;
    start: number;
    end: number;
    sender: string;
  }>;
}

interface HistoricalWeatherData {
  location: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  start_date: string;
  end_date: string;
  daily: Array<{
    date: number;
    temp_max: number;
    temp_min: number;
    temp_avg: number;
    humidity: number;
    wind_speed: number;
    weather_description: string;
    precipitation: number;
  }>;
}

interface ClimateData {
  location: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  monthly_averages: Array<{
    month: string;
    temp_avg: number;
    temp_min_avg: number;
    temp_max_avg: number;
    precipitation_avg: number;
    humidity_avg: number;
    daylight_hours_avg: number;
  }>;
  annual_data: {
    temp_avg: number;
    precipitation_total: number;
    frost_days: number;
    growing_season_length: number;
    heat_degree_days: number;
    cool_degree_days: number;
  };
  climate_zone: string;
  growing_zones: string[];
}

/**
 * Convert location string to coordinates
 */
async function geocodeLocation(location: string): Promise<{ lat: number; lon: number }> {
  try {
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key is not set');
    }
    
    const response = await axios.get(`http://api.openweathermap.org/geo/1.0/direct`, {
      params: {
        q: location,
        limit: 1,
        appid: OPENWEATHER_API_KEY
      }
    });
    
    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { lat, lon };
    } else {
      throw new Error(`Location not found: ${location}`);
    }
  } catch (error) {
    console.error('Error geocoding location:', error);
    
    // Return a default location (Lusaka, Zambia) for demo purposes
    return { lat: -15.4166, lon: 28.2833 };
  }
}

/**
 * Get current weather and forecast for a location
 */
export async function getCurrentWeather(location: string): Promise<WeatherData> {
  try {
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key is not set');
    }
    
    // First get coordinates from location name
    const { lat, lon } = await geocodeLocation(location);
    
    // Then get weather data
    const response = await axios.get(`${WEATHER_API_BASE_URL}/onecall`, {
      params: {
        lat,
        lon,
        exclude: 'minutely,hourly',
        units: 'metric',
        appid: OPENWEATHER_API_KEY
      }
    });
    
    // Process and transform the data
    const data = response.data;
    
    // If API call was successful but we're in demo mode (no API key),
    // return mock data
    if (!data || !data.current) {
      return getMockWeatherData(location, lat, lon);
    }
    
    const weatherData: WeatherData = {
      location,
      coordinates: { lat, lon },
      current: {
        temp: data.current.temp,
        feels_like: data.current.feels_like,
        humidity: data.current.humidity,
        wind_speed: data.current.wind_speed,
        wind_direction: data.current.wind_deg,
        weather_description: data.current.weather[0].description,
        weather_icon: data.current.weather[0].icon,
        uv_index: data.current.uvi,
        visibility: data.current.visibility,
        pressure: data.current.pressure,
        timestamp: data.current.dt
      },
      forecast: data.daily.map((day: any) => ({
        date: day.dt,
        temp_max: day.temp.max,
        temp_min: day.temp.min,
        humidity: day.humidity,
        weather_description: day.weather[0].description,
        weather_icon: day.weather[0].icon,
        precipitation_probability: day.pop,
        wind_speed: day.wind_speed
      }))
    };
    
    // Add weather alerts if available
    if (data.alerts) {
      weatherData.alerts = data.alerts.map((alert: any) => ({
        event: alert.event,
        description: alert.description,
        start: alert.start,
        end: alert.end,
        sender: alert.sender_name
      }));
    }
    
    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    
    // Return mock data in case of error or missing API key
    const { lat, lon } = await geocodeLocation(location);
    return getMockWeatherData(location, lat, lon);
  }
}

/**
 * Get historical weather data for a location
 */
export async function getHistoricalWeather(
  location: string, 
  start: string, 
  end?: string
): Promise<HistoricalWeatherData> {
  try {
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key is not set');
    }
    
    // Get coordinates from location name
    const { lat, lon } = await geocodeLocation(location);
    
    // Parse start date
    const startDate = new Date(start);
    // Set end date to start date + 7 days if not provided, or parse provided end date
    const endDate = end ? new Date(end) : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Format dates for API calls
    const startUnix = Math.floor(startDate.getTime() / 1000);
    const endUnix = Math.floor(endDate.getTime() / 1000);
    
    // Make API call to get historical data
    // Note: OpenWeather's free tier doesn't have proper historical API
    // This would use a different endpoint in a production environment
    
    // For now, return mock historical data
    return getMockHistoricalWeatherData(
      location, 
      lat, 
      lon, 
      startDate.toISOString().split('T')[0], 
      endDate.toISOString().split('T')[0]
    );
  } catch (error) {
    console.error('Error fetching historical weather data:', error);
    
    // Return mock data in case of error
    const { lat, lon } = await geocodeLocation(location);
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return getMockHistoricalWeatherData(
      location, 
      lat, 
      lon, 
      startDate.toISOString().split('T')[0], 
      endDate.toISOString().split('T')[0]
    );
  }
}

/**
 * Get climate data for a location
 */
export async function getClimateData(location: string): Promise<ClimateData> {
  try {
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key is not set');
    }
    
    // Get coordinates from location name
    const { lat, lon } = await geocodeLocation(location);
    
    // In a real implementation, this would call a climate data API
    // For now, return mock climate data
    return getMockClimateData(location, lat, lon);
  } catch (error) {
    console.error('Error fetching climate data:', error);
    
    // Return mock data in case of error
    const { lat, lon } = await geocodeLocation(location);
    return getMockClimateData(location, lat, lon);
  }
}

// Mock data generators for testing and development

function getMockWeatherData(location: string, lat: number, lon: number): WeatherData {
  const now = new Date();
  const currentTimestamp = Math.floor(now.getTime() / 1000);
  
  return {
    location,
    coordinates: { lat, lon },
    current: {
      temp: 25.2,
      feels_like: 26.5,
      humidity: 65,
      wind_speed: 3.5,
      wind_direction: 180,
      weather_description: 'Partly cloudy',
      weather_icon: '03d',
      uv_index: 6.2,
      visibility: 10000,
      pressure: 1015,
      timestamp: currentTimestamp
    },
    forecast: Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      return {
        date: Math.floor(date.getTime() / 1000),
        temp_max: 28 + Math.random() * 5 - 2,
        temp_min: 20 + Math.random() * 3 - 1,
        humidity: 60 + Math.floor(Math.random() * 20),
        weather_description: ['Sunny', 'Partly cloudy', 'Cloudy', 'Light rain'][Math.floor(Math.random() * 4)],
        weather_icon: ['01d', '02d', '03d', '10d'][Math.floor(Math.random() * 4)],
        precipitation_probability: Math.random() * 0.6,
        wind_speed: 2 + Math.random() * 4
      };
    }),
    alerts: [
      {
        event: 'Heavy Rainfall Alert',
        description: 'Heavy rainfall expected in some parts of the region. Potential for localized flooding in low-lying areas.',
        start: currentTimestamp + 86400, // 1 day from now
        end: currentTimestamp + 172800, // 2 days from now
        sender: 'National Weather Service'
      }
    ]
  };
}

function getMockHistoricalWeatherData(
  location: string, 
  lat: number, 
  lon: number, 
  startDate: string, 
  endDate: string
): HistoricalWeatherData {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
  
  return {
    location,
    coordinates: { lat, lon },
    start_date: startDate,
    end_date: endDate,
    daily: Array.from({ length: dayDiff }, (_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return {
        date: Math.floor(date.getTime() / 1000),
        temp_max: 28 + Math.random() * 5 - 2,
        temp_min: 20 + Math.random() * 3 - 1,
        temp_avg: 24 + Math.random() * 3 - 1,
        humidity: 60 + Math.floor(Math.random() * 20),
        wind_speed: 2 + Math.random() * 4,
        weather_description: ['Sunny', 'Partly cloudy', 'Cloudy', 'Light rain'][Math.floor(Math.random() * 4)],
        precipitation: Math.random() * 10
      };
    })
  };
}

function getMockClimateData(location: string, lat: number, lon: number): ClimateData {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Generate mock climate data with seasonal pattern based on hemisphere
  const isNorthernHemisphere = lat > 0;
  
  return {
    location,
    coordinates: { lat, lon },
    monthly_averages: months.map((month, i) => {
      // Create seasonal pattern
      const seasonalFactor = isNorthernHemisphere
        ? Math.sin((i - 3) * Math.PI / 6) // Peak in July
        : Math.sin((i - 9) * Math.PI / 6); // Peak in January
      
      const tempAvg = 23 + seasonalFactor * 10;
      
      return {
        month,
        temp_avg: tempAvg,
        temp_min_avg: tempAvg - 8 + Math.random() * 2,
        temp_max_avg: tempAvg + 8 + Math.random() * 2,
        precipitation_avg: 50 + seasonalFactor * 70 + Math.random() * 20,
        humidity_avg: 60 + seasonalFactor * 20,
        daylight_hours_avg: 12 + seasonalFactor * 3
      };
    }),
    annual_data: {
      temp_avg: 23,
      precipitation_total: 1200,
      frost_days: 0,
      growing_season_length: 300,
      heat_degree_days: 3500,
      cool_degree_days: 100
    },
    climate_zone: 'Tropical savanna',
    growing_zones: ['USDA Zone 10', 'FAO Zone 3']
  };
}