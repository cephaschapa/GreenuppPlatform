import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Cloud, CloudRain, Droplets, Gauge, Thermometer, Wind } from "lucide-react";
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useWeatherPreferences } from '@/hooks/use-weather-preferences';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types for the weather data
interface WeatherLocation {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

interface Weather {
  description: string;
  icon: string;
  main: string;
}

interface MainWeather {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
}

interface Wind {
  speed: number;
  deg: number;
}

interface Clouds {
  all: number;
}

interface Rain {
  '1h'?: number;
  '3h'?: number;
}

interface CurrentWeather {
  location: WeatherLocation;
  weather: Weather;
  main: MainWeather;
  wind: Wind;
  clouds: Clouds;
  rain?: Rain;
  visibility: number;
  dt: number;
  timezone: number;
  sunrise: number;
  sunset: number;
}

interface ForecastItem {
  dt: number;
  main: MainWeather;
  weather: Weather[];
  clouds: Clouds;
  wind: Wind;
  visibility: number;
  pop: number;
  rain?: { '3h'?: number };
  sys: { pod: string };
  dt_txt: string;
}

interface WeatherForecast {
  location: WeatherLocation;
  forecastItems: ForecastItem[];
}

interface AirQuality {
  location: WeatherLocation;
  aqi: number;
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
  dt: number;
}

interface WeatherData {
  current: CurrentWeather;
  forecast?: WeatherForecast;
  airQuality?: AirQuality;
}

interface IrrigationNeeds {
  needed: boolean;
  reason: string;
}

interface Risk {
  risk: 'low' | 'medium' | 'high';
  notes: string;
}

interface FieldWorkability {
  workable: boolean;
  reason: string;
}

interface FrostRisk {
  risk: 'none' | 'low' | 'moderate' | 'high';
  forecast: string;
}

interface AgriculturalInsights {
  irrigationNeeded: IrrigationNeeds;
  pestRisks: Risk;
  diseaseRisks: Risk;
  fieldWorkability: FieldWorkability;
  growingDegreeDay: number;
  frostRisk: FrostRisk;
}

interface AgriculturalWeatherData extends WeatherData {
  agriculturalInsights: AgriculturalInsights;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
}

function formatTimeFromDateString(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
}

function getWeatherIcon(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

function getRiskColor(risk: 'low' | 'medium' | 'high' | 'none' | 'moderate'): string {
  switch (risk) {
    case 'low':
    case 'none':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'medium':
    case 'moderate':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getAQIDescription(aqi: number): string {
  switch (aqi) {
    case 1:
      return 'Good';
    case 2:
      return 'Fair';
    case 3:
      return 'Moderate';
    case 4:
      return 'Poor';
    case 5:
      return 'Very Poor';
    default:
      return 'Unknown';
  }
}

function getAQIColor(aqi: number): string {
  switch (aqi) {
    case 1:
      return 'bg-green-100 text-green-800 border-green-200';
    case 2:
      return 'bg-green-50 text-green-600 border-green-100';
    case 3:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 4:
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 5:
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function groupForecastByDay(forecastItems: ForecastItem[]): { [key: string]: ForecastItem[] } {
  return forecastItems.reduce((acc, item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as { [key: string]: ForecastItem[] });
}

function WeatherSearch() {
  const [location, setLocation] = useState('');
  const [savedLocation, setSavedLocation] = useState('');
  const { preferences, isLoading: isLoadingPrefs, createWeatherPreference, updateWeatherPreference } = useWeatherPreferences();

  const handleSearch = () => {
    if (location.trim()) {
      setSavedLocation(location);
    }
  };

  const handleSavePreference = () => {
    if (savedLocation && preferences) {
      if (preferences.id) {
        updateWeatherPreference({
          id: preferences.id,
          location: savedLocation
        });
      } else {
        createWeatherPreference({
          location: savedLocation
        });
      }
    }
  };

  React.useEffect(() => {
    if (preferences && preferences.location) {
      setLocation(preferences.location);
      setSavedLocation(preferences.location);
    }
  }, [preferences]);

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-wrap gap-2">
        <div className="flex-1">
          <Input
            placeholder="Enter city name (e.g. London, New York, Tokyo)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
        <Button variant="outline" onClick={handleSavePreference} disabled={!savedLocation || isLoadingPrefs}>
          {preferences?.id ? 'Update Preference' : 'Save as Default'}
        </Button>
      </div>
      {savedLocation && (
        <div>
          <span className="text-sm text-muted-foreground">
            Showing weather for: <span className="font-medium text-foreground">{savedLocation}</span>
          </span>
        </div>
      )}
    </div>
  );
}

function CurrentWeatherCard({ weatherData }: { weatherData: WeatherData }) {
  const { current } = weatherData;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1">Current Weather</CardTitle>
            <CardDescription>
              {current.location.name}, {current.location.country}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{Math.round(current.main.temp)}°C</div>
            <div className="text-muted-foreground text-sm">
              Feels like {Math.round(current.main.feels_like)}°C
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img 
              src={getWeatherIcon(current.weather.icon)} 
              alt={current.weather.description}
              className="w-16 h-16 mr-2" 
            />
            <div>
              <div className="font-medium capitalize">{current.weather.description}</div>
              <div className="text-sm text-muted-foreground">
                Updated at {formatTime(current.dt)}
              </div>
            </div>
          </div>
          <div className="text-sm text-right">
            <div>High: {Math.round(current.main.temp_max)}°C</div>
            <div>Low: {Math.round(current.main.temp_min)}°C</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-2">
          <div className="flex items-center">
            <Wind className="w-4 h-4 mr-2 text-muted-foreground" />
            <div className="text-sm">{current.wind.speed} m/s</div>
          </div>
          <div className="flex items-center">
            <Droplets className="w-4 h-4 mr-2 text-muted-foreground" />
            <div className="text-sm">{current.main.humidity}%</div>
          </div>
          <div className="flex items-center">
            <Gauge className="w-4 h-4 mr-2 text-muted-foreground" />
            <div className="text-sm">{current.main.pressure} hPa</div>
          </div>
          <div className="flex items-center">
            <Cloud className="w-4 h-4 mr-2 text-muted-foreground" />
            <div className="text-sm">{current.clouds.all}%</div>
          </div>
          {current.rain && (current.rain['1h'] || current.rain['3h']) && (
            <div className="flex items-center">
              <CloudRain className="w-4 h-4 mr-2 text-muted-foreground" />
              <div className="text-sm">
                {current.rain['1h'] ? `${current.rain['1h']} mm/h` : `${current.rain['3h']} mm/3h`}
              </div>
            </div>
          )}
          <div className="flex items-center">
            <Thermometer className="w-4 h-4 mr-2 text-muted-foreground" />
            <div className="text-sm">Visibility: {(current.visibility / 1000).toFixed(1)} km</div>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground mt-4">
          <div className="flex justify-between">
            <span>Sunrise: {formatTime(current.sunrise)}</span>
            <span>Sunset: {formatTime(current.sunset)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ForecastCard({ weatherData }: { weatherData: WeatherData }) {
  const { forecast } = weatherData;
  
  if (!forecast) return null;
  
  const groupedForecast = groupForecastByDay(forecast.forecastItems);
  
  // Get the next 3 days excluding today
  const today = new Date().toLocaleDateString();
  const forecastDays = Object.keys(groupedForecast).filter(day => day !== today).slice(0, 3);
  
  return (
    <Card>
      <CardHeader className="bg-primary/5 pb-2">
        <CardTitle className="text-xl">3-Day Forecast</CardTitle>
        <CardDescription>
          {forecast.location.name}, {forecast.location.country}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {forecastDays.map((day) => {
            const dayData = groupedForecast[day];
            // Get middle of day forecast
            const middayForecast = dayData.find(item => 
              new Date(item.dt * 1000).getHours() >= 12 && 
              new Date(item.dt * 1000).getHours() <= 14
            ) || dayData[Math.floor(dayData.length / 2)];
            
            // Calculate min and max
            const minTemp = Math.min(...dayData.map(item => item.main.temp_min));
            const maxTemp = Math.max(...dayData.map(item => item.main.temp_max));
            
            const date = new Date(day);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            return (
              <div key={day} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <div className="flex items-center">
                  <img 
                    src={getWeatherIcon(middayForecast.weather[0].icon)} 
                    alt={middayForecast.weather[0].description}
                    className="w-12 h-12 mr-3" 
                  />
                  <div>
                    <div className="font-medium">{dayName}</div>
                    <div className="text-xs text-muted-foreground">{dateString}</div>
                    <div className="text-sm mt-1 capitalize">{middayForecast.weather[0].description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-medium">{Math.round(middayForecast.main.temp)}°C</div>
                  <div className="text-xs text-muted-foreground">
                    H: {Math.round(maxTemp)}°C L: {Math.round(minTemp)}°C
                  </div>
                  <div className="text-xs mt-1">
                    <span className="text-muted-foreground">
                      {middayForecast.main.humidity}% • {middayForecast.wind.speed} m/s
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function HourlyForecastCard({ weatherData }: { weatherData: WeatherData }) {
  const { forecast } = weatherData;
  
  if (!forecast) return null;
  
  // Get next 24 hours
  const next24Hours = forecast.forecastItems.slice(0, 8);
  
  return (
    <Card>
      <CardHeader className="bg-primary/5 pb-2">
        <CardTitle className="text-xl">Hourly Forecast</CardTitle>
        <CardDescription>Next 24 hours</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 overflow-x-auto">
        <div className="grid grid-flow-col gap-4 pb-2 min-w-fit">
          {next24Hours.map((item, index) => (
            <div key={index} className="flex flex-col items-center justify-center min-w-fit">
              <div className="text-sm font-medium mb-1">
                {formatTimeFromDateString(item.dt_txt)}
              </div>
              <img 
                src={getWeatherIcon(item.weather[0].icon)} 
                alt={item.weather[0].description}
                className="w-10 h-10 my-1" 
              />
              <div className="text-sm font-medium">{Math.round(item.main.temp)}°C</div>
              <div className="flex items-center mt-1">
                <Droplets className="w-3 h-3 mr-1 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{item.main.humidity}%</span>
              </div>
              <div className="flex items-center mt-1">
                <Wind className="w-3 h-3 mr-1 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{item.wind.speed} m/s</span>
              </div>
              {item.pop > 0 && (
                <div className="flex items-center mt-1">
                  <CloudRain className="w-3 h-3 mr-1 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{Math.round(item.pop * 100)}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AirQualityCard({ weatherData }: { weatherData: WeatherData }) {
  const { airQuality } = weatherData;
  
  if (!airQuality) return null;
  
  return (
    <Card>
      <CardHeader className="bg-primary/5 pb-2">
        <CardTitle className="text-xl">Air Quality</CardTitle>
        <CardDescription>
          {airQuality.location.name}, {airQuality.location.country}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-medium">Air Quality Index</div>
            <Badge className={`mt-1 ${getAQIColor(airQuality.aqi)}`}>
              {getAQIDescription(airQuality.aqi)}
            </Badge>
          </div>
          <div className="text-4xl font-bold">{airQuality.aqi}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <div className="text-sm font-medium">PM2.5</div>
            <div className="text-lg">{airQuality.components.pm2_5.toFixed(1)} µg/m³</div>
          </div>
          <div>
            <div className="text-sm font-medium">PM10</div>
            <div className="text-lg">{airQuality.components.pm10.toFixed(1)} µg/m³</div>
          </div>
          <div>
            <div className="text-sm font-medium">NO₂</div>
            <div className="text-lg">{airQuality.components.no2.toFixed(1)} µg/m³</div>
          </div>
          <div>
            <div className="text-sm font-medium">O₃</div>
            <div className="text-lg">{airQuality.components.o3.toFixed(1)} µg/m³</div>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground mt-4">
          Updated at {formatDate(airQuality.dt)}
        </div>
      </CardContent>
    </Card>
  );
}

function AgriculturalInsightsCard({ agricData }: { agricData: AgriculturalWeatherData }) {
  const { agriculturalInsights } = agricData;
  
  return (
    <Card>
      <CardHeader className="bg-primary/5 pb-2">
        <CardTitle className="text-xl">Agricultural Insights</CardTitle>
        <CardDescription>
          Weather-based recommendations for farming
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div>
            <div className="font-medium mb-1">Irrigation</div>
            <Badge 
              className={agriculturalInsights.irrigationNeeded.needed ? 
                "bg-orange-100 text-orange-800 border-orange-200" : 
                "bg-blue-100 text-blue-800 border-blue-200"
              }
            >
              {agriculturalInsights.irrigationNeeded.needed ? "Irrigation Needed" : "No Irrigation Needed"}
            </Badge>
            <p className="text-sm mt-2">{agriculturalInsights.irrigationNeeded.reason}</p>
          </div>
          
          <div>
            <div className="font-medium mb-1">Field Workability</div>
            <Badge 
              className={agriculturalInsights.fieldWorkability.workable ? 
                "bg-green-100 text-green-800 border-green-200" : 
                "bg-red-100 text-red-800 border-red-200"
              }
            >
              {agriculturalInsights.fieldWorkability.workable ? "Field is Workable" : "Field Not Workable"}
            </Badge>
            <p className="text-sm mt-2">{agriculturalInsights.fieldWorkability.reason}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-medium mb-1">Pest Risk</div>
              <Badge className={getRiskColor(agriculturalInsights.pestRisks.risk)}>
                {agriculturalInsights.pestRisks.risk.charAt(0).toUpperCase() + agriculturalInsights.pestRisks.risk.slice(1)} Risk
              </Badge>
              <p className="text-sm mt-2">{agriculturalInsights.pestRisks.notes}</p>
            </div>
            
            <div>
              <div className="font-medium mb-1">Disease Risk</div>
              <Badge className={getRiskColor(agriculturalInsights.diseaseRisks.risk)}>
                {agriculturalInsights.diseaseRisks.risk.charAt(0).toUpperCase() + agriculturalInsights.diseaseRisks.risk.slice(1)} Risk
              </Badge>
              <p className="text-sm mt-2">{agriculturalInsights.diseaseRisks.notes}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-medium mb-1">Growing Degree Day</div>
              <div className="text-xl font-medium">{agriculturalInsights.growingDegreeDay} GDD</div>
              <p className="text-sm text-muted-foreground mt-1">Base temperature: 10°C</p>
            </div>
            
            <div>
              <div className="font-medium mb-1">Frost Risk</div>
              <Badge className={getRiskColor(agriculturalInsights.frostRisk.risk)}>
                {agriculturalInsights.frostRisk.risk.charAt(0).toUpperCase() + agriculturalInsights.frostRisk.risk.slice(1)} Risk
              </Badge>
              <p className="text-sm mt-2">{agriculturalInsights.frostRisk.forecast}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WeatherDashboard() {
  const { preferences } = useWeatherPreferences();
  const [location, setLocation] = useState('');
  const [viewType, setViewType] = useState<'standard' | 'agricultural'>('standard');
  
  React.useEffect(() => {
    if (preferences?.location) {
      setLocation(preferences.location);
    }
  }, [preferences]);
  
  const { data: weatherData, isLoading: isLoadingWeather, error: weatherError } = useQuery({
    queryKey: ['/api/weather', location],
    queryFn: () => fetch(`/api/weather?location=${encodeURIComponent(location)}`).then(res => res.json()),
    enabled: !!location,
  });
  
  const { data: agricData, isLoading: isLoadingAgric, error: agricError } = useQuery({
    queryKey: ['/api/weather/agricultural', location],
    queryFn: () => fetch(`/api/weather/agricultural?location=${encodeURIComponent(location)}`).then(res => res.json()),
    enabled: !!location && viewType === 'agricultural',
  });
  
  return (
    <div className="space-y-6">
      <WeatherSearch />
      
      <div className="mb-4">
        <Tabs defaultValue="standard" onValueChange={(value) => setViewType(value as 'standard' | 'agricultural')}>
          <TabsList className="mb-4">
            <TabsTrigger value="standard">Standard Weather</TabsTrigger>
            <TabsTrigger value="agricultural">Agricultural Weather</TabsTrigger>
          </TabsList>
          
          <TabsContent value="standard">
            {!location && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Search for a location</AlertTitle>
                <AlertDescription>
                  Enter a city name in the search box above to view weather information.
                </AlertDescription>
              </Alert>
            )}
            
            {location && isLoadingWeather && (
              <div className="space-y-4">
                <Skeleton className="w-full h-40" />
                <Skeleton className="w-full h-80" />
              </div>
            )}
            
            {location && weatherError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to load weather data. Please try again with a different location.
                </AlertDescription>
              </Alert>
            )}
            
            {weatherData && (
              <div className="grid gap-6 md:grid-cols-2">
                <CurrentWeatherCard weatherData={weatherData} />
                <AirQualityCard weatherData={weatherData} />
                <div className="md:col-span-2">
                  <HourlyForecastCard weatherData={weatherData} />
                </div>
                <div className="md:col-span-2">
                  <ForecastCard weatherData={weatherData} />
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="agricultural">
            {!location && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Search for a location</AlertTitle>
                <AlertDescription>
                  Enter a city name in the search box above to view agricultural weather information.
                </AlertDescription>
              </Alert>
            )}
            
            {location && (isLoadingWeather || isLoadingAgric) && (
              <div className="space-y-4">
                <Skeleton className="w-full h-40" />
                <Skeleton className="w-full h-80" />
              </div>
            )}
            
            {location && (weatherError || agricError) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to load agricultural weather data. Please try again with a different location.
                </AlertDescription>
              </Alert>
            )}
            
            {weatherData && agricData && (
              <div className="grid gap-6 md:grid-cols-2">
                <CurrentWeatherCard weatherData={weatherData} />
                <AgriculturalInsightsCard agricData={agricData} />
                <div className="md:col-span-2">
                  <HourlyForecastCard weatherData={weatherData} />
                </div>
                <div className="md:col-span-2">
                  <ForecastCard weatherData={weatherData} />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function WeatherPage() {
  return (
    <DashboardLayout title="Weather Dashboard">
      <div className="container max-w-7xl mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Weather Dashboard</h1>
          <p className="text-muted-foreground">
            View current weather, forecasts and agricultural insights to help plan your farming activities.
          </p>
        </div>
        
        <WeatherDashboard />
      </div>
    </DashboardLayout>
  );
}