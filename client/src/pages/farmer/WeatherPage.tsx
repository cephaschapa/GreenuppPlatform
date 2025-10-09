import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WeatherPreferences } from "@/components/farmer/WeatherPreferences";
import { EnhancedWeatherDashboard } from "@/components/farmer/EnhancedWeatherDashboard";
import { WeatherAlertSystem } from "@/components/farmer/WeatherAlertSystem";
import { useWeatherPreferences } from "@/hooks/use-weather-preferences";
import RegionalSeedRecommendations from "@/components/RegionalSeedRecommendations";
// import { WeatherPreferences as WeatherPreferencesType } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Cloud,
  // Droplets,
  // Thermometer,
  // Wind,
  CloudRain,
  Sun,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Sprout,
  BarChart4,
  CloudFog,
  CloudLightning,
  CloudSnow,
  CloudDrizzle,
  CloudSun,
  // Umbrella,
  // CalendarDays,
  // BarChart2,
  History,
  Settings,
  MapPin,
  Navigation,
} from "lucide-react";
// import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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
import { Input } from "@/components/ui/input";

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
  const [activeLocation, setActiveLocation] = useState<string | null>(() => {
    // Try to get the last active location from localStorage
    const savedLocation = localStorage.getItem("weatherActiveLocation");
    return savedLocation || null;
  });
  const [climateData, setClimateData] = useState<ClimateData | null>(null);
  const [loadingClimate, setLoadingClimate] = useState(false);
  const [cropRecommendations, setCropRecommendations] = useState<
    CropRecommendation[] | null
  >(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [historicalData, setHistoricalData] =
    useState<HistoricalWeatherData | null>(null);
  const [loadingHistorical, setLoadingHistorical] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [hasAttemptedAutoDetect, setHasAttemptedAutoDetect] = useState(false);
  const [detectedCoordinates, setDetectedCoordinates] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [detectedLocationData, setDetectedLocationData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const { preferences, isLoading } = useWeatherPreferences();
  const { toast } = useToast();

  // Extract city name from full location string
  const extractCityName = (fullLocation: string): string => {
    const suffixes = [
      "District",
      "City",

      "Village",
      "Municipality",
      "Province",
      "State",
      "County",
      "Region",
      "Area",
      "Zone",
      "Territory",
      "Department",
      "Prefecture",
    ];

    let cityName = fullLocation;

    // Remove common suffixes
    for (const suffix of suffixes) {
      const regex = new RegExp(`\\s+${suffix}$`, "i");
      cityName = cityName.replace(regex, "");
    }

    // Also handle cases with commas (e.g., "Lusaka, Central Province")
    if (cityName.includes(",")) {
      cityName = cityName.split(",")[0].trim();
    }

    return cityName.trim();
  };

  // Save current location to preferences
  const saveLocation = async () => {
    if (!activeLocation) {
      toast({
        title: "No location to save",
        description: "Please detect or select a location first",
        variant: "destructive",
      });
      return;
    }

    // Use the extracted city name for saving
    const cityName = extractCityName(activeLocation);

    if (preferences?.locations?.includes(cityName)) {
      toast({
        title: "Location already saved",
        description: `${cityName} is already in your saved locations`,
      });
      return;
    }

    try {
      const currentLocations = preferences?.locations || [];
      const updatedLocations = [...currentLocations, cityName];

      const updateData = {
        userId: preferences?.userId || 0,
        locations: updatedLocations,
        alertsEnabled: preferences?.alertsEnabled ?? true,
        temperatureUnit: preferences?.temperatureUnit || "celsius",
      };

      const response = await fetch("/api/weather-preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to save location");
      }

      toast({
        title: "Location saved!",
        description: `${cityName} has been added to your saved locations`,
      });

      // Refresh preferences data
      window.location.reload(); // Simple refresh to update the UI
    } catch (error) {
      // console.error("Error saving location:", error);
      toast({
        title: "Failed to save location",
        description: "Please try again or save it manually in Preferences",
        variant: "destructive",
      });
    }
  };

  // Auto-detect user's current location
  const detectCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location detection failed",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setIsDetectingLocation(true);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000, // 1 minute cache
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // Store the coordinates
      setDetectedCoordinates({ lat: latitude, lon: longitude });

      // Use our server's reverse geocoding endpoint
      const response = await fetch(
        `/api/weather/reverse-geocode?lat=${latitude}&lon=${longitude}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch location data");
      }

      const data = await response.json();

      if (data && data.name) {
        const fullLocationName = data.name;
        const locationName = extractCityName(fullLocationName);

        // Store the full location data for display
        setDetectedLocationData(data);

        // Set as active location immediately
        setActiveLocation(locationName);

        // Reset all data when changing location
        setWeatherData(null);
        setClimateData(null);
        setCropRecommendations(null);
        setHistoricalData(null);

        toast({
          title: "Location detected!",
          description: `Weather data for ${locationName} is now loading`,
        });

        // Note: Users can now save the location using the "Save Location" button
        // that appears next to the location display
      } else {
        throw new Error("Location not found");
      }
    } catch (error: any) {
      // console.error("Error detecting location:", error);

      let errorMessage =
        "Unable to determine your current location. Please add it manually.";

      if (error.code === 1) {
        errorMessage =
          "Location access denied. Please allow location access in your browser settings.";
      } else if (error.code === 2) {
        errorMessage =
          "Location unavailable. Please check your device's location services.";
      } else if (error.code === 3) {
        errorMessage = "Location request timed out. Please try again.";
      }

      // Only show error toast if this was a manual detection attempt
      if (hasAttemptedAutoDetect) {
        toast({
          title: "Location detection failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Auto-detect location on page load if no location is set
  useEffect(() => {
    if (
      !activeLocation &&
      !isLoading &&
      !hasAttemptedAutoDetect &&
      navigator.geolocation
    ) {
      setHasAttemptedAutoDetect(true);
      // console.log("Attempting to auto-detect location...");

      // Check if we have permission to access location
      navigator.permissions
        ?.query({ name: "geolocation" })
        .then((permissionStatus) => {
          if (permissionStatus.state === "granted") {
            // User has already granted permission, auto-detect
            // console.log("Location permission granted, detecting location...");
            detectCurrentLocation();
          } else {
            // console.log(
            //   "Location permission not granted:",
            //   permissionStatus.state
            // );
          }
          // If permission is 'denied' or 'prompt', don't auto-detect to avoid annoying the user
        })
        .catch(() => {
          // Permissions API not supported, don't auto-detect
          // console.log("Permissions API not supported");
        });
    }
  }, [activeLocation, isLoading, hasAttemptedAutoDetect]);

  // Save active location to localStorage whenever it changes
  useEffect(() => {
    if (activeLocation) {
      localStorage.setItem("weatherActiveLocation", activeLocation);
    } else {
      // Clear localStorage if no active location
      localStorage.removeItem("weatherActiveLocation");
    }
  }, [activeLocation]);

  // Validate and set active location when preferences load
  useEffect(() => {
    if (preferences?.locations && preferences.locations.length > 0) {
      // If we have a saved location, check if it's still in user's preferences
      if (activeLocation && preferences.locations.includes(activeLocation)) {
        // Saved location is still valid, keep it
        // console.log("Using saved active location:", activeLocation);
      } else if (
        !activeLocation ||
        !preferences.locations.includes(activeLocation)
      ) {
        // Either no active location or saved location is no longer in preferences
        // Set the first location as active
        // console.log(
        //   "Setting active location from preferences:",
        //   preferences.locations[0]
        // );
        setActiveLocation(preferences.locations[0]);
      }
    }
  }, [preferences, activeLocation]);

  // Fetch weather for the active location
  useEffect(() => {
    if (!activeLocation) {
      // console.log("No active location, skipping weather fetch");
      return;
    }

    // console.log("Fetching weather for location:", activeLocation);
    const fetchWeather = async () => {
      setLoadingWeather(true);
      try {
        const response = await fetch(
          `/api/weather?location=${encodeURIComponent(activeLocation)}`
        );

        // Handle different response statuses
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          // Check for specific API key issues
          if (
            response.status === 500 &&
            errorData.message?.includes("API key")
          ) {
            throw new Error(
              "API key issue - Weather service temporarily unavailable"
            );
          } else if (response.status === 401) {
            throw new Error("Authentication required to access weather data");
          } else {
            throw new Error("Failed to fetch weather data");
          }
        }

        const data = await response.json();
        setWeatherData(data);
      } catch (error: any) {
        // console.error("Error fetching weather:", error);

        // Provide a user-friendly error message
        toast({
          title: "Weather Data Unavailable",
          description:
            error.message || "Please check your connection and try again later",
          variant: "destructive",
        });

        // Set a null weather data state to show the error UI
        setWeatherData(null);
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [activeLocation, toast]);

  // Format temperature based on user preference
  const formatTemperature = (temp: number) => {
    if (!preferences) return `${temp}°C`;

    if (preferences.temperatureUnit === "fahrenheit") {
      const fahrenheit = (temp * 9) / 5 + 32;
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
      const response = await fetch(
        `/api/weather/climate?location=${encodeURIComponent(activeLocation)}`
      );

      // Handle different response statuses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Check for specific API key issues
        if (response.status === 500 && errorData.message?.includes("API key")) {
          throw new Error(
            "API key issue - Climate service temporarily unavailable"
          );
        } else if (response.status === 401) {
          throw new Error("Authentication required to access climate data");
        } else {
          throw new Error("Failed to fetch climate data");
        }
      }

      const data = await response.json();
      setClimateData(data);
    } catch (error: any) {
      // console.error("Error fetching climate data:", error);

      toast({
        title: "Climate Data Unavailable",
        description:
          error.message || "Please check your connection and try again later",
        variant: "destructive",
      });

      // Set null climate data to show the error UI
      setClimateData(null);
    } finally {
      setLoadingClimate(false);
    }
  };

  // Fetch crop recommendations
  const fetchCropRecommendations = async () => {
    if (!activeLocation) return;

    setLoadingRecommendations(true);
    try {
      const response = await fetch(
        `/api/weather/crop-recommendations?location=${encodeURIComponent(
          activeLocation
        )}`
      );

      // Handle different response statuses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Check for specific API key issues
        if (response.status === 500 && errorData.message?.includes("API key")) {
          throw new Error(
            "API key issue - Crop recommendation service temporarily unavailable"
          );
        } else if (response.status === 401) {
          throw new Error(
            "Authentication required to access crop recommendations"
          );
        } else {
          throw new Error("Failed to fetch crop recommendations");
        }
      }

      const data = await response.json();
      setCropRecommendations(data);
    } catch (error: any) {
      // console.error("Error fetching crop recommendations:", error);

      toast({
        title: "Crop Recommendations Unavailable",
        description:
          error.message || "Please check your connection and try again later",
        variant: "destructive",
      });

      // Set null recommendations to show the error UI
      setCropRecommendations(null);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Fetch historical weather data
  const fetchHistoricalData = async () => {
    if (!activeLocation || !dateRange?.from || !dateRange?.to) return;

    setLoadingHistorical(true);
    try {
      const startDate = format(dateRange.from, "yyyy-MM-dd");
      const endDate = format(dateRange.to, "yyyy-MM-dd");

      const response = await fetch(
        `/api/weather/historical?location=${encodeURIComponent(
          activeLocation
        )}&startDate=${startDate}&endDate=${endDate}`
      );

      // Handle different response statuses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Check for specific API key issues
        if (response.status === 500 && errorData.message?.includes("API key")) {
          throw new Error(
            "API key issue - Historical weather data temporarily unavailable"
          );
        } else if (response.status === 401) {
          throw new Error("Authentication required to access historical data");
        } else {
          throw new Error("Failed to fetch historical weather data");
        }
      }

      const data = await response.json();
      setHistoricalData(data);
    } catch (error: any) {
      // console.error("Error fetching historical data:", error);

      toast({
        title: "Historical Weather Data Unavailable",
        description:
          error.message || "Please check your connection and try again later",
        variant: "destructive",
      });

      // Set null historical data to show the error UI
      setHistoricalData(null);
    } finally {
      setLoadingHistorical(false);
    }
  };

  // Get weather icon based on condition
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "clear":
        return <Sun className="h-10 w-10 text-yellow-500" />;
      case "sunny":
        return <Sun className="h-10 w-10 text-yellow-500" />;
      case "rain":
        return <CloudRain className="h-10 w-10 text-blue-500" />;
      case "drizzle":
        return <CloudDrizzle className="h-10 w-10 text-blue-300" />;
      case "thunderstorm":
        return <CloudLightning className="h-10 w-10 text-purple-500" />;
      case "snow":
        return <CloudSnow className="h-10 w-10 text-blue-200" />;
      case "mist":
      case "fog":
        return <CloudFog className="h-10 w-10 text-gray-400" />;
      case "partly cloudy":
        return <CloudSun className="h-10 w-10 text-gray-400" />;
      default:
        return <Cloud className="h-10 w-10 text-gray-500" />;
    }
  };

  // Search for locations using geocoding API
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(
        `/api/weather/geocode?query=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("Failed to fetch location suggestions");
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err: any) {
      setSearchError(err.message || "Error searching locations");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Add a searched location to preferences
  const addSearchedLocation = async (locationName: string) => {
    const cityName = extractCityName(locationName);
    if (preferences?.locations?.includes(cityName)) {
      toast({
        title: "Location already saved",
        description: `${cityName} is already in your saved locations`,
      });
      return;
    }
    try {
      const currentLocations = preferences?.locations || [];
      const updatedLocations = [...currentLocations, cityName];
      const updateData = {
        userId: preferences?.userId || 0,
        locations: updatedLocations,
        alertsEnabled: preferences?.alertsEnabled ?? true,
        temperatureUnit: preferences?.temperatureUnit || "celsius",
      };
      const response = await fetch("/api/weather-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error("Failed to save location");
      toast({
        title: "Location saved!",
        description: `${cityName} has been added to your saved locations`,
      });
      setSearchQuery("");
      setSearchResults([]);
      window.location.reload();
    } catch {
      toast({
        title: "Failed to save location",
        description: "Please try again or save it manually in Preferences",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout
      title="Weather Services"
      description="Monitor weather conditions and set up your preferences"
    >
      <div className="gap-8 overflow-x-auto scrollbar-hide">
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="mb-4 flex w-full mobile-tabs" role="tabslist">
            <TabsTrigger
              value="current"
              className="flex items-center gap-1.5 mobile-tab"
              role="tab"
            >
              <Cloud className="h-4 w-4 mobile-icon" />
              <span className="hidden sm:inline">Current Weather</span>
              <span className="sm:hidden">Current</span>
            </TabsTrigger>
            <TabsTrigger
              value="forecast"
              className="flex items-center gap-1.5 mobile-tab"
              role="tab"
            >
              <Calendar className="h-4 w-4 mobile-icon" />
              <span className="hidden sm:inline">Forecast</span>
              <span className="sm:hidden">Forecast</span>
            </TabsTrigger>
            <TabsTrigger
              value="climate"
              className="flex items-center gap-1.5 mobile-tab"
              role="tab"
            >
              <BarChart4 className="h-4 w-4 mobile-icon" />
              <span className="hidden sm:inline">Climate Analysis</span>
              <span className="sm:hidden">Climate</span>
            </TabsTrigger>
            <TabsTrigger
              value="recommendations"
              className="flex items-center gap-1.5 mobile-tab"
              role="tab"
            >
              <Sprout className="h-4 w-4 mobile-icon" />
              <span className="hidden sm:inline">Crop Recommendations</span>
              <span className="sm:hidden">Crops</span>
            </TabsTrigger>
            <TabsTrigger
              value="alerts"
              className="flex items-center gap-1.5 mobile-tab"
              role="tab"
            >
              <AlertTriangle className="h-4 w-4 mobile-icon" />
              <span className="hidden sm:inline">Weather Alerts</span>
              <span className="sm:hidden">Alerts</span>
            </TabsTrigger>
            <TabsTrigger
              value="historical"
              className="flex items-center gap-1.5 mobile-tab"
              role="tab"
            >
              <RefreshCw className="h-4 w-4 mobile-icon" />
              <span className="hidden sm:inline">Historical Data</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="flex items-center gap-1.5 mobile-tab"
              role="tab"
            >
              <Settings className="h-4 w-4 mobile-icon" />
              <span className="hidden sm:inline">Preferences</span>
              <span className="sm:hidden">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            <div className="grid gap-6">
              {/* Location selector */}
              <Card>
                <CardHeader className="pb-3 mobile-p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mobile-spacing">
                    <div>
                      <CardTitle className="text-xl mobile-text-lg">
                        Weather Location
                      </CardTitle>
                      <CardDescription className="mobile-text-sm">
                        Select a location or auto-detect your current position
                      </CardDescription>
                    </div>
                    {activeLocation && weatherData && (
                      <div className="flex items-center gap-2 mobile-weather">
                        {getWeatherIcon(weatherData.current.condition)}
                        <div className="text-xl sm:text-2xl font-semibold mobile-text-lg">
                          {formatTemperature(weatherData.current.temp)}
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="mobile-p-4">
                  {isLoading ? (
                    <div className="flex justify-center py-4 mobile-loading">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2 mobile-text-sm">Loading...</span>
                    </div>
                  ) : (
                    <div className="mobile-spacing">
                      {/* Auto-detect button */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={detectCurrentLocation}
                          disabled={isDetectingLocation}
                          className="flex-1 sm:flex-none mobile-btn-compact"
                          variant="outline"
                        >
                          {isDetectingLocation ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin mobile-icon" />
                              Detecting Location...
                            </>
                          ) : (
                            <>
                              <Navigation className="mr-2 h-4 w-4 mobile-icon" />
                              Auto-Detect My Location
                            </>
                          )}
                        </Button>

                        {activeLocation && (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm text-muted-foreground mobile-status">
                            <MapPin className="h-4 w-4 mobile-icon" />
                            <div className="flex flex-col">
                              <span className="mobile-text-sm">
                                Current: {extractCityName(activeLocation)}
                              </span>
                              {detectedLocationData?.geoPath && (
                                <span className="text-xs opacity-75 mobile-text-xs">
                                  {detectedLocationData.geoPath}
                                </span>
                              )}
                            </div>
                            {detectedCoordinates && (
                              <span className="text-xs opacity-75 mobile-text-xs">
                                ({detectedCoordinates.lat.toFixed(4)},{" "}
                                {detectedCoordinates.lon.toFixed(4)})
                              </span>
                            )}
                            {/* Save Location button - only show if location is detected but not saved */}
                            {detectedCoordinates &&
                              activeLocation &&
                              preferences?.locations &&
                              !preferences.locations.includes(
                                extractCityName(activeLocation)
                              ) && (
                                <Button
                                  onClick={saveLocation}
                                  size="sm"
                                  variant="outline"
                                  className="ml-2 h-6 px-2 text-xs mobile-btn-compact"
                                >
                                  Save Location
                                </Button>
                              )}
                          </div>
                        )}
                      </div>

                      {/* Location search bar */}
                      <div className="mb-4">
                        <Input
                          placeholder="Search for a city or location..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (e.target.value.length > 2) {
                              searchLocations(e.target.value);
                            } else {
                              setSearchResults([]);
                            }
                          }}
                          className="w-full mobile-input-group"
                        />
                        {isSearching && (
                          <div className="text-xs text-muted-foreground mt-1 mobile-text-xs">
                            Searching...
                          </div>
                        )}
                        {searchError && (
                          <div className="text-xs text-destructive mt-1 mobile-text-xs">
                            {searchError}
                          </div>
                        )}
                        {searchResults.length > 0 && (
                          <div className="border rounded-md bg-background mt-2 max-h-48 overflow-y-auto shadow-lg z-10 mobile-search-results">
                            {searchResults.map((result, idx) => {
                              const cityName = extractCityName(
                                result.name || result.display_name || ""
                              );
                              const displayName =
                                result.geoPath ||
                                result.display_name ||
                                result.name ||
                                "";
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between px-3 py-2 hover:bg-muted cursor-pointer mobile-p-2"
                                >
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <span className="font-medium mobile-text-sm truncate">
                                      {cityName}
                                    </span>
                                    <span className="text-xs text-muted-foreground mobile-text-xs truncate">
                                      {displayName}
                                    </span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      addSearchedLocation(
                                        result.name || result.display_name || ""
                                      )
                                    }
                                    className="ml-2 flex-shrink-0 mobile-btn-compact"
                                  >
                                    Add
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Location dropdown */}
                      {preferences?.locations &&
                        preferences.locations.length > 0 && (
                          <div className="relative">
                            <label className="text-sm font-medium mb-2 block mobile-text-sm">
                              Or select from saved locations:
                            </label>
                            <select
                              className="w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 mobile-dropdown"
                              value={activeLocation || ""}
                              onChange={(e) => {
                                const newLocation = e.target.value;
                                if (newLocation) {
                                  // Reset all data when changing location
                                  setWeatherData(null);
                                  setClimateData(null);
                                  setCropRecommendations(null);
                                  setHistoricalData(null);
                                  setActiveLocation(newLocation);
                                  // Clear detected coordinates and location data when switching to saved location
                                  setDetectedCoordinates(null);
                                  setDetectedLocationData(null);
                                }
                              }}
                            >
                              <option value="" disabled>
                                Select a saved location
                              </option>
                              {preferences.locations.map((location) => {
                                const cityName = extractCityName(location);
                                return (
                                  <option key={cityName} value={cityName}>
                                    {cityName}
                                  </option>
                                );
                              })}
                            </select>
                            <MapPin className="absolute right-3 top-8 h-4 w-4 text-muted-foreground pointer-events-none mobile-icon" />
                          </div>
                        )}

                      {/* No locations message */}
                      {(!preferences?.locations ||
                        preferences.locations.length === 0) && (
                        <div className="text-center py-6 text-muted-foreground border rounded-lg bg-muted/30 mobile-p-4">
                          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50 mobile-icon" />
                          <p className="font-medium mb-1 mobile-text-lg">
                            No saved locations
                          </p>
                          <p className="text-sm mobile-text-sm">
                            Use auto-detect or go to Preferences to add
                            locations
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Weather Dashboard */}
              {activeLocation && (
                <EnhancedWeatherDashboard
                  weatherData={weatherData}
                  preferences={preferences ?? null}
                  loading={loadingWeather}
                  onRefresh={handleRefreshWeather}
                  activeLocation={activeLocation}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="forecast">
            <Card>
              <CardHeader className="mobile-p-4">
                <CardTitle className="mobile-text-lg">
                  Weather Forecast
                </CardTitle>
                <CardDescription className="mobile-text-sm">
                  {activeLocation
                    ? `5-day forecast for ${activeLocation}`
                    : "Select a location to view forecast"}
                </CardDescription>
              </CardHeader>
              <CardContent className="mobile-p-4">
                {!activeLocation ? (
                  <div className="text-center py-8 text-muted-foreground mobile-loading">
                    <p className="mobile-text-lg">No location selected.</p>
                    <p className="text-sm mobile-text-sm">
                      Choose a location from the Current Weather tab.
                    </p>
                  </div>
                ) : loadingWeather ? (
                  <div className="flex justify-center py-12 mobile-loading">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <span className="ml-2 mobile-text-sm">
                      Loading forecast...
                    </span>
                  </div>
                ) : !weatherData?.forecast ? (
                  <div className="text-center py-8 text-muted-foreground mobile-loading">
                    <p className="mobile-text-lg">
                      Forecast data not available for this location.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mobile-grid">
                    {weatherData.forecast.map((day, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center p-4 border rounded-lg mobile-weather"
                      >
                        <div className="font-medium mb-2 mobile-text-sm text-center">
                          {day.dayOfWeek}, {day.date}
                        </div>
                        <div className="text-3xl mb-3">
                          {getWeatherIcon(day.condition)}
                        </div>
                        <div className="text-lg font-semibold mobile-text-lg">
                          {formatTemperature(day.temp.max)}
                        </div>
                        <div className="text-sm text-muted-foreground mobile-text-sm">
                          {formatTemperature(day.temp.min)}
                        </div>
                        <div className="mt-2 text-sm mobile-text-sm text-center">
                          {day.description || day.condition}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground mobile-text-xs">
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
                  Climate data and seasonal patterns for{" "}
                  {activeLocation || "your location"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!activeLocation ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No location selected.</p>
                    <p className="text-sm">
                      Choose a location from the Current Weather tab.
                    </p>
                  </div>
                ) : (
                  <div>
                    {!climateData && !loadingClimate ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-4">
                        <p className="text-muted-foreground">
                          Climate data helps understand seasonal patterns and
                          make better agricultural decisions.
                        </p>
                        <Button onClick={fetchClimateData} className="mt-2">
                          Load Climate Data
                        </Button>
                      </div>
                    ) : loadingClimate ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      </div>
                    ) : (
                      climateData && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Soil Conditions Card */}
                            <Card className="overflow-hidden">
                              <CardHeader className="bg-primary/5 pb-2">
                                <CardTitle className="text-lg">
                                  Soil Conditions
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-4">
                                <div className="space-y-4">
                                  <div>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span>Soil Type</span>
                                      <span className="font-medium">
                                        {climateData.soilConditions.type}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <div className="bg-primary/10 rounded-md p-2 flex-shrink-0">
                                      <div className="flex items-center justify-center h-8 w-8">
                                        <span className="font-medium">
                                          {climateData.soilConditions.ph.toFixed(
                                            1
                                          )}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-center text-muted-foreground mt-1">
                                        pH
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium">
                                        Soil pH
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {climateData.soilConditions.ph < 5.5
                                          ? "Acidic"
                                          : climateData.soilConditions.ph > 7.5
                                          ? "Alkaline"
                                          : "Neutral"}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <div className="bg-primary/10 rounded-md p-2 flex-shrink-0">
                                      <div className="flex items-center justify-center h-8 w-8">
                                        <span className="font-medium">
                                          {climateData.soilConditions.moisture.toFixed(
                                            0
                                          )}
                                          %
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-center text-muted-foreground mt-1">
                                        Moisture
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium">
                                        Soil Moisture
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {climateData.soilConditions.moisture <
                                        20
                                          ? "Dry"
                                          : climateData.soilConditions
                                              .moisture > 60
                                          ? "Wet"
                                          : "Moderate"}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Regional Soil Data */}
                                  {(() => {
                                    // Determine agricultural region from location
                                    let region = "";
                                    if (activeLocation) {
                                      const loc = activeLocation.toLowerCase();
                                      if (
                                        loc.includes("lusaka") ||
                                        loc.includes("central") ||
                                        loc.includes("eastern")
                                      ) {
                                        region = "Region II";
                                      } else if (
                                        loc.includes("ndola") ||
                                        loc.includes("kitwe") ||
                                        loc.includes("northwestern") ||
                                        loc.includes("luapula") ||
                                        loc.includes("northern") ||
                                        loc.includes("copperbelt")
                                      ) {
                                        region = "Region III";
                                      } else if (
                                        loc.includes("livingstone") ||
                                        loc.includes("southern") ||
                                        loc.includes("western") ||
                                        loc.includes("chipata")
                                      ) {
                                        region = "Region I";
                                      } else {
                                        // Default to Region II for Zambia if cannot determine
                                        region = "Region II";
                                      }
                                    }

                                    // Show region-specific soil data based on determined region
                                    if (region) {
                                      return (
                                        <div className="mt-2 pt-3 border-t">
                                          <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium">
                                              Regional Soil Profile
                                            </span>
                                            <span className="text-xs bg-primary/10 px-2 py-0.5 rounded text-primary">
                                              {region}
                                            </span>
                                          </div>

                                          <div className="grid grid-cols-1 gap-2 text-sm">
                                            {region === "Region I" && (
                                              <>
                                                <div className="flex justify-between text-xs">
                                                  <span className="text-muted-foreground">
                                                    Typical pH Range:
                                                  </span>
                                                  <span>4.77–5.11</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                  <span className="text-muted-foreground">
                                                    Soil Composition:
                                                  </span>
                                                  <span className="text-right">
                                                    Slightly acidic loamy and
                                                    clayey soils
                                                  </span>
                                                </div>
                                                <div className="flex gap-1 flex-wrap mt-1">
                                                  <span className="text-xs bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 rounded-full px-2 py-0.5">
                                                    Erosion prone
                                                  </span>
                                                  <span className="text-xs bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 rounded-full px-2 py-0.5">
                                                    Low water-holding capacity
                                                  </span>
                                                </div>
                                              </>
                                            )}

                                            {region === "Region II" && (
                                              <>
                                                <div className="flex justify-between text-xs">
                                                  <span className="text-muted-foreground">
                                                    Typical pH Range:
                                                  </span>
                                                  <span>4.02–5.56</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                  <span className="text-muted-foreground">
                                                    Soil Composition:
                                                  </span>
                                                  <span className="text-right">
                                                    Red to brown clayey to loamy
                                                    soils
                                                  </span>
                                                </div>
                                                <div className="flex gap-1 flex-wrap mt-1">
                                                  <span className="text-xs bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 rounded-full px-2 py-0.5">
                                                    Shallow rooting zones
                                                  </span>
                                                  <span className="text-xs bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 rounded-full px-2 py-0.5">
                                                    Leached soil
                                                  </span>
                                                </div>
                                              </>
                                            )}

                                            {region === "Region III" && (
                                              <>
                                                <div className="flex justify-between text-xs">
                                                  <span className="text-muted-foreground">
                                                    Typical pH Range:
                                                  </span>
                                                  <span>4.0–6.9</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                  <span className="text-muted-foreground">
                                                    Soil Composition:
                                                  </span>
                                                  <span className="text-right">
                                                    Highly weathered, leached
                                                    soils
                                                  </span>
                                                </div>
                                                <div className="flex gap-1 flex-wrap mt-1">
                                                  <span className="text-xs bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 rounded-full px-2 py-0.5">
                                                    Extreme acidity
                                                  </span>
                                                  <span className="text-xs bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 rounded-full px-2 py-0.5">
                                                    Low nutrient availability
                                                  </span>
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Growing Season Card */}
                            <Card className="overflow-hidden">
                              <CardHeader className="bg-primary/5 pb-2">
                                <CardTitle className="text-lg">
                                  Growing Season
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-4">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">
                                      Season Length:
                                    </span>
                                    <span className="font-medium">
                                      {climateData.growingSeasonLength} days
                                    </span>
                                  </div>

                                  <Progress
                                    value={
                                      (climateData.growingSeasonLength / 365) *
                                      100
                                    }
                                    className="h-2.5"
                                  />

                                  <div className="bg-primary/5 p-3 rounded-md mt-4">
                                    <div className="text-sm font-medium mb-1">
                                      Growing Season Assessment
                                    </div>
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
                              <CardTitle className="text-lg">
                                Monthly Climate Averages
                              </CardTitle>
                              <CardDescription>
                                Temperature, precipitation, and growing degree
                                days by month
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="overflow-x-auto">
                                <table className="w-full min-w-[640px] table-auto">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="text-left px-4 py-2 font-medium">
                                        Month
                                      </th>
                                      <th className="text-center px-4 py-2 font-medium">
                                        Avg. Temp
                                      </th>
                                      <th className="text-center px-4 py-2 font-medium">
                                        Precipitation
                                      </th>
                                      <th className="text-center px-4 py-2 font-medium">
                                        Growing Degree Days
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {climateData.monthlyAverages.map(
                                      (month, index) => (
                                        <tr
                                          key={index}
                                          className="border-b last:border-0 hover:bg-muted/50"
                                        >
                                          <td className="px-4 py-2">
                                            {month.month}
                                          </td>
                                          <td className="px-4 py-2 text-center">
                                            {formatTemperature(
                                              month.averageTemp
                                            )}
                                          </td>
                                          <td className="px-4 py-2 text-center">
                                            {month.averagePrecipitation.toFixed(
                                              1
                                            )}{" "}
                                            mm
                                          </td>
                                          <td className="px-4 py-2 text-center">
                                            {month.growingDegreeDays.toFixed(0)}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </CardContent>
                            <CardFooter className="bg-muted/30 text-sm text-muted-foreground">
                              <div>
                                Growing Degree Days (GDD) indicate heat
                                accumulation for crop growth (base 10°C).
                              </div>
                            </CardFooter>
                          </Card>
                        </div>
                      )
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
                  Crops that are suitable for the climate in{" "}
                  {activeLocation || "your location"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!activeLocation ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No location selected.</p>
                    <p className="text-sm">
                      Choose a location from the Current Weather tab.
                    </p>
                  </div>
                ) : (
                  <div>
                    {!cropRecommendations && !loadingRecommendations ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-4">
                        <p className="text-muted-foreground">
                          Our AI-powered system can recommend the best crops to
                          plant based on local climate data.
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
                    ) : (
                      cropRecommendations && (
                        <div className="space-y-6">
                          {/* Regional Seed Recommendations based on location */}
                          <div className="mb-6">
                            <RegionalSeedRecommendations
                              location={activeLocation}
                              soilType={climateData?.soilConditions?.type}
                              onLocationChange={setActiveLocation}
                            />
                          </div>

                          <h3 className="text-lg font-medium">
                            AI-Generated Crop Recommendations
                          </h3>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {cropRecommendations
                              .slice(0, 6)
                              .map((crop, index) => (
                                <div
                                  key={index}
                                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex justify-between items-start mb-4">
                                    <div>
                                      <h3 className="font-semibold text-lg">
                                        {crop.cropName}
                                      </h3>
                                      <p className="text-sm text-muted-foreground">
                                        Variety: {crop.variety}
                                      </p>
                                    </div>
                                    <HoverCard>
                                      <HoverCardTrigger asChild>
                                        <div className="flex items-center gap-1 bg-primary/10 py-1 px-2 rounded">
                                          <BarChart4 className="h-4 w-4" />
                                          <span className="font-medium">
                                            {crop.suitabilityScore}/100
                                          </span>
                                        </div>
                                      </HoverCardTrigger>
                                      <HoverCardContent className="w-80">
                                        <div className="font-medium mb-1">
                                          Suitability Score Explained
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">
                                          This score represents how well the
                                          crop is suited to your local climate
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
                                      <div className="text-xs text-muted-foreground">
                                        Planting Window
                                      </div>
                                      <div className="font-medium">
                                        {crop.optimalPlantingWindow.start} -{" "}
                                        {crop.optimalPlantingWindow.end}
                                      </div>
                                    </div>

                                    <div className="bg-primary/5 p-3 rounded">
                                      <div className="text-xs text-muted-foreground">
                                        Expected Yield
                                      </div>
                                      <div className="font-medium">
                                        {crop.expectedYield.toFixed(1)}{" "}
                                        {crop.yieldUnit}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-sm">
                                    <div className="font-medium mb-1">
                                      Notes:
                                    </div>
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
                                Showing top 6 recommended crops out of{" "}
                                {cropRecommendations.length} suitable options.
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="grid gap-6">
              {/* Weather Alert System */}
              {activeLocation && weatherData && (
                <WeatherAlertSystem
                  currentWeather={{
                    temp: weatherData.current.temp,
                    humidity: weatherData.current.humidity,
                    windSpeed: weatherData.current.windSpeed,
                    uv: weatherData.current.uv,
                    precipitation: weatherData.forecast[0]?.precipitation || 0,
                  }}
                  location={activeLocation}
                />
              )}

              {/* API Weather Alerts */}
              {weatherData?.alerts && weatherData.alerts.length > 0 && (
                <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                  <CardHeader>
                    <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Official Weather Alerts
                    </CardTitle>
                    <CardDescription className="text-red-700 dark:text-red-300">
                      Severe weather alerts from meteorological services
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      {weatherData.alerts.map((alert, index) => (
                        <div
                          key={index}
                          className="mb-4 p-4 bg-white/50 dark:bg-white/10 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="destructive">
                              {alert.severity}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(
                                alert.start * 1000
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-semibold mb-1">{alert.event}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {alert.description}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">From:</span>{" "}
                            {alert.senderName}
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Alert History and Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Alert History
                  </CardTitle>
                  <CardDescription>
                    Track your weather alert activity and patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Alert history and statistics coming soon</p>
                    <p className="text-sm">
                      Track alert triggers and response times
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="historical">
            <Card>
              <CardHeader>
                <CardTitle>Historical Weather Data</CardTitle>
                <CardDescription>
                  View historical weather patterns for{" "}
                  {activeLocation || "your location"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!activeLocation ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No location selected.</p>
                    <p className="text-sm">
                      Choose a location from the Current Weather tab.
                    </p>
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
                                <th className="text-left px-4 py-2 font-medium">
                                  Date
                                </th>
                                <th className="text-center px-4 py-2 font-medium">
                                  Avg. Temp
                                </th>
                                <th className="text-center px-4 py-2 font-medium">
                                  Min Temp
                                </th>
                                <th className="text-center px-4 py-2 font-medium">
                                  Max Temp
                                </th>
                                <th className="text-center px-4 py-2 font-medium">
                                  Humidity
                                </th>
                                <th className="text-center px-4 py-2 font-medium">
                                  Precipitation
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {historicalData.dates.map((day, index) => (
                                <tr
                                  key={index}
                                  className="border-b last:border-0 hover:bg-muted/50"
                                >
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
