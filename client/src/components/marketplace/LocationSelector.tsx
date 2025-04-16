import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

// Fix Leaflet's default icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface LocationData {
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

interface LocationSelectorProps {
  initialLocation: LocationData | null;
  onLocationSelect: (location: LocationData) => void;
}

interface MapClickHandlerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

// Component to handle map click events
function MapClickHandler({ onLocationSelect }: MapClickHandlerProps) {
  const map = useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  
  return null;
}

export default function LocationSelector({ initialLocation, onLocationSelect }: LocationSelectorProps) {
  const [position, setPosition] = useState<[number, number] | null>(() => {
    if (initialLocation && typeof initialLocation.latitude === 'number' && typeof initialLocation.longitude === 'number') {
      return [initialLocation.latitude, initialLocation.longitude];
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Function to handle map clicks
  const handleMapClick = async (lat: number, lng: number) => {
    setIsLoading(true);
    setError(null);
    setPosition([lat, lng]);

    try {
      // Use reverse geocoding to get address details
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }

      const data = await response.json();

      if (data && data.address) {
        const locationData: LocationData = {
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

        onLocationSelect(locationData);
      }
    } catch (err) {
      console.error('Error fetching location data:', err);
      setError('Failed to get location details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up initial map view
  useEffect(() => {
    if (!position && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPos);
          
          // Center map on position
          if (mapRef.current) {
            mapRef.current.setView(newPos, 13);
          }
        },
        (err) => {
          console.error('Error getting user location:', err);
          // Default to central Zambia if location cannot be determined
          const defaultPos: [number, number] = [-15.4167, 28.2833]; // Lusaka, Zambia
          setPosition(defaultPos);
        }
      );
    }
  }, [position]);

  if (!position) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center bg-muted rounded-md">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border shadow-sm">
        <div className="h-[300px] w-full relative">
          <MapContainer
            center={position}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {position && <Marker position={position} />}
            <MapClickHandler onLocationSelect={handleMapClick} />
          </MapContainer>

          {isLoading && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="bg-white p-3 rounded-full">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <div className="text-sm text-muted-foreground">
            {error ? (
              <p className="text-destructive">{error}</p>
            ) : (
              <p>Click on the map to set your precise location</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}