import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  MapPin,
  Tractor,
  Ruler,
  Leaf,
  Calendar,
  Eye,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

// Fix Leaflet's default icon issues
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Custom field marker icon
const FieldIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [1, -34],
  className: "field-marker",
});

L.Marker.prototype.options.icon = DefaultIcon;

interface FieldWithLocation {
  id: number;
  name: string;
  location: string | null;
  locationId: number | null;
  size: string | null;
  sizeUnit: string | null;
  soilType: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  // Boundary data
  boundary?: {
    type: "Polygon";
    coordinates: number[][][];
  } | null;
  calculatedArea?: number | string | null;
  centerLat?: number | string | null;
  centerLng?: number | string | null;
  locationData?: {
    id: number;
    latitude: number;
    longitude: number;
    country: string;
    region: string;
    city: string;
    formattedAddress: string | null;
  };
  crops?: Array<{
    id: number;
    name: string;
    variety: string | null;
    status: string;
    plantingDate: string | null;
    expectedHarvestDate: string | null;
  }>;
}

interface FieldMapDisplayProps {
  selectedFieldId?: number | null;
  onFieldSelect?: (fieldId: number) => void;
  height?: string;
}

// Component to fit map bounds to all markers
function FitBounds({ fields }: { fields: FieldWithLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (fields.length > 0) {
      const bounds = L.latLngBounds([]);

      fields.forEach((field) => {
        // Use boundary bounds if available, otherwise use location data
        if (field.boundary?.coordinates?.[0]) {
          field.boundary.coordinates[0].forEach((coord) => {
            bounds.extend([coord[1], coord[0]]); // [lat, lng]
          });
        } else if (
          field.locationData?.latitude &&
          field.locationData?.longitude
        ) {
          bounds.extend([
            field.locationData.latitude,
            field.locationData.longitude,
          ]);
        } else if (field.centerLat && field.centerLng) {
          const lat =
            typeof field.centerLat === "string"
              ? parseFloat(field.centerLat)
              : field.centerLat;
          const lng =
            typeof field.centerLng === "string"
              ? parseFloat(field.centerLng)
              : field.centerLng;
          bounds.extend([lat, lng]);
        }
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [map, fields]);

  return null;
}

// Get status color for crops
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "harvesting":
      return "bg-orange-100 text-orange-800";
    case "growing":
      return "bg-blue-100 text-blue-800";
    case "planted":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function FieldMapDisplay({
  selectedFieldId,
  onFieldSelect,
  height = "500px",
}: FieldMapDisplayProps) {
  const { user } = useAuth();
  const mapRef = useRef<L.Map | null>(null);

  // Check if basic fields exist (for helpful messaging)
  const { data: basicFields = [] } = useQuery({
    queryKey: ["/api/fields"],
    queryFn: async () => {
      const response = await fetch("/api/fields", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch basic fields");
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Fetch fields with location data
  const {
    data: fields = [],
    isLoading,
    error,
  } = useQuery<FieldWithLocation[]>({
    queryKey: ["fields-with-locations", user?.id],
    queryFn: async () => {
      const response = await fetch("/api/fields/with-locations", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch fields");
      }

      return response.json();
    },
    enabled: !!user?.id,
  });

  // Default center (can be customized based on user's region)
  const defaultCenter: [number, number] = [-15.4067, 28.2871]; // Zambia center

  // Filter fields with valid location data or boundary data
  const fieldsWithLocations = fields.filter((field: FieldWithLocation) => {
    const hasLocationData =
      field.locationData?.latitude && field.locationData?.longitude;
    const hasBoundary =
      field.boundary?.coordinates?.[0]?.length &&
      field.boundary.coordinates[0].length > 0;
    // Convert string coordinates to numbers for comparison
    const centerLat =
      typeof field.centerLat === "string"
        ? parseFloat(field.centerLat)
        : field.centerLat;
    const centerLng =
      typeof field.centerLng === "string"
        ? parseFloat(field.centerLng)
        : field.centerLng;
    const hasCenterCoords =
      centerLat && centerLng && !isNaN(centerLat) && !isNaN(centerLng);

    return hasLocationData || hasBoundary || hasCenterCoords;
  });

  // Count fields with boundaries
  const fieldsWithBoundaries = fieldsWithLocations.filter(
    (field) =>
      field.boundary?.coordinates?.[0]?.length &&
      field.boundary.coordinates[0].length > 0
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Field Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Field Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Failed to load field locations
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Field Locations
          <div className="flex gap-2 ml-auto">
            <Badge variant="secondary">
              {fieldsWithLocations.length} fields mapped
            </Badge>
            {fieldsWithBoundaries.length > 0 && (
              <Badge
                variant="outline"
                className="text-green-700 border-green-300"
              >
                {fieldsWithBoundaries.length} with boundaries
              </Badge>
            )}
          </div>
        </CardTitle>
        {fieldsWithLocations.some(
          (field) => field.boundary?.coordinates?.[0]
        ) && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-1 bg-green-500 border-dashed border border-green-600"></div>
              <span>Field boundaries</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1 bg-blue-500"></div>
              <span>Selected field</span>
            </div>
            <span className="text-xs">
              💡 Click boundaries to select fields
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative z-10" style={{ height }}>
          <MapContainer
            center={defaultCenter}
            zoom={8}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {fieldsWithLocations.length > 0 && (
              <FitBounds fields={fieldsWithLocations} />
            )}

            {fieldsWithLocations.map((field) => {
              // Determine marker position (handle string coordinates from database)
              const markerPosition: [number, number] =
                field.locationData?.latitude && field.locationData?.longitude
                  ? [field.locationData.latitude, field.locationData.longitude]
                  : field.centerLat && field.centerLng
                  ? [
                      typeof field.centerLat === "string"
                        ? parseFloat(field.centerLat)
                        : field.centerLat,
                      typeof field.centerLng === "string"
                        ? parseFloat(field.centerLng)
                        : field.centerLng,
                    ]
                  : [0, 0];

              return (
                <div key={field.id}>
                  {/* Field boundary polygon */}
                  {field.boundary?.coordinates?.[0] && (
                    <Polygon
                      positions={field.boundary.coordinates[0].map((coord) => [
                        coord[1],
                        coord[0],
                      ])}
                      pathOptions={{
                        color:
                          selectedFieldId === field.id ? "#3b82f6" : "#10b981",
                        fillColor:
                          selectedFieldId === field.id ? "#3b82f6" : "#10b981",
                        fillOpacity: selectedFieldId === field.id ? 0.4 : 0.25,
                        weight: selectedFieldId === field.id ? 4 : 3,
                        opacity: 1,
                        dashArray:
                          selectedFieldId === field.id ? undefined : "5, 5",
                      }}
                      eventHandlers={{
                        click: () => {
                          if (onFieldSelect) {
                            onFieldSelect(field.id);
                          }
                        },
                        mouseover: (e) => {
                          const layer = e.target;
                          layer.setStyle({
                            weight: 4,
                            fillOpacity: 0.5,
                          });
                        },
                        mouseout: (e) => {
                          const layer = e.target;
                          layer.setStyle({
                            weight: selectedFieldId === field.id ? 4 : 3,
                            fillOpacity:
                              selectedFieldId === field.id ? 0.4 : 0.25,
                          });
                        },
                      }}
                    />
                  )}

                  {/* Field center marker */}
                  <Marker
                    position={markerPosition}
                    icon={
                      selectedFieldId === field.id ? FieldIcon : DefaultIcon
                    }
                  >
                    <Popup>
                      <div className="space-y-3 min-w-[250px]">
                        {/* Field Header */}
                        <div className="border-b pb-2">
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Tractor className="h-4 w-4" />
                            {field.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {field.locationData?.formattedAddress ||
                              `${field.locationData?.city}, ${field.locationData?.region}`}
                          </p>
                        </div>

                        {/* Field Details */}
                        <div className="space-y-2">
                          {/* Area Information - prioritize calculated area from boundary */}
                          {(field.calculatedArea || field.size) && (
                            <div className="flex items-center gap-2 text-sm">
                              <Ruler className="h-3 w-3 text-muted-foreground" />
                              <span>
                                {field.calculatedArea
                                  ? (() => {
                                      const areaNum =
                                        typeof field.calculatedArea === "string"
                                          ? parseFloat(field.calculatedArea)
                                          : field.calculatedArea;
                                      const hectares = areaNum / 10000;
                                      if (hectares < 1) {
                                        return `${areaNum.toFixed(0)} m²`;
                                      } else {
                                        const acres = hectares * 2.471;
                                        return `${hectares.toFixed(
                                          2
                                        )} ha (${acres.toFixed(2)} acres)`;
                                      }
                                    })()
                                  : `${field.size} ${
                                      field.sizeUnit || "hectares"
                                    }`}
                                {field.calculatedArea && (
                                  <span className="text-xs text-green-600 ml-1">
                                    📐 Precise
                                  </span>
                                )}
                              </span>
                            </div>
                          )}

                          {/* Boundary Status */}
                          {field.boundary?.coordinates?.[0] && (
                            <div className="flex items-center gap-2 text-sm">
                              <div className="h-3 w-3 bg-green-500 rounded-full" />
                              <span className="text-green-700">
                                Field boundary mapped (
                                {field.boundary.coordinates[0].length - 1}{" "}
                                points)
                              </span>
                            </div>
                          )}

                          {field.soilType && (
                            <div className="flex items-center gap-2 text-sm">
                              <div className="h-3 w-3 bg-amber-600 rounded-full" />
                              <span>{field.soilType}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>
                              Created{" "}
                              {new Date(field.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Crops */}
                        {field.crops && field.crops.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Leaf className="h-3 w-3 text-green-600" />
                              Crops ({field.crops.length})
                            </div>
                            <div className="space-y-1">
                              {field.crops.slice(0, 3).map((crop: any) => (
                                <div
                                  key={crop.id}
                                  className="flex items-center justify-between text-xs"
                                >
                                  <span>
                                    {crop.name}{" "}
                                    {crop.variety && `(${crop.variety})`}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs ${getStatusColor(
                                      crop.status
                                    )}`}
                                  >
                                    {crop.status}
                                  </Badge>
                                </div>
                              ))}
                              {field.crops.length > 3 && (
                                <p className="text-xs text-muted-foreground">
                                  +{field.crops.length - 3} more crops
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {field.notes && (
                          <div className="text-xs text-muted-foreground border-t pt-2">
                            <p className="line-clamp-2">{field.notes}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          {onFieldSelect && (
                            <Button
                              size="sm"
                              onClick={() => onFieldSelect(field.id)}
                              className="flex-1"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </div>
              );
            })}
          </MapContainer>

          {fieldsWithLocations.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  No fields with location data
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {basicFields.length > 0
                    ? `You have ${basicFields.length} fields, but they need location data to appear on the map`
                    : "Add location data to your fields to see them on the map"}
                </p>
                {basicFields.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-blue-600 font-medium">
                      💡 To add your fields to the map:
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>1. Edit an existing field and add location data</p>
                      <p>
                        2. Or create a new field with the "Point Location" or
                        "Field Boundary" tabs
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
