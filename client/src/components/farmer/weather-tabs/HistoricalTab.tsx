import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Loader2, Calendar } from "lucide-react";
import { DateRange } from "react-day-picker";

interface HistoricalWeatherData {
  location: string;
  dates: Array<{
    date: string;
    averageTemp: number;
    minTemp: number;
    maxTemp: number;
    humidity: number;
    precipitation: number;
  }>;
}

interface HistoricalTabProps {
  activeLocation: string | null;
  historicalData: HistoricalWeatherData | null;
  loadingHistorical: boolean;
  dateRange: DateRange | undefined;
  detectedLocationData: any;
  extractCityName: (location: string) => string;
  formatTemperature: (temp: number) => string;
  fetchHistoricalData: () => Promise<void>;
  setDateRange: (range: DateRange | undefined) => void;
}

export function HistoricalTab({
  activeLocation,
  historicalData,
  loadingHistorical,
  dateRange,
  detectedLocationData,
  extractCityName,
  formatTemperature,
  fetchHistoricalData,
  setDateRange,
}: HistoricalTabProps) {
  return (
    <TabsContent value="historical">
      <Card>
        <CardHeader className="mobile-p-4">
          <CardTitle className="mobile-text-lg">
            Historical Weather Data
          </CardTitle>
          <CardDescription className="mobile-text-sm">
            View historical weather patterns for{" "}
            {detectedLocationData?.city ||
              extractCityName(activeLocation || "") ||
              "your location"}
          </CardDescription>
        </CardHeader>
        <CardContent className="mobile-p-4">
          {!activeLocation ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No location selected.</p>
              <p className="text-sm">
                Choose a location from the Current Weather tab.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-3">
                  Select a date range to view historical weather data:
                </p>
                <DateRangePicker date={dateRange} onDateChange={setDateRange} />
              </div>

              {dateRange?.from && dateRange?.to && (
                <div className="flex justify-center">
                  <Button
                    onClick={fetchHistoricalData}
                    disabled={loadingHistorical}
                  >
                    {loadingHistorical ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading data...
                      </>
                    ) : (
                      <>
                        <Calendar className="mr-2 h-4 w-4" />
                        Fetch Historical Data
                      </>
                    )}
                  </Button>
                </div>
              )}

              {historicalData && (
                <div className="mt-6">
                  <h3 className="text-base sm:text-lg font-medium mb-3">
                    Weather History for {historicalData.location}
                  </h3>

                  <ScrollArea className="w-full">
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                      <table className="w-full min-w-[640px] table-auto">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm">
                              Date
                            </th>
                            <th className="text-center px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm">
                              <span className="hidden sm:inline">
                                Avg. Temp
                              </span>
                              <span className="sm:hidden">Avg</span>
                            </th>
                            <th className="text-center px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm">
                              Min
                            </th>
                            <th className="text-center px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm">
                              Max
                            </th>
                            <th className="text-center px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm">
                              <span className="hidden sm:inline">Humidity</span>
                              <span className="sm:hidden">Hum.</span>
                            </th>
                            <th className="text-center px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm">
                              <span className="hidden sm:inline">
                                Precipitation
                              </span>
                              <span className="sm:hidden">Precip.</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {historicalData.dates.map((day, index) => (
                            <tr
                              key={index}
                              className="border-b last:border-0 hover:bg-muted/50"
                            >
                              <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">
                                {day.date}
                              </td>
                              <td className="px-2 sm:px-4 py-2 text-center text-xs sm:text-sm">
                                {formatTemperature(day.averageTemp)}
                              </td>
                              <td className="px-2 sm:px-4 py-2 text-center text-xs sm:text-sm">
                                {formatTemperature(day.minTemp)}
                              </td>
                              <td className="px-2 sm:px-4 py-2 text-center text-xs sm:text-sm">
                                {formatTemperature(day.maxTemp)}
                              </td>
                              <td className="px-2 sm:px-4 py-2 text-center text-xs sm:text-sm">
                                {day.humidity.toFixed(0)}%
                              </td>
                              <td className="px-2 sm:px-4 py-2 text-center text-xs sm:text-sm">
                                {day.precipitation.toFixed(1)} mm
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
