import { useState } from "react";
import { Geolocation, Position } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export const useGeolocation = (options: GeolocationOptions = {}) => {
  const [position, setPosition] = useState<Position | null>(null);
  const [coordinates, setCoordinates] = useState<LocationCoordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNative = Capacitor.isNativePlatform();

  const getCurrentPosition = async (): Promise<LocationCoordinates | null> => {
    setIsLoading(true);
    setError(null);

    try {
      let position: Position;

      if (isNative) {
        // Request permissions first
        const permissions = await Geolocation.requestPermissions();

        if (permissions.location === "denied") {
          throw new Error("Location permission denied");
        }

        position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: options.enableHighAccuracy ?? true,
          timeout: options.timeout ?? 10000,
          maximumAge: options.maximumAge ?? 0,
        });
      } else {
        // Web Geolocation API
        position = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported"));
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (pos) => {
              resolve({
                coords: {
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                  accuracy: pos.coords.accuracy,
                  altitude: pos.coords.altitude,
                  altitudeAccuracy: pos.coords.altitudeAccuracy,
                  heading: pos.coords.heading,
                  speed: pos.coords.speed,
                },
                timestamp: pos.timestamp,
              } as Position);
            },
            (err) => reject(err),
            {
              enableHighAccuracy: options.enableHighAccuracy ?? true,
              timeout: options.timeout ?? 10000,
              maximumAge: options.maximumAge ?? 0,
            }
          );
        });
      }

      const coords: LocationCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
      };

      setPosition(position);
      setCoordinates(coords);
      return coords;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to get location";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const watchPosition = (callback: (coords: LocationCoordinates) => void) => {
    let watchId: string | number;

    if (isNative) {
      (async () => {
        try {
          watchId = await Geolocation.watchPosition(
            {
              enableHighAccuracy: options.enableHighAccuracy ?? true,
              timeout: options.timeout ?? 10000,
              maximumAge: options.maximumAge ?? 5000,
            },
            (position, err) => {
              if (err) {
                setError(err.message);
              } else if (position) {
                const coords: LocationCoordinates = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                  altitude: position.coords.altitude,
                  altitudeAccuracy: position.coords.altitudeAccuracy,
                  heading: position.coords.heading,
                  speed: position.coords.speed,
                };
                setPosition(position);
                setCoordinates(coords);
                callback(coords);
              }
            }
          );
        } catch (err: any) {
          setError(err.message);
        }
      })();
    } else {
      // Web geolocation watch
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const coords: LocationCoordinates = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              altitude: pos.coords.altitude,
              altitudeAccuracy: pos.coords.altitudeAccuracy,
              heading: pos.coords.heading,
              speed: pos.coords.speed,
            };
            setCoordinates(coords);
            callback(coords);
          },
          (err) => setError(err.message),
          {
            enableHighAccuracy: options.enableHighAccuracy ?? true,
            timeout: options.timeout ?? 10000,
            maximumAge: options.maximumAge ?? 5000,
          }
        );
      }
    }

    return () => {
      if (isNative && typeof watchId === 'string') {
        Geolocation.clearWatch({ id: watchId });
      } else if (!isNative && typeof watchId === 'number') {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  };

  return {
    position,
    coordinates,
    getCurrentPosition,
    watchPosition,
    isLoading,
    error,
    isNative,
    isSupported: isNative || 'geolocation' in navigator,
  };
};


