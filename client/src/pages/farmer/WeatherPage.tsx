import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WeatherPreferences } from "@/components/farmer/WeatherPreferences";
import { useWeatherPreferences } from "@/hooks/use-weather-preferences";
import {
  CurrentWeatherTab,
  ForecastTab,
  ClimateTab,
  RecommendationsTab,
  AlertsTab,
  HistoricalTab,
} from "@/components/farmer/weather-tabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Cloud,
  CloudRain,
  Sun,
  AlertTriangle,
  Calendar,
  Sprout,
  BarChart4,
  RefreshCw,
  CloudFog,
  CloudLightning,
  CloudSnow,
  CloudDrizzle,
  CloudSun,
  Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";
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
  const [hasTriedAutoDetect, setHasTriedAutoDetect] = useState(false);
  const [detectedCoordinates, setDetectedCoordinates] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [detectedLocationData, setDetectedLocationData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [weatherPrecision, setWeatherPrecision] = useState<
    "neighborhood" | "city" | "approximate" | null
  >(null);
  const [weatherSource, setWeatherSource] = useState<
    "zambian_database" | "openweather_geocode" | "coordinates" | null
  >(null);

  const [locationName, setLocationName] = useState<string | null>(null);

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
    console.log(cityName);

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

  // Auto-detect user's current location using hyperlocal weather system
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
            enableHighAccuracy: true, // Request highest accuracy
            timeout: 15000, // Increased timeout for better accuracy
            maximumAge: 0, // Don't use cached position - get fresh GPS data
          });
        }
      );

      const { latitude, longitude, accuracy } = position.coords;

      // Log accuracy for debugging
      console.log(
        `📍 GPS Position: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`
      );

      // Store the coordinates
      setDetectedCoordinates({ lat: latitude, lon: longitude });

      // Use our new accurate location detection service
      const response = await fetch(`/api/location/detect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ lat: latitude, lon: longitude }),
      });

      if (!response.ok) {
        throw new Error("Failed to detect location");
      }

      const data = await response.json();

      if (data.success && data.location) {
        const locationData = data.location;

        // Store the full location data for display
        setDetectedLocationData({
          name: locationData.name,
          city: locationData.city,
          state: locationData.state,
          country: locationData.country,
          type: data.meta?.zambianDetails?.type || "city",
          province: locationData.state,
        });

        // Use coordinates format for activeLocation to ensure weather API works globally
        // The weather API handles "lat,lon" format better than complex location names
        setActiveLocation(`${latitude},${longitude}`);

        // Store precision and source
        setWeatherPrecision(data.meta?.precision || null);
        setWeatherSource(data.meta?.source || null);

        // Reset all data when changing location
        setWeatherData(null);
        setClimateData(null);
        setCropRecommendations(null);
        setHistoricalData(null);

        // Show enhanced toast with location details
        const precisionEmoji =
          data.meta?.precision === "neighborhood"
            ? "🎯"
            : data.meta?.precision === "city"
            ? "📍"
            : "📌";

        const locationDescription = data.meta?.isZambian
          ? `${locationData.name} in ${locationData.city}, ${locationData.state}`
          : `${locationData.name}, ${
              locationData.state || locationData.country
            }`;

        toast({
          title: `${precisionEmoji} Location Detected!`,
          description: locationDescription,
          duration: 5000,
        });

        // Show precision info if neighborhood-level for Zambian locations
        if (data.meta?.isZambian && data.meta?.precision === "neighborhood") {
          toast({
            title: "🎯 Precise Location Found",
            description:
              "Using neighborhood-level weather data from Zambian database",
            duration: 4000,
          });
        }

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

      // Show error toast for manual detection attempts
      toast({
        title: "Location detection failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Set initial location from user's saved preferences OR auto-detect
  useEffect(() => {
    // Skip if already tried auto-detect
    if (hasTriedAutoDetect || isLoading) return;

    // Priority 1: Use saved preferences if available
    if (preferences?.locations && preferences.locations.length > 0) {
      console.log(
        "Setting active location from user preferences:",
        preferences.locations[0]
      );
      setActiveLocation(preferences.locations[0]);
      setHasTriedAutoDetect(true);
      return;
    }

    // Priority 2: Auto-detect location if no preferences
    if (!activeLocation && navigator.geolocation) {
      console.log("Auto-detecting location on page load...");
      setHasTriedAutoDetect(true);

      // Attempt auto-detection immediately
      // This will prompt for permission on first load, but auto-detect silently after that
      detectCurrentLocation();
    }
  }, [preferences, isLoading, hasTriedAutoDetect, activeLocation]); // Dependencies ensure this runs when preferences load

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
        // Try hyperlocal API first for Zambian locations
        let response = await fetch(
          `/api/hyperlocal-weather?location=${encodeURIComponent(
            activeLocation
          )}`
        );

        let data;
        let useHyperlocal = false;

        if (response.ok) {
          data = await response.json();
          if (data.success) {
            // Hyperlocal API successful
            useHyperlocal = true;
            setWeatherData(data.weather);
            setWeatherPrecision(data.meta?.precision || null);
            setWeatherSource(data.meta?.source || null);

            // Show precision indicator
            if (data.meta?.precision === "neighborhood") {
              toast({
                title: `📍 Precise Weather for ${data.location.name}`,
                description: `Neighborhood-level weather data from our Zambian database`,
                duration: 3000,
              });
            }
          }
        }

        // Fallback to regular weather API if hyperlocal failed
        if (!useHyperlocal) {
          response = await fetch(
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

          data = await response.json();
          setWeatherData(data);
          setWeatherPrecision(null);
          setWeatherSource(null);
        }
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
  const handleRefreshWeather = async () => {
    if (!activeLocation) return;

    setLoadingWeather(true);
    setWeatherData(null);

    try {
      // Try hyperlocal API first for Zambian locations
      let response = await fetch(
        `/api/hyperlocal-weather?location=${encodeURIComponent(activeLocation)}`
      );

      let data;
      let useHyperlocal = false;

      if (response.ok) {
        data = await response.json();
        if (data.success) {
          // Hyperlocal API successful
          useHyperlocal = true;
          setWeatherData(data.weather);
          setWeatherPrecision(data.meta?.precision || null);
          setWeatherSource(data.meta?.source || null);

          toast({
            title: "🔄 Weather Updated",
            description: `Latest data for ${activeLocation}`,
            duration: 2000,
          });
        }
      }

      // Fallback to regular weather API if hyperlocal failed
      if (!useHyperlocal) {
        response = await fetch(
          `/api/weather?location=${encodeURIComponent(activeLocation)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }

        data = await response.json();
        setWeatherData(data);
        setWeatherPrecision(null);
        setWeatherSource(null);

        toast({
          title: "🔄 Weather Updated",
          description: `Latest data for ${activeLocation}`,
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast({
        title: "❌ Refresh Failed",
        description: error.message || "Unable to fetch latest weather data",
        variant: "destructive",
      });
      setWeatherData(null);
    } finally {
      setLoadingWeather(false);
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
      <div className="gap-8">
        <Tabs defaultValue="current" className="w-full">
          <div className="mb-4 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList
              className="inline-flex w-auto min-w-full sm:w-full sm:grid sm:grid-cols-6 gap-1"
              role="tabslist"
            >
              <TabsTrigger
                value="current"
                className="flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-sm"
                role="tab"
              >
                <Cloud className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Current Weather</span>
                <span className="sm:hidden">Current</span>
              </TabsTrigger>
              <TabsTrigger
                value="forecast"
                className="flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-sm"
                role="tab"
              >
                <Calendar className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Forecast</span>
                <span className="sm:hidden">Forecast</span>
              </TabsTrigger>
              <TabsTrigger
                value="climate"
                className="flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-sm"
                role="tab"
              >
                <BarChart4 className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Climate Analysis</span>
                <span className="sm:hidden">Climate</span>
              </TabsTrigger>
              <TabsTrigger
                value="recommendations"
                className="flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-sm"
                role="tab"
              >
                <Sprout className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Crop Recommendations</span>
                <span className="sm:hidden">Crops</span>
              </TabsTrigger>
              <TabsTrigger
                value="alerts"
                className="flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-sm"
                role="tab"
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Weather Alerts</span>
                <span className="sm:hidden">Alerts</span>
              </TabsTrigger>
              <TabsTrigger
                value="historical"
                className="flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-sm"
                role="tab"
              >
                <RefreshCw className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Historical Data</span>
                <span className="sm:hidden">History</span>
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-sm"
                role="tab"
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Preferences</span>
                <span className="sm:hidden">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <CurrentWeatherTab
            activeLocation={activeLocation}
            isLoading={isLoading}
            isDetectingLocation={isDetectingLocation}
            weatherData={weatherData}
            weatherPrecision={weatherPrecision}
            weatherSource={weatherSource}
            detectedLocationData={detectedLocationData}
            detectedCoordinates={detectedCoordinates}
            preferences={preferences}
            loadingWeather={loadingWeather}
            extractCityName={extractCityName}
            getWeatherIcon={getWeatherIcon}
            formatTemperature={formatTemperature}
            detectCurrentLocation={detectCurrentLocation}
            saveLocation={saveLocation}
            handleRefreshWeather={handleRefreshWeather}
            setActiveLocation={setActiveLocation}
            setDetectedLocationData={setDetectedLocationData}
            setDetectedCoordinates={setDetectedCoordinates}
            setWeatherPrecision={setWeatherPrecision}
            setWeatherSource={setWeatherSource}
            setWeatherData={setWeatherData}
            setClimateData={setClimateData}
            setCropRecommendations={setCropRecommendations}
            setHistoricalData={setHistoricalData}
          />

          <ForecastTab
            activeLocation={activeLocation}
            loadingWeather={loadingWeather}
            weatherData={weatherData}
            detectedLocationData={detectedLocationData}
            extractCityName={extractCityName}
            getWeatherIcon={getWeatherIcon}
            formatTemperature={formatTemperature}
          />

          <ClimateTab
            activeLocation={activeLocation}
            climateData={climateData}
            loadingClimate={loadingClimate}
            detectedLocationData={detectedLocationData}
            extractCityName={extractCityName}
            formatTemperature={formatTemperature}
            fetchClimateData={fetchClimateData}
          />

          <RecommendationsTab
            activeLocation={activeLocation}
            cropRecommendations={cropRecommendations}
            loadingRecommendations={loadingRecommendations}
            climateData={climateData}
            detectedLocationData={detectedLocationData}
            extractCityName={extractCityName}
            fetchCropRecommendations={fetchCropRecommendations}
            setActiveLocation={setActiveLocation}
          />

          <AlertsTab
            activeLocation={activeLocation}
            weatherData={weatherData}
          />

          <HistoricalTab
            activeLocation={activeLocation}
            historicalData={historicalData}
            loadingHistorical={loadingHistorical}
            dateRange={dateRange}
            detectedLocationData={detectedLocationData}
            extractCityName={extractCityName}
            formatTemperature={formatTemperature}
            fetchHistoricalData={fetchHistoricalData}
            setDateRange={setDateRange}
          />

          <TabsContent value="preferences">
            <WeatherPreferences />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
