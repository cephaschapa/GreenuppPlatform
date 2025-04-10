import axios from 'axios';
import { InsertCropYieldPrediction } from '@shared/schema';
import { db } from './db';
import { cropYieldPredictions } from '@shared/schema';

// We'll use OpenWeatherMap API as it provides both current, forecast and historical data
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const OPENWEATHER_GEO_URL = 'https://api.openweathermap.org/geo/1.0';

// Cache for weather data to minimize API calls
const weatherCache: { [key: string]: { data: any; timestamp: number } } = {};
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

interface GeoLocation {
  lat: number;
  lon: number;
  name: string;
  country: string;
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

/**
 * Geocode a location string to coordinates
 */
async function geocodeLocation(location: string): Promise<GeoLocation> {
  try {
    // Check if we need to use the API key
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key not configured');
    }

    const response = await axios.get(`${OPENWEATHER_GEO_URL}/direct`, {
      params: {
        q: location,
        limit: 1,
        appid: OPENWEATHER_API_KEY
      }
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: result.lat,
        lon: result.lon,
        name: result.name,
        country: result.country
      };
    } else {
      throw new Error('Location not found');
    }
  } catch (error: any) {
    console.error('Error geocoding location:', error);
    throw new Error('Failed to geocode location');
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
      throw new Error('OpenWeather API key not configured');
    }

    // Fetch weather data using One Call API for current, forecast and alerts
    const response = await axios.get(`${OPENWEATHER_BASE_URL}/onecall`, {
      params: {
        lat: geoData.lat,
        lon: geoData.lon,
        units: 'metric',
        exclude: 'minutely,hourly',
        appid: OPENWEATHER_API_KEY
      }
    });

    // Format the data into our structure
    const data = response.data;
    const weatherData: WeatherData = {
      location: `${geoData.name}, ${geoData.country}`,
      coordinates: {
        lat: geoData.lat,
        lon: geoData.lon
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
        timestamp: data.current.dt
      },
      forecast: data.daily.map((day: any) => {
        const date = new Date(day.dt * 1000);
        return {
          date: date.toLocaleDateString(),
          dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
          temp: {
            day: day.temp.day,
            min: day.temp.min,
            max: day.temp.max
          },
          humidity: day.humidity,
          windSpeed: day.wind_speed,
          condition: day.weather[0].main,
          description: day.weather[0].description,
          icon: day.weather[0].icon,
          precipitation: day.pop * 100, // Probability of precipitation as percentage
          sunrise: day.sunrise,
          sunset: day.sunset
        };
      })
    };

    // Add alerts if present
    if (data.alerts) {
      weatherData.alerts = data.alerts.map((alert: any) => ({
        senderName: alert.sender_name,
        event: alert.event,
        start: alert.start,
        end: alert.end,
        description: alert.description,
        severity: alert.tags?.[0] || 'Info'
      }));
    }

    // Save to cache
    weatherCache[cacheKey] = {
      data: weatherData,
      timestamp: Date.now()
    };

    return weatherData;
  } catch (error: any) {
    console.error('Error fetching weather data:', error);
    if (error.response) {
      console.error('API response error:', error.response.data);
    }
    throw new Error('Failed to retrieve weather data');
  }
}

/**
 * Get historical weather data for a location
 */
