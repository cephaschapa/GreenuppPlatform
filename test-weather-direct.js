import axios from 'axios';

// Direct test of the OpenWeather API functionality
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

async function geocodeLocation(location) {
  try {
    const response = await axios.get(`${WEATHER_API_BASE_URL}/weather`, {
      params: {
        q: location,
        appid: OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });
    
    const { coord } = response.data;
    return { lat: coord.lat, lon: coord.lon };
  } catch (error) {
    console.error('Error geocoding location:', error.message);
    return { lat: -15.4166, lon: 28.2833 }; // Default to Lusaka
  }
}

async function testCurrentWeather() {
  try {
    const location = 'Lusaka';
    const { lat, lon } = await geocodeLocation(location);
    
    console.log(`Testing current weather for ${location} (${lat}, ${lon})...`);
    
    const response = await axios.get(`${WEATHER_API_BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        units: 'metric',
        appid: OPENWEATHER_API_KEY
      }
    });
    
    console.log('Current weather:');
    console.log('- Temperature:', response.data.main.temp);
    console.log('- Feels like:', response.data.main.feels_like);
    console.log('- Humidity:', response.data.main.humidity);
    console.log('- Weather:', response.data.weather[0].description);
    
    return true;
  } catch (error) {
    console.error('Error fetching current weather:', error.message);
    return false;
  }
}

async function testForecastWeather() {
  try {
    const location = 'Lusaka';
    const { lat, lon } = await geocodeLocation(location);
    
    console.log(`Testing forecast weather for ${location} (${lat}, ${lon})...`);
    
    const response = await axios.get(`${WEATHER_API_BASE_URL}/forecast`, {
      params: {
        lat,
        lon,
        units: 'metric',
        appid: OPENWEATHER_API_KEY
      }
    });
    
    console.log('Forecast count:', response.data.list.length);
    console.log('First forecast item:');
    const firstItem = response.data.list[0];
    console.log('- Time:', new Date(firstItem.dt * 1000).toISOString());
    console.log('- Temperature:', firstItem.main.temp);
    console.log('- Weather:', firstItem.weather[0].description);
    
    return true;
  } catch (error) {
    console.error('Error fetching forecast weather:', error.message);
    return false;
  }
}

async function testDailyForecast() {
  try {
    const location = 'Lusaka';
    const { lat, lon } = await geocodeLocation(location);
    
    console.log(`Testing 16-day daily forecast for ${location} (${lat}, ${lon})...`);
    
    const response = await axios.get(`${WEATHER_API_BASE_URL}/forecast/daily`, {
      params: {
        lat,
        lon,
        cnt: 16,
        units: 'metric',
        appid: OPENWEATHER_API_KEY
      }
    });
    
    console.log('Daily forecast count:', response.data.list.length);
    console.log('First day forecast:');
    const firstDay = response.data.list[0];
    console.log('- Day:', new Date(firstDay.dt * 1000).toLocaleDateString());
    console.log('- Min temp:', firstDay.temp.min);
    console.log('- Max temp:', firstDay.temp.max);
    console.log('- Weather:', firstDay.weather[0].description);
    
    return true;
  } catch (error) {
    console.error('Error fetching daily forecast:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('=== TESTING OPENWEATHER API INTEGRATION ===');
  
  if (!OPENWEATHER_API_KEY) {
    console.error('ERROR: No OpenWeather API key found. Please set the OPENWEATHER_API_KEY environment variable.');
    return;
  }
  
  const currentResult = await testCurrentWeather();
  const forecastResult = await testForecastWeather();
  const dailyResult = await testDailyForecast();
  
  console.log('\n=== TEST RESULTS ===');
  console.log('Current weather API:', currentResult ? '✅ PASSED' : '❌ FAILED');
  console.log('5-day forecast API:', forecastResult ? '✅ PASSED' : '❌ FAILED');
  console.log('16-day daily forecast API:', dailyResult ? '✅ PASSED' : '❌ FAILED');
}

runTests();