import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Loader2,
  Cloud,
  Droplets,
  Thermometer,
  Wind,
  CloudRain,
  Sun,
  RefreshCw,
  AlertTriangle,
  Calendar,
  BarChart4,
  CloudFog,
  CloudLightning,
  CloudSnow,
  CloudDrizzle,
  CloudSun,
  Umbrella,
  CalendarDays,
  BarChart2,
  History,
  Settings,
  MapPin,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Zap,
  Shield,
  Leaf,
  Sprout,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

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

interface WeatherPreferences {
  id: number;
  userId: number;
  locations: string[] | null;
  alertsEnabled: boolean | null;
  temperatureUnit: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface EnhancedWeatherDashboardProps {
  weatherData: WeatherData | null;
  preferences: WeatherPreferences | null;
  loading: boolean;
  onRefresh: () => void;
  activeLocation: string | null;
}

export function EnhancedWeatherDashboard({
  weatherData,
  preferences,
  loading,
  onRefresh,
  activeLocation,
}: EnhancedWeatherDashboardProps) {
  const { toast } = useToast();

  // Format temperature based on user preference
  const formatTemperature = (temp: number) => {
    if (!preferences) return `${Math.round(temp)}°C`;

    if (preferences.temperatureUnit === "fahrenheit") {
      const fahrenheit = (temp * 9) / 5 + 32;
      return `${Math.round(fahrenheit)}°F`;
    }

    return `${Math.round(temp)}°C`;
  };

  // Get weather icon based on condition
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "clear":
        return <Sun className="h-6 w-6 text-yellow-500" />;
      case "sunny":
        return <Sun className="h-6 w-6 text-yellow-500" />;
      case "rain":
        return <CloudRain className="h-6 w-6 text-blue-500" />;
      case "drizzle":
        return <CloudDrizzle className="h-6 w-6 text-blue-300" />;
      case "thunderstorm":
        return <CloudLightning className="h-6 w-6 text-purple-500" />;
      case "snow":
        return <CloudSnow className="h-6 w-6 text-blue-200" />;
      case "mist":
      case "fog":
        return <CloudFog className="h-6 w-6 text-gray-400" />;
      case "partly cloudy":
        return <CloudSun className="h-6 w-6 text-gray-400" />;
      default:
        return <Cloud className="h-6 w-6 text-gray-500" />;
    }
  };

  // Calculate agricultural weather indices
  const calculateAgriculturalIndices = () => {
    if (!weatherData) return null;

    const { current } = weatherData;

    // Frost risk (temperature below 2°C)
    const frostRisk =
      current.temp < 2 ? "High" : current.temp < 5 ? "Medium" : "Low";

    // Drought risk (low humidity and high temperature)
    const droughtRisk =
      current.humidity < 30 && current.temp > 25
        ? "High"
        : current.humidity < 50 && current.temp > 20
        ? "Medium"
        : "Low";

    // Pest pressure (warm and humid conditions)
    const pestPressure =
      current.temp > 20 && current.humidity > 60
        ? "High"
        : current.temp > 15 && current.humidity > 50
        ? "Medium"
        : "Low";

    // Irrigation need (based on temperature and humidity)
    const irrigationNeed =
      current.temp > 25 && current.humidity < 40
        ? "High"
        : current.temp > 20 && current.humidity < 50
        ? "Medium"
        : "Low";

    return {
      frostRisk,
      droughtRisk,
      pestPressure,
      irrigationNeed,
    };
  };

  // Get UV risk level
  const getUVRiskLevel = (uv: number) => {
    if (uv >= 11)
      return {
        level: "Extreme",
        color: "text-purple-600",
        bg: "bg-purple-100",
      };
    if (uv >= 8)
      return { level: "Very High", color: "text-red-600", bg: "bg-red-100" };
    if (uv >= 6)
      return { level: "High", color: "text-orange-600", bg: "bg-orange-100" };
    if (uv >= 3)
      return {
        level: "Moderate",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };
    return { level: "Low", color: "text-green-600", bg: "bg-green-100" };
  };

  // Get wind speed category
  const getWindCategory = (speed: number) => {
    if (speed > 50)
      return { category: "Storm", color: "text-red-600", bg: "bg-red-100" };
    if (speed > 30)
      return {
        category: "Strong",
        color: "text-orange-600",
        bg: "bg-orange-100",
      };
    if (speed > 15)
      return {
        category: "Moderate",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };
    return { category: "Light", color: "text-green-600", bg: "bg-green-100" };
  };

  const agriculturalIndices = calculateAgriculturalIndices();
  const uvRisk = weatherData ? getUVRiskLevel(weatherData.current.uv) : null;
  const windCategory = weatherData
    ? getWindCategory(weatherData.current.windSpeed)
    : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!weatherData) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Weather Data Unavailable</AlertTitle>
        <AlertDescription>
          Unable to load weather data for {activeLocation}. Please check your
          connection and try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Weather Overview */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">
              {weatherData.location}
            </CardTitle>
            <CardDescription>
              Updated{" "}
              {new Date(
                weatherData.current.timestamp * 1000
              ).toLocaleTimeString()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Temperature Display */}
            <div className="flex flex-col items-center justify-center p-6 bg-white/50 dark:bg-white/10 rounded-lg">
              <div className="text-6xl font-bold mb-2">
                {formatTemperature(weatherData.current.temp)}
              </div>
              <div className="text-xl text-muted-foreground mb-4">
                {weatherData.current.description}
              </div>
              <div className="flex items-center gap-2">
                {getWeatherIcon(weatherData.current.condition)}
              </div>
            </div>

            {/* Key Weather Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-4 bg-white/50 dark:bg-white/10 rounded-lg">
                <Thermometer className="h-8 w-8 mb-2 text-red-500" />
                <div className="text-sm text-muted-foreground">Feels Like</div>
                <div className="text-xl font-semibold">
                  {formatTemperature(weatherData.current.feelsLike)}
                </div>
              </div>

              <div className="flex flex-col items-center p-4 bg-white/50 dark:bg-white/10 rounded-lg">
                <Droplets className="h-8 w-8 mb-2 text-blue-500" />
                <div className="text-sm text-muted-foreground">Humidity</div>
                <div className="text-xl font-semibold">
                  {weatherData.current.humidity}%
                </div>
              </div>

              <div className="flex flex-col items-center p-4 bg-white/50 dark:bg-white/10 rounded-lg">
                <Wind className="h-8 w-8 mb-2 text-teal-500" />
                <div className="text-sm text-muted-foreground">Wind</div>
                <div className="text-xl font-semibold">
                  {weatherData.current.windSpeed} km/h
                </div>
              </div>

              <div className="flex flex-col items-center p-4 bg-white/50 dark:bg-white/10 rounded-lg">
                <Eye className="h-8 w-8 mb-2 text-gray-500" />
                <div className="text-sm text-muted-foreground">Visibility</div>
                <div className="text-xl font-semibold">
                  {weatherData.current.visibility / 1000} km
                </div>
              </div>
            </div>

            {/* Agricultural Weather Indices */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Agricultural Indices</h3>
              {agriculturalIndices && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-white/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-500" />
                      <span className="text-sm">Frost Risk</span>
                    </div>
                    <Badge
                      variant={
                        agriculturalIndices.frostRisk === "High"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {agriculturalIndices.frostRisk}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-white/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-orange-500" />
                      <span className="text-sm">Drought Risk</span>
                    </div>
                    <Badge
                      variant={
                        agriculturalIndices.droughtRisk === "High"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {agriculturalIndices.droughtRisk}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-white/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Pest Pressure</span>
                    </div>
                    <Badge
                      variant={
                        agriculturalIndices.pestPressure === "High"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {agriculturalIndices.pestPressure}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-white/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Umbrella className="h-5 w-5 text-blue-500" />
                      <span className="text-sm">Irrigation Need</span>
                    </div>
                    <Badge
                      variant={
                        agriculturalIndices.irrigationNeed === "High"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {agriculturalIndices.irrigationNeed}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Weather Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* UV Index */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              UV Index
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {weatherData.current.uv}
            </div>
            {uvRisk && (
              <Badge className={`${uvRisk.bg} ${uvRisk.color} border-0`}>
                {uvRisk.level}
              </Badge>
            )}
            <Progress
              value={(weatherData.current.uv / 11) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Pressure */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Pressure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {weatherData.current.pressure} hPa
            </div>
            <div className="text-sm text-muted-foreground">
              {weatherData.current.pressure > 1013 ? "High" : "Low"} pressure
            </div>
          </CardContent>
        </Card>

        {/* Cloud Cover */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Cloud Cover
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {weatherData.current.cloudCover}%
            </div>
            <Progress value={weatherData.current.cloudCover} className="mt-2" />
          </CardContent>
        </Card>

        {/* Wind Category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wind className="h-4 w-4" />
              Wind Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {weatherData.current.windSpeed} km/h
            </div>
            {windCategory && (
              <Badge
                className={`${windCategory.bg} ${windCategory.color} border-0`}
              >
                {windCategory.category}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weather Alerts */}
      {weatherData.alerts && weatherData.alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Weather Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              {weatherData.alerts.map((alert, index) => (
                <div
                  key={index}
                  className="mb-4 p-3 bg-white/50 dark:bg-white/10 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="destructive">{alert.severity}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(alert.start * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-semibold mb-1">{alert.event}</h4>
                  <p className="text-sm text-muted-foreground">
                    {alert.description}
                  </p>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* 5-Day Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            5-Day Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {weatherData.forecast.slice(0, 5).map((day, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="font-medium mb-2 text-center">
                  {day.dayOfWeek}
                  <br />
                  <span className="text-sm text-muted-foreground">
                    {day.date}
                  </span>
                </div>
                <div className="text-3xl mb-3">
                  {getWeatherIcon(day.condition)}
                </div>
                <div className="text-lg font-semibold">
                  {formatTemperature(day.temp.max)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatTemperature(day.temp.min)}
                </div>
                <div className="mt-2 text-sm text-center">
                  {day.description}
                </div>
                <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                  <Umbrella className="h-3 w-3" />
                  {day.precipitation || 0}%
                </div>
                <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                  <Wind className="h-3 w-3" />
                  {day.windSpeed} km/h
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
