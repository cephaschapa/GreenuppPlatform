import { useState, useEffect, useRef } from "react";
import { MapPin, Search, Loader2, Navigation, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ZambianLocation {
  name: string;
  city: string;
  province: string;
  type: "city" | "town" | "compound" | "neighborhood" | "village" | "district";
  coordinates: {
    lat: number;
    lon: number;
  };
  fullName: string;
  description?: string;
}

interface ZambianLocationSearchProps {
  onLocationSelect: (location: ZambianLocation) => void;
  placeholder?: string;
  showGPSDetect?: boolean;
  onGPSDetect?: (lat: number, lon: number) => void;
  className?: string;
}

export function ZambianLocationSearch({
  onLocationSelect,
  placeholder = "Search Zambian locations...",
  showGPSDetect = true,
  onGPSDetect,
  className,
}: ZambianLocationSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ZambianLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<ZambianLocation | null>(null);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Search Zambian locations
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/hyperlocal-weather/search?q=${encodeURIComponent(
            searchQuery
          )}&limit=10`
        );

        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.locations || []);
        }
      } catch (error) {
        console.error("Error searching locations:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleLocationSelect = (location: ZambianLocation) => {
    setSelectedLocation(location);
    setSearchQuery("");
    setOpen(false);
    onLocationSelect(location);
  };

  const handleGPSDetect = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingGPS(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setIsDetectingGPS(false);

        if (onGPSDetect) {
          onGPSDetect(latitude, longitude);
        }

        // Fetch nearest Zambian location
        fetch(`/api/hyperlocal-weather?lat=${latitude}&lon=${longitude}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.location) {
              const location: ZambianLocation = {
                name: data.location.name,
                city: data.location.city,
                province: data.location.province,
                type: data.location.type,
                coordinates: data.location.coordinates,
                fullName: `${data.location.name}, ${data.location.city}`,
                description: data.location.description,
              };
              handleLocationSelect(location);
            }
          })
          .catch((error) => {
            console.error("Error fetching nearest location:", error);
          });
      },
      (error) => {
        setIsDetectingGPS(false);
        console.error("Error getting location:", error);
        alert("Unable to detect your location. Please search manually.");
      }
    );
  };

  const getLocationTypeColor = (type: string) => {
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
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="flex-1 justify-start min-w-0"
          >
            {selectedLocation ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate flex-1">{selectedLocation.fullName}</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs shrink-0",
                    getLocationTypeColor(selectedLocation.type)
                  )}
                >
                  {selectedLocation.type}
                </Badge>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                <Search className="h-4 w-4 shrink-0" />
                <span className="truncate">{placeholder}</span>
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Type to search..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isSearching && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Searching...
                  </span>
                </div>
              )}

              {!isSearching && searchQuery.length < 2 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Type at least 2 characters to search
                </div>
              )}

              {!isSearching &&
                searchQuery.length >= 2 &&
                searchResults.length === 0 && (
                  <CommandEmpty>No locations found.</CommandEmpty>
                )}

              {!isSearching && searchResults.length > 0 && (
                <CommandGroup heading="Zambian Locations">
                  {searchResults.map((location) => (
                    <CommandItem
                      key={`${location.name}-${location.city}`}
                      onSelect={() => handleLocationSelect(location)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{location.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {location.city}, {location.province}
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs shrink-0",
                          getLocationTypeColor(location.type)
                        )}
                      >
                        {location.type}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {showGPSDetect && (
        <Button
          variant="outline"
          size="icon"
          onClick={handleGPSDetect}
          disabled={isDetectingGPS}
          title="Detect my location"
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

// Simpler version without popover for inline use
export function SimpleZambianLocationSearch({
  onLocationSelect,
  placeholder = "Search location...",
  className,
}: Omit<ZambianLocationSearchProps, "showGPSDetect" | "onGPSDetect">) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ZambianLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  // Search Zambian locations
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
        const response = await fetch(
          `/api/hyperlocal-weather/search?q=${encodeURIComponent(
            searchQuery
          )}&limit=8`
        );

        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.locations || []);
          setShowResults(true);
        }
      } catch (error) {
        console.error("Error searching locations:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleLocationSelect = (location: ZambianLocation) => {
    setSearchQuery(location.fullName);
    setShowResults(false);
    onLocationSelect(location);
  };

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case "compound":
      case "neighborhood":
        return "bg-green-100 text-green-800";
      case "city":
        return "bg-blue-100 text-blue-800";
      case "town":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
      </div>

      {showResults && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-[300px] overflow-auto">
          {searchResults.map((location) => (
            <div
              key={`${location.name}-${location.city}`}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => handleLocationSelect(location)}
            >
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{location.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {location.city}, {location.province}
                </div>
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs shrink-0",
                  getLocationTypeColor(location.type)
                )}
              >
                {location.type}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
