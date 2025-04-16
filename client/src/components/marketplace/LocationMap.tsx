import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, AlertTriangle, Loader2 } from 'lucide-react';
import { formatDistance, getCardinalDirection, getBearing } from '@/lib/h3-utils';

// Fix Leaflet's default icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import sellerIcon from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const SellerIcon = L.icon({
  iconUrl: sellerIcon,
  shadowUrl: iconShadow,
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [1, -34]
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface LocationMapProps {
  sellerLatitude: number | null;
  sellerLongitude: number | null;
  locationAddress?: string | null;
  locationName?: string;
}

export default function LocationMap({ 
  sellerLatitude, 
  sellerLongitude, 
  locationAddress, 
  locationName = 'Seller Location' 
}: LocationMapProps) {
  const [buyerLocation, setBuyerLocation] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [bearing, setBearing] = useState<number | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Check if seller location is valid
  const isSellerLocationValid = 
    sellerLatitude !== null && 
    sellerLongitude !== null &&
    !isNaN(sellerLatitude) && 
    !isNaN(sellerLongitude);

  const sellerPosition: [number, number] | null = 
    isSellerLocationValid ? [sellerLatitude, sellerLongitude] : null;

  // Calculate distance and bearing between buyer and seller
  useEffect(() => {
    if (buyerLocation && sellerPosition) {
      // Calculate distance in kilometers
      const distanceKm = calculateDistance(
        buyerLocation[0], 
        buyerLocation[1], 
        sellerPosition[0], 
        sellerPosition[1]
      );
      
      setDistance(distanceKm);

      // Calculate bearing
      const bearingDegrees = calculateBearing(
        buyerLocation[0], 
        buyerLocation[1], 
        sellerPosition[0], 
        sellerPosition[1]
      );
      
      setBearing(bearingDegrees);
    }
  }, [buyerLocation, sellerPosition]);

  // Calculate distance using Haversine formula
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  }

  // Calculate bearing between two points
  function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
              Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
    let bearing = Math.atan2(y, x);
    
    bearing = toDeg(bearing);
    bearing = (bearing + 360) % 360;
    
    return bearing;
  }

  // Helper functions for calculations
  function toRad(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  function toDeg(radians: number): number {
    return radians * 180 / Math.PI;
  }

  // Get user's current location
  const detectLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos: [number, number] = [
            position.coords.latitude,
            position.coords.longitude
          ];
          
          setBuyerLocation(newPos);
          
          // If we have a map reference, fit both points
          if (mapRef.current && sellerPosition) {
            const bounds = L.latLngBounds([newPos, sellerPosition]);
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
          }
          
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Could not determine your location. Please ensure location permissions are enabled.');
          setIsLoadingLocation(false);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
      setIsLoadingLocation(false);
    }
  };

  // Set bounds to fit both markers when both positions are available
  useEffect(() => {
    if (mapRef.current && buyerLocation && sellerPosition) {
      const bounds = L.latLngBounds([buyerLocation, sellerPosition]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [buyerLocation, sellerPosition]);

  if (!isSellerLocationValid) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] bg-muted/30 rounded-md">
            <div className="text-center p-4">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-muted-foreground">Location information not available for this listing</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" /> 
          Seller Location
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[300px] relative">
          <MapContainer
            center={sellerPosition as LatLngExpression || [0, 0]}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {sellerPosition && (
              <Marker position={sellerPosition} icon={SellerIcon}>
                <Popup>
                  <strong>{locationName}</strong>
                  {locationAddress && <p className="text-xs mt-1">{locationAddress}</p>}
                </Popup>
              </Marker>
            )}
            {buyerLocation && (
              <Marker position={buyerLocation}>
                <Popup>
                  <strong>Your Location</strong>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          <div className="absolute bottom-4 left-0 right-0 mx-auto px-4 z-[1000]">
            <div className="bg-white rounded-md p-3 shadow-md max-w-[250px] mx-auto">
              {!buyerLocation ? (
                <Button 
                  onClick={detectLocation} 
                  size="sm" 
                  className="w-full"
                  disabled={isLoadingLocation}
                >
                  {isLoadingLocation ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4 mr-2" />
                      Show Distance from Me
                    </>
                  )}
                </Button>
              ) : (
                <div className="text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <strong>Distance:</strong> 
                    <span>{formatDistance(distance || 0)}</span>
                  </div>
                  {bearing !== null && (
                    <div className="flex items-center justify-between">
                      <strong>Direction:</strong>
                      <span>{getCardinalDirection(bearing)}</span>
                    </div>
                  )}
                </div>
              )}
              {locationError && (
                <p className="text-red-500 text-xs mt-2">{locationError}</p>
              )}
            </div>
          </div>
        </div>

        {locationAddress && (
          <div className="p-3 text-sm text-muted-foreground border-t">
            <MapPin className="h-4 w-4 inline-block mr-1" />
            {locationAddress}
          </div>
        )}
      </CardContent>
    </Card>
  );
}