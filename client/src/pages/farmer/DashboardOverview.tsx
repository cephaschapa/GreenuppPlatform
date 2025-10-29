import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FarmerProfile, Field, Crop, FarmerTask } from "@shared/schema";
import {
  Loader2,
  TractorIcon,
  Leaf,
  // Calendar,
  ClipboardList,
  Cloud,
  Sparkles,
  ChevronRight,
  // CheckCircle,
} from "lucide-react";
import { Link } from "wouter";
// import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useRoleNavigation } from "@/hooks/use-role-navigation";
import { TodayDashboard } from "@/components/farmer/TodayDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardOverview() {
  const { user } = useAuth();
  const { getUrl } = useRoleNavigation();
  const [activeTab, setActiveTab] = useState("today");

  console.log("🔍 DashboardOverview rendering, activeTab:", activeTab);
  console.error("🚨 TEST: If you see this, cache is working!");

  // Fetch farmer profile
  const { data: farmerProfile, isLoading: profileLoading } =
    useQuery<FarmerProfile>({
      queryKey: ["/api/farmer-profile"],
      queryFn: async () => {
        try {
          const response = await fetch("/api/farmer-profile");
          if (!response.ok) {
            throw new Error("Failed to fetch profile");
          }
          return await response.json();
        } catch (error) {
          // console.error("Error fetching profile:", error);
          return null;
        }
      },
    });
  console.log("Test");

  console.log("farmerProfile", farmerProfile);

  // Fetch fields
  const { data: fields, isLoading: fieldsLoading } = useQuery<Field[]>({
    queryKey: ["/api/fields"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/fields");
        if (!response.ok) {
          throw new Error("Failed to fetch fields");
        }
        return await response.json();
      } catch (error) {
        // console.error("Error fetching fields:", error);
        return [];
      }
    },
  });

  // Fetch crops
  const { data: crops, isLoading: cropsLoading } = useQuery<Crop[]>({
    queryKey: ["/api/crops"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/crops");
        if (!response.ok) {
          throw new Error("Failed to fetch crops");
        }
        return await response.json();
      } catch (error) {
        // console.error("Error fetching crops:", error);
        return [];
      }
    },
  });

  // Fetch tasks
  const { data: tasks, isLoading: tasksLoading } = useQuery<FarmerTask[]>({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/tasks");
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        return await response.json();
      } catch (error) {
        // console.error("Error fetching tasks:", error);
        return [];
      }
    },
  });

  // Get counts
  const fieldCount = fields?.length || 0;
  const cropCount = crops?.length || 0;
  const pendingTaskCount = tasks?.filter((task) => !task.completed).length || 0;

  // Weather data
  const { data: weatherData, isLoading: weatherLoading } = useQuery({
    queryKey: ["/api/weather", farmerProfile?.farmLocation],
    queryFn: async () => {
      try {
        if (!farmerProfile?.farmLocation) {
          throw new Error("No farm location set");
        }
        const response = await fetch(
          `/api/weather?location=${encodeURIComponent(
            farmerProfile.farmLocation
          )}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch weather");
        }
        return await response.json();
      } catch (error) {
        // console.error("Error fetching weather:", error);
        return null;
      }
    },
    enabled: !!farmerProfile?.farmLocation, // Only run query if we have a location
  });

  // Check if any section is loading
  const isLoading =
    profileLoading ||
    fieldsLoading ||
    cropsLoading ||
    tasksLoading ||
    weatherLoading;

  // Helper to format date
  const formatDate = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString();
  };

  // Filter crops by status
  const getActiveGrowingCrops = () => {
    return (
      crops?.filter(
        (crop) => crop.status === "growing" || crop.status === "planted"
      ) || []
    );
  };

  // Get upcoming tasks (next 7 days)
  const getUpcomingTasks = () => {
    if (!tasks) return [];

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return tasks
      .filter((task) => {
        if (task.completed) return false;

        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        if (!dueDate) return false;

        return dueDate >= today && dueDate <= nextWeek;
      })
      .sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate) : new Date();
        const dateB = b.dueDate ? new Date(b.dueDate) : new Date();
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);
  };

  // Profile completion is now handled by the onboarding system
  // No need for manual profile completion tracking

  return (
    <DashboardLayout
      title={`Welcome, ${farmerProfile?.farmName || "Farmer"}`}
      description="Your farming operations at a glance"
    >
      {/* Profile completion section removed - now handled by onboarding system */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="overview">Full Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            <TodayDashboard />
          </TabsContent>

          <TabsContent value="overview">
            <div className="space-y-6 md:space-y-8">
              {/* Stats Overview - Mobile optimized grid */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <Card className="bg-card border-muted hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-2 px-4 py-3">
                    <CardTitle className="text-base md:text-lg font-medium flex items-center gap-2">
                      <TractorIcon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      <span className="hidden sm:inline">Fields</span>
                      <span className="sm:hidden">Fields</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <div className="text-2xl md:text-3xl font-bold">
                      {fieldCount}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      Total fields
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 px-4 pb-3">
                    <Link href={getUrl("fields")}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between text-xs md:text-sm"
                      >
                        <span className="hidden sm:inline">View Fields</span>
                        <span className="sm:hidden">View</span>
                        <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>

                <Card className="bg-card border-muted hover:border-green-500/30 transition-colors">
                  <CardHeader className="pb-2 px-4 py-3">
                    <CardTitle className="text-base md:text-lg font-medium flex items-center gap-2">
                      <Leaf className="h-4 w-4 md:h-5 md:w-5 text-green-500 dark:text-green-400" />
                      <span className="hidden sm:inline">Crops</span>
                      <span className="sm:hidden">Crops</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <div className="text-2xl md:text-3xl font-bold">
                      {cropCount}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {getActiveGrowingCrops().length} growing
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 px-4 pb-3">
                    <Link href={getUrl("fields")}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between text-xs md:text-sm"
                      >
                        <span className="hidden sm:inline">Manage Crops</span>
                        <span className="sm:hidden">Manage</span>
                        <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>

                <Card className="bg-card border-muted hover:border-blue-500/30 transition-colors">
                  <CardHeader className="pb-2 px-4 py-3">
                    <CardTitle className="text-base md:text-lg font-medium flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 md:h-5 md:w-5 text-blue-500 dark:text-blue-400" />
                      <span className="hidden sm:inline">Tasks</span>
                      <span className="sm:hidden">Tasks</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <div className="text-2xl md:text-3xl font-bold">
                      {pendingTaskCount}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      Pending
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 px-4 pb-3">
                    <Link href={getUrl("tasks")}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between text-xs md:text-sm"
                      >
                        <span className="hidden sm:inline">View Tasks</span>
                        <span className="sm:hidden">View</span>
                        <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>

                <Card className="bg-card border-muted hover:border-sky-500/30 transition-colors">
                  <CardHeader className="pb-2 px-4 py-3">
                    <CardTitle className="text-base md:text-lg font-medium flex items-center gap-2">
                      <Cloud className="h-4 w-4 md:h-5 md:w-5 text-sky-500 dark:text-sky-400" />
                      <span className="hidden sm:inline">Weather</span>
                      <span className="sm:hidden">Weather</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    {weatherData ? (
                      <>
                        <div className="text-2xl md:text-3xl font-bold">
                          {weatherData.current.temp}°C
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1 truncate">
                          {weatherData.current.condition}
                        </p>
                      </>
                    ) : !farmerProfile?.farmLocation ? (
                      <div className="text-center">
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Set farm location to view weather
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">
                        Unavailable
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 px-4 pb-3">
                    {!farmerProfile?.farmLocation ? (
                      <Link href={getUrl("profile")}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-between text-xs md:text-sm"
                        >
                          <span className="hidden sm:inline">Set Location</span>
                          <span className="sm:hidden">Set Location</span>
                          <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href={getUrl("weather")}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-between text-xs md:text-sm"
                        >
                          <span className="hidden sm:inline">
                            Weather Details
                          </span>
                          <span className="sm:hidden">Details</span>
                          <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </Link>
                    )}
                  </CardFooter>
                </Card>
              </div>

              {/* Quick Access Sections - Mobile optimized */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Upcoming Tasks */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg md:text-xl">
                      Upcoming Tasks
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Tasks due in the next 7 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    {getUpcomingTasks().length > 0 ? (
                      <div className="space-y-2 md:space-y-3">
                        {getUpcomingTasks().map((task) => (
                          <div
                            key={task.id}
                            className="p-3 border border-border rounded-lg flex justify-between items-center hover:border-muted transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm md:text-base truncate">
                                {task.title}
                              </h4>
                              <p className="text-xs md:text-sm text-muted-foreground">
                                Due: {formatDate(task.dueDate)}
                              </p>
                            </div>
                            <Badge
                              variant={
                                task.priority === "high"
                                  ? "destructive"
                                  : task.priority === "medium"
                                  ? "warning"
                                  : "info"
                              }
                              className="ml-2 text-xs"
                            >
                              {task.priority
                                ? task.priority.charAt(0).toUpperCase() +
                                  task.priority.slice(1)
                                : "Normal"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <p className="text-sm">
                          No upcoming tasks for the next 7 days.
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="px-4 pb-4">
                    <Link href={getUrl("tasks")}>
                      <Button variant="outline" className="w-full text-sm">
                        View All Tasks
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>

                {/* Active Crops */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg md:text-xl">
                      Active Crops
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Currently growing crops
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    {getActiveGrowingCrops().length > 0 ? (
                      <div className="space-y-2 md:space-y-3">
                        {getActiveGrowingCrops()
                          .slice(0, 5)
                          .map((crop) => (
                            <div
                              key={crop.id}
                              className="p-3 border border-border rounded-lg hover:border-muted transition-colors"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm md:text-base truncate">
                                    {crop.name}{" "}
                                    {crop.variety ? `(${crop.variety})` : ""}
                                  </h4>
                                </div>
                                <Badge
                                  variant="success"
                                  className="ml-2 text-xs"
                                >
                                  {crop.status.charAt(0).toUpperCase() +
                                    crop.status.slice(1)}
                                </Badge>
                              </div>
                              <div className="mt-1 text-xs md:text-sm text-muted-foreground grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-2">
                                <p>Planted: {formatDate(crop.plantingDate)}</p>
                                <p>
                                  Est. Harvest:{" "}
                                  {formatDate(
                                    crop.expectedHarvestDate ||
                                      crop.plantingDate
                                  )}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <p className="text-sm">
                          No active crops currently growing.
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="px-4 pb-4">
                    <Link href={getUrl("fields")}>
                      <Button variant="outline" className="w-full text-sm">
                        Manage Crops
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>

              {/* AI Insights and Quick Actions - Mobile optimized */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* AI Insights */}
                <Card className="border-primary/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-background to-primary/10 z-0"></div>
                  <CardHeader className="relative z-10 pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                      <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      AI-Powered Insights
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Get intelligent predictions for your crops
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10 px-4 pb-3">
                    <p className="text-sm mb-4">
                      Use our AI technology to predict crop yields, analyze soil
                      conditions, and get recommendations based on weather
                      patterns.
                    </p>
                  </CardContent>
                  <CardFooter className="relative z-10 px-4 pb-4">
                    <Link href={getUrl("predictions")}>
                      <Button className="w-full text-sm">
                        Generate Predictions
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>

                {/* Quick Links */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg md:text-xl">
                      Quick Actions
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Common tasks and actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                      <Link href={getUrl("fields")}>
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-2 text-xs md:text-sm h-10 md:h-11"
                        >
                          <TractorIcon className="h-3 w-3 md:h-4 md:w-4" />
                          Add Field
                        </Button>
                      </Link>
                      <Link href={getUrl("tasks")}>
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-2 text-xs md:text-sm h-10 md:h-11"
                        >
                          <ClipboardList className="h-3 w-3 md:h-4 md:w-4" />
                          New Task
                        </Button>
                      </Link>
                      <Link href={getUrl("weather")}>
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-2 text-xs md:text-sm h-10 md:h-11"
                        >
                          <Cloud className="h-3 w-3 md:h-4 md:w-4" />
                          Weather
                        </Button>
                      </Link>
                      <Link href={getUrl("predictions")}>
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-2 text-xs md:text-sm h-10 md:h-11"
                        >
                          <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
                          Predictions
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </DashboardLayout>
  );
}
