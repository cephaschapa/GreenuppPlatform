import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  MapPin,
  Navigation,
  X,
  Pencil,
  Square,
  RotateCcw,
  Calculator,
  Save,
  Trash2,
} from "lucide-react";
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

export interface FieldBoundaryData {
  id?: number;
  // Center point for location reference
  centerLat: number;
  centerLng: number;
  // Boundary polygon (GeoJSON format)
  boundary: {
    type: "Polygon";
    coordinates: number[][][]; // [[[lng, lat], [lng, lat], ...]]
  };
  // Calculated area in square meters
  calculatedArea: number;
  // Location data for geocoding
  country: string;
  region: string;
  city: string;
  neighborhood: string | null;
  postalCode: string | null;
  formattedAddress: string | null;
  placeId: string | null;
}

interface FieldBoundaryPickerProps {
  initialBoundary?: FieldBoundaryData | null;
  onBoundarySelect: (boundary: FieldBoundaryData) => void;
  onBoundaryClear?: () => void;
  disabled?: boolean;
}

type DrawingMode = "none" | "drawing" | "editing";

// Component to handle drawing interactions
function DrawingHandler({
  mode,
  onPointAdd,
  onDrawingComplete,
  currentPolygon,
}: {
  mode: DrawingMode;
  onPointAdd: (lat: number, lng: number) => void;
  onDrawingComplete: () => void;
  currentPolygon: [number, number][];
}) {
  useMapEvents({
    click(e) {
      if (mode === "drawing") {
        onPointAdd(e.latlng.lat, e.latlng.lng);
      }
    },
    contextmenu(e) {
      e.originalEvent.preventDefault();
      if (mode === "drawing" && currentPolygon.length >= 3) {
        onDrawingComplete();
      }
    },
  });
  return null;
}

// Component to fit map bounds
function BoundsFitter({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, bounds]);

  return null;
}

// Calculate polygon area using shoelace formula
function calculatePolygonArea(coordinates: number[][]): number {
  if (coordinates.length < 3) return 0;

  let area = 0;
  const n = coordinates.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += coordinates[i][0] * coordinates[j][1];
    area -= coordinates[j][0] * coordinates[i][1];
  }

  area = Math.abs(area) / 2;

  // Convert from degrees to square meters (approximate)
  // This is a rough approximation - for precise calculations, use proper geodesic formulas
  const earthRadius = 6371000; // meters
  const degToRad = Math.PI / 180;
  const avgLat =
    coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length;
  const latCorrection = Math.cos(avgLat * degToRad);

  return area * Math.pow(earthRadius * degToRad, 2) * latCorrection;
}

// Calculate polygon centroid
function calculatePolygonCentroid(coordinates: number[][]): [number, number] {
  if (coordinates.length === 0) return [0, 0];

  const centroid = coordinates.reduce(
    (acc, coord) => [acc[0] + coord[1], acc[1] + coord[0]], // [lat, lng]
    [0, 0]
  );

  return [centroid[0] / coordinates.length, centroid[1] / coordinates.length];
}

// Format area for display
function formatArea(areaInSquareMeters: number): string {
  if (areaInSquareMeters < 10000) {
    return `${areaInSquareMeters.toFixed(0)} m²`;
  } else {
    const hectares = areaInSquareMeters / 10000;
    const acres = hectares * 2.471;
    return `${hectares.toFixed(2)} ha (${acres.toFixed(2)} acres)`;
  }
}

export default function FieldBoundaryPicker({
  initialBoundary,
  onBoundarySelect,
  onBoundaryClear,
  disabled = false,
}: FieldBoundaryPickerProps) {
  const [drawingMode, setDrawingMode] = useState<DrawingMode>("none");
  const [currentPolygon, setCurrentPolygon] = useState<[number, number][]>([]);
  const [savedBoundary, setSavedBoundary] = useState<FieldBoundaryData | null>(
    initialBoundary || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const mapRef = useRef<L.Map | null>(null);

  // Default center (can be customized based on user's region)
  const defaultCenter: [number, number] = [-15.4067, 28.2871]; // Zambia center

  // Calculate bounds for the current view
  const bounds = savedBoundary
    ? (() => {
        const coords = savedBoundary.boundary.coordinates[0];
        const latLngs = coords.map(
          (coord) => [coord[1], coord[0]] as [number, number]
        );
        return L.latLngBounds(latLngs);
      })()
    : null;

  // Auto-detect GPS location
  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsDetectingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setUserLocation([lat, lng]);
        setIsDetectingLocation(false);

        // Update map center
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 15);
        }

        toast({
          title: "Location detected",
          description: "Map centered on your current location.",
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsDetectingLocation(false);

        let errorMessage = "Failed to detect location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }

        setError(errorMessage);
        toast({
          title: "Location detection failed",
          description: errorMessage,
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

  // Start drawing mode
  const startDrawing = () => {
    setDrawingMode("drawing");
    setCurrentPolygon([]);
    setError(null);
    toast({
      title: "Drawing mode activated",
      description: "Click on the map to add points. Right-click to finish.",
    });
  };

  // Add point to current polygon
  const addPoint = (lat: number, lng: number) => {
    setCurrentPolygon((prev) => [...prev, [lat, lng]]);
  };

  // Complete drawing and save boundary
  const completeDrawing = async () => {
    if (currentPolygon.length < 3) {
      setError("A field boundary must have at least 3 points");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Close the polygon by adding the first point at the end
      const closedPolygon = [...currentPolygon, currentPolygon[0]];

      // Convert to GeoJSON format [lng, lat]
      const geoJsonCoords = closedPolygon.map(([lat, lng]) => [lng, lat]);

      // Calculate area and centroid
      const area = calculatePolygonArea(geoJsonCoords);
      const [centerLat, centerLng] = calculatePolygonCentroid(geoJsonCoords);

      // Show user that we're processing the boundary
      toast({
        title: "Processing field boundary",
        description: "Calculating area and fetching location details...",
      });

      // Get location data from center point
      const response = await fetch(
        `/api/geocode/reverse?lat=${centerLat}&lon=${centerLng}&zoom=18&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch location data");
      }

      // Show user that we're getting location data
      toast({
        title: "Getting location details",
        description: "Retrieving address information for your field...",
      });

      const locationData = await response.json();

      const boundaryData: FieldBoundaryData = {
        centerLat,
        centerLng,
        boundary: {
          type: "Polygon",
          coordinates: [geoJsonCoords],
        },
        calculatedArea: area,
        country: locationData?.address?.country || "",
        region:
          locationData?.address?.state || locationData?.address?.county || "",
        city:
          locationData?.address?.city ||
          locationData?.address?.town ||
          locationData?.address?.village ||
          "",
        neighborhood:
          locationData?.address?.suburb ||
          locationData?.address?.neighbourhood ||
          null,
        postalCode: locationData?.address?.postcode || null,
        formattedAddress: locationData?.display_name || null,
        placeId: locationData?.place_id?.toString() || null,
      };

      setSavedBoundary(boundaryData);
      onBoundarySelect(boundaryData);
      setDrawingMode("none");
      setCurrentPolygon([]);

      toast({
        title: "Field boundary saved successfully!",
        description: `Area: ${formatArea(area)} • Location: ${
          boundaryData.formattedAddress
            ? boundaryData.formattedAddress.split(",").slice(0, 2).join(", ")
            : `${boundaryData.city}, ${boundaryData.region}`
        }`,
      });
    } catch (error) {
      console.error("Error saving boundary:", error);
      setError("Failed to save field boundary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear drawing
  const clearDrawing = () => {
    setCurrentPolygon([]);
    setDrawingMode("none");
    setError(null);
  };

  // Clear saved boundary
  const clearBoundary = () => {
    setSavedBoundary(null);
    setCurrentPolygon([]);
    setDrawingMode("none");
    setError(null);
    onBoundaryClear?.();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Square className="h-5 w-5" />
            Field Boundary
            {savedBoundary && (
              <Badge variant="secondary" className="ml-auto">
                {formatArea(savedBoundary.calculatedArea)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="draw" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="draw">Draw Boundary</TabsTrigger>
              <TabsTrigger value="location">Find My Location</TabsTrigger>
            </TabsList>

            <TabsContent value="draw" className="space-y-4">
              {/* Drawing Controls */}
              <div className="flex flex-wrap gap-2">
                {drawingMode === "none" && (
                  <Button
                    onClick={startDrawing}
                    disabled={disabled}
                    className="flex items-center gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Draw Field Boundary
                  </Button>
                )}

                {drawingMode === "drawing" && (
                  <>
                    <Button
                      onClick={completeDrawing}
                      disabled={currentPolygon.length < 3}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save Boundary ({currentPolygon.length} points)
                    </Button>
                    <Button
                      onClick={clearDrawing}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Clear
                    </Button>
                  </>
                )}

                {savedBoundary && drawingMode === "none" && (
                  <>
                    <Button
                      onClick={startDrawing}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Redraw
                    </Button>
                    <Button
                      onClick={clearBoundary}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear Boundary
                    </Button>
                  </>
                )}
              </div>

              {/* Instructions */}
              <div className="text-sm text-muted-foreground">
                {drawingMode === "drawing" ? (
                  <div className="space-y-1">
                    <p>• Click on the map to add boundary points</p>
                    <p>
                      • Right-click when finished (minimum 3 points required)
                    </p>
                    <p>
                      • Area and location details will be calculated
                      automatically
                    </p>
                    <p className="text-xs text-blue-600">
                      💡 After completing, we'll process the boundary and get
                      location data
                    </p>
                  </div>
                ) : savedBoundary ? (
                  <div className="space-y-1">
                    <p>
                      • Field boundary is set with{" "}
                      {savedBoundary.calculatedArea
                        ? formatArea(savedBoundary.calculatedArea)
                        : "calculated area"}
                    </p>
                    <p>• You can redraw or clear the boundary if needed</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p>• Draw the boundary of your field on the map</p>
                    <p>• The system will automatically calculate the area</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-4">
              {/* GPS Location Detection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Auto-detect Location</span>
                </div>

                <p className="text-sm text-muted-foreground">
                  Use your device's GPS to automatically center the map on your
                  current location.
                </p>

                <Button
                  onClick={detectCurrentLocation}
                  disabled={disabled || isDetectingLocation}
                  className="flex items-center gap-2"
                >
                  {isDetectingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                  {isDetectingLocation
                    ? "Detecting Location..."
                    : "Detect My Location"}
                </Button>

                {userLocation && (
                  <div className="flex items-center gap-2 text-sm bg-blue-50 p-3 rounded-md">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span>
                      Location detected: {userLocation[0].toFixed(6)},{" "}
                      {userLocation[1].toFixed(6)}
                    </span>
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  <p>• Your browser will ask for location permission</p>
                  <p>
                    • This helps you start drawing near your current position
                  </p>
                  <p>
                    • Switch to "Draw Boundary" tab to start mapping your field
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Map */}
          <div className="h-[500px] w-full relative border rounded-md overflow-hidden">
            <MapContainer
              center={
                bounds ? bounds.getCenter() : userLocation || defaultCenter
              }
              zoom={bounds ? 15 : userLocation ? 15 : 8}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {bounds && <BoundsFitter bounds={bounds} />}

              {/* Drawing handler */}
              <DrawingHandler
                mode={drawingMode}
                onPointAdd={addPoint}
                onDrawingComplete={completeDrawing}
                currentPolygon={currentPolygon}
              />

              {/* User location marker */}
              {userLocation && (
                <Marker
                  position={userLocation}
                  icon={L.icon({
                    iconUrl:
                      "data:image/svg+xml;base64," +
                      btoa(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    `),
                    iconSize: [24, 24],
                    iconAnchor: [12, 24],
                  })}
                />
              )}

              {/* Current drawing polygon */}
              {currentPolygon.length > 0 && (
                <Polygon
                  positions={currentPolygon}
                  pathOptions={{
                    color: "#3b82f6",
                    fillColor: "#3b82f6",
                    fillOpacity: 0.2,
                    weight: 2,
                  }}
                />
              )}

              {/* Current drawing points */}
              {currentPolygon.map((point, index) => (
                <Marker key={index} position={point} />
              ))}

              {/* Saved boundary */}
              {savedBoundary && (
                <>
                  <Polygon
                    positions={savedBoundary.boundary.coordinates[0].map(
                      (coord) => [coord[1], coord[0]]
                    )}
                    pathOptions={{
                      color: "#10b981",
                      fillColor: "#10b981",
                      fillOpacity: 0.3,
                      weight: 3,
                    }}
                  />
                  <Marker
                    position={[
                      savedBoundary.centerLat,
                      savedBoundary.centerLng,
                    ]}
                  />
                </>
              )}
            </MapContainer>

            {(isLoading || isDetectingLocation) && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <div className="text-sm">
                      <p className="font-medium">
                        {isDetectingLocation
                          ? "Detecting your location..."
                          : "Processing field boundary..."}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {isDetectingLocation
                          ? "Using GPS to find your position"
                          : "Calculating area and getting location details"}
                      </p>
                    </div>
                  </div>
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

          {/* Area Information */}
          {savedBoundary && (
            <div className="flex items-center gap-2 text-sm bg-green-50 p-3 rounded-md">
              <Calculator className="h-4 w-4 text-green-600" />
              <span className="font-medium">
                Calculated Area: {formatArea(savedBoundary.calculatedArea)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
