import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Database,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PerformanceMetrics {
  queryStats: Record<
    string,
    {
      count: number;
      totalTime: number;
      avgTime: number;
    }
  >;
  databaseStats: any[];
  cacheStats: {
    memory: {
      size: number;
      maxSize: number;
    };
    redis: {
      connected: boolean;
    };
  };
  systemStats: {
    memory: {
      heapUsed: string;
      heapTotal: string;
      external: string;
    };
    uptime: number;
    responseTime: number;
  };
}

export function PerformanceMonitor() {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const {
    data: metrics,
    isLoading,
    error,
    refetch,
  } = useQuery<PerformanceMetrics>({
    queryKey: ["performance-metrics"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/performance");
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleRefresh = () => {
    refetch();
    setLastRefresh(new Date());
  };

  // Calculate performance indicators
  const getPerformanceIndicators = () => {
    if (!metrics)
      return {
        slowQueries: 0,
        totalQueries: 0,
        avgQueryTime: 0,
        cacheHitRate: 0,
      };

    const slowQueries = Object.entries(metrics.queryStats).filter(
      ([_, stats]) => stats.avgTime > 1000
    );

    const totalQueries = Object.values(metrics.queryStats).reduce(
      (sum, stats) => sum + stats.count,
      0
    );

    const avgQueryTime =
      Object.values(metrics.queryStats).reduce(
        (sum, stats) => sum + stats.avgTime,
        0
      ) / Object.keys(metrics.queryStats).length || 0;

    return {
      slowQueries: slowQueries.length,
      totalQueries,
      avgQueryTime,
      cacheHitRate:
        metrics.cacheStats.memory.size / metrics.cacheStats.memory.maxSize,
    };
  };

  const indicators = getPerformanceIndicators();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading performance metrics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center text-red-500">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <span>Failed to load performance metrics</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Monitor</h2>
          <p className="text-muted-foreground">
            Real-time system performance metrics and database statistics
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{indicators.totalQueries}</div>
            <p className="text-xs text-muted-foreground">Last 30 seconds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Query Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {indicators.avgQueryTime.toFixed(1)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              {indicators.avgQueryTime > 1000 ? (
                <span className="text-red-500">Slow performance</span>
              ) : (
                <span className="text-green-500">Good performance</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slow Queries</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{indicators.slowQueries}</div>
            <p className="text-xs text-muted-foreground">
              {indicators.slowQueries > 0 ? (
                <span className="text-red-500">Needs attention</span>
              ) : (
                <span className="text-green-500">All queries fast</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(indicators.cacheHitRate * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Memory cache utilization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Query Performance Details */}
      <Card>
        <CardHeader>
          <CardTitle>Query Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(metrics?.queryStats || {}).map(
              ([queryName, stats]) => (
                <div
                  key={queryName}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {stats.avgTime > 1000 ? (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{queryName}</p>
                      <p className="text-sm text-muted-foreground">
                        {stats.count} executions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {stats.avgTime.toFixed(1)}ms avg
                    </p>
                    <Badge
                      variant={stats.avgTime > 1000 ? "destructive" : "default"}
                      className="text-xs"
                    >
                      {stats.avgTime > 1000 ? "Slow" : "Fast"}
                    </Badge>
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Heap Used:</span>
                <span className="font-mono">
                  {metrics?.systemStats.memory.heapUsed}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Heap Total:</span>
                <span className="font-mono">
                  {metrics?.systemStats.memory.heapTotal}
                </span>
              </div>
              <div className="flex justify-between">
                <span>External Memory:</span>
                <span className="font-mono">
                  {metrics?.systemStats.memory.external}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span className="font-mono">
                  {Math.floor((metrics?.systemStats.uptime || 0) / 3600)}h{" "}
                  {Math.floor(((metrics?.systemStats.uptime || 0) % 3600) / 60)}
                  m
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cache Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Memory Cache:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono">
                    {metrics?.cacheStats.memory.size}/
                    {metrics?.cacheStats.memory.maxSize}
                  </span>
                  <Badge variant="outline">Items</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Redis Cache:</span>
                <div className="flex items-center space-x-2">
                  {metrics?.cacheStats.redis.connected ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <Badge variant="default">Connected</Badge>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <Badge variant="destructive">Disconnected</Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {lastRefresh.toLocaleTimeString()}
      </div>
    </div>
  );
}
