import axios from 'axios';

const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

interface WeatherLocation {
  lat: number;
  lon: number;
  city?: string;
  country?: string;
}

export interface CurrentWeather {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  weather: {
    description: string;
    icon: string;
    main: string;
  };
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  visibility: number;
  dt: number; // timestamp
  timezone: number;
  sunrise: number;
  sunset: number;
}

export interface ForecastItem {
  dt: number; // timestamp
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  pop: number; // probability of precipitation
  rain?: {
    '3h'?: number;
  };
  sys: {
    pod: string; // part of day (n/d)
  };
  dt_txt: string; // date time text
}

export interface WeatherForecast {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  forecastItems: ForecastItem[];
}

export interface AirQuality {
  location: {
    name: string;
    country: string;
    lat: number; 
    lon: number;
  };
  aqi: number; // Air Quality Index
  components: {
    co: number;
    no: number;
    no2: number;
    o3: number;
    so2: number;
    pm2_5: number;
    pm10: number;
    nh3: number;
  };
  dt: number; // timestamp
}

export interface WeatherAlert {
  sender: string;
  event: string;
  start: number; // timestamp
  end: number; // timestamp
  description: string;
  tags: string[];
}

export interface WeatherData {
  current: CurrentWeather;
  forecast?: WeatherForecast;
  airQuality?: AirQuality;
  alerts?: WeatherAlert[];
}

/**
 * Get location coordinates from city name
 */
export async function getCoordinates(cityName: string): Promise<WeatherLocation> {
  try {
    const response = await axios.get(`https://api.openweathermap.org/geo/1.0/direct`, {
      params: {
        q: cityName,
        limit: 1,
        appid: OPENWEATHERMAP_API_KEY
      }
    });

    if (response.data && response.data.length > 0) {
      const { lat, lon, name, country } = response.data[0];
      return { lat, lon, city: name, country };
    }
    
    throw new Error('Location not found');
  } catch (error) {
    console.error('Error getting coordinates:', error);
    throw new Error('Failed to get location coordinates');
  }
}

/**
 * Get current weather data
 */
export async function getCurrentWeather(location: WeatherLocation): Promise<CurrentWeather> {
  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        lat: location.lat,
        lon: location.lon,
        appid: OPENWEATHERMAP_API_KEY,
        units: 'metric'
      }
    });

    const data = response.data;

    return {
      location: {
        name: data.name,
        country: data.sys.country,
        lat: data.coord.lat,
        lon: data.coord.lon
      },
      weather: {
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        main: data.weather[0].main
      },
      main: {
        temp: data.main.temp,
        feels_like: data.main.feels_like,
        temp_min: data.main.temp_min,
        temp_max: data.main.temp_max,
        pressure: data.main.pressure,
        humidity: data.main.humidity
      },
      wind: {
        speed: data.wind.speed,
        deg: data.wind.deg
      },
      clouds: {
        all: data.clouds.all
      },
      rain: data.rain,
      visibility: data.visibility,
      dt: data.dt,
      timezone: data.timezone,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset
    };
  } catch (error) {
    console.error('Error getting current weather:', error);
    throw new Error('Failed to get current weather data');
  }
}

/**
 * Get 5-day weather forecast data
 */
export async function getWeatherForecast(location: WeatherLocation): Promise<WeatherForecast> {
  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        lat: location.lat,
        lon: location.lon,
        appid: OPENWEATHERMAP_API_KEY,
        units: 'metric'
      }
    });

    const data = response.data;

    return {
      location: {
        name: data.city.name,
        country: data.city.country,
        lat: data.city.coord.lat,
        lon: data.city.coord.lon
      },
      forecastItems: data.list
    };
  } catch (error) {
    console.error('Error getting weather forecast:', error);
    throw new Error('Failed to get weather forecast data');
  }
}

/**
 * Get air quality data
 */
export async function getAirQuality(location: WeatherLocation): Promise<AirQuality> {
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/air_pollution`, {
      params: {
        lat: location.lat,
        lon: location.lon,
        appid: OPENWEATHERMAP_API_KEY
      }
    });

    const data = response.data;
    const airData = data.list[0];

    return {
      location: {
        name: location.city || 'Unknown',
        country: location.country || 'Unknown',
        lat: location.lat,
        lon: location.lon
      },
      aqi: airData.main.aqi,
      components: airData.components,
      dt: airData.dt
    };
  } catch (error) {
    console.error('Error getting air quality data:', error);
    throw new Error('Failed to get air quality data');
  }
}

/**
 * Get comprehensive weather data including current weather, forecast, air quality, and alerts
 */
export async function getComprehensiveWeatherData(location: WeatherLocation): Promise<WeatherData> {
  try {
    // Use Promise.all to make concurrent API calls
    const [currentWeather, forecast, airQuality] = await Promise.all([
      getCurrentWeather(location),
      getWeatherForecast(location),
      getAirQuality(location).catch(() => undefined) // Don't fail if air quality fails
    ]);

    return {
      current: currentWeather,
      forecast,
      airQuality
    };
  } catch (error) {
    console.error('Error getting comprehensive weather data:', error);
    throw new Error('Failed to get comprehensive weather data');
  }
}

/**
 * Get agricultural weather data and advisories
 */
export async function getAgriculturalWeatherData(location: WeatherLocation): Promise<any> {
  // This would integrate with a more specialized agricultural weather API
  // or enhance generic weather data with agricultural interpretations
  
  try {
    const weatherData = await getComprehensiveWeatherData(location);
    
    // Enhance with agricultural insights
    // This is a simplified example - in a real implementation, you would 
    // use more sophisticated analysis tailored to your specific crops and conditions
    
    const agriculturalInsights = {
      irrigationNeeded: determineIrrigationNeeds(weatherData),
      pestRisks: determinePestRisks(weatherData),
      diseaseRisks: determineDiseaseRisks(weatherData),
      fieldWorkability: determineFieldWorkability(weatherData),
      growingDegreeDay: calculateGrowingDegreeDay(weatherData),
      frostRisk: determineFrostRisk(weatherData)
    };
    
    return {
      ...weatherData,
      agriculturalInsights
    };
  } catch (error) {
    console.error('Error getting agricultural weather data:', error);
    throw new Error('Failed to get agricultural weather data');
  }
}

// Helper functions for agricultural insights
function determineIrrigationNeeds(weatherData: WeatherData): { needed: boolean, reason: string } {
  // Simple logic based on precipitation and temperature
  const forecast = weatherData.forecast?.forecastItems || [];
  const nextFewDays = forecast.slice(0, 8); // Next 24 hours
  
  // Check for rain in the forecast
  const hasRain = nextFewDays.some(item => 
    item.rain !== undefined && 
    item.rain['3h'] !== undefined && 
    item.rain['3h'] > 2
  );
  
  // Check if temperatures will be high
  const highTemp = nextFewDays.some(item => item.main.temp > 30);
  
  if (hasRain) {
    return { needed: false, reason: 'Rain expected in the next 24 hours' };
  } else if (highTemp) {
    return { needed: true, reason: 'High temperatures expected without rainfall' };
  }
  
  return { needed: true, reason: 'No significant rainfall expected' };
}

function determinePestRisks(weatherData: WeatherData): { risk: 'low' | 'medium' | 'high', notes: string } {
  // Simple logic based on temperature and humidity
  const temp = weatherData.current.main.temp;
  const humidity = weatherData.current.main.humidity;
  
  if (temp > 25 && humidity > 70) {
    return { risk: 'high', notes: 'Warm and humid conditions favor pest development' };
  } else if (temp > 20 && humidity > 60) {
    return { risk: 'medium', notes: 'Moderate risk for some pests' };
  }
  
  return { risk: 'low', notes: 'Current conditions not favorable for most pests' };
}

function determineDiseaseRisks(weatherData: WeatherData): { risk: 'low' | 'medium' | 'high', notes: string } {
  // Simple logic based on humidity and rainfall
  const humidity = weatherData.current.main.humidity;
  const hasRecentRain = weatherData.current.rain !== undefined && 
    ((weatherData.current.rain['1h'] !== undefined && weatherData.current.rain['1h'] > 0) || 
     (weatherData.current.rain['3h'] !== undefined && weatherData.current.rain['3h'] > 0));
  
  if (humidity > 85 && hasRecentRain) {
    return { risk: 'high', notes: 'High humidity and recent rainfall increase fungal disease risk' };
  } else if (humidity > 70) {
    return { risk: 'medium', notes: 'Elevated humidity may favor some diseases' };
  }
  
  return { risk: 'low', notes: 'Current conditions not highly favorable for disease development' };
}

function determineFieldWorkability(weatherData: WeatherData): { workable: boolean, reason: string } {
  // Simple logic based on precipitation
  const hasRecentRain = weatherData.current.rain !== undefined && 
    ((weatherData.current.rain['1h'] !== undefined && weatherData.current.rain['1h'] > 5) || 
     (weatherData.current.rain['3h'] !== undefined && weatherData.current.rain['3h'] > 10));
  
  const forecast = weatherData.forecast?.forecastItems || [];
  const rainSoon = forecast.length > 0 && 
    forecast[0].rain !== undefined && 
    forecast[0].rain['3h'] !== undefined && 
    forecast[0].rain['3h'] > 2;
  
  if (hasRecentRain) {
    return { workable: false, reason: 'Field likely too wet from recent rainfall' };
  } else if (rainSoon) {
    return { workable: false, reason: 'Rain expected soon, may want to delay field work' };
  }
  
  return { workable: true, reason: 'Field conditions likely suitable for work' };
}

function calculateGrowingDegreeDay(weatherData: WeatherData): number {
  // Basic GDD calculation: GDD = (Tmax + Tmin) / 2 - Tbase
  // Where Tbase is usually 10°C for many crops
  const tmax = weatherData.current.main.temp_max;
  const tmin = weatherData.current.main.temp_min;
  const tbase = 10;
  
  let gdd = (tmax + tmin) / 2 - tbase;
  gdd = Math.max(0, gdd); // GDD cannot be negative
  
  return Math.round(gdd * 10) / 10; // Round to 1 decimal place
}

function determineFrostRisk(weatherData: WeatherData): { risk: 'none' | 'low' | 'moderate' | 'high', forecast: string } {
  // Check for frost risk in the next few days
  const forecast = weatherData.forecast?.forecastItems || [];
  const nextFewDays = forecast.slice(0, 16); // Next 48 hours
  
  const minTemp = Math.min(...nextFewDays.map(item => item.main.temp_min));
  
  if (minTemp < 0) {
    return { risk: 'high', forecast: `Freezing temperatures (${minTemp.toFixed(1)}°C) expected` };
  } else if (minTemp < 2) {
    return { risk: 'moderate', forecast: `Near-freezing temperatures (${minTemp.toFixed(1)}°C) possible` };
  } else if (minTemp < 5) {
    return { risk: 'low', forecast: `Cool temperatures (${minTemp.toFixed(1)}°C) expected but frost unlikely` };
  }
  
  return { risk: 'none', forecast: 'No frost risk expected' };
}