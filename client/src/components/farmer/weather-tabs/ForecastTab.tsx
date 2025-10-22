import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ForecastTabProps {
  activeLocation: string | null;
  loadingWeather: boolean;
  weatherData: any;
  detectedLocationData: any;
  extractCityName: (location: string) => string;
  getWeatherIcon: (condition: string) => JSX.Element;
  formatTemperature: (temp: number) => string;
}

export function ForecastTab({
  activeLocation,
  loadingWeather,
  weatherData,
  detectedLocationData,
  extractCityName,
  getWeatherIcon,
  formatTemperature,
}: ForecastTabProps) {
  return (
    <TabsContent value="forecast">
      <Card>
        <CardHeader className="mobile-p-4">
          <CardTitle className="mobile-text-lg">Weather Forecast</CardTitle>
          <CardDescription className="mobile-text-sm">
            {activeLocation
              ? `5-day forecast for ${
                  detectedLocationData?.city ||
                  extractCityName(activeLocation || "")
                }`
              : "Select a location to view forecast"}
          </CardDescription>
        </CardHeader>
        <CardContent className="mobile-p-4">
          {!activeLocation ? (
            <div className="text-center py-8 text-muted-foreground mobile-loading">
              <p className="mobile-text-lg">No location selected.</p>
              <p className="text-sm mobile-text-sm">
                Choose a location from the Current Weather tab.
              </p>
            </div>
          ) : loadingWeather ? (
            <div className="flex justify-center py-12 mobile-loading">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <span className="ml-2 mobile-text-sm">Loading forecast...</span>
            </div>
          ) : !weatherData?.forecast ? (
            <div className="text-center py-8 text-muted-foreground mobile-loading">
              <p className="mobile-text-lg">
                Forecast data not available for this location.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mobile-grid">
              {weatherData.forecast.map((day: any, index: number) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-4 border rounded-lg mobile-weather"
                >
                  <div className="font-medium mb-2 mobile-text-sm text-center">
                    {day.dayOfWeek}, {day.date}
                  </div>
                  <div className="text-3xl mb-3">
                    {getWeatherIcon(day.condition)}
                  </div>
                  <div className="text-lg font-semibold mobile-text-lg">
                    {formatTemperature(day.temp.max)}
                  </div>
                  <div className="text-sm text-muted-foreground mobile-text-sm">
                    {formatTemperature(day.temp.min)}
                  </div>
                  <div className="mt-2 text-sm mobile-text-sm text-center">
                    {day.description || day.condition}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground mobile-text-xs">
                    Rain: {day.precipitation || 0}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
