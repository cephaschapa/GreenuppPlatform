import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface ClimateData {
  location: string;
  monthlyAverages: Array<{
    month: string;
    averageTemp: number;
    averagePrecipitation: number;
    growingDegreeDays: number;
  }>;
  soilConditions: {
    type: string;
    ph: number;
    moisture: number;
  };
  growingSeasonLength: number;
}

interface ClimateTabProps {
  activeLocation: string | null;
  climateData: ClimateData | null;
  loadingClimate: boolean;
  detectedLocationData: any;
  extractCityName: (location: string) => string;
  formatTemperature: (temp: number) => string;
  fetchClimateData: () => Promise<void>;
}

export function ClimateTab({
  activeLocation,
  climateData,
  loadingClimate,
  detectedLocationData,
  extractCityName,
  formatTemperature,
  fetchClimateData,
}: ClimateTabProps) {
  return (
    <TabsContent value="climate">
      <Card>
        <CardHeader className="mobile-p-4">
          <CardTitle className="mobile-text-lg">Climate Analysis</CardTitle>
          <CardDescription className="mobile-text-sm">
            Climate data and seasonal patterns for{" "}
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
            <div>
              {!climateData && !loadingClimate ? (
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <p className="text-muted-foreground">
                    Climate data helps understand seasonal patterns and make
                    better agricultural decisions.
                  </p>
                  <Button onClick={fetchClimateData} className="mt-2">
                    Load Climate Data
                  </Button>
                </div>
              ) : loadingClimate ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : (
                climateData && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Soil Conditions Card */}
                      <Card className="overflow-hidden">
                        <CardHeader className="bg-primary/5 pb-2">
                          <CardTitle className="text-lg">
                            Soil Conditions
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Soil Type</span>
                                <span className="font-medium">
                                  {climateData.soilConditions.type}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="bg-primary/10 rounded-md p-2 flex-shrink-0">
                                <div className="flex items-center justify-center h-8 w-8">
                                  <span className="font-medium">
                                    {climateData.soilConditions.ph.toFixed(1)}
                                  </span>
                                </div>
                                <div className="text-[10px] text-center text-muted-foreground mt-1">
                                  pH
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium">
                                  Soil pH
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {climateData.soilConditions.ph < 5.5
                                    ? "Acidic"
                                    : climateData.soilConditions.ph > 7.5
                                    ? "Alkaline"
                                    : "Neutral"}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="bg-primary/10 rounded-md p-2 flex-shrink-0">
                                <div className="flex items-center justify-center h-8 w-8">
                                  <span className="font-medium">
                                    {climateData.soilConditions.moisture.toFixed(
                                      0
                                    )}
                                    %
                                  </span>
                                </div>
                                <div className="text-[10px] text-center text-muted-foreground mt-1">
                                  Moisture
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium">
                                  Soil Moisture
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {climateData.soilConditions.moisture < 20
                                    ? "Dry"
                                    : climateData.soilConditions.moisture > 60
                                    ? "Wet"
                                    : "Moderate"}
                                </div>
                              </div>
                            </div>

                            {/* Regional Soil Data */}
                            {(() => {
                              // Determine agricultural region from location
                              let region = "";
                              if (activeLocation) {
                                const loc = activeLocation.toLowerCase();
                                if (
                                  loc.includes("lusaka") ||
                                  loc.includes("central") ||
                                  loc.includes("eastern")
                                ) {
                                  region = "Region II";
                                } else if (
                                  loc.includes("ndola") ||
                                  loc.includes("kitwe") ||
                                  loc.includes("northwestern") ||
                                  loc.includes("luapula") ||
                                  loc.includes("northern") ||
                                  loc.includes("copperbelt")
                                ) {
                                  region = "Region III";
                                } else if (
                                  loc.includes("livingstone") ||
                                  loc.includes("southern") ||
                                  loc.includes("western") ||
                                  loc.includes("chipata")
                                ) {
                                  region = "Region I";
                                } else {
                                  // Default to Region II for Zambia if cannot determine
                                  region = "Region II";
                                }
                              }

                              // Show region-specific soil data based on determined region
                              if (region) {
                                return (
                                  <div className="mt-2 pt-3 border-t">
                                    <div className="flex justify-between text-sm mb-2">
                                      <span className="font-medium">
                                        Regional Soil Profile
                                      </span>
                                      <span className="text-xs bg-primary/10 px-2 py-0.5 rounded text-primary">
                                        {region}
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 text-sm">
                                      {region === "Region I" && (
                                        <>
                                          <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">
                                              Typical pH Range:
                                            </span>
                                            <span>4.77–5.11</span>
                                          </div>
                                          <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">
                                              Soil Composition:
                                            </span>
                                            <span className="text-right">
                                              Slightly acidic loamy and clayey
                                              soils
                                            </span>
                                          </div>
                                          <div className="flex gap-1 flex-wrap mt-1">
                                            <span className="text-xs bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 rounded-full px-2 py-0.5">
                                              Erosion prone
                                            </span>
                                            <span className="text-xs bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 rounded-full px-2 py-0.5">
                                              Low water-holding capacity
                                            </span>
                                          </div>
                                        </>
                                      )}

                                      {region === "Region II" && (
                                        <>
                                          <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">
                                              Typical pH Range:
                                            </span>
                                            <span>4.02–5.56</span>
                                          </div>
                                          <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">
                                              Soil Composition:
                                            </span>
                                            <span className="text-right">
                                              Red to brown clayey to loamy soils
                                            </span>
                                          </div>
                                          <div className="flex gap-1 flex-wrap mt-1">
                                            <span className="text-xs bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 rounded-full px-2 py-0.5">
                                              Shallow rooting zones
                                            </span>
                                            <span className="text-xs bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 rounded-full px-2 py-0.5">
                                              Leached soil
                                            </span>
                                          </div>
                                        </>
                                      )}

                                      {region === "Region III" && (
                                        <>
                                          <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">
                                              Typical pH Range:
                                            </span>
                                            <span>4.0–6.9</span>
                                          </div>
                                          <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">
                                              Soil Composition:
                                            </span>
                                            <span className="text-right">
                                              Highly weathered, leached soils
                                            </span>
                                          </div>
                                          <div className="flex gap-1 flex-wrap mt-1">
                                            <span className="text-xs bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 rounded-full px-2 py-0.5">
                                              Extreme acidity
                                            </span>
                                            <span className="text-xs bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 rounded-full px-2 py-0.5">
                                              Low nutrient availability
                                            </span>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Growing Season Card */}
                      <Card className="overflow-hidden">
                        <CardHeader className="bg-primary/5 pb-2">
                          <CardTitle className="text-lg">
                            Growing Season
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Season Length:</span>
                              <span className="font-medium">
                                {climateData.growingSeasonLength} days
                              </span>
                            </div>

                            <Progress
                              value={
                                (climateData.growingSeasonLength / 365) * 100
                              }
                              className="h-2.5"
                            />

                            <div className="bg-primary/5 p-3 rounded-md mt-4">
                              <div className="text-sm font-medium mb-1">
                                Growing Season Assessment
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {climateData.growingSeasonLength > 270
                                  ? "Long growing season suitable for multiple harvests and heat-loving crops."
                                  : climateData.growingSeasonLength > 180
                                  ? "Average growing season suitable for most common crops."
                                  : "Short growing season - focus on cold-tolerant and fast-maturing crops."}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Monthly Climate Data */}
                    <Card>
                      <CardHeader className="mobile-p-4">
                        <CardTitle className="text-lg mobile-text-lg">
                          Monthly Climate Averages
                        </CardTitle>
                        <CardDescription className="mobile-text-sm">
                          Temperature, precipitation, and growing degree days by
                          month
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="mobile-p-4">
                        <ScrollArea className="w-full">
                          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                            <table className="w-full min-w-[640px] table-auto">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm">
                                    Month
                                  </th>
                                  <th className="text-center px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm">
                                    Avg. Temp
                                  </th>
                                  <th className="text-center px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm">
                                    Precip.
                                  </th>
                                  <th className="text-center px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm">
                                    <span className="hidden sm:inline">
                                      Growing Degree Days
                                    </span>
                                    <span className="sm:hidden">GDD</span>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {climateData.monthlyAverages.map(
                                  (month, index) => (
                                    <tr
                                      key={index}
                                      className="border-b last:border-0 hover:bg-muted/50"
                                    >
                                      <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">
                                        {month.month}
                                      </td>
                                      <td className="px-2 sm:px-4 py-2 text-center text-xs sm:text-sm">
                                        {formatTemperature(month.averageTemp)}
                                      </td>
                                      <td className="px-2 sm:px-4 py-2 text-center text-xs sm:text-sm">
                                        {month.averagePrecipitation.toFixed(1)}{" "}
                                        mm
                                      </td>
                                      <td className="px-2 sm:px-4 py-2 text-center text-xs sm:text-sm">
                                        {month.growingDegreeDays.toFixed(0)}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </ScrollArea>
                      </CardContent>
                      <CardFooter className="bg-muted/30 text-xs sm:text-sm text-muted-foreground mobile-p-4">
                        <div>
                          Growing Degree Days (GDD) indicate heat accumulation
                          for crop growth (base 10°C).
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
