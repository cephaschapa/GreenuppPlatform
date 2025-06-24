import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Bell,
  BellOff,
  Settings,
  Plus,
  Trash2,
  Thermometer,
  Droplets,
  Wind,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WeatherAlert {
  id: string;
  name: string;
  type:
    | "temperature"
    | "humidity"
    | "wind"
    | "precipitation"
    | "uv"
    | "frost"
    | "drought";
  condition: "above" | "below" | "equals";
  threshold: number;
  unit: string;
  enabled: boolean;
  location: string;
  notificationType: "push" | "email" | "both";
  lastTriggered?: Date;
  createdAt: Date;
}

interface WeatherAlertSystemProps {
  currentWeather: {
    temp: number;
    humidity: number;
    windSpeed: number;
    uv: number;
    precipitation: number;
  } | null;
  location: string;
}

export function WeatherAlertSystem({
  currentWeather,
  location,
}: WeatherAlertSystemProps) {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAlert, setNewAlert] = useState<Partial<WeatherAlert>>({
    name: "",
    type: "temperature",
    condition: "above",
    threshold: 0,
    unit: "°C",
    enabled: true,
    location,
    notificationType: "push",
  });
  const { toast } = useToast();

  // Load alerts from localStorage (in a real app, this would be from the backend)
  useEffect(() => {
    const savedAlerts = localStorage.getItem("weatherAlerts");
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }
  }, []);

  // Save alerts to localStorage
  const saveAlerts = (updatedAlerts: WeatherAlert[]) => {
    localStorage.setItem("weatherAlerts", JSON.stringify(updatedAlerts));
    setAlerts(updatedAlerts);
  };

  // Check if weather conditions trigger any alerts
  useEffect(() => {
    if (!currentWeather) return;

    alerts.forEach((alert) => {
      if (!alert.enabled) return;

      let shouldTrigger = false;
      let currentValue = 0;

      switch (alert.type) {
        case "temperature":
          currentValue = currentWeather.temp;
          break;
        case "humidity":
          currentValue = currentWeather.humidity;
          break;
        case "wind":
          currentValue = currentWeather.windSpeed;
          break;
        case "uv":
          currentValue = currentWeather.uv;
          break;
        case "precipitation":
          currentValue = currentWeather.precipitation;
          break;
        case "frost":
          currentValue = currentWeather.temp;
          shouldTrigger = currentValue < 2;
          break;
        case "drought":
          currentValue = currentWeather.humidity;
          shouldTrigger = currentValue < 30 && currentWeather.temp > 25;
          break;
      }

      if (alert.type !== "frost" && alert.type !== "drought") {
        switch (alert.condition) {
          case "above":
            shouldTrigger = currentValue > alert.threshold;
            break;
          case "below":
            shouldTrigger = currentValue < alert.threshold;
            break;
          case "equals":
            shouldTrigger = Math.abs(currentValue - alert.threshold) < 1;
            break;
        }
      }

      if (shouldTrigger) {
        triggerAlert(alert, currentValue);
      }
    });
  }, [currentWeather, alerts]);

  const triggerAlert = (alert: WeatherAlert, currentValue: number) => {
    // Check if alert was recently triggered (within last hour)
    const lastTriggered = alert.lastTriggered;
    if (lastTriggered && Date.now() - lastTriggered.getTime() < 3600000) {
      return; // Don't trigger if already triggered recently
    }

    // Update alert with trigger time
    const updatedAlerts = alerts.map((a) =>
      a.id === alert.id ? { ...a, lastTriggered: new Date() } : a
    );
    saveAlerts(updatedAlerts);

    // Show notification
    toast({
      title: `Weather Alert: ${alert.name}`,
      description: `${alert.type} is ${alert.condition} ${alert.threshold}${
        alert.unit
      } (Current: ${currentValue.toFixed(1)}${alert.unit})`,
      variant: "destructive",
    });

    // In a real app, you would also send push notifications or emails here
    console.log(`Weather alert triggered: ${alert.name}`);
  };

  const createAlert = () => {
    if (!newAlert.name || newAlert.threshold === undefined) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const alert: WeatherAlert = {
      id: Date.now().toString(),
      name: newAlert.name!,
      type: newAlert.type!,
      condition: newAlert.condition!,
      threshold: newAlert.threshold!,
      unit: newAlert.unit!,
      enabled: newAlert.enabled!,
      location: newAlert.location!,
      notificationType: newAlert.notificationType!,
      createdAt: new Date(),
    };

    const updatedAlerts = [...alerts, alert];
    saveAlerts(updatedAlerts);

    setNewAlert({
      name: "",
      type: "temperature",
      condition: "above",
      threshold: 0,
      unit: "°C",
      enabled: true,
      location,
      notificationType: "push",
    });
    setIsCreateDialogOpen(false);

    toast({
      title: "Alert Created",
      description: `Weather alert "${alert.name}" has been created successfully`,
    });
  };

  const toggleAlert = (alertId: string) => {
    const updatedAlerts = alerts.map((alert) =>
      alert.id === alertId ? { ...alert, enabled: !alert.enabled } : alert
    );
    saveAlerts(updatedAlerts);
  };

  const deleteAlert = (alertId: string) => {
    const updatedAlerts = alerts.filter((alert) => alert.id !== alertId);
    saveAlerts(updatedAlerts);
    toast({
      title: "Alert Deleted",
      description: "Weather alert has been deleted successfully",
    });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "temperature":
        return <Thermometer className="h-4 w-4" />;
      case "humidity":
        return <Droplets className="h-4 w-4" />;
      case "wind":
        return <Wind className="h-4 w-4" />;
      case "uv":
        return <Zap className="h-4 w-4" />;
      case "precipitation":
        return <Droplets className="h-4 w-4" />;
      case "frost":
        return <Shield className="h-4 w-4" />;
      case "drought":
        return <Droplets className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getUnitForType = (type: string) => {
    switch (type) {
      case "temperature":
        return "°C";
      case "humidity":
        return "%";
      case "wind":
        return "km/h";
      case "uv":
        return "";
      case "precipitation":
        return "%";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Weather Alerts
            </CardTitle>
            <CardDescription>
              Set custom weather thresholds and receive notifications
            </CardDescription>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Alert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Weather Alert</DialogTitle>
                <DialogDescription>
                  Set up a custom weather alert for your location
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="alert-name">Alert Name</Label>
                  <Input
                    id="alert-name"
                    value={newAlert.name}
                    onChange={(e) =>
                      setNewAlert({ ...newAlert, name: e.target.value })
                    }
                    placeholder="e.g., High Temperature Alert"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="alert-type">Weather Type</Label>
                    <Select
                      value={newAlert.type}
                      onValueChange={(value: any) => {
                        setNewAlert({
                          ...newAlert,
                          type: value,
                          unit: getUnitForType(value),
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="temperature">Temperature</SelectItem>
                        <SelectItem value="humidity">Humidity</SelectItem>
                        <SelectItem value="wind">Wind Speed</SelectItem>
                        <SelectItem value="uv">UV Index</SelectItem>
                        <SelectItem value="precipitation">
                          Precipitation
                        </SelectItem>
                        <SelectItem value="frost">Frost Risk</SelectItem>
                        <SelectItem value="drought">Drought Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="alert-condition">Condition</Label>
                    <Select
                      value={newAlert.condition}
                      onValueChange={(value: any) =>
                        setNewAlert({ ...newAlert, condition: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="above">Above</SelectItem>
                        <SelectItem value="below">Below</SelectItem>
                        <SelectItem value="equals">Equals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="alert-threshold">Threshold</Label>
                  <Input
                    id="alert-threshold"
                    type="number"
                    value={newAlert.threshold}
                    onChange={(e) =>
                      setNewAlert({
                        ...newAlert,
                        threshold: parseFloat(e.target.value),
                      })
                    }
                    placeholder="Enter threshold value"
                  />
                </div>

                <div>
                  <Label htmlFor="alert-notification">Notification Type</Label>
                  <Select
                    value={newAlert.notificationType}
                    onValueChange={(value: any) =>
                      setNewAlert({ ...newAlert, notificationType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="push">Push Notification</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="alert-enabled"
                    checked={newAlert.enabled}
                    onCheckedChange={(checked) =>
                      setNewAlert({ ...newAlert, enabled: checked })
                    }
                  />
                  <Label htmlFor="alert-enabled">
                    Enable alert immediately
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={createAlert}>Create Alert</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BellOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No weather alerts configured</p>
            <p className="text-sm">Create your first alert to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getAlertIcon(alert.type)}
                  <div>
                    <div className="font-medium">{alert.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {alert.type} {alert.condition} {alert.threshold}
                      {alert.unit}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created {alert.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alert.lastTriggered && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Triggered {alert.lastTriggered.toLocaleDateString()}
                    </Badge>
                  )}
                  <Switch
                    checked={alert.enabled}
                    onCheckedChange={() => toggleAlert(alert.id)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAlert(alert.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
