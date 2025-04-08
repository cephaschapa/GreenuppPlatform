import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { FarmerProfile } from "@shared/schema";
import { Loader2, Cloud, Droplets, Thermometer, Wind } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export function FarmerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Fetch farmer profile
  const { data: farmerProfile, isLoading: profileLoading } = useQuery<FarmerProfile>({
    queryKey: ['/api/farmer-profile'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/farmer-profile');
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
    }
  });

  // Function to fetch weather data
  const fetchWeatherData = async () => {
    if (!farmerProfile?.farmLocation) return;
    
    setLoadingWeather(true);
    try {
      // Call our weather API endpoint
      const response = await fetch(`/api/weather?location=${encodeURIComponent(farmerProfile.farmLocation)}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }
      
      const data = await response.json();
      setWeatherData(data);
      
      toast({
        title: "Weather data updated",
        description: "Showing forecast for " + farmerProfile.farmLocation
      });
    } catch (error) {
      console.error("Error fetching weather:", error);
      toast({
        title: "Failed to load weather data",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    if (farmerProfile?.farmLocation) {
      fetchWeatherData();
    }
  }, [farmerProfile]);

  // Handle missing profile
  if (!profileLoading && !farmerProfile) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-secondary/30 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-white font-space">Complete Your Profile</CardTitle>
            <CardDescription className="text-gray-400">Set up your farm details to access all features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex flex-col items-center justify-center border border-dashed border-primary/40 rounded-md p-6">
              <p className="text-gray-300 text-center mb-4">
                You need to complete your farmer profile to unlock all dashboard features
              </p>
              <Link href="/profile-creation">
                <Button variant="default">
                  Complete Farm Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Top cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-secondary/30 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium text-white font-space">Crop Management</CardTitle>
            <CardDescription className="text-gray-400">Manage your active crops</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-center justify-center border border-dashed border-primary/40 rounded-md">
              {farmerProfile?.mainCrops && farmerProfile.mainCrops.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 w-full p-2">
                  {farmerProfile.mainCrops.map((crop, index) => (
                    <div key={index} className="px-3 py-1 bg-green-900/30 border border-green-700/30 rounded-md text-center">
                      {crop}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No crops added yet</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-secondary">
              Manage Crops
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-secondary/30 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium text-white font-space">Weather Forecast</CardTitle>
            <CardDescription className="text-gray-400">
              {farmerProfile?.farmLocation || "Set your farm location"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex flex-col items-center justify-center border border-dashed border-primary/40 rounded-md">
              {loadingWeather ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : weatherData ? (
                <div className="flex flex-col items-center w-full">
                  <div className="flex items-center justify-between w-full px-4">
                    <div className="flex items-center">
                      <Thermometer className="h-5 w-5 text-orange-400 mr-2" />
                      <span>{weatherData.current.temp}°C</span>
                    </div>
                    <div className="flex items-center">
                      <Droplets className="h-5 w-5 text-blue-400 mr-2" />
                      <span>{weatherData.current.humidity}%</span>
                    </div>
                    <div className="flex items-center">
                      <Wind className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{weatherData.current.wind_speed} km/h</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-center">
                    {weatherData.current.weather[0].description}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Cloud className="h-8 w-8 text-gray-500 mb-2" />
                  <p className="text-gray-500 text-sm">Update location for weather</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full border-primary text-primary hover:bg-primary hover:text-secondary"
              onClick={fetchWeatherData}
              disabled={loadingWeather || !farmerProfile?.farmLocation}
            >
              {loadingWeather ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Refresh Weather"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-secondary/30 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium text-white font-space">Farm Analytics</CardTitle>
            <CardDescription className="text-gray-400">Key farm metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex flex-col items-center justify-center border border-dashed border-primary/40 rounded-md p-4">
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400">Farm Size</span>
                  <span className="text-lg font-medium text-primary">{farmerProfile?.farmSize || "N/A"}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400">Farm Type</span>
                  <span className="text-lg font-medium text-primary">
                    {farmerProfile?.farmType ? 
                      farmerProfile.farmType.charAt(0).toUpperCase() + farmerProfile.farmType.slice(1) : 
                      "N/A"}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400">Established</span>
                  <span className="text-lg font-medium text-primary">{farmerProfile?.establishedYear || "N/A"}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400">Crops</span>
                  <span className="text-lg font-medium text-primary">{farmerProfile?.mainCrops?.length || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-secondary">
              View Detailed Analytics
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-secondary/30 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-white font-space">Crop Planning</CardTitle>
            <CardDescription className="text-gray-400">Schedule and manage planting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-primary/40 rounded-md p-6">
              <div className="text-center mb-4">
                <p className="text-gray-300">Plan your planting and harvesting schedule</p>
                <p className="text-gray-500 text-sm mt-2">Coming soon: AI-powered crop rotation suggestions</p>
              </div>
              <Button variant="default" disabled>
                Create Planting Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-white font-space">Marketplace</CardTitle>
            <CardDescription className="text-gray-400">Buy supplies and sell produce</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col border border-dashed border-primary/40 rounded-md p-4">
                <h3 className="text-green-500 font-medium mb-2">Sell Produce</h3>
                <p className="text-gray-400 text-sm mb-4">List your harvest for buyers</p>
                <Button variant="outline" size="sm" className="mt-auto">
                  Create Listing
                </Button>
              </div>
              <div className="flex flex-col border border-dashed border-primary/40 rounded-md p-4">
                <h3 className="text-blue-500 font-medium mb-2">Buy Supplies</h3>
                <p className="text-gray-400 text-sm mb-4">Purchase seeds, tools and more</p>
                <Button variant="outline" size="sm" className="mt-auto">
                  Browse Supplies
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights card */}
      <Card className="bg-secondary/30 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-white font-space">AI-Powered Insights</CardTitle>
          <CardDescription className="text-gray-400">Smart recommendations based on your farm data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex flex-col items-center justify-center border border-dashed border-primary/40 rounded-md p-6 bg-gradient-to-br from-green-950/50 to-black/50">
            {farmerProfile ? (
              <div className="text-center">
                <h3 className="text-primary font-medium mb-3">Recommendations for {farmerProfile.farmName}</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    Optimal planting time for {farmerProfile.mainCrops?.[0] || "your crops"} approaching
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    Consider soil testing based on your farm type
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    Weather trends suggest adjusting irrigation schedules
                  </li>
                </ul>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-300 mb-4">Complete your farm profile to unlock AI insights</p>
                <Link href="/profile-creation">
                  <Button variant="default">
                    Complete Farm Setup
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}