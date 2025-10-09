import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Navigation, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface DetectedLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  city?: string;
  state?: string;
  region?: string;
  country?: string;
  postalCode?: string;
}

interface LocationAutoDetectProps {
  onLocationDetected: (location: DetectedLocation) => void;
  onError?: (error: string) => void;
  buttonText?: string;
  autoDetect?: boolean;
  showDetails?: boolean;
  className?: string;
}

export default function LocationAutoDetect({
  onLocationDetected,
  onError,
  buttonText = "Detect My Location",
  autoDetect = false,
  showDetails = true,
  className = "",
}: LocationAutoDetectProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedLocation, setDetectedLocation] = useState<DetectedLocation | null>(null);
  const { toast } = useToast();

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          let errorMessage = "Failed to get location";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location access in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable. Please try again.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again.";
              break;
          }
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<any> => {
    // Use your existing backend geocoding endpoint
    const response = await fetch(
      `/api/geocode/reverse?lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error("Failed to get address details");
    }

    return await response.json();
  };

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    setError(null);

    try {
      // Step 1: Get current GPS position
      console.log("Getting GPS position...");
      const position = await getCurrentPosition();

      const { latitude, longitude, accuracy } = position.coords;
      console.log("GPS position obtained:", { latitude, longitude, accuracy });

      // Step 2: Reverse geocode to get address
      console.log("Reverse geocoding...");
      const geocodeData = await reverseGeocode(latitude, longitude);
      console.log("Geocode data:", geocodeData);

      // Step 3: Parse address components
      const address = geocodeData.address || {};
      const location: DetectedLocation = {
        latitude,
        longitude,
        accuracy,
        address: geocodeData.display_name || "",
        city: address.city || address.town || address.village || "",
        state: address.state || address.county || "",
        region: address.state || address.county || "",
        country: address.country || "",
        postalCode: address.postcode || "",
      };

      console.log("Parsed location:", location);

      setDetectedLocation(location);
      onLocationDetected(location);

      toast({
        title: "Location detected!",
        description: location.city
          ? `Found your location in ${location.city}, ${location.country}`
          : "Location detected successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to detect location";
      console.error("Location detection error:", err);

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

  // Auto-detect on mount if enabled
  useEffect(() => {
    if (autoDetect && !detectedLocation && !isDetecting) {
      handleDetectLocation();
    }
  }, [autoDetect]);

  return (
    <div className={`space-y-3 ${className}`}>
      <Button
        type="button"
        variant={detectedLocation ? "outline" : "default"}
        onClick={handleDetectLocation}
        disabled={isDetecting}
        className="w-full"
        size="lg"
      >
        {isDetecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Detecting Location...
          </>
        ) : detectedLocation ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
            Location Detected - Click to Update
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
                  onClick={handleDetectLocation}
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
                {detectedLocation.address && (
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    {detectedLocation.address}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {detectedLocation.city && detectedLocation.country && (
                    <Badge variant="outline" className="text-xs">
                      {detectedLocation.city}, {detectedLocation.country}
                    </Badge>
                  )}
                  {detectedLocation.accuracy && (
                    <Badge variant="outline" className="text-xs">
                      Accuracy: ±{Math.round(detectedLocation.accuracy)}m
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {detectedLocation.latitude.toFixed(6)}, {detectedLocation.longitude.toFixed(6)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

