import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import {
  // MapPin,
  Users,
  Activity,
  // Layers,
  // Filter,
  // Search,
  // Eye,
  BarChart3,
  Globe,
  // Satellite,
  // Bug,
  Wheat,
  // AlertTriangle,
  // Clock,
  UserCheck,
  MapIcon,
} from "lucide-react";

interface UserMapData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  lastActiveAt: string;
  createdAt: string;
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    state?: string;
    country?: string;
    formattedAddress?: string;
  };
  farmProfile?: {
    farmName?: string;
    farmLocation?: string;
    farmSize?: string;
    mainCrops?: string[];
  };
  fields?: Array<{
    id: number;
    name: string;
    centerLat: number;
    centerLng: number;
    size: number;
    boundary?: any;
  }>;
  recentActivity?: {
    pestReports: number;
    plantAnalyses: number;
    lastLogin: string;
  };
}

interface MapStats {
  totalUsers: number;
  activeUsers: number;
  farmerUsers: number;
  countries: string[];
  recentSignups: number;
  totalFields: number;
  totalFarmArea: number;
}

interface MapFilters {
  userType: string;
  activityStatus: string;
  country: string;
  dateRange: string;
  searchQuery: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export function AdminUserMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserMapData | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [mapType, setMapType] = useState<
    "roadmap" | "satellite" | "hybrid" | "terrain"
  >("satellite");
  const [showClusters, setShowClusters] = useState(true);
  const [showFields, setShowFields] = useState(true);
  const [showPestReports, setShowPestReports] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const [filters, setFilters] = useState<MapFilters>({
    userType: "all",
    activityStatus: "all",
    country: "all",
    dateRange: "all",
    searchQuery: "",
  });

