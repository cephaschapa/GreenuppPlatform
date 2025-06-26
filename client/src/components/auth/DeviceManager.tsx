import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Clock,
  Shield,
  ShieldCheck,
  Trash2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DeviceSession {
  id: number;
  sessionId: string;
  deviceName: string;
  deviceType: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  isCurrent: boolean;
  isTrusted: boolean;
  lastActiveAt: string;
  createdAt: string;
}

export function DeviceManager() {
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchDevices = async () => {
    try {
      const response = await apiRequest("GET", "/api/auth/devices");
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load devices",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const revokeDevice = async (sessionId: string) => {
    try {
      await apiRequest("DELETE", `/api/auth/devices/${sessionId}`);

      setDevices(devices.filter((device) => device.sessionId !== sessionId));

      toast({
        title: "Success",
        description: "Device session revoked successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke device session",
        variant: "destructive",
      });
    }
  };

  const markAsTrusted = async (sessionId: string) => {
    try {
      await apiRequest("POST", `/api/auth/devices/${sessionId}/trust`);

      setDevices(
        devices.map((device) =>
          device.sessionId === sessionId
            ? { ...device, isTrusted: true }
            : device
        )
      );

      toast({
        title: "Success",
        description: "Device marked as trusted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark device as trusted",
        variant: "destructive",
      });
    }
  };

  const refreshDevices = async () => {
    setIsRefreshing(true);
    await fetchDevices();
    setIsRefreshing(false);
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading devices...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Device Management</h2>
          <p className="text-muted-foreground">
            Manage your active sessions and trusted devices
          </p>
        </div>
        <Button onClick={refreshDevices} disabled={isRefreshing}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {devices.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No active devices found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {devices.map((device) => (
            <Card key={device.sessionId} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-lg">
                      {getDeviceIcon(device.deviceType)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{device.deviceName}</h3>
                        {device.isCurrent && (
                          <Badge variant="default" className="text-xs">
                            Current Session
                          </Badge>
                        )}
                        {device.isTrusted && (
                          <Badge variant="secondary" className="text-xs">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Trusted
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Globe className="h-3 w-3" />
                          <span>
                            {device.browser} on {device.os}
                          </span>
                        </div>

                        {device.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{device.location}</span>
                          </div>
                        )}

                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            Last active: {formatDate(device.lastActiveAt)}
                          </span>
                        </div>

                        <div className="text-xs">IP: {device.ipAddress}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    {!device.isCurrent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revokeDevice(device.sessionId)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Revoke
                      </Button>
                    )}

                    {!device.isTrusted && !device.isCurrent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsTrusted(device.sessionId)}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        Trust
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Tip:</strong> Regularly review your active sessions
          and revoke any devices you don't recognize. Trusted devices won't
          require additional verification for future logins.
        </AlertDescription>
      </Alert>
    </div>
  );
}
