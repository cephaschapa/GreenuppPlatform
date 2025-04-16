import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { formatDistance } from "@/lib/h3-utils";

// Fix default icon issue with Leaflet in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Define the format of location data
export interface LocationData {
  id?: number;
  latitude: number | null;
  longitude: number | null;
  country: string;
  region: string;
  city: string;
  neighborhood?: string | null;
  postalCode?: string | null;
  formattedAddress?: string | null;
  placeId?: string | null;
}

// Component that handles map click events
const MapClickHandler = ({ 
  onLocationSelect 
}: { 
  onLocationSelect: (lat: number, lng: number) => void 
}) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Initialize default icon for Leaflet
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationSelectorProps {
  initialLocation?: LocationData | null;
  onChange?: (location: LocationData) => void;
  readOnly?: boolean;
  showRadius?: boolean;
  radiusKm?: number;
  onRadiusChange?: (radius: number) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  initialLocation,
  onChange,
  readOnly = false,
  showRadius = false,
  radiusKm = 10,
  onRadiusChange
}) => {
  // State for location data
  const [location, setLocation] = useState<LocationData | null>(initialLocation || null);
  const [searchInput, setSearchInput] = useState('');
  const [radius, setRadius] = useState(radiusKm);
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    initialLocation && initialLocation.latitude && initialLocation.longitude
      ? [initialLocation.latitude, initialLocation.longitude]
      : [0, 0] // Default to center of map if no location
  );
  const [mapZoom, setMapZoom] = useState(initialLocation ? 13 : 2);
  const mapRef = useRef<L.Map | null>(null);

  // Update local state when initialLocation changes
  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
      if (initialLocation.latitude && initialLocation.longitude) {
        setMapCenter([initialLocation.latitude, initialLocation.longitude]);
        if (mapRef.current) {
          mapRef.current.setView(
            [initialLocation.latitude, initialLocation.longitude],
            13
          );
        }
      }
    }
  }, [initialLocation]);

  // Update radius state when prop changes
  useEffect(() => {
    setRadius(radiusKm);
  }, [radiusKm]);

  // Function to handle location selection from map click
  const handleLocationSelect = async (lat: number, lng: number) => {
    if (readOnly) return;

    try {
      // Get address information from coordinates using reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );
      const data = await response.json();

      if (data && data.address) {
        const newLocation: LocationData = {
          latitude: lat,
          longitude: lng,
          country: data.address.country || '',
          region: data.address.state || data.address.county || '',
          city: data.address.city || data.address.town || data.address.village || '',
          neighborhood: data.address.suburb || data.address.neighbourhood || null,
          postalCode: data.address.postcode || null,
          formattedAddress: data.display_name || null,
          placeId: data.place_id?.toString() || null
        };

        setLocation(newLocation);
        onChange?.(newLocation);
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  };

  // Function to handle search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput || readOnly) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        // Parse the address parts
        const address = result.address || {};
        
        const newLocation: LocationData = {
          latitude: lat,
          longitude: lng,
          country: address.country || '',
          region: address.state || address.county || '',
          city: address.city || address.town || address.village || '',
          neighborhood: address.suburb || address.neighbourhood || null,
          postalCode: address.postcode || null,
          formattedAddress: result.display_name || null,
          placeId: result.place_id?.toString() || null
        };

        setLocation(newLocation);
        setMapCenter([lat, lng]);
        setMapZoom(13);
        
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 13);
        }

        onChange?.(newLocation);
      }
    } catch (error) {
      console.error('Error searching for location:', error);
    }
  };

  // Handle radius change
  const handleRadiusChange = (value: number[]) => {
    const newRadius = value[0];
    setRadius(newRadius);
    onRadiusChange?.(newRadius);
  };

  return (
    <div className="flex flex-col space-y-4">
      {!readOnly && (
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for a location..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-8"
              disabled={readOnly}
            />
          </div>
          <Button type="submit" disabled={readOnly}>
            Find
          </Button>
        </form>
      )}

      <div className="h-[300px] rounded-md overflow-hidden border">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {!readOnly && <MapClickHandler onLocationSelect={handleLocationSelect} />}

          {location && location.latitude && location.longitude && (
            <>
              <Marker position={[location.latitude, location.longitude]} />
              
              {showRadius && (
                <Circle
                  center={[location.latitude, location.longitude]}
                  radius={radius * 1000} // Convert km to meters
                  pathOptions={{ 
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.1,
                    weight: 1
                  }}
                />
              )}
            </>
          )}
        </MapContainer>
      </div>

      {showRadius && !readOnly && (
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Search Radius</span>
            <span className="text-sm font-medium">{formatDistance(radius)}</span>
          </div>
          <Slider 
            value={[radius]}
            min={1}
            max={50}
            step={1}
            onValueChange={handleRadiusChange}
          />
        </div>
      )}

      {location && location.formattedAddress && (
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Selected Location
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 pt-0">
            <p className="text-sm">{location.formattedAddress}</p>
            {showRadius && (
              <p className="text-xs text-muted-foreground mt-1">
                Showing results within {formatDistance(radius)}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LocationSelector;