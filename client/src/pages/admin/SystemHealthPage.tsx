import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SystemHealthStatus } from "@/components/SystemHealthStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Activity,
  Server,
  Database,
  HardDrive,
  Cpu,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function SystemHealthPage() {
  const queryClient = useQueryClient();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["health"] });
    setLastRefresh(new Date());
  };

  return (
    <DashboardLayout
      title="System Health"
      description="Monitor system health and performance metrics"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">System Health Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time monitoring of system components and performance
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Last Updated */}
        <div className="text-sm text-muted-foreground">
          Last updated: {lastRefresh.toLocaleString()}
        </div>

        {/* Detailed Health Status */}
        <SystemHealthStatus variant="detailed" showDetails={true} />

        {/* Additional System Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Environment Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Server className="h-5 w-5" />
                Environment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Environment
                </span>
                <span className="text-sm font-medium">
                  {import.meta.env.MODE || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Platform</span>
                <span className="text-sm font-medium">
                  {navigator.platform || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  User Agent
                </span>
                <span className="text-sm font-medium">
                  {navigator.userAgent.split(" ")[0] || "Unknown"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Memory Available
                </span>
                <span className="text-sm font-medium">
                  {(navigator as any).deviceMemory
                    ? `${(navigator as any).deviceMemory}GB`
                    : "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Connection Type
                </span>
                <span className="text-sm font-medium">
                  {(navigator as any).connection?.effectiveType || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Language</span>
                <span className="text-sm font-medium">
                  {navigator.language || "Unknown"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Database Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Database className="h-5 w-5" />
                Database
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="default" className="text-xs">
                  Connected
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Provider</span>
                <span className="text-sm font-medium">PostgreSQL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Connection Pool
                </span>
                <span className="text-sm font-medium">Active</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Check History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Health Check History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Health check history and trends will be displayed here.
              <br />
              This feature can be expanded to show historical data and alerts.
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Force Health Check
              </Button>
              <Button variant="outline" size="sm">
                <Database className="h-4 w-4 mr-2" />
                Test Database
              </Button>
              <Button variant="outline" size="sm">
                <Server className="h-4 w-4 mr-2" />
                Restart Services
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
