import { useState, useEffect, useRef } from "react";
import { MapPin, Search, Loader2, Globe, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface GlobalLocation {
  name: string;
  city: string;
  state?: string;
  country: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  formatted: string;
  source: "zambian_database" | "openweather";
  type?: string;
  province?: string;
}

interface GlobalLocationSearchProps {
  onLocationSelect: (location: GlobalLocation) => void;
  placeholder?: string;
  showGPSDetect?: boolean;
  className?: string;
}

export function GlobalLocationSearch({
  onLocationSelect,
  placeholder = "Search any city worldwide...",
  showGPSDetect = true,
  className,
}: GlobalLocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GlobalLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search locations (both Zambian and global)
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Search both Zambian database and global locations in parallel
        const [zambianResponse, globalResponse] = await Promise.allSettled([
          fetch(
            `/api/hyperlocal-weather/search?q=${encodeURIComponent(
              searchQuery
            )}&limit=5`
          ),
          fetch(
            `/api/weather/geocode?query=${encodeURIComponent(searchQuery)}`
          ),
        ]);

        const results: GlobalLocation[] = [];

        // Add Zambian locations first (with priority)
        if (
          zambianResponse.status === "fulfilled" &&
          zambianResponse.value.ok
        ) {
          const zambianData = await zambianResponse.value.json();
          const zambianLocations = (zambianData.locations || []).map(
            (loc: any) => ({
              name: loc.name,
              city: loc.city,
              state: loc.province,
              country: "Zambia",
              coordinates: loc.coordinates,
              formatted: `${loc.name}, ${loc.city}, ${loc.province}`,
              source: "zambian_database" as const,
              type: loc.type,
              province: loc.province,
            })
          );
          results.push(...zambianLocations);
        }

        // Add global locations (from OpenWeather)
        if (globalResponse.status === "fulfilled" && globalResponse.value.ok) {
          const globalData = await globalResponse.value.json();
          const globalLocations = (globalData.results || [])
            .slice(0, 5)
            .map((loc: any) => ({
              name: loc.name,
              city: loc.name,
              state: loc.state,
              country: loc.country,
              coordinates: { lat: loc.lat, lon: loc.lon },
              formatted: [loc.name, loc.state, loc.country]
                .filter(Boolean)
                .join(", "),
              source: "openweather" as const,
            }));

          // Filter out duplicates (if a location appears in both results)
          const uniqueGlobalLocations = globalLocations.filter(
            (global: GlobalLocation) =>
              !results.some(
                (zambian) =>
                  zambian.city.toLowerCase() === global.city.toLowerCase() &&
                  zambian.country.toLowerCase() === global.country.toLowerCase()
              )
          );

          results.push(...uniqueGlobalLocations);
        }

        setSearchResults(results);
        setShowResults(results.length > 0);
      } catch (error) {
        console.error("Error searching locations:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400); // Slightly longer debounce for dual API calls

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleLocationSelect = (location: GlobalLocation) => {
    setSearchQuery(location.formatted);
    setShowResults(false);
    onLocationSelect(location);
  };

  const handleGPSDetect = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location detection",
        variant: "destructive",
      });
      return;
    }

    setIsDetectingGPS(true);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // Use our accurate location detection service
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
        const location: GlobalLocation = {
          name: locationData.name,
          city: locationData.city,
          state: locationData.state,
          country: locationData.country,
          coordinates: locationData.coordinates,
          formatted: locationData.formatted,
          source: data.meta?.source || "openweather",
          type: data.meta?.zambianDetails?.type,
          province: locationData.state,
        };

        handleLocationSelect(location);

        toast({
          title: "📍 Location Detected!",
          description: locationData.formatted,
        });
      }
    } catch (error: any) {
      let errorMessage = "Unable to detect your location";

      if (error.code === 1) {
        errorMessage =
          "Location access denied. Please allow location access in your browser settings.";
      } else if (error.code === 2) {
        errorMessage =
          "Location unavailable. Please check your device's location services.";
      } else if (error.code === 3) {
        errorMessage = "Location request timed out. Please try again.";
      }

      toast({
        title: "Location detection failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDetectingGPS(false);
    }
  };

  const getLocationTypeColor = (source: string, type?: string) => {
    if (source === "zambian_database") {
      switch (type) {
        case "compound":
        case "neighborhood":
          return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        case "city":
          return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        case "town":
          return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      }
    }
    return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
  };

  const getLocationIcon = (source: string) => {
    return source === "zambian_database" ? (
      <MapPin className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
    ) : (
      <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
    );
  };

  return (
    <div ref={wrapperRef} className={cn("flex gap-2", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          className="pl-9"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}

        {showResults && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[400px] overflow-auto">
            <div className="py-2">
              {searchResults.map((location, index) => (
                <div
                  key={`${location.name}-${location.city}-${index}`}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleLocationSelect(location)}
                >
                  {getLocationIcon(location.source)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-sm">
                      {location.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {location.source === "zambian_database"
                        ? `${location.city}, ${location.province}, Zambia`
                        : location.formatted}
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs shrink-0",
                      getLocationTypeColor(location.source, location.type)
                    )}
                  >
                    {location.source === "zambian_database"
                      ? location.type
                      : "Global"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchQuery.length >= 2 &&
          !isSearching &&
          searchResults.length === 0 &&
          showResults && (
            <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg p-4">
              <p className="text-sm text-muted-foreground text-center">
                No locations found for "{searchQuery}"
              </p>
            </div>
          )}
      </div>

      {showGPSDetect && (
        <Button
          variant="outline"
          size="icon"
          onClick={handleGPSDetect}
          disabled={isDetectingGPS}
          title="Detect my location"
          className="shrink-0"
        >
          {isDetectingGPS ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}
