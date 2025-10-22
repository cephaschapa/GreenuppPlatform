import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import RegionalSeedRecommendations from "@/components/RegionalSeedRecommendations";
import { Loader2, Sprout, BarChart4 } from "lucide-react";

interface CropRecommendation {
  cropName: string;
  variety: string;
  suitabilityScore: number;
  optimalPlantingWindow: {
    start: string;
    end: string;
  };
  expectedYield: number;
  yieldUnit: string;
  comments: string[];
}

interface RecommendationsTabProps {
  activeLocation: string | null;
  cropRecommendations: CropRecommendation[] | null;
  loadingRecommendations: boolean;
  climateData: any;
  detectedLocationData: any;
  extractCityName: (location: string) => string;
  fetchCropRecommendations: () => Promise<void>;
  setActiveLocation: (location: string) => void;
}

export function RecommendationsTab({
  activeLocation,
  cropRecommendations,
  loadingRecommendations,
  climateData,
  detectedLocationData,
  extractCityName,
  fetchCropRecommendations,
  setActiveLocation,
}: RecommendationsTabProps) {
  return (
    <TabsContent value="recommendations">
      <Card>
        <CardHeader className="mobile-p-4">
          <CardTitle className="mobile-text-lg">Crop Recommendations</CardTitle>
          <CardDescription className="mobile-text-sm">
            Crops that are suitable for the climate in{" "}
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
              {!cropRecommendations && !loadingRecommendations ? (
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <p className="text-muted-foreground">
                    Our AI-powered system can recommend the best crops to plant
                    based on local climate data.
                  </p>
                  <Button onClick={fetchCropRecommendations} className="mt-2">
                    <Sprout className="mr-2 h-4 w-4" />
                    Get Crop Recommendations
                  </Button>
                </div>
              ) : loadingRecommendations ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : (
                cropRecommendations && (
                  <div className="space-y-6">
                    {/* Regional Seed Recommendations based on location */}
                    <div className="mb-6">
                      <RegionalSeedRecommendations
                        location={activeLocation}
                        soilType={climateData?.soilConditions?.type}
                        onLocationChange={setActiveLocation}
                        locationName={
                          detectedLocationData?.city ||
                          extractCityName(activeLocation || "")
                        }
                      />
                    </div>

                    <h3 className="text-lg font-medium mobile-text-lg mb-4">
                      AI-Generated Crop Recommendations
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      {cropRecommendations.slice(0, 6).map((crop, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-3 sm:p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-3 sm:mb-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base sm:text-lg truncate">
                                {crop.cropName}
                              </h3>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                Variety: {crop.variety}
                              </p>
                            </div>
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <div className="flex items-center gap-1 bg-primary/10 py-1 px-2 rounded flex-shrink-0 w-fit">
                                  <BarChart4 className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="font-medium text-xs sm:text-sm">
                                    {crop.suitabilityScore}/100
                                  </span>
                                </div>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-72 sm:w-80">
                                <div className="font-medium mb-1 text-sm sm:text-base">
                                  Suitability Score Explained
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                                  This score represents how well the crop is
                                  suited to your local climate and soil
                                  conditions:
                                </p>
                                <ul className="text-xs sm:text-sm space-y-1">
                                  <li>• 80-100: Excellent match</li>
                                  <li>• 60-79: Good match</li>
                                  <li>• 40-59: Fair match</li>
                                  <li>• Below 40: Challenging</li>
                                </ul>
                              </HoverCardContent>
                            </HoverCard>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
                            <div className="bg-primary/5 p-2 sm:p-3 rounded">
                              <div className="text-xs text-muted-foreground">
                                Planting Window
                              </div>
                              <div className="font-medium text-xs sm:text-sm">
                                {crop.optimalPlantingWindow.start} -{" "}
                                {crop.optimalPlantingWindow.end}
                              </div>
                            </div>

                            <div className="bg-primary/5 p-2 sm:p-3 rounded">
                              <div className="text-xs text-muted-foreground">
                                Expected Yield
                              </div>
                              <div className="font-medium text-xs sm:text-sm">
                                {crop.expectedYield.toFixed(1)} {crop.yieldUnit}
                              </div>
                            </div>
                          </div>

                          <div className="text-xs sm:text-sm">
                            <div className="font-medium mb-1">Notes:</div>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                              {crop.comments.map((comment, i) => (
                                <li key={i}>{comment}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>

                    {cropRecommendations.length > 6 && (
                      <div className="bg-muted/30 p-4 rounded-lg text-sm text-center">
                        <p className="text-muted-foreground">
                          Showing top 6 recommended crops out of{" "}
                          {cropRecommendations.length} suitable options.
                        </p>
                      </div>
                    )}
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
