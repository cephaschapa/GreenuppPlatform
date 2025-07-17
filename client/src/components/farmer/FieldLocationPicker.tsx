import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, Navigation, Search, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Fix Leaflet's default icon issues
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface FieldLocationData {
  id?: number;
  latitude: number;
  longitude: number;
  country: string;
  region: string;
  city: string;
  neighborhood: string | null;
  postalCode: string | null;
  formattedAddress: string | null;
  placeId: string | null;
}

interface FieldLocationPickerProps {
  initialLocation?: FieldLocationData | null;
  onLocationSelect: (location: FieldLocationData) => void;
  onLocationClear?: () => void;
  disabled?: boolean;
}

// Component to handle map clicks
function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function FieldLocationPicker({
  initialLocation,
  onLocationSelect,
  onLocationClear,
  disabled = false,
}: FieldLocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(() => {
    if (initialLocation?.latitude && initialLocation?.longitude) {
      return [initialLocation.latitude, initialLocation.longitude];
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  // Default center (can be customized based on user's region)
  const defaultCenter: [number, number] = [-15.4067, 28.2871]; // Zambia center

  // Handle map clicks
  const handleMapClick = async (lat: number, lng: number) => {
    if (disabled) return;

    setIsLoading(true);
    setError(null);
    setPosition([lat, lng]);

    try {
      // Use our proxy endpoint for reverse geocoding
      const response = await fetch(
        `/api/geocode/reverse?lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch location data");
      }

      const data = await response.json();

      if (data && data.address) {
        const locationData: FieldLocationData = {
          latitude: lat,
          longitude: lng,
          country: data.address.country || "",
          region: data.address.state || data.address.county || "",
          city:
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "",
          neighborhood:
            data.address.suburb || data.address.neighbourhood || null,
          postalCode: data.address.postcode || null,
          formattedAddress: data.display_name || null,
          placeId: data.place_id?.toString() || null,
        };

        onLocationSelect(locationData);
        toast({
          title: "Location selected",
          description: `Field location set to ${
            locationData.formattedAddress || "selected coordinates"
          }`,
        });
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
      setError("Failed to get location details. Please try again.");
      toast({
        title: "Location error",
        description: "Could not get location details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Search for locations
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/geocode/search?q=${encodeURIComponent(
          searchQuery
        )}&limit=5&countrycodes=zm`
      );

      if (!response.ok) {
        throw new Error("Failed to search locations");
      }

      const data = await response.json();
      setSearchResults(data || []);
    } catch (error) {
      console.error("Error searching locations:", error);
      setError("Failed to search locations. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Select search result
  const handleSearchResultSelect = async (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    setPosition([lat, lng]);
    setSearchResults([]);
    setSearchQuery("");

    // Update map center
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 15);
    }

    await handleMapClick(lat, lng);
  };

  // Detect current location
  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location detection failed",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setIsDetectingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setPosition([lat, lng]);

        // Update map center
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 15);
        }

        await handleMapClick(lat, lng);
        setIsDetectingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setError("Failed to detect your location. Please select manually.");
        setIsDetectingLocation(false);
        toast({
          title: "Location detection failed",
          description: "Please select your field location manually on the map",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Clear location
  const handleClearLocation = () => {
    setPosition(null);
    setError(null);
    setSearchQuery("");
    setSearchResults([]);
    onLocationClear?.();
  };

  // Handle Enter key in search
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Field Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="space-y-2">
            <Label htmlFor="location-search">Search Location</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="location-search"
                  placeholder="Search for a location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  disabled={disabled || isSearching}
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        onClick={() => handleSearchResultSelect(result)}
                      >
                        <div className="font-medium">{result.display_name}</div>
                        <div className="text-sm text-gray-500">
                          {result.lat}, {result.lon}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleSearch}
                disabled={disabled || isSearching || !searchQuery.trim()}
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={detectCurrentLocation}
              disabled={disabled || isDetectingLocation}
              className="flex-1"
            >
              {isDetectingLocation ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Navigation className="h-4 w-4 mr-2" />
              )}
              Detect Current Location
            </Button>

            {position && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClearLocation}
                disabled={disabled}
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Map */}
          <div className="h-[400px] w-full relative border rounded-md overflow-hidden">
            <MapContainer
              center={position || defaultCenter}
              zoom={position ? 15 : 8}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {position && <Marker position={position} />}
              {!disabled && (
                <MapClickHandler onLocationSelect={handleMapClick} />
              )}
            </MapContainer>

            {isLoading && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="bg-white p-3 rounded-full">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Instructions */}
          <div className="text-sm text-muted-foreground">
            {disabled
              ? "Location selection is disabled"
              : "Click on the map to set your field location, search for a location, or detect your current location"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
