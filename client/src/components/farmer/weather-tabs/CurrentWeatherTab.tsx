import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnhancedWeatherDashboard } from "@/components/farmer/EnhancedWeatherDashboard";
import { GlobalLocationSearch } from "@/components/farmer/GlobalLocationSearch";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CurrentWeatherTabProps {
  activeLocation: string | null;
  isLoading: boolean;
  isDetectingLocation: boolean;
  weatherData: any;
  weatherPrecision: "neighborhood" | "city" | "approximate" | null;
  weatherSource:
    | "zambian_database"
    | "openweather_geocode"
    | "coordinates"
    | null;
  detectedLocationData: any;
  detectedCoordinates: { lat: number; lon: number } | null;
  preferences: any;
  loadingWeather: boolean;
  extractCityName: (location: string) => string;
  getWeatherIcon: (condition: string) => JSX.Element;
  formatTemperature: (temp: number) => string;
  detectCurrentLocation: () => Promise<void>;
  saveLocation: () => Promise<void>;
  handleRefreshWeather: () => Promise<void>;
  setActiveLocation: (location: string) => void;
  setDetectedLocationData: (data: any) => void;
  setDetectedCoordinates: (coords: { lat: number; lon: number } | null) => void;
  setWeatherPrecision: (
    precision: "neighborhood" | "city" | "approximate" | null
  ) => void;
  setWeatherSource: (
    source: "zambian_database" | "openweather_geocode" | "coordinates" | null
  ) => void;
  setWeatherData: (data: any) => void;
  setClimateData: (data: any) => void;
  setCropRecommendations: (data: any) => void;
  setHistoricalData: (data: any) => void;
}

export function CurrentWeatherTab({
  activeLocation,
  isLoading,
  isDetectingLocation,
  weatherData,
  weatherPrecision,
  detectedLocationData,
  detectedCoordinates,
  preferences,
  loadingWeather,
  extractCityName,
  getWeatherIcon,
  formatTemperature,
  detectCurrentLocation,
  saveLocation,
  handleRefreshWeather,
  setActiveLocation,
  setDetectedLocationData,
  setDetectedCoordinates,
  setWeatherPrecision,
  setWeatherSource,
  setWeatherData,
  setClimateData,
  setCropRecommendations,
  setHistoricalData,
}: CurrentWeatherTabProps) {
  const { toast } = useToast();

  return (
    <TabsContent value="current">
      <div className="grid gap-6">
        {/* Location selector */}
        <Card>
          <CardHeader className="pb-3 p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base sm:text-xl">
                  Weather Location
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm break-words">
                  Your location is automatically detected worldwide, or search
                  for specific areas
                </CardDescription>
              </div>
              {activeLocation && weatherData && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {getWeatherIcon(weatherData.current.condition)}
                  <div className="text-lg sm:text-2xl font-semibold">
                    {formatTemperature(weatherData.current.temp)}
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            {isLoading ? (
              <div className="flex justify-center py-4 mobile-loading">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 mobile-text-sm">Loading...</span>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {/* Current Location Display */}
                {isDetectingLocation ? (
                  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-muted/50 rounded-lg border border-dashed">
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm">
                        Detecting your location...
                      </p>
                      <p className="text-xs text-muted-foreground break-words">
                        Finding nearest Zambian neighborhood
                      </p>
                    </div>
                  </div>
                ) : activeLocation ? (
                  <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-muted/50 rounded-lg border">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-xs sm:text-sm break-words">
                          {detectedLocationData?.name ||
                            detectedLocationData?.city ||
                            extractCityName(activeLocation)}
                        </span>
                        {weatherPrecision && (
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs flex-shrink-0",
                              weatherPrecision === "neighborhood" &&
                                "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                              weatherPrecision === "city" &&
                                "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                              weatherPrecision === "approximate" &&
                                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            )}
                          >
                            {weatherPrecision === "neighborhood" &&
                              "🎯 Precise"}
                            {weatherPrecision === "city" && "📍 City-level"}
                            {weatherPrecision === "approximate" &&
                              "📌 Approximate"}
                          </Badge>
                        )}
                      </div>
                      {detectedLocationData && (
                        <p className="text-xs text-muted-foreground mt-1 break-words">
                          {detectedLocationData.type &&
                            `${detectedLocationData.type} in `}
                          {detectedLocationData.city}
                          {detectedLocationData.state &&
                            detectedLocationData.state !==
                              detectedLocationData.city &&
                            `, ${detectedLocationData.state}`}
                          {detectedLocationData.country &&
                            `, ${detectedLocationData.country}`}
                        </p>
                      )}
                      {detectedCoordinates && (
                        <p className="text-xs text-muted-foreground/70 mt-1 break-all">
                          {detectedCoordinates.lat.toFixed(4)},{" "}
                          {detectedCoordinates.lon.toFixed(4)}
                        </p>
                      )}
                    </div>
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
                          className="flex-shrink-0 text-xs sm:text-sm"
                        >
                          Save
                        </Button>
                      )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 p-6 sm:p-8 bg-muted/50 rounded-lg border border-dashed">
                    <Navigation className="h-12 w-12 text-muted-foreground" />
                    <div className="text-center space-y-2">
                      <h3 className="font-medium text-sm sm:text-base">
                        No Location Detected
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
                        Detect your current location to get accurate weather
                        data for your area
                      </p>
                    </div>
                    <Button
                      onClick={detectCurrentLocation}
                      size="lg"
                      className="gap-2"
                      disabled={isDetectingLocation}
                    >
                      {isDetectingLocation ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Detecting...
                        </>
                      ) : (
                        <>
                          <Navigation className="h-4 w-4" />
                          Detect My Location
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Global Location Search with Autocomplete */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium block">
                    Search Any Location Worldwide:
                  </label>
                  <GlobalLocationSearch
                    onLocationSelect={(location) => {
                      // Store location data for display
                      setDetectedLocationData({
                        name: location.name,
                        city: location.city,
                        state: location.state,
                        country: location.country,
                        type: location.type || "city",
                        province: location.state,
                      });

                      // Store coordinates for weather fetching and saving
                      setDetectedCoordinates(location.coordinates);

                      // Use coordinates format for reliable weather API
                      setActiveLocation(
                        `${location.coordinates.lat},${location.coordinates.lon}`
                      );

                      // Set precision based on source
                      if (location.source === "zambian_database") {
                        setWeatherPrecision(
                          location.type === "compound" ||
                            location.type === "neighborhood"
                            ? "neighborhood"
                            : "city"
                        );
                        setWeatherSource("zambian_database");
                      } else {
                        setWeatherPrecision("city");
                        setWeatherSource("openweather_geocode");
                      }

                      // Reset weather data
                      setWeatherData(null);
                      setClimateData(null);
                      setCropRecommendations(null);
                      setHistoricalData(null);

                      const locationDesc =
                        location.source === "zambian_database"
                          ? `${location.type} in ${location.city}, ${location.province}`
                          : location.formatted;

                      toast({
                        title: `📍 ${location.name} Selected`,
                        description: locationDesc,
                      });
                    }}
                    placeholder="Search Cape Town, Lusaka, Nairobi..."
                    showGPSDetect={false}
                  />
                  <p className="text-xs text-muted-foreground break-words">
                    🌍 Search for any city worldwide, or get precise results for
                    Zambian neighborhoods
                  </p>
                </div>
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
  );
}
