import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WeatherPreferences } from "@/components/farmer/WeatherPreferences";
import { useWeatherPreferences } from "@/hooks/use-weather-preferences";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Loader2, Cloud, Droplets, Thermometer, Wind, CloudRain, Sun, 
  RefreshCw, AlertTriangle, Calendar, Sprout, BarChart4, CloudFog, 
  CloudLightning, CloudSnow, CloudDrizzle, CloudSun, Umbrella
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { format, subMonths } from "date-fns";

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
  suitabilityScore: number;
  optimalPlantingWindow: {
    start: string;
    end: string;
  };
  expectedYield: number;
  yieldUnit: string;
  comments: string[];
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

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const [climateData, setClimateData] = useState<ClimateData | null>(null);
  const [loadingClimate, setLoadingClimate] = useState(false);
  const [cropRecommendations, setCropRecommendations] = useState<CropRecommendation[] | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [historicalData, setHistoricalData] = useState<HistoricalWeatherData | null>(null);
  const [loadingHistorical, setLoadingHistorical] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  
  const { preferences, isLoading } = useWeatherPreferences();
  const { toast } = useToast();
  
  // Set first location as active when preferences load
  useEffect(() => {
    if (preferences?.locations && preferences.locations.length > 0 && !activeLocation) {
      setActiveLocation(preferences.locations[0]);
    }
  }, [preferences, activeLocation]);
  
  // Fetch weather for the active location
  useEffect(() => {
    if (!activeLocation) return;
    
    const fetchWeather = async () => {
      setLoadingWeather(true);
      try {
        const response = await fetch(`/api/weather?location=${encodeURIComponent(activeLocation)}`);
        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }
        const data = await response.json();
        setWeatherData(data);
      } catch (error) {
        console.error("Error fetching weather:", error);
        toast({
          title: "Error fetching weather data",
          description: "Please check your connection and try again",
          variant: "destructive",
        });
      } finally {
        setLoadingWeather(false);
      }
    };
    
    fetchWeather();
  }, [activeLocation, toast]);
  
  // Format temperature based on user preference
  const formatTemperature = (temp: number) => {
    if (!preferences) return `${temp}°C`;
    
    if (preferences.temperatureUnit === 'fahrenheit') {
      const fahrenheit = (temp * 9/5) + 32;
      return `${Math.round(fahrenheit)}°F`;
    }
    
    return `${temp}°C`;
  };
  
  // Refresh weather data
  const handleRefreshWeather = () => {
    if (activeLocation) {
      setWeatherData(null);
      setActiveLocation(activeLocation); // This will trigger the useEffect to refetch
    }
  };

  // Fetch climate data
  const fetchClimateData = async () => {
    if (!activeLocation) return;
    
    setLoadingClimate(true);
    try {
      const response = await fetch(`/api/weather/climate?location=${encodeURIComponent(activeLocation)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch climate data");
      }
      const data = await response.json();
      setClimateData(data);
    } catch (error) {
      console.error("Error fetching climate data:", error);
      toast({
        title: "Error fetching climate data",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    } finally {
      setLoadingClimate(false);
    }
  };

  // Fetch crop recommendations
  const fetchCropRecommendations = async () => {
    if (!activeLocation) return;
    
    setLoadingRecommendations(true);
    try {
      const response = await fetch(`/api/crop-recommendations?location=${encodeURIComponent(activeLocation)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch crop recommendations");
      }
      const data = await response.json();
      setCropRecommendations(data);
    } catch (error) {
      console.error("Error fetching crop recommendations:", error);
      toast({
        title: "Error fetching crop recommendations",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Fetch historical weather data
  const fetchHistoricalData = async () => {
    if (!activeLocation || !dateRange?.from || !dateRange?.to) return;
    
    setLoadingHistorical(true);
    try {
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to, 'yyyy-MM-dd');
      
      const response = await fetch(
        `/api/weather/historical?location=${encodeURIComponent(activeLocation)}&startDate=${startDate}&endDate=${endDate}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch historical weather data");
      }
      
      const data = await response.json();
      setHistoricalData(data);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      toast({
        title: "Error fetching historical weather data",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    } finally {
      setLoadingHistorical(false);
    }
  };

  // Get weather icon based on condition
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className="h-10 w-10 text-yellow-500" />;
      case 'sunny':
        return <Sun className="h-10 w-10 text-yellow-500" />;
      case 'rain':
        return <CloudRain className="h-10 w-10 text-blue-500" />;
      case 'drizzle':
        return <CloudDrizzle className="h-10 w-10 text-blue-300" />;
      case 'thunderstorm':
        return <CloudLightning className="h-10 w-10 text-purple-500" />;
      case 'snow':
        return <CloudSnow className="h-10 w-10 text-blue-200" />;
      case 'mist':
      case 'fog':
        return <CloudFog className="h-10 w-10 text-gray-400" />;
      case 'partly cloudy':
        return <CloudSun className="h-10 w-10 text-gray-400" />;
      default:
        return <Cloud className="h-10 w-10 text-gray-500" />;
    }
  };
  
  return (
    <DashboardLayout
      title="Weather Services"
      description="Monitor weather conditions and set up your preferences"
    >
      <div className="grid gap-8">
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="mb-4 flex flex-wrap">
            <TabsTrigger value="current">Current Weather</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="climate">Climate Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">Crop Recommendations</TabsTrigger>
            <TabsTrigger value="historical">Historical Data</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
            <div className="grid gap-6">
              {/* Location selector */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">Locations</CardTitle>
                  <CardDescription>Select a location to view weather data</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : !preferences?.locations || preferences.locations.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>No locations added yet.</p>
                      <p className="text-sm">Go to the Preferences tab to add locations.</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {preferences.locations.map((location) => (
                        <Badge
                          key={location}
                          variant={activeLocation === location ? "default" : "outline"}
                          className="cursor-pointer px-3 py-1 text-sm"
                          onClick={() => setActiveLocation(location)}
                        >
                          {location}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Weather Alerts if present */}
              {weatherData?.alerts && weatherData.alerts.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Weather Alerts for {activeLocation}</AlertTitle>
                  <AlertDescription>
                    <ScrollArea className="h-[100px] mt-2">
                      {weatherData.alerts.map((alert, index) => (
                        <div key={index} className="mb-2 pb-2 border-b border-destructive/20 last:border-0">
                          <div className="font-semibold">{alert.event}</div>
                          <div className="text-sm">{alert.description}</div>
                        </div>
                      ))}
                    </ScrollArea>
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Current weather */}
              {activeLocation && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Current Weather in {activeLocation}</CardTitle>
                      <CardDescription>
                        {weatherData?.current ? 
                          `Updated ${new Date(weatherData?.current?.timestamp * 1000).toLocaleTimeString()}` : 
                          "Loading weather data..."}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleRefreshWeather}
                      disabled={loadingWeather}
                    >
                      {loadingWeather ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loadingWeather ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      </div>
                    ) : !weatherData ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No weather data available for this location.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col items-center justify-center p-6 bg-primary/5 rounded-lg">
                          <div className="text-6xl font-bold mb-2">
                            {formatTemperature(weatherData.current.temp)}
                          </div>
                          <div className="text-xl text-muted-foreground">
                            {weatherData.current.description || weatherData.current.condition}
                          </div>
                          <div className="mt-4 flex items-center gap-2">
                            {getWeatherIcon(weatherData.current.condition)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col items-center p-4 bg-primary/5 rounded-lg">
                            <Thermometer className="h-8 w-8 mb-2 text-red-500" />
                            <div className="text-sm text-muted-foreground">Feels Like</div>
                            <div className="text-xl font-semibold">
                              {formatTemperature(weatherData.current.feelsLike || weatherData.current.temp)}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center p-4 bg-primary/5 rounded-lg">
                            <Droplets className="h-8 w-8 mb-2 text-blue-500" />
                            <div className="text-sm text-muted-foreground">Humidity</div>
                            <div className="text-xl font-semibold">
                              {weatherData.current.humidity}%
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center p-4 bg-primary/5 rounded-lg">
                            <Wind className="h-8 w-8 mb-2 text-teal-500" />
                            <div className="text-sm text-muted-foreground">Wind</div>
                            <div className="text-xl font-semibold">
                              {weatherData.current.windSpeed} km/h
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center p-4 bg-primary/5 rounded-lg">
                            <Cloud className="h-8 w-8 mb-2 text-gray-500" />
                            <div className="text-sm text-muted-foreground">Cloud Cover</div>
                            <div className="text-xl font-semibold">
                              {weatherData.current.cloudCover || 0}%
                            </div>
                          </div>

                          <div className="flex flex-col items-center p-4 bg-primary/5 rounded-lg">
                            <Umbrella className="h-8 w-8 mb-2 text-indigo-500" />
                            <div className="text-sm text-muted-foreground">Pressure</div>
                            <div className="text-xl font-semibold">
                              {weatherData.current.pressure} hPa
                            </div>
                          </div>

                          <div className="flex flex-col items-center p-4 bg-primary/5 rounded-lg">
                            <Sun className="h-8 w-8 mb-2 text-orange-500" />
                            <div className="text-sm text-muted-foreground">UV Index</div>
                            <div className="text-xl font-semibold">
                              {weatherData.current.uv || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="forecast">
            <Card>
              <CardHeader>
                <CardTitle>Weather Forecast</CardTitle>
                <CardDescription>
                  {activeLocation 
                    ? `5-day forecast for ${activeLocation}` 
                    : "Select a location to view forecast"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!activeLocation ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No location selected.</p>
                    <p className="text-sm">Choose a location from the Current Weather tab.</p>
                  </div>
                ) : loadingWeather ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  </div>
                ) : !weatherData?.forecast ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Forecast data not available for this location.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {weatherData.forecast.map((day, index) => (
                      <div key={index} className="flex flex-col items-center p-4 border rounded-lg">
                        <div className="font-medium mb-2">{day.dayOfWeek}, {day.date}</div>
                        <div className="text-3xl mb-3">
                          {getWeatherIcon(day.condition)}
                        </div>
                        <div className="text-lg font-semibold">
                          {formatTemperature(day.temp.max)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatTemperature(day.temp.min)}
                        </div>
                        <div className="mt-2 text-sm">
                          {day.description || day.condition}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Rain: {day.precipitation || 0}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="climate">
            <Card>
              <CardHeader>
                <CardTitle>Climate Analysis</CardTitle>
                <CardDescription>
                  Climate data and seasonal patterns for {activeLocation || "your location"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!activeLocation ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No location selected.</p>
                    <p className="text-sm">Choose a location from the Current Weather tab.</p>
                  </div>
                ) : (
                  <div>
                    {!climateData && !loadingClimate ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-4">
                        <p className="text-muted-foreground">
                          Climate data helps understand seasonal patterns and make better agricultural decisions.
                        </p>
                        <Button 
                          onClick={fetchClimateData}
                          className="mt-2"
                        >
                          Load Climate Data
                        </Button>
                      </div>
                    ) : loadingClimate ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      </div>
                    ) : climateData && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Soil Conditions Card */}
                          <Card className="overflow-hidden">
                            <CardHeader className="bg-primary/5 pb-2">
                              <CardTitle className="text-lg">Soil Conditions</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                              <div className="space-y-4">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Soil Type</span>
                                    <span className="font-medium">{climateData.soilConditions.type}</span>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Soil pH</span>
                                    <span className="font-medium">{climateData.soilConditions.ph.toFixed(1)}</span>
                                  </div>
                                  <Progress value={((climateData.soilConditions.ph - 4) / 6) * 100} className="h-2" />
                                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>Acidic (4.0)</span>
                                    <span>Neutral (7.0)</span>
                                    <span>Alkaline (10.0)</span>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Soil Moisture</span>
                                    <span className="font-medium">{climateData.soilConditions.moisture.toFixed(0)}%</span>
                                  </div>
                                  <Progress value={climateData.soilConditions.moisture} className="h-2" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          {/* Growing Season Card */}
                          <Card className="overflow-hidden">
                            <CardHeader className="bg-primary/5 pb-2">
                              <CardTitle className="text-lg">Growing Season</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Season Length:</span>
                                  <span className="font-medium">{climateData.growingSeasonLength} days</span>
                                </div>
                                
                                <Progress 
                                  value={(climateData.growingSeasonLength / 365) * 100} 
                                  className="h-2.5" 
                                />
                                
                                <div className="bg-primary/5 p-3 rounded-md mt-4">
                                  <div className="text-sm font-medium mb-1">Growing Season Assessment</div>
                                  <div className="text-sm text-muted-foreground">
                                    {climateData.growingSeasonLength > 270 
                                      ? "Long growing season suitable for multiple harvests and heat-loving crops."
                                      : climateData.growingSeasonLength > 180
                                      ? "Average growing season suitable for most common crops."
                                      : "Short growing season - focus on cold-tolerant and fast-maturing crops."}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        {/* Monthly Climate Data */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Monthly Climate Averages</CardTitle>
                            <CardDescription>Temperature, precipitation, and growing degree days by month</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[640px] table-auto">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left px-4 py-2 font-medium">Month</th>
                                    <th className="text-center px-4 py-2 font-medium">Avg. Temp</th>
                                    <th className="text-center px-4 py-2 font-medium">Precipitation</th>
                                    <th className="text-center px-4 py-2 font-medium">Growing Degree Days</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {climateData.monthlyAverages.map((month, index) => (
                                    <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                                      <td className="px-4 py-2">{month.month}</td>
                                      <td className="px-4 py-2 text-center">
                                        {formatTemperature(month.averageTemp)}
                                      </td>
                                      <td className="px-4 py-2 text-center">
                                        {month.averagePrecipitation.toFixed(1)} mm
                                      </td>
                                      <td className="px-4 py-2 text-center">
                                        {month.growingDegreeDays.toFixed(0)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </CardContent>
                          <CardFooter className="bg-muted/30 text-sm text-muted-foreground">
                            <div>
                              Growing Degree Days (GDD) indicate heat accumulation for crop growth (base 10°C).
                            </div>
                          </CardFooter>
                        </Card>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle>Crop Recommendations</CardTitle>
                <CardDescription>
                  Crops that are suitable for the climate in {activeLocation || "your location"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!activeLocation ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No location selected.</p>
                    <p className="text-sm">Choose a location from the Current Weather tab.</p>
                  </div>
                ) : (
                  <div>
                    {!cropRecommendations && !loadingRecommendations ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-4">
                        <p className="text-muted-foreground">
                          Our AI-powered system can recommend the best crops to plant based on local climate data.
                        </p>
                        <Button 
                          onClick={fetchCropRecommendations}
                          className="mt-2"
                        >
                          <Sprout className="mr-2 h-4 w-4" />
                          Get Crop Recommendations
                        </Button>
                      </div>
                    ) : loadingRecommendations ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      </div>
                    ) : cropRecommendations && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {cropRecommendations.slice(0, 6).map((crop, index) => (
                            <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="font-semibold text-lg">{crop.cropName}</h3>
                                  <p className="text-sm text-muted-foreground">Variety: {crop.variety}</p>
                                </div>
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <div className="flex items-center gap-1 bg-primary/10 py-1 px-2 rounded">
                                      <BarChart4 className="h-4 w-4" />
                                      <span className="font-medium">{crop.suitabilityScore}/100</span>
                                    </div>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-80">
                                    <div className="font-medium mb-1">Suitability Score Explained</div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                      This score represents how well the crop is suited to your local climate
                                      and soil conditions:
                                    </p>
                                    <ul className="text-sm space-y-1">
                                      <li>• 80-100: Excellent match</li>
                                      <li>• 60-79: Good match</li>
                                      <li>• 40-59: Fair match</li>
                                      <li>• Below 40: Challenging</li>
                                    </ul>
                                  </HoverCardContent>
                                </HoverCard>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-primary/5 p-3 rounded">
                                  <div className="text-xs text-muted-foreground">Planting Window</div>
                                  <div className="font-medium">
                                    {crop.optimalPlantingWindow.start} - {crop.optimalPlantingWindow.end}
                                  </div>
                                </div>
                                
                                <div className="bg-primary/5 p-3 rounded">
                                  <div className="text-xs text-muted-foreground">Expected Yield</div>
                                  <div className="font-medium">
                                    {crop.expectedYield.toFixed(1)} {crop.yieldUnit}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-sm">
                                <div className="font-medium mb-1">Notes:</div>
                                <ul className="list-disc list-inside text-muted-foreground">
                                  {crop.comments.map((comment, i) => (
                                    <li key={i}>{comment}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {cropRecommendations.length > 6 && (
                          <div className="bg-muted/30 p-4 rounded-lg text-sm text-center">
                            <p className="text-muted-foreground">
                              Showing top 6 recommended crops out of {cropRecommendations.length} suitable options.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="historical">
            <Card>
              <CardHeader>
                <CardTitle>Historical Weather Data</CardTitle>
                <CardDescription>
                  View historical weather patterns for {activeLocation || "your location"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!activeLocation ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No location selected.</p>
                    <p className="text-sm">Choose a location from the Current Weather tab.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-3">
                        Select a date range to view historical weather data:
                      </p>
                      <DateRangePicker 
                        date={dateRange} 
                        onDateChange={setDateRange} 
                      />
                    </div>
                    
                    {dateRange?.from && dateRange?.to && (
                      <div className="flex justify-center">
                        <Button
                          onClick={fetchHistoricalData}
                          disabled={loadingHistorical}
                        >
                          {loadingHistorical ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading data...
                            </>
                          ) : (
                            <>
                              <Calendar className="mr-2 h-4 w-4" />
                              Fetch Historical Data
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                    
                    {historicalData && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-3">
                          Weather History for {historicalData.location}
                        </h3>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[640px] table-auto">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left px-4 py-2 font-medium">Date</th>
                                <th className="text-center px-4 py-2 font-medium">Avg. Temp</th>
                                <th className="text-center px-4 py-2 font-medium">Min Temp</th>
                                <th className="text-center px-4 py-2 font-medium">Max Temp</th>
                                <th className="text-center px-4 py-2 font-medium">Humidity</th>
                                <th className="text-center px-4 py-2 font-medium">Precipitation</th>
                              </tr>
                            </thead>
                            <tbody>
                              {historicalData.dates.map((day, index) => (
                                <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                                  <td className="px-4 py-2">{day.date}</td>
                                  <td className="px-4 py-2 text-center">
                                    {formatTemperature(day.averageTemp)}
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    {formatTemperature(day.minTemp)}
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    {formatTemperature(day.maxTemp)}
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    {day.humidity.toFixed(0)}%
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    {day.precipitation.toFixed(1)} mm
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences">
            <WeatherPreferences />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}