export async function getHistoricalWeatherData(location: string, startDate: Date, endDate: Date): Promise<HistoricalWeatherData> {
  try {
    // First, geocode the location
    const geoData = await geocodeLocation(location);
    
    // Check if we need to use the API key
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key not configured');
    }

    // Format dates to Unix timestamps
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);
    
    // Due to API limitations, we'll need to make a request for each day
    const dates: Array<Date> = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Make API requests for each date (we may need to limit this or paginate for long date ranges)
    const weatherPromises = dates.map(async (date) => {
      const timestamp = Math.floor(date.getTime() / 1000);
      
      const response = await axios.get(`${OPENWEATHER_BASE_URL}/onecall/timemachine`, {
        params: {
          lat: geoData.lat,
          lon: geoData.lon,
          dt: timestamp,
          units: 'metric',
          appid: OPENWEATHER_API_KEY
        }
      });
      
      return {
        date: date.toISOString().split('T')[0],
        data: response.data
      };
    });
    
    const results = await Promise.all(weatherPromises);
    
    // Process and format the data
    const historicalData: HistoricalWeatherData = {
      location: `${geoData.name}, ${geoData.country}`,
      dates: results.map(result => {
        const day = result.data;
        
        // Calculate daily min and max from hourly data if available
        let minTemp = day.current.temp;
        let maxTemp = day.current.temp;
        let totalTemp = day.current.temp;
        let totalHumidity = day.current.humidity;
        
        if (day.hourly) {
          minTemp = Math.min(...day.hourly.map((hour: any) => hour.temp));
          maxTemp = Math.max(...day.hourly.map((hour: any) => hour.temp));
          totalTemp = day.hourly.reduce((sum: number, hour: any) => sum + hour.temp, 0) / day.hourly.length;
          totalHumidity = day.hourly.reduce((sum: number, hour: any) => sum + hour.humidity, 0) / day.hourly.length;
        }
        
        return {
          date: result.date,
          averageTemp: totalTemp,
          minTemp,
          maxTemp,
          humidity: totalHumidity,
          precipitation: day.current.rain?.['1h'] || 0 // Not always available
        };
      })
    };
    
    return historicalData;
  } catch (error: any) {
    console.error('Error fetching historical weather data:', error);
    throw new Error('Failed to retrieve historical weather data');
  }
}

/**
 * Get climate data for a location, combining historical data with other sources
 */
