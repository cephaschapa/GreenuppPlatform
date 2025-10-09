import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Navigation, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    google: any;
  }
}

export interface DetectedLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  placeId?: string;
}

interface GoogleLocationDetectorProps {
  onLocationDetected: (location: DetectedLocation) => void;
  onError?: (error: string) => void;
  buttonText?: string;
  className?: string;
  autoDetect?: boolean;
  showDetails?: boolean;
}

export default function GoogleLocationDetector({
  onLocationDetected,
  onError,
  buttonText = "Auto-Detect Location",
  className = "",
  autoDetect = false,
  showDetails = true,
}: GoogleLocationDetectorProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedLocation, setDetectedLocation] = useState<DetectedLocation | null>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const { toast } = useToast();

  // Load Google Maps API
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setError("Google Maps API key not configured");
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setGoogleMapsLoaded(true);
      return;
    }

    // Load Google Maps API
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setGoogleMapsLoaded(true);
    };

    script.onerror = () => {
      setError("Failed to load Google Maps API");
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      const existingScript = document.querySelector(`script[src*="${apiKey}"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // Auto-detect location on mount if enabled
  useEffect(() => {
    if (autoDetect && googleMapsLoaded && !detectedLocation && !isDetecting) {
      handleDetectLocation();
    }
  }, [autoDetect, googleMapsLoaded]);

  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.maps) {
        reject(new Error("Google Maps API not loaded"));
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      const latlng = new window.google.maps.LatLng(lat, lng);

      geocoder.geocode({ location: latlng }, (results: any, status: any) => {
        if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
          resolve(results[0]);
        } else {
          reject(new Error("Reverse geocoding failed"));
        }
      });
    });
  }, []);

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    setError(null);

    try {
      // Step 1: Get current position
      const position = await getCurrentPosition();

      const { latitude, longitude, accuracy } = position.coords;

      // Step 2: Reverse geocode to get address details
      const geocodeResult = await reverseGeocode(latitude, longitude);

      // Step 3: Parse the address components
      const addressComponents = geocodeResult.address_components || [];
      const formattedAddress = geocodeResult.formatted_address;

      let city = "";
      let state = "";
      let country = "";
      let postalCode = "";

      addressComponents.forEach((component: any) => {
        const types = component.types;
        if (types.includes("locality") || types.includes("administrative_area_level_3")) {
          city = component.long_name;
        }
        if (types.includes("administrative_area_level_1")) {
          state = component.long_name;
        }
        if (types.includes("country")) {
          country = component.long_name;
        }
        if (types.includes("postal_code")) {
          postalCode = component.long_name;
        }
      });

      // Step 4: Create location object
      const location: DetectedLocation = {
        latitude,
        longitude,
        accuracy,
        address: formattedAddress,
        city,
        state,
        country,
        postalCode,
        placeId: geocodeResult.place_id,
      };

      setDetectedLocation(location);
      onLocationDetected(location);

      toast({
        title: "Location detected successfully!",
        description: `Found your location in ${city || "your area"}`,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to detect location";

      setError(errorMessage);
      onError?.(errorMessage);

      toast({
        title: "Location detection failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleRetry = () => {
    handleDetectLocation();
  };

  if (!googleMapsLoaded) {
    return (
      <Card className={`border-dashed ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading location services...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Button
        type="button"
        variant={detectedLocation ? "outline" : "default"}
        onClick={handleDetectLocation}
        disabled={isDetecting}
        className="w-full"
      >
        {isDetecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Detecting Location...
          </>
        ) : detectedLocation ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
            Location Detected
          </>
        ) : (
          <>
            <Navigation className="mr-2 h-4 w-4" />
            {buttonText}
          </>
        )}
      </Button>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                  Location Detection Failed
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  {error}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRetry}
                  className="mt-2 h-6 px-2 text-xs text-red-700 hover:text-red-800 hover:bg-red-100"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {detectedLocation && showDetails && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Location Detected
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  {detectedLocation.address}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {detectedLocation.city}, {detectedLocation.country}
                  </Badge>
                  {detectedLocation.accuracy && (
                    <Badge variant="outline" className="text-xs">
                      ±{Math.round(detectedLocation.accuracy)}m
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
