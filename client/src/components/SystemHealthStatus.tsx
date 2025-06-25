import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Server,
  Activity,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface HealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  requestId: string;
  responseTime: number;
}

interface DatabaseHealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
  database: "connected" | "disconnected";
  requestId: string;
  responseTime: number;
  error?: string;
}

interface DetailedHealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
  checks: {
    database: boolean;
    memory: boolean;
    disk: boolean;
  };
  memory: {
    heapUsed: string;
    heapTotal: string;
    external: string;
  };
  requestId: string;
  responseTime: number;
  error?: string;
}

export function SystemHealthStatus({
  variant = "default",
  showDetails = false,
}: {
  variant?: "default" | "compact" | "detailed";
  showDetails?: boolean;
}) {
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  // Fetch basic health status
  const {
    data: basicHealth,
    isLoading: basicLoading,
    error: basicError,
  } = useQuery<HealthStatus>({
    queryKey: ["health", "basic"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/health");
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 2,
  });

  // Fetch database health status
  const {
    data: dbHealth,
    isLoading: dbLoading,
    error: dbError,
  } = useQuery<DatabaseHealthStatus>({
    queryKey: ["health", "database"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/health/db");
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
    retry: 2,
  });

  // Fetch detailed health status (only if showDetails is true)
  const {
    data: detailedHealth,
    isLoading: detailedLoading,
    error: detailedError,
  } = useQuery<DetailedHealthStatus>({
    queryKey: ["health", "detailed"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/health/detailed");
      return response.json();
    },
    refetchInterval: 120000, // Refresh every 2 minutes
    retry: 2,
    enabled: showDetails,
  });

  // Determine overall system status
  const getOverallStatus = () => {
    if (basicLoading || dbLoading) return "loading";
    if (basicError || dbError) return "error";
    if (basicHealth?.status === "unhealthy" || dbHealth?.status === "unhealthy")
      return "unhealthy";
    return "healthy";
  };

  const overallStatus = getOverallStatus();

  // Format uptime
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Get status icon and color
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "healthy":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
        };
      case "unhealthy":
        return {
          icon: AlertTriangle,
          color: "text-red-500",
          bgColor: "bg-red-500/10",
        };
      case "loading":
        return {
          icon: Clock,
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
        };
      default:
        return {
          icon: AlertTriangle,
          color: "text-gray-500",
          bgColor: "bg-gray-500/10",
        };
    }
  };

  const statusConfig = getStatusConfig(overallStatus);
  const StatusIcon = statusConfig.icon;

  if (variant === "compact") {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
              <span className="text-sm font-medium">System Status</span>
            </div>
            <Badge
              variant={overallStatus === "healthy" ? "default" : "destructive"}
              className="text-xs"
            >
              {overallStatus === "loading" ? "Checking..." : overallStatus}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5" />
          System Health Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
            <div>
              <p className="font-medium">Overall Status</p>
              <p className="text-sm text-muted-foreground">
                {basicHealth?.environment || "Unknown"} Environment
              </p>
            </div>
          </div>
          <Badge
            variant={overallStatus === "healthy" ? "default" : "destructive"}
            className="text-sm"
          >
            {overallStatus === "loading" ? "Checking..." : overallStatus}
          </Badge>
        </div>

        {/* Service Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* API Server */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">API Server</span>
            </div>
            <div className="text-right">
              <Badge
                variant={
                  basicHealth?.status === "healthy" ? "default" : "destructive"
                }
                className="text-xs"
              >
                {basicLoading
                  ? "Checking..."
                  : basicHealth?.status || "Unknown"}
              </Badge>
              {basicHealth?.responseTime && (
                <p className="text-xs text-muted-foreground mt-1">
                  {basicHealth.responseTime}ms
                </p>
              )}
            </div>
          </div>

          {/* Database */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Database</span>
            </div>
            <div className="text-right">
              <Badge
                variant={
                  dbHealth?.status === "healthy" ? "default" : "destructive"
                }
                className="text-xs"
              >
                {dbLoading ? "Checking..." : dbHealth?.status || "Unknown"}
              </Badge>
              {dbHealth?.responseTime && (
                <p className="text-xs text-muted-foreground mt-1">
                  {dbHealth.responseTime}ms
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Details */}
        {showDetails && detailedHealth && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">System Resources</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border">
                <p className="text-xs text-muted-foreground">Memory Usage</p>
                <p className="font-medium">{detailedHealth.memory.heapUsed}</p>
                <p className="text-xs text-muted-foreground">
                  of {detailedHealth.memory.heapTotal}
                </p>
              </div>
              <div className="p-3 rounded-lg border">
                <p className="text-xs text-muted-foreground">External Memory</p>
                <p className="font-medium">{detailedHealth.memory.external}</p>
              </div>
              <div className="p-3 rounded-lg border">
                <p className="text-xs text-muted-foreground">Uptime</p>
                <p className="font-medium">
                  {basicHealth?.uptime
                    ? formatUptime(basicHealth.uptime)
                    : "Unknown"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Basic Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Version: {basicHealth?.version || "Unknown"}</span>
          <span>Last checked: {lastChecked.toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
