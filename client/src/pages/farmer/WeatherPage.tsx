import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WeatherPreferences } from "@/components/farmer/WeatherPreferences";
import { PlantingRecommendations } from "@/components/farmer/PlantingRecommendations";
import { useWeatherPreferences } from "@/hooks/use-weather-preferences";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Cloud, Droplets, Thermometer, Wind, CloudRain, Sun, RefreshCw, Sparkles } from "lucide-react";

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const { preferences, isLoading } = useWeatherPreferences();
  
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
      } finally {
        setLoadingWeather(false);
      }
    };
    
    fetchWeather();
  }, [activeLocation]);
  
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
  
  return (
    <DashboardLayout
      title="Weather Services"
      description="Monitor weather conditions and get AI-powered planting recommendations"
    >
      <div className="grid gap-8">
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="current">Current Weather</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="planting">
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                Planting Recommendations
              </div>
            </TabsTrigger>
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
              
              {/* Current weather */}
              {activeLocation && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Current Weather in {activeLocation}</CardTitle>
                      <CardDescription>Updated {weatherData?.current?.timestamp || "recently"}</CardDescription>
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
                            {weatherData.current.condition}
                          </div>
                          <div className="mt-4 flex items-center gap-2">
                            <div className="text-3xl">
                              {weatherData.current.condition === "Clear" ? (
                                <Sun className="h-10 w-10 text-yellow-500" />
                              ) : weatherData.current.condition === "Rain" ? (
                                <CloudRain className="h-10 w-10 text-blue-500" />
                              ) : (
                                <Cloud className="h-10 w-10 text-gray-500" />
                              )}
                            </div>
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
                    {weatherData.forecast.map((day: any, index: number) => (
                      <div key={index} className="flex flex-col items-center p-4 border rounded-lg">
                        <div className="font-medium mb-2">{day.date}</div>
                        <div className="text-3xl mb-3">
                          {day.condition === "Clear" ? (
                            <Sun className="h-10 w-10 text-yellow-500" />
                          ) : day.condition === "Rain" ? (
                            <CloudRain className="h-10 w-10 text-blue-500" />
                          ) : (
                            <Cloud className="h-10 w-10 text-gray-500" />
                          )}
                        </div>
                        <div className="text-lg font-semibold">
                          {formatTemperature(day.maxTemp)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatTemperature(day.minTemp)}
                        </div>
                        <div className="mt-2 text-sm">
                          {day.condition}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Rain: {day.rainChance || 0}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="planting">
            <PlantingRecommendations />
          </TabsContent>
          
          <TabsContent value="preferences">
            <WeatherPreferences />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}