  // Fetch map data
  const { data: mapData, isLoading: mapLoading } = useQuery({
    queryKey: ["/api/admin/users/map-data", filters],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `/api/admin/users/map-data?${new URLSearchParams(filters as any)}`
      );
      return response.json() as Promise<UserMapData[]>;
    },
  });

  // Fetch map statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/users/map-stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users/map-stats");
      return response.json() as Promise<MapStats>;
    },
  });

  // Fetch pest outbreak data
  const { data: pestOutbreaks } = useQuery({
    queryKey: ["/api/admin/users/pest-outbreaks"],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        "/api/admin/users/pest-outbreaks"
      );
      return response.json() as Promise<any[]>;
    },
    enabled: showPestReports,
  });

  // Fetch farming analytics
  const { data: analytics } = useQuery({
    queryKey: ["/api/admin/users/farming-analytics"],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        "/api/admin/users/farming-analytics"
      );
      return response.json() as Promise<any>;
    },
    enabled: showAnalytics,
  });

  // Fetch Google Maps API key from server
  const { data: mapsConfig } = useQuery({
    queryKey: ["/api/maps/config"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/maps/config");
      return response.json() as Promise<{ success: boolean; apiKey: string }>;
    },
  });

  // Initialize Google Maps
  useEffect(() => {
    // Don't initialize if we don't have the API key yet
    if (!mapsConfig?.success || !mapsConfig?.apiKey) return;

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 6,
        center: { lat: -15.3875, lng: 28.3228 }, // Centered on Zambia
        mapTypeId: mapType,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true,
        gestureHandling: "auto",
        tilt: mapType === "satellite" || mapType === "hybrid" ? 45 : 0, // Enable 3D tilt for satellite view
        heading: 0,
        styles:
          mapType === "roadmap"
            ? [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }],
                },
              ]
            : [], // Only apply custom styles to roadmap
      });

      mapInstanceRef.current = map;

      // Add map type controls
      map.setOptions({
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: window.google.maps.ControlPosition.TOP_CENTER,
        },
      });
    };

    // Load Google Maps API if not already loaded
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsConfig.apiKey}&libraries=geometry,places,visualization`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, [mapType, mapsConfig]);

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapData) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    let hasValidLocations = false;

    mapData.forEach((user) => {
      // Add user location marker
      if (user.location?.latitude && user.location?.longitude) {
        const userMarker = createUserMarker(user);
        markersRef.current.push(userMarker);
        bounds.extend(
          new window.google.maps.LatLng(
            user.location.latitude,
            user.location.longitude
          )
        );
        hasValidLocations = true;
      }

      // Add field markers if enabled
      if (showFields && user.fields) {
        user.fields.forEach((field) => {
          if (field.centerLat && field.centerLng) {
            const fieldMarker = createFieldMarker(field, user);
            markersRef.current.push(fieldMarker);
            bounds.extend(
              new window.google.maps.LatLng(field.centerLat, field.centerLng)
            );
            hasValidLocations = true;
          }
        });
      }
    });

    // Add pest outbreak markers if enabled
    if (showPestReports && pestOutbreaks) {
      pestOutbreaks.forEach((outbreak) => {
        if (outbreak.coordinates?.latitude && outbreak.coordinates?.longitude) {
          const outbreakMarker = createPestOutbreakMarker(outbreak);
          markersRef.current.push(outbreakMarker);
          bounds.extend(
            new window.google.maps.LatLng(
              outbreak.coordinates.latitude,
              outbreak.coordinates.longitude
            )
          );
          hasValidLocations = true;
        }
      });
    }

    // Add activity hotspot markers if enabled
    if (showAnalytics && analytics?.activityHotspots) {
      analytics.activityHotspots.forEach((hotspot: any) => {
        if (hotspot.coordinates?.latitude && hotspot.coordinates?.longitude) {
          const hotspotMarker = createActivityHotspotMarker(hotspot);
          markersRef.current.push(hotspotMarker);
          bounds.extend(
            new window.google.maps.LatLng(
              hotspot.coordinates.latitude,
              hotspot.coordinates.longitude
            )
          );
          hasValidLocations = true;
        }
      });
    }

    // Fit map to show all markers
    if (hasValidLocations) {
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [
    mapData,
    showFields,
    showClusters,
    showPestReports,
    pestOutbreaks,
    showAnalytics,
    analytics,
    createUserMarker,
    createFieldMarker,
  ]);

  const createUserMarker = useCallback((user: UserMapData) => {
    if (!mapInstanceRef.current || !user.location) return null;

    // Determine marker color based on user status and role
    let markerColor = "#6B7280"; // Default gray
    if (user.isActive) {
      markerColor =
        user.role === "farmer"
          ? "#10B981"
          : user.role === "admin"
          ? "#EF4444"
          : "#3B82F6";
    }

    const marker = new window.google.maps.Marker({
      position: { lat: user.location.latitude, lng: user.location.longitude },
      map: mapInstanceRef.current,
      title: `${user.firstName} ${user.lastName}`,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: user.isActive ? 8 : 6,
        fillColor: markerColor,
        fillOpacity: user.isActive ? 0.9 : 0.6,
        strokeColor: "#FFFFFF",
        strokeWeight: 2,
      },
    });

    // Create info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: createUserInfoWindowContent(user),
    });

    marker.addListener("click", () => {
      // Close other info windows
      markersRef.current.forEach((m) => {
        if (m.infoWindow) m.infoWindow.close();
      });

      infoWindow.open(mapInstanceRef.current, marker);
      setSelectedUser(user);
    });

    (marker as any).infoWindow = infoWindow;
    return marker;
  }, []);

  const createFieldMarker = useCallback((field: any, user: UserMapData) => {
    if (!mapInstanceRef.current) return null;

    const marker = new window.google.maps.Marker({
      position: { lat: field.centerLat, lng: field.centerLng },
      map: mapInstanceRef.current,
      title: `${field.name} - ${user.firstName} ${user.lastName}`,
      icon: {
        path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: "#8B5CF6",
        fillOpacity: 0.7,
        strokeColor: "#FFFFFF",
        strokeWeight: 1,
      },
    });

    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div class="p-2">
          <h3 class="font-semibold">${field.name}</h3>
          <p class="text-sm text-gray-600">Owner: ${user.firstName} ${user.lastName}</p>
          <p class="text-sm">Size: ${field.size} hectares</p>
        </div>
      `,
    });

    marker.addListener("click", () => {
      infoWindow.open(mapInstanceRef.current, marker);
    });

    return marker;
  }, []);

  const createPestOutbreakMarker = (outbreak: any) => {
    if (!mapInstanceRef.current) return null;

    // Determine marker color based on severity
    let markerColor = "#FFA500"; // Default orange
    if (outbreak.severity === "high") markerColor = "#DC2626";
    else if (outbreak.severity === "medium") markerColor = "#F59E0B";
    else if (outbreak.severity === "low") markerColor = "#10B981";

    const marker = new window.google.maps.Marker({
      position: {
        lat: outbreak.coordinates.latitude,
        lng: outbreak.coordinates.longitude,
      },
      map: mapInstanceRef.current,
      title: `Pest Outbreak: ${outbreak.pestInfo.name}`,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: markerColor,
        fillOpacity: 0.8,
        strokeColor: "#FFFFFF",
        strokeWeight: 3,
      },
    });

    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div class="p-3 max-w-xs">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-4 h-4 rounded-full" style="background-color: ${markerColor}"></div>
            <h3 class="font-semibold text-red-700">🚨 Pest Outbreak</h3>
          </div>
          <p class="text-sm font-medium mb-1">${outbreak.pestInfo.name}</p>
          <p class="text-xs text-gray-600 mb-2">${outbreak.location}</p>
          <div class="space-y-1 text-xs">
            <p><strong>Severity:</strong> <span class="capitalize">${
              outbreak.severity
            }</span></p>
            <p><strong>Status:</strong> <span class="capitalize">${
              outbreak.status
            }</span></p>
            <p><strong>Affected Farms:</strong> ${outbreak.affectedFarms}</p>
            <p><strong>Reports:</strong> ${outbreak.reportCount}</p>
            <p><strong>Risk Level:</strong> <span class="capitalize">${
              outbreak.pestInfo.riskLevel
            }</span></p>
            <p><strong>Economic Impact:</strong> <span class="capitalize">${
              outbreak.pestInfo.economicImpact
            }</span></p>
          </div>
          ${
            outbreak.firstReported
              ? `<p class="text-xs text-gray-500 mt-2">First reported: ${new Date(
                  outbreak.firstReported
                ).toLocaleDateString()}</p>`
              : ""
          }
        </div>
      `,
    });

    marker.addListener("click", () => {
      infoWindow.open(mapInstanceRef.current, marker);
    });

    return marker;
  };

  const createActivityHotspotMarker = (hotspot: any) => {
    if (!mapInstanceRef.current) return null;

    // Scale marker size based on activity level
    const scale = Math.min(Math.max(hotspot.totalActivity / 2, 6), 20);

    const marker = new window.google.maps.Marker({
      position: {
        lat: hotspot.coordinates.latitude,
        lng: hotspot.coordinates.longitude,
      },
      map: mapInstanceRef.current,
      title: `Activity Hotspot: ${hotspot.location}`,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: scale,
        fillColor: "#8B5CF6",
        fillOpacity: 0.6,
        strokeColor: "#FFFFFF",
        strokeWeight: 2,
      },
    });

    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div class="p-3 max-w-xs">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-4 h-4 rounded-full bg-purple-500"></div>
            <h3 class="font-semibold text-purple-700">📊 Activity Hotspot</h3>
          </div>
          <p class="text-sm font-medium mb-1">${hotspot.location}</p>
          <div class="space-y-1 text-xs">
            <p><strong>Total Activity:</strong> ${hotspot.totalActivity}</p>
            <p><strong>Pest Reports:</strong> ${hotspot.pestReports}</p>
            <p><strong>Plant Analyses:</strong> ${hotspot.plantAnalyses}</p>
            ${
              hotspot.lastActivity
                ? `<p><strong>Last Activity:</strong> ${new Date(
                    hotspot.lastActivity
                  ).toLocaleDateString()}</p>`
                : ""
            }
          </div>
        </div>
      `,
    });

    marker.addListener("click", () => {
      infoWindow.open(mapInstanceRef.current, marker);
    });

    return marker;
  };

  const createUserInfoWindowContent = (user: UserMapData) => {
    return `
      <div class="p-3 max-w-xs">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-3 h-3 rounded-full ${
            user.isActive ? "bg-green-500" : "bg-gray-400"
          }"></div>
          <h3 class="font-semibold">${user.firstName} ${user.lastName}</h3>
        </div>
        <p class="text-sm text-gray-600 mb-1">${user.email}</p>
        <div class="flex gap-1 mb-2">
          <span class="px-2 py-1 text-xs rounded ${
            user.role === "farmer"
              ? "bg-green-100 text-green-800"
              : user.role === "admin"
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }">${user.role}</span>
          ${
            user.isActive
              ? '<span class="px-2 py-1 text-xs rounded bg-green-100 text-green-800">Active</span>'
              : '<span class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">Inactive</span>'
          }
        </div>
        ${
          user.farmProfile?.farmName
            ? `<p class="text-sm"><strong>Farm:</strong> ${user.farmProfile.farmName}</p>`
            : ""
        }
        ${
          user.location?.city
            ? `<p class="text-sm"><strong>Location:</strong> ${user.location.city}, ${user.location.country}</p>`
            : ""
        }
        ${
          user.recentActivity
            ? `
          <div class="mt-2 pt-2 border-t">
            <p class="text-xs text-gray-500">Recent Activity:</p>
            <p class="text-xs">Pest Reports: ${user.recentActivity.pestReports}</p>
            <p class="text-xs">Plant Analyses: ${user.recentActivity.plantAnalyses}</p>
          </div>
        `
            : ""
        }
        <button onclick="window.viewUserDetails(${
          user.id
        })" class="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
          View Details
        </button>
      </div>
    `;
  };

  // Expose function to global scope for info window buttons
  useEffect(() => {
    (window as any).viewUserDetails = (userId: number) => {
      const user = mapData?.find((u) => u.id === userId);
      if (user) {
        setSelectedUser(user);
        setShowUserDialog(true);
      }
    };
  }, [mapData]);

  if (mapLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Users
                </p>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.activeUsers || 0}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Farmers
                </p>
                <p className="text-2xl font-bold text-emerald-600">
                  {stats?.farmerUsers || 0}
                </p>
              </div>
              <Wheat className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Countries
                </p>
                <p className="text-2xl font-bold">
                  {stats?.countries?.length || 0}
                </p>
              </div>
              <Globe className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapIcon className="h-5 w-5" />
            User Location Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="userType">User Type</Label>
                <Select
                  value={filters.userType}
                  onValueChange={(value) =>
                    setFilters({ ...filters, userType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="farmer">Farmers</SelectItem>
                    <SelectItem value="buyer">Buyers</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="activityStatus">Activity</Label>
                <Select
                  value={filters.activityStatus}
                  onValueChange={(value) =>
                    setFilters({ ...filters, activityStatus: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Select
                  value={filters.country}
                  onValueChange={(value) =>
                    setFilters({ ...filters, country: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {stats?.countries?.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search users..."
                  value={filters.searchQuery}
                  onChange={(e) =>
                    setFilters({ ...filters, searchQuery: e.target.value })
                  }
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() =>
                    setFilters({
                      userType: "all",
                      activityStatus: "all",
                      country: "all",
                      dateRange: "all",
                      searchQuery: "",
                    })
                  }
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Map Type and Layer Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label>Map Type:</Label>
                <Select
                  value={mapType}
                  onValueChange={(value: any) => setMapType(value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="roadmap">Roadmap</SelectItem>
                    <SelectItem value="satellite">Satellite</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="terrain">Terrain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFields}
                    onChange={(e) => setShowFields(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Show Fields</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPestReports}
                    onChange={(e) => setShowPestReports(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Pest Outbreaks</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAnalytics}
                    onChange={(e) => setShowAnalytics(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Activity Hotspots</span>
                </label>
              </div>
            </div>

            {/* Map Container */}
            <div className="relative">
              <div
                ref={mapRef}
                className="w-full h-[600px] rounded-lg border"
                style={{ minHeight: "600px" }}
              />

              {/* Map Legend */}
              <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg">
                <h4 className="font-semibold text-sm mb-2">Legend</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Active Farmers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Active Users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Admins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span>Inactive Users</span>
                  </div>
                  {showFields && (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 bg-purple-500"
                        style={{
                          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                        }}
                      ></div>
                      <span>Farm Fields</span>
                    </div>
                  )}
                  {showPestReports && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-600 border-2 border-white"></div>
                        <span>High Risk Outbreaks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-white"></div>
                        <span>Medium Risk Outbreaks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
                        <span>Low Risk Outbreaks</span>
                      </div>
                    </>
                  )}
                  {showAnalytics && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500 opacity-60"></div>
                      <span>Activity Hotspots</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Panel */}
      {showAnalytics && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Crop Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wheat className="h-5 w-5" />
                Crop Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analytics.cropDistribution
                  ?.slice(0, 10)
                  .map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium text-sm">{item.cropType}</p>
                        <p className="text-xs text-gray-600">{item.location}</p>
                      </div>
                      <Badge variant="secondary">
                        {item.farmerCount} farmers
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Farm Size Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Farm Size Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analytics.farmSizeDistribution
                  ?.slice(0, 8)
                  .map((item: any, index: number) => (
                    <div key={index} className="p-2 bg-gray-50 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium text-sm">{item.location}</p>
                        <Badge variant="outline">{item.farmCount} farms</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <span>Avg: {item.avgFarmSize} ha</span>
                        <span>Total: {item.totalFarmArea} ha</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Hotspots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analytics.activityHotspots
                  ?.slice(0, 8)
                  .map((item: any, index: number) => (
                    <div key={index} className="p-2 bg-gray-50 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium text-sm">{item.location}</p>
                        <Badge
                          variant={
                            item.totalActivity > 10
                              ? "destructive"
                              : item.totalActivity > 5
                              ? "default"
                              : "secondary"
                          }
                        >
                          {item.totalActivity} activities
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <span>🐛 {item.pestReports} pest reports</span>
                        <span>🌱 {item.plantAnalyses} analyses</span>
                      </div>
                      {item.lastActivity && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last:{" "}
                          {new Date(item.lastActivity).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              User Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about the selected user
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Basic Information</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Name:</strong> {selectedUser.firstName}{" "}
                      {selectedUser.lastName}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedUser.email}
                    </p>
                    <p>
                      <strong>Role:</strong> {selectedUser.role}
                    </p>
                    <p>
                      <strong>Status:</strong>
                      <Badge
                        className={
                          selectedUser.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {selectedUser.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </p>
                    <p>
                      <strong>Joined:</strong>{" "}
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Last Active:</strong>{" "}
                      {new Date(selectedUser.lastActiveAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Location</h3>
                  <div className="space-y-1 text-sm">
                    {selectedUser.location ? (
                      <>
                        <p>
                          <strong>City:</strong> {selectedUser.location.city}
                        </p>
                        <p>
                          <strong>State:</strong> {selectedUser.location.state}
                        </p>
                        <p>
                          <strong>Country:</strong>{" "}
                          {selectedUser.location.country}
                        </p>
                        <p>
                          <strong>Coordinates:</strong>{" "}
                          {selectedUser.location.latitude?.toFixed(4)},{" "}
                          {selectedUser.location.longitude?.toFixed(4)}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-500">
                        No location data available
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {selectedUser.farmProfile && (
                <div>
                  <h3 className="font-semibold mb-2">Farm Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p>
                        <strong>Farm Name:</strong>{" "}
                        {selectedUser.farmProfile.farmName || "N/A"}
                      </p>
                      <p>
                        <strong>Farm Size:</strong>{" "}
                        {selectedUser.farmProfile.farmSize || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Location:</strong>{" "}
                        {selectedUser.farmProfile.farmLocation || "N/A"}
                      </p>
                      <p>
                        <strong>Main Crops:</strong>{" "}
                        {selectedUser.farmProfile.mainCrops?.join(", ") ||
                          "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedUser.fields && selectedUser.fields.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">
                    Fields ({selectedUser.fields.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                    {selectedUser.fields.map((field) => (
                      <div
                        key={field.id}
                        className="p-2 border rounded text-sm"
                      >
                        <p>
                          <strong>{field.name}</strong> - {field.size} hectares
                        </p>
                        <p className="text-gray-600">
                          Lat: {field.centerLat}, Lng: {field.centerLng}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedUser.recentActivity && (
                <div>
                  <h3 className="font-semibold mb-2">Recent Activity</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedUser.recentActivity.pestReports}
                      </p>
                      <p className="text-gray-600">Pest Reports</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <p className="text-2xl font-bold text-green-600">
                        {selectedUser.recentActivity.plantAnalyses}
                      </p>
                      <p className="text-gray-600">Plant Analyses</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <p className="text-xs font-medium text-purple-600">
                        Last Login
                      </p>
                      <p className="text-sm">
                        {new Date(
                          selectedUser.recentActivity.lastLogin
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
