import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Droplets,
  Bug,
  Leaf,
  AlertTriangle,
  Camera,
  TrendingUp,
  Clock,
  CheckCircle,
  Sprout,
  FlaskConical,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface CropActivityLogProps {
  cropId: number;
  limit?: number;
}

interface Observation {
  id: number;
  cropId: number;
  observationType: string;
  observationDate: string;
  notes?: string;
  healthStatus?: string;
  pestDetected?: boolean;
  pestType?: string;
  diseaseDetected?: boolean;
  diseaseType?: string;
  actionTaken?: string;
  waterAmountLiters?: number;
  fertilizerApplied?: boolean;
  temperature?: number;
  weatherCondition?: string;
}

export function CropActivityLog({ cropId, limit = 20 }: CropActivityLogProps) {
  const { data: observations, isLoading } = useQuery<Observation[]>({
    queryKey: ["/api/crop-observations", cropId],
    queryFn: async () => {
      const response = await fetch(
        `/api/crop-observations?cropId=${cropId}&limit=${limit}`
      );
      if (!response.ok) throw new Error("Failed to fetch observations");
      return await response.json();
    },
  });

  const getObservationIcon = (type: string) => {
    switch (type) {
      case "watering":
        return <Droplets className="h-4 w-4 text-blue-500" />;
      case "fertilizing":
        return <FlaskConical className="h-4 w-4 text-purple-500" />;
      case "pest_check":
        return <Bug className="h-4 w-4 text-orange-500" />;
      case "disease_check":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "growth_measurement":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "harvest_check":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default:
        return <Leaf className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthStatusColor = (status?: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "good":
        return "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300";
      case "fair":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "poor":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatObservationType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!observations || observations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Timeline</CardTitle>
          <CardDescription>
            Track all observations and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Sprout className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No observations yet</p>
            <p className="text-xs">Start logging your daily crop checks</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
        <CardDescription>
          {observations.length} observation{observations.length > 1 ? "s" : ""}{" "}
          logged
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {observations.map((obs, idx) => (
              <div
                key={obs.id}
                className="relative pl-8 pb-4 border-l-2 border-muted last:border-0 last:pb-0"
              >
                {/* Timeline dot */}
                <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full border-2 border-background bg-primary" />

                {/* Observation content */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getObservationIcon(obs.observationType)}
                      <span className="font-medium text-sm">
                        {formatObservationType(obs.observationType)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(obs.observationDate), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  {/* Health Status */}
                  {obs.healthStatus && (
                    <Badge
                      className={cn(
                        "text-xs",
                        getHealthStatusColor(obs.healthStatus)
                      )}
                    >
                      Health: {obs.healthStatus}
                    </Badge>
                  )}

                  {/* Notes */}
                  {obs.notes && (
                    <p className="text-sm text-muted-foreground">{obs.notes}</p>
                  )}

                  {/* Issues Detected */}
                  <div className="flex flex-wrap gap-2">
                    {obs.pestDetected && (
                      <Badge variant="destructive" className="text-xs">
                        <Bug className="h-3 w-3 mr-1" />
                        Pest: {obs.pestType || "Unknown"}
                      </Badge>
                    )}
                    {obs.diseaseDetected && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Disease: {obs.diseaseType || "Unknown"}
                      </Badge>
                    )}
                  </div>

                  {/* Actions Taken */}
                  {obs.actionTaken && (
                    <div className="text-xs bg-muted/50 p-2 rounded">
                      <span className="font-medium">Action: </span>
                      {obs.actionTaken}
                    </div>
                  )}

                  {/* Water Amount */}
                  {obs.waterAmountLiters && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Droplets className="h-3 w-3" />
                      {obs.waterAmountLiters}L water applied
                    </div>
                  )}

                  {/* Weather Context */}
                  {obs.weatherCondition && obs.temperature && (
                    <div className="text-xs text-muted-foreground">
                      Weather: {obs.temperature}°C, {obs.weatherCondition}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