export async function getClimateData(location: string): Promise<ClimateData> {
  try {
    // First, geocode the location
    const geoData = await geocodeLocation(location);
    
    // For now, we'll simulate climate data based on seasonal patterns
    // In a production environment, this would connect to a climate database or API
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // This is simulated data - in a real implementation, we would fetch from a climate database
    // We're using latitude to simulate different climate zones
    const isNorthernHemisphere = geoData.lat > 0;
    const isEquatorial = Math.abs(geoData.lat) < 23.5;
    const isTemperate = Math.abs(geoData.lat) >= 23.5 && Math.abs(geoData.lat) < 40;
    const isPolar = Math.abs(geoData.lat) >= 60;
    
    let growingSeasonLength = 0;
    let soilType = "Loam";
    let soilPH = 6.5;
    let monthlyData = [];
    
    if (isEquatorial) {
      // Equatorial climate: warm year-round, wet/dry seasons
      growingSeasonLength = 365;
      soilType = "Clay Loam";
      soilPH = 5.8; // More acidic due to rainfall
      
      monthlyData = months.map(month => ({
        month,
        averageTemp: 25 + Math.random() * 5,
        averagePrecipitation: 150 + Math.random() * 100,
        growingDegreeDays: 30 * 25 // Approximate
      }));
    } else if (isTemperate) {
      // Temperate climate: seasonal variations
      growingSeasonLength = 180 + Math.floor(Math.random() * 60);
      soilType = "Silt Loam";
      soilPH = 6.2;
      
      const season = isNorthernHemisphere ? 
        [0, 0, 1, 1, 2, 2, 3, 3, 2, 1, 0, 0] : // Northern seasons
        [2, 3, 2, 1, 0, 0, 0, 0, 1, 2, 3, 3];  // Southern seasons
      
      monthlyData = months.map((month, i) => {
        // 0: Winter, 1: Spring, 2: Summer, 3: Fall
        const seasonIndex = season[i];
        
        // Temperature varies by season
        let temp;
        let precip;
        let gdd;
        
        switch (seasonIndex) {
          case 0: // Winter
            temp = 0 + Math.random() * 10;
            precip = 80 + Math.random() * 40;
            gdd = 0;
            break;
          case 1: // Spring
            temp = 15 + Math.random() * 8;
            precip = 100 + Math.random() * 50;
            gdd = 30 * Math.max(0, temp - 10);
            break;
          case 2: // Summer
            temp = 25 + Math.random() * 6;
            precip = 70 + Math.random() * 50;
            gdd = 30 * Math.max(0, temp - 10);
            break;
          case 3: // Fall
            temp = 15 + Math.random() * 8;
            precip = 100 + Math.random() * 60;
            gdd = 30 * Math.max(0, temp - 10);
            break;
          default:
            temp = 15;
            precip = 100;
            gdd = 150;
        }
        
        return {
          month,
          averageTemp: temp,
          averagePrecipitation: precip,
          growingDegreeDays: gdd
        };
      });
    } else if (isPolar) {
      // Polar climate: very cold, short growing season
      growingSeasonLength = 60 + Math.floor(Math.random() * 40);
      soilType = "Peat";
      soilPH = 5.5;
      
      monthlyData = months.map((month, i) => {
        // Simulate polar temperatures and precipitation
        const isNorthPolarSummer = isNorthernHemisphere && (i >= 5 && i <= 7);
        const isSouthPolarSummer = !isNorthernHemisphere && (i == 0 || i == 1 || i == 11);
        const isSummer = isNorthPolarSummer || isSouthPolarSummer;
        
        let temp = isSummer ? 
          10 + Math.random() * 5 : // Summer
          -15 + Math.random() * 15; // Winter
          
        let precip = isSummer ? 
          40 + Math.random() * 20 : // Summer
          20 + Math.random() * 10; // Winter
          
        let gdd = isSummer ? 30 * Math.max(0, temp - 5) : 0;
        
        return {
          month,
          averageTemp: temp,
          averagePrecipitation: precip,
          growingDegreeDays: gdd
        };
      });
    } else {
      // Default case - mid-latitude climate
      growingSeasonLength = 120 + Math.floor(Math.random() * 60);
      
      const season = isNorthernHemisphere ? 
        [0, 0, 1, 1, 2, 2, 3, 3, 2, 1, 0, 0] : // Northern seasons
        [2, 3, 2, 1, 0, 0, 0, 0, 1, 2, 3, 3];  // Southern seasons
      
      monthlyData = months.map((month, i) => {
        const seasonIndex = season[i];
        
        let temp;
        let precip;
        
        switch (seasonIndex) {
          case 0: // Winter
            temp = 5 + Math.random() * 8;
            precip = 80 + Math.random() * 40;
            break;
          case 1: // Spring
            temp = 15 + Math.random() * 8;
            precip = 90 + Math.random() * 40;
            break;
          case 2: // Summer
            temp = 22 + Math.random() * 8;
            precip = 60 + Math.random() * 30;
            break;
          case 3: // Fall
            temp = 15 + Math.random() * 8;
            precip = 90 + Math.random() * 40;
            break;
          default:
            temp = 15;
            precip = 80;
        }
        
        return {
          month,
          averageTemp: temp,
          averagePrecipitation: precip,
          growingDegreeDays: 30 * Math.max(0, temp - 10)
        };
      });
    }
    
    return {
      location: `${geoData.name}, ${geoData.country}`,
      monthlyAverages: monthlyData,
      soilConditions: {
        type: soilType,
        ph: soilPH,
        moisture: 50 + Math.random() * 20 // Percentage
      },
      growingSeasonLength
    };
  } catch (error: any) {
    console.error('Error generating climate data:', error);
    throw new Error('Failed to retrieve climate data');
  }
}

/**
 * Get crop recommendations based on climate data
 */
