import axios from 'axios';
import qs from 'querystring';

async function testWeatherAPI() {
  try {
    // 1. Login to get authenticated session
    const loginResponse = await axios.post('http://localhost:5000/api/login', {
      username: 'cephaschapa',
      password: 'password123'
    }, {
      withCredentials: true,
      maxRedirects: 0,
      validateStatus: status => status >= 200 && status < 500
    });
    
    // Extract cookie
    const cookies = loginResponse.headers['set-cookie'];
    
    if (loginResponse.status !== 200 || !cookies) {
      console.error('Login failed:', loginResponse.status, loginResponse.data);
      return;
    }
    
    console.log('Login successful:', loginResponse.data.username);
    
    // 2. Test current weather API
    const weatherResponse = await axios.get('http://localhost:5000/api/weather?location=Lusaka', {
      headers: {
        Cookie: cookies
      }
    });
    
    // Print just a portion of the response to keep output manageable
    const { location, coordinates, current } = weatherResponse.data;
    console.log('Current weather data:', { 
      location, 
      coordinates,
      current: {
        temp: current.temp,
        feels_like: current.feels_like,
        humidity: current.humidity,
        weather_description: current.weather_description
      }
    });
    
    // 3. Test historical weather API
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 10); // 10 days ago
    
    const historicalResponse = await axios.get(`http://localhost:5000/api/weather/historical?location=Lusaka&startDate=${startDate.toISOString().split('T')[0]}`, {
      headers: {
        Cookie: cookies
      }
    });
    
    console.log('Historical weather data length:', historicalResponse.data.daily.length);
    
    // 4. Test climate data API
    const climateResponse = await axios.get('http://localhost:5000/api/weather/climate?location=Lusaka', {
      headers: {
        Cookie: cookies
      }
    });
    
    console.log('Climate data for location:', climateResponse.data.location);
    console.log('Climate zone:', climateResponse.data.climate_zone);
    
    return 'Tests completed successfully';
  } catch (error) {
    console.error('Error during test:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return 'Tests failed';
  }
}

testWeatherAPI().then(console.log);