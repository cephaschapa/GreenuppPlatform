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
    
    const response = await axios.get(`https://api.openweathermap.org/geo/1.0/direct`, {
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
    
    // Then get weather data using the updated 3.0 API endpoint
    const response = await axios.get(`https://api.openweathermap.org/data/3.0/onecall`, {
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
    
    return {
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
        timestamp: data.current.dt,
      },
      forecast: data.daily.slice(1, 8).map((day: any) => ({
        date: day.dt,
        temp_max: day.temp.max,
        temp_min: day.temp.min,
        humidity: day.humidity,
        weather_description: day.weather[0].description,
        weather_icon: day.weather[0].icon,
        precipitation_probability: day.pop,
        wind_speed: day.wind_speed,
      })),
      alerts: data.alerts?.map((alert: any) => ({
        event: alert.event,
        description: alert.description,
        start: alert.start,
        end: alert.end,
        sender: alert.sender_name,
      })),
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    
    // Return mock data for demo/testing
    return getMockWeatherData(location);
  }
}

/**
 * Get historical weather data for a location
 */
export async function getHistoricalWeather(
  location: string, 
  startDate: string, 
  endDate?: string
): Promise<HistoricalWeatherData> {
  try {
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key is not set');
    }
    
    // First get coordinates from location name
    const { lat, lon } = await geocodeLocation(location);
    
    // Convert dates to unix timestamps
    const start = Math.floor(new Date(startDate).getTime() / 1000);
    const end = endDate ? Math.floor(new Date(endDate).getTime() / 1000) : Math.floor(Date.now() / 1000);
    
    // API call for historical data with the updated endpoint
    const response = await axios.get(`https://api.openweathermap.org/data/3.0/history/timemachine`, {
      params: {
        lat,
        lon,
        start,
        end,
        units: 'metric',
        appid: OPENWEATHER_API_KEY
      }
    });
    
    // Process the data
    const data = response.data;
    
    return {
      location,
      coordinates: { lat, lon },
      start_date: startDate,
      end_date: endDate || new Date().toISOString().split('T')[0],
      daily: data.data.map((day: any) => ({
        date: day.dt,
        temp_max: day.temp.max,
        temp_min: day.temp.min,
        temp_avg: (day.temp.max + day.temp.min) / 2,
        humidity: day.humidity,
        wind_speed: day.wind_speed,
        weather_description: day.weather[0].description,
        precipitation: day.rain || 0,
      })),
    };
  } catch (error) {
    console.error('Error fetching historical weather data:', error);
    
    // Return mock data for demo/testing
    return getMockHistoricalData(location, startDate, endDate);
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
    
    // This is a placeholder for a climate data API call
    // OpenWeather doesn't directly provide climate data in its API
    // We'd need a different service for this actual data
    
    return getMockClimateData(location, lat, lon);
  } catch (error) {
    console.error('Error fetching climate data:', error);
    
    // Return mock data
    return getMockClimateData(location, 0, 0);
  }
}

// Mock data generators for testing and demonstration

function getMockWeatherData(location: string): WeatherData {
  const { lat, lon } = { lat: -15.4166, lon: 28.2833 }; // Default to Lusaka
  
  const forecast = [];
  const currentDate = new Date();
  
  for (let i = 1; i <= 7; i++) {
    const forecastDate = new Date();
    forecastDate.setDate(currentDate.getDate() + i);
    
    forecast.push({
      date: Math.floor(forecastDate.getTime() / 1000),
      temp_max: 22 + Math.random() * 10,
      temp_min: 12 + Math.random() * 8,
      humidity: 30 + Math.random() * 60,
      weather_description: ['Sunny', 'Partly cloudy', 'Cloudy', 'Light rain', 'Thunderstorm'][Math.floor(Math.random() * 5)],
      weather_icon: ['01d', '02d', '03d', '10d', '11d'][Math.floor(Math.random() * 5)],
      precipitation_probability: Math.random(),
      wind_speed: 2 + Math.random() * 8,
    });
  }
  
  return {
    location,
    coordinates: { lat, lon },
    current: {
      temp: 25 + Math.random() * 10,
      feels_like: 26 + Math.random() * 8,
      humidity: 40 + Math.random() * 40,
      wind_speed: 3 + Math.random() * 10,
      wind_direction: Math.random() * 360,
      weather_description: 'Partly cloudy',
      weather_icon: '02d',
      uv_index: 2 + Math.random() * 9,
      visibility: 8000 + Math.random() * 2000,
      pressure: 1010 + Math.random() * 20,
      timestamp: Math.floor(Date.now() / 1000),
    },
    forecast,
    alerts: Math.random() > 0.7 ? [{
      event: 'Heavy Rain Warning',
      description: 'Heavy rainfall expected in the afternoon',
      start: Math.floor(Date.now() / 1000),
      end: Math.floor(Date.now() / 1000) + 86400,
      sender: 'Meteorological Department',
    }] : undefined,
  };
}

function getMockHistoricalData(location: string, startDate: string, endDate?: string): HistoricalWeatherData {
  const { lat, lon } = { lat: -15.4166, lon: 28.2833 }; // Default to Lusaka
  
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  const daily = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    
    daily.push({
      date: Math.floor(date.getTime() / 1000),
      temp_max: 20 + Math.random() * 12,
      temp_min: 10 + Math.random() * 10,
      temp_avg: 15 + Math.random() * 10,
      humidity: 30 + Math.random() * 60,
      wind_speed: 2 + Math.random() * 4,
      weather_description: ['Sunny', 'Partly cloudy', 'Cloudy', 'Light rain'][Math.floor(Math.random() * 4)],
      precipitation: Math.random() * 10
    });
  }
  
  return {
    location,
    coordinates: { lat, lon },
    start_date: startDate,
    end_date: endDate || new Date().toISOString().split('T')[0],
    daily
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
    monthly_averages: months.map((month, index) => {
      // Create temperature pattern based on hemisphere (warmer in summer, colder in winter)
      let tempBase = isNorthernHemisphere ? 
        20 - 15 * Math.cos((index / 12) * 2 * Math.PI) : // Northern pattern (summer in middle of year)
        20 - 15 * Math.cos(((index + 6) / 12) * 2 * Math.PI); // Southern pattern (winter in middle of year)
      
      // Add some random variation
      tempBase += (Math.random() * 4) - 2;
      
      // Create precipitation pattern (rainy season)
      let precipBase = isNorthernHemisphere ?
        40 + 80 * Math.sin(((index + 3) / 12) * 2 * Math.PI) : // Northern pattern
        40 + 80 * Math.sin(((index + 9) / 12) * 2 * Math.PI);  // Southern pattern
      
      // Ensure precipitation is positive and add some random variation
      precipBase = Math.max(10, precipBase + (Math.random() * 20) - 10);
      
      // Create daylight hours pattern
      let daylightBase = isNorthernHemisphere ?
        12 + 4 * Math.sin(((index) / 12) * 2 * Math.PI) : // Northern pattern
        12 + 4 * Math.sin(((index + 6) / 12) * 2 * Math.PI); // Southern pattern
      
      return {
        month,
        temp_avg: tempBase,
        temp_min_avg: tempBase - 8 - Math.random() * 4,
        temp_max_avg: tempBase + 8 + Math.random() * 4,
        precipitation_avg: precipBase,
        humidity_avg: 40 + precipBase / 3 + Math.random() * 10,
        daylight_hours_avg: daylightBase
      };
    }),
    annual_data: {
      temp_avg: 18 + Math.random() * 6,
      precipitation_total: 600 + Math.random() * 1000,
      frost_days: isNorthernHemisphere ? 
        (lat > 40 ? 60 + Math.round(Math.random() * 40) : Math.round(Math.random() * 20)) : 
        (lat < -40 ? 60 + Math.round(Math.random() * 40) : Math.round(Math.random() * 20)),
      growing_season_length: 180 + Math.round(Math.random() * 100),
      heat_degree_days: 1000 + Math.round(Math.random() * 2000),
      cool_degree_days: 800 + Math.round(Math.random() * 1500)
    },
    climate_zone: ['Tropical', 'Subtropical', 'Mediterranean', 'Temperate', 'Continental', 'Polar'][Math.floor(Math.random() * 6)],
    growing_zones: [
      `Zone ${Math.floor(Math.random() * 13)}`,
      `Zone ${Math.floor(Math.random() * 13)}`
    ]
  };
}