export async function getCropRecommendations(location: string): Promise<CropRecommendation[]> {
  try {
    // Get climate data for the location
    const climateData = await getClimateData(location);
    
    // Simple crop database with climate requirements
    // In a real application, this would be in a database
    const cropDatabase = [
      {
        name: 'Maize (Corn)',
        varieties: ['Hybrid', 'Sweet Corn', 'Popcorn'],
        tempRange: { min: 18, opt: 24, max: 32 },
        growingDays: { min: 60, max: 100 },
        waterRequirement: 'Medium', // mm per growing season
        soilTypes: ['Loam', 'Sandy Loam'],
        soilPH: { min: 5.8, max: 7.0 },
        seasonality: ['Spring', 'Summer']
      },
      {
        name: 'Wheat',
        varieties: ['Winter Wheat', 'Spring Wheat', 'Durum'],
        tempRange: { min: 3, opt: 15, max: 30 },
        growingDays: { min: 100, max: 130 },
        waterRequirement: 'Low',
        soilTypes: ['Clay Loam', 'Silt Loam', 'Loam'],
        soilPH: { min: 6.0, max: 7.5 },
        seasonality: ['Fall', 'Spring']
      },
      {
        name: 'Rice',
        varieties: ['Long Grain', 'Medium Grain', 'Short Grain'],
        tempRange: { min: 20, opt: 30, max: 35 },
        growingDays: { min: 90, max: 150 },
        waterRequirement: 'High',
        soilTypes: ['Clay', 'Clay Loam'],
        soilPH: { min: 5.5, max: 6.5 },
        seasonality: ['Spring', 'Summer']
      },
      {
        name: 'Potato',
        varieties: ['Russet', 'Red', 'White', 'Yellow'],
        tempRange: { min: 10, opt: 18, max: 25 },
        growingDays: { min: 70, max: 120 },
        waterRequirement: 'Medium',
        soilTypes: ['Sandy Loam', 'Loam'],
        soilPH: { min: 5.0, max: 6.5 },
        seasonality: ['Spring', 'Fall']
      },
      {
        name: 'Soybean',
        varieties: ['Early Maturity', 'Mid Maturity', 'Late Maturity'],
        tempRange: { min: 15, opt: 25, max: 30 },
        growingDays: { min: 80, max: 120 },
        waterRequirement: 'Medium',
        soilTypes: ['Loam', 'Clay Loam', 'Silt Loam'],
        soilPH: { min: 6.0, max: 7.0 },
        seasonality: ['Spring', 'Summer']
      },
      {
        name: 'Tomato',
        varieties: ['Cherry', 'Roma', 'Beefsteak'],
        tempRange: { min: 16, opt: 25, max: 30 },
        growingDays: { min: 60, max: 100 },
        waterRequirement: 'Medium',
        soilTypes: ['Loam', 'Sandy Loam'],
        soilPH: { min: 6.0, max: 6.8 },
        seasonality: ['Spring', 'Summer']
      },
      {
        name: 'Lettuce',
        varieties: ['Romaine', 'Iceberg', 'Butterhead', 'Loose Leaf'],
        tempRange: { min: 7, opt: 16, max: 24 },
        growingDays: { min: 30, max: 70 },
        waterRequirement: 'Medium',
        soilTypes: ['Loam', 'Sandy Loam'],
        soilPH: { min: 6.0, max: 7.0 },
        seasonality: ['Spring', 'Fall']
      },
      {
        name: 'Cotton',
        varieties: ['Upland', 'Pima'],
        tempRange: { min: 18, opt: 28, max: 35 },
        growingDays: { min: 150, max: 180 },
        waterRequirement: 'Medium',
        soilTypes: ['Loam', 'Sandy Loam', 'Clay Loam'],
        soilPH: { min: 5.8, max: 8.0 },
        seasonality: ['Spring', 'Summer']
      },
      {
        name: 'Sunflower',
        varieties: ['Oil', 'Confectionery'],
        tempRange: { min: 8, opt: 23, max: 32 },
        growingDays: { min: 70, max: 100 },
        waterRequirement: 'Low',
        soilTypes: ['Loam', 'Sandy Loam', 'Clay Loam'],
        soilPH: { min: 6.0, max: 7.5 },
        seasonality: ['Spring', 'Summer']
      },
      {
        name: 'Barley',
        varieties: ['Spring', 'Winter', 'Two-row', 'Six-row'],
        tempRange: { min: 5, opt: 15, max: 25 },
        growingDays: { min: 60, max: 100 },
        waterRequirement: 'Low',
        soilTypes: ['Loam', 'Clay Loam', 'Silt Loam'],
        soilPH: { min: 6.0, max: 8.0 },
        seasonality: ['Fall', 'Spring']
      },
      {
        name: 'Coffee',
        varieties: ['Arabica', 'Robusta'],
        tempRange: { min: 15, opt: 20, max: 25 },
        growingDays: { min: 365, max: 365 },
        waterRequirement: 'Medium',
        soilTypes: ['Loam', 'Clay Loam'],
        soilPH: { min: 5.0, max: 6.0 },
        seasonality: ['Perennial']
      }
    ];
    
    // Calculate average temperature and precipitation
    const avgTemp = climateData.monthlyAverages.reduce(
      (sum, month) => sum + month.averageTemp, 0
    ) / climateData.monthlyAverages.length;
    
    const avgPrecipitation = climateData.monthlyAverages.reduce(
      (sum, month) => sum + month.averagePrecipitation, 0
    ) / climateData.monthlyAverages.length;
    
    // Find months with appropriate temperature for planting
    const suitablePlantingMonths = climateData.monthlyAverages
      .filter(month => month.averageTemp > 10)
      .map(month => month.month);
    
    // Calculate suitability score for each crop
    const recommendations: CropRecommendation[] = cropDatabase.map(crop => {
      // Temperature suitability (0-40)
      const tempSuitability = 
        avgTemp < crop.tempRange.min ? 0 :
        avgTemp > crop.tempRange.max ? 0 :
        avgTemp === crop.tempRange.opt ? 40 :
        40 - (Math.abs(avgTemp - crop.tempRange.opt) / 
             (crop.tempRange.max - crop.tempRange.min) * 40);
      
      // Growing season suitability (0-30)
      const seasonSuitability = 
        climateData.growingSeasonLength < crop.growingDays.min ? 0 :
        30 * Math.min(
          1, 
          climateData.growingSeasonLength / crop.growingDays.max
        );
      
      // Soil suitability (0-20)
      const soilTypeSuitability = 
        crop.soilTypes.includes(climateData.soilConditions.type) ? 20 : 10;
      
      // Soil pH suitability (0-10)
      const phSuitability = 
        climateData.soilConditions.ph < crop.soilPH.min ? 0 :
        climateData.soilConditions.ph > crop.soilPH.max ? 0 :
        10;
      
      // Total suitability score (0-100)
      const suitabilityScore = Math.round(
        tempSuitability + seasonSuitability + soilTypeSuitability + phSuitability
      );
      
      // Choose appropriate variety based on climate
      let bestVariety = crop.varieties[0];
      if (crop.name === 'Wheat') {
        bestVariety = avgTemp < 5 ? 'Winter Wheat' : 'Spring Wheat';
      } else if (crop.name === 'Soybean') {
        bestVariety = climateData.growingSeasonLength < 100 ? 'Early Maturity' : 'Mid Maturity';
      }
      
      // Determine optimal planting window
      const seasonToMonthMap: Record<string, string[]> = {
        Spring: ['March', 'April', 'May'],
        Summer: ['June', 'July', 'August'],
        Fall: ['September', 'October', 'November'],
        Winter: ['December', 'January', 'February'],
        Perennial: ['January'] // Just a placeholder for perennial crops
      };
      
      const plantingMonths = crop.seasonality.flatMap(season => {
        return seasonToMonthMap[season as keyof typeof seasonToMonthMap] || [];
      }).filter(month => suitablePlantingMonths.includes(month));
      
      const startMonth = plantingMonths[0] || 'March';
      const endMonth = plantingMonths[plantingMonths.length - 1] || 'May';
      
      // Comments based on suitability
      const comments = [];
      if (suitabilityScore >= 80) {
        comments.push('Excellent crop choice for this climate.');
      } else if (suitabilityScore >= 60) {
        comments.push('Good potential with proper management.');
      } else if (suitabilityScore >= 40) {
        comments.push('Moderate potential, may require additional inputs.');
      } else {
        comments.push('Challenging crop for this climate, consider alternatives.');
      }
      
      if (avgTemp < crop.tempRange.min) {
        comments.push('Climate may be too cool for optimal growth.');
      } else if (avgTemp > crop.tempRange.max) {
        comments.push('Climate may be too warm for optimal growth.');
      }
      
      if (climateData.growingSeasonLength < crop.growingDays.min) {
        comments.push('Growing season may be too short.');
      }
      
      const expectedYield = suitabilityScore >= 80 ? 'High' :
                           suitabilityScore >= 60 ? 'Above Average' :
                           suitabilityScore >= 40 ? 'Average' :
                           'Below Average';
      
      return {
        cropName: crop.name,
        variety: bestVariety,
        suitabilityScore,
        optimalPlantingWindow: {
          start: startMonth,
          end: endMonth
        },
        expectedYield: suitabilityScore / 20, // Scaled yield estimate (0-5)
        yieldUnit: 'tons/hectare',
        comments
      };
    });
    
    // Sort by suitability score (highest first)
    return recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  } catch (error: any) {
    console.error('Error generating crop recommendations:', error);
    throw new Error('Failed to generate crop recommendations');
  }
}

/**
 * Generate a crop yield prediction using climate and crop data
 */
export async function generateCropYieldPrediction(cropId: number, location: string): Promise<InsertCropYieldPrediction> {
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
        averageTemp: climateData.monthlyAverages.reduce((sum, m) => sum + m.averageTemp, 0) / 12,
        averagePrecipitation: climateData.monthlyAverages.reduce((sum, m) => sum + m.averagePrecipitation, 0) / 12,
        growingSeasonLength: climateData.growingSeasonLength
      },
      weather: {
        currentTemp: weatherData.current.temp,
        forecastConditions: weatherData.forecast.slice(0, 5).map(day => day.condition)
      },
      soil: climateData.soilConditions
    };
    
    // Simulate a yield prediction
    const basePredictedYield = 3.5; // Base yield in tons/hectare
    
    // Adjust based on growing season length
    const seasonAdjustment = climateData.growingSeasonLength > 150 ? 1.2 : 
                            climateData.growingSeasonLength > 120 ? 1.0 : 0.8;
    
    // Adjust based on current weather conditions
    const weatherImpact = weatherData.alerts?.length ? 0.8 : 1.0; // Reduce yield if alerts present
    
    const predictedYield = basePredictedYield * seasonAdjustment * weatherImpact;
    
    // Create the prediction object
    const yieldPrediction: InsertCropYieldPrediction = {
      cropId,
      predictedYield,
      yieldUnit: 'tons/hectare',
      confidenceLevel,
      factorsConsidered
    };
    
    return yieldPrediction;
  } catch (error: any) {
    console.error('Error generating crop yield prediction:', error);
    throw new Error('Failed to generate crop yield prediction');
  }
}

/**
 * Save a crop yield prediction to the database
 */
export async function saveCropYieldPrediction(prediction: InsertCropYieldPrediction) {
  try {
    const [result] = await db.insert(cropYieldPredictions).values(prediction).returning();
    return result;
  } catch (error: any) {
    console.error('Error saving crop yield prediction:', error);
    throw new Error('Failed to save crop yield prediction');
  }
}