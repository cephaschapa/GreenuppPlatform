import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WeatherAlertSystem } from "@/components/farmer/WeatherAlertSystem";
import { AlertTriangle, History } from "lucide-react";

interface AlertsTabProps {
  activeLocation: string | null;
  weatherData: any;
}

export function AlertsTab({ activeLocation, weatherData }: AlertsTabProps) {
  return (
    <TabsContent value="alerts">
      <div className="grid gap-6">
        {/* Weather Alert System */}
        {activeLocation && weatherData && (
          <WeatherAlertSystem
            currentWeather={{
              temp: weatherData.current.temp,
              humidity: weatherData.current.humidity,
              windSpeed: weatherData.current.windSpeed,
              uv: weatherData.current.uv,
              precipitation: weatherData.forecast[0]?.precipitation || 0,
            }}
            location={activeLocation}
          />
        )}

        {/* API Weather Alerts */}
        {weatherData?.alerts && weatherData.alerts.length > 0 && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <CardHeader className="mobile-p-4">
              <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2 mobile-text-lg">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                Official Weather Alerts
              </CardTitle>
              <CardDescription className="text-red-700 dark:text-red-300 mobile-text-sm">
                Severe weather alerts from meteorological services
              </CardDescription>
            </CardHeader>
            <CardContent className="mobile-p-4">
              <ScrollArea className="h-64 -mx-4 px-4 sm:mx-0 sm:px-0">
                {weatherData.alerts.map((alert: any, index: number) => (
                  <div
                    key={index}
                    className="mb-3 sm:mb-4 p-3 sm:p-4 bg-white/50 dark:bg-white/10 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <Badge variant="destructive" className="text-xs">
                        {alert.severity}
                      </Badge>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(alert.start * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">
                      {alert.event}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                      {alert.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">From:</span>{" "}
                      {alert.senderName}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Alert History and Statistics */}
        <Card>
          <CardHeader className="mobile-p-4">
            <CardTitle className="flex items-center gap-2 mobile-text-lg">
              <History className="h-4 w-4 sm:h-5 sm:w-5" />
              Alert History
            </CardTitle>
            <CardDescription className="mobile-text-sm">
              Track your weather alert activity and patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="mobile-p-4">
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">
                Alert history and statistics coming soon
              </p>
              <p className="text-xs sm:text-sm">
                Track alert triggers and response times
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}
