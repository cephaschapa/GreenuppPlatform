import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BuyerDashboard } from "@/components/dashboards/BuyerDashboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Calendar,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  TractorIcon,
  Leaf,
  ClipboardList,
  Cloud,
  ChevronRight,
  AlertCircle,
  Loader2,
  Sun,
  CloudRain,
  Wind,
  Droplets,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { FarmerTask, Crop } from "@shared/schema";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const [showWelcome, setShowWelcome] = useState(false);

  // Farmer-specific data
  const { data: farmerProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/farmer-profile"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/farmer-profile");
        if (!response.ok) {
          throw new Error("Failed to fetch farmer profile");
        }
        return await response.json();
      } catch (error) {
        // console.error("Error fetching farmer profile:", error);
        return null;
      }
    },
    enabled: user?.role === "farmer",
  });
  const { data: fields, isLoading: fieldsLoading } = useQuery({
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
    enabled: user?.role === "farmer",
  });
  const { data: crops, isLoading: cropsLoading } = useQuery({
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
    enabled: user?.role === "farmer",
  });
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/tasks");
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        return data;
      } catch (error) {
        // console.error("Error fetching tasks:", error);
        return [];
      }
    },
    enabled: user?.role === "farmer",
  });
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
    enabled: user?.role === "farmer" && !!farmerProfile?.farmLocation,
  });

  // Farmer dashboard helpers
  const fieldCount = fields?.length || 0;
  const cropCount = crops?.length || 0;
  const pendingTaskCount =
    tasks?.filter((task: FarmerTask) => !task.completed).length || 0;
  const isFarmerLoading =
    profileLoading ||
    fieldsLoading ||
    cropsLoading ||
    tasksLoading ||
    weatherLoading;
  const formatDate = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString();
  };
  const getActiveGrowingCrops = () =>
    crops?.filter(
      (crop: Crop) => crop.status === "growing" || crop.status === "planted"
    ) || [];
  const getUpcomingTasks = () => {
    if (!tasks) return [];

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return tasks
      .filter((task: FarmerTask) => {
        // Don't filter out completed tasks for now, show all recent tasks
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        if (!dueDate) return false;

        // For now, show all tasks regardless of date to debug the issue
        // The tasks have dates in 2025 but we're in 2024
        return true;
      })
      .sort((a: FarmerTask, b: FarmerTask) => {
        const dateA = a.dueDate ? new Date(a.dueDate) : new Date();
        const dateB = b.dueDate ? new Date(b.dueDate) : new Date();
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);
  };

  // Generate AI insights based on weather data
  const generateWeatherInsights = () => {
    if (!weatherData?.current) return [];

    const insights = [];
    const weather = weatherData.current;
    const temp = weather.temp;
    const humidity = weather.humidity;
    const windSpeed = weather.windSpeed;
    const cloudCover = weather.cloudCover;

    // Temperature-based insights
    if (temp > 30) {
      insights.push({
        type: "warning",
        icon: "🌡️",
        title: "High Temperature Alert",
        message: `Temperature is ${temp.toFixed(
          0
        )}°C. Consider increasing irrigation frequency and providing shade for sensitive crops.`,
        priority: "high",
        action: "Increase watering schedule",
      });
    } else if (temp < 10) {
      insights.push({
        type: "warning",
        icon: "❄️",
        title: "Low Temperature Warning",
        message: `Temperature is ${temp.toFixed(
          0
        )}°C. Protect sensitive crops from potential frost damage.`,
        priority: "high",
        action: "Apply frost protection",
      });
    } else if (temp >= 20 && temp <= 25) {
      insights.push({
        type: "success",
        icon: "🌱",
        title: "Optimal Growing Conditions",
        message: `Temperature is ideal at ${temp.toFixed(
          0
        )}°C. Perfect conditions for most crop activities.`,
        priority: "medium",
        action: "Continue normal operations",
      });
    }

    // Humidity-based insights
    if (humidity > 80) {
      insights.push({
        type: "warning",
        icon: "💧",
        title: "High Humidity Alert",
        message: `Humidity is ${humidity}%. Monitor crops for fungal diseases and improve air circulation.`,
        priority: "medium",
        action: "Check for disease signs",
      });
    } else if (humidity < 40) {
      insights.push({
        type: "info",
        icon: "🌬️",
        title: "Low Humidity Notice",
        message: `Humidity is ${humidity}%. Consider increasing irrigation to prevent plant stress.`,
        priority: "medium",
        action: "Increase irrigation",
      });
    }

    // Wind-based insights
    if (windSpeed > 15) {
      insights.push({
        type: "warning",
        icon: "💨",
        title: "Strong Wind Alert",
        message: `Wind speed is ${windSpeed.toFixed(
          0
        )} km/h. Secure loose structures and check for plant damage.`,
        priority: "high",
        action: "Secure farm structures",
      });
    }

    // Cloud cover insights
    if (cloudCover > 80) {
      insights.push({
        type: "info",
        icon: "☁️",
        title: "Overcast Conditions",
        message: `${cloudCover}% cloud cover. Reduced sunlight may slow photosynthesis. Consider adjusting fertilizer schedule.`,
        priority: "low",
        action: "Monitor plant growth",
      });
    } else if (cloudCover < 20) {
      insights.push({
        type: "success",
        icon: "☀️",
        title: "Clear Skies",
        message: `Only ${cloudCover}% cloud cover. Excellent conditions for photosynthesis and crop growth.`,
        priority: "low",
        action: "Optimal growing day",
      });
    }

    // General recommendations
    if (insights.length === 0) {
      insights.push({
        type: "info",
        icon: "🌾",
        title: "Normal Conditions",
        message:
          "Weather conditions are within normal ranges. Continue with regular farm activities.",
        priority: "low",
        action: "Maintain current schedule",
      });
    }

    return insights.slice(0, 3); // Show top 3 insights
  };
  const calculateProfileCompletion = () => {
    if (!farmerProfile || !user) return 0;
    const requiredFields = [
      farmerProfile.farmName,
      farmerProfile.farmLocation,
      farmerProfile.farmSize,
      farmerProfile.farmType,
      farmerProfile.contactPhone,
      farmerProfile.bio,
      user.firstName,
      user.lastName,
      user.email,
    ];
    const completedFields = requiredFields.filter(
      (field) => field && field.toString().trim() !== ""
    ).length;
    return Math.round((completedFields / requiredFields.length) * 100);
  };
  const profileCompletion = calculateProfileCompletion();

  // Check for welcome parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("welcome") === "true") {
      setShowWelcome(true);
      // Remove the welcome parameter from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Redirect based on role
  if (user.role === "supplier") {
    // Could redirect to a supplier-specific page in the future
    return <Redirect to="/dashboard/supplier" />;
  }

  if (user.role === "buyer") {
    return (
      <DashboardLayout
        title="Dashboard"
        description="Your personalized buyer experience"
      >
        <BuyerDashboard />
      </DashboardLayout>
    );
  }

  // FARMER DASHBOARD
  if (user.role === "farmer") {
    return (
      <DashboardLayout
        title={`Welcome, ${farmerProfile?.farmName || "Farmer"}`}
        description="Your farming operations at a glance"
      >
        {profileCompletion < 100 && (
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 mb-4">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <div>
                    <h3 className="font-medium">Profile Completion</h3>
                    <p className="text-sm text-muted-foreground">
                      {profileCompletion === 100
                        ? "Your profile is complete!"
                        : "Complete your profile to unlock all features"}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={profileCompletion === 100 ? "default" : "secondary"}
                >
                  {profileCompletion}%
                </Badge>
              </div>
              <Progress value={profileCompletion} className="h-2 mb-2" />
              <div className="flex justify-end">
                <Link href="/dashboard/profile">
                  <Button size="sm" variant="default">
                    Complete Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
        {isFarmerLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <Card className="bg-card border hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2 px-4 py-3">
                  <CardTitle className="text-base md:text-lg font-medium flex items-center gap-2">
                    <Cloud className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    <span className="hidden sm:inline">Weather</span>
                    <span className="sm:hidden">Weather</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <Carousel
                    className="w-full"
                    plugins={[
                      Autoplay({ delay: 4000, stopOnInteraction: false }),
                    ]}
                  >
                    <CarouselContent>
                      <CarouselItem>
                        <div className="flex flex-col items-center justify-center py-4">
                          <Sun className="h-8 w-8 text-yellow-500 mb-2" />
                          <div className="text-2xl font-bold">
                            {weatherData?.current?.temp.toFixed(0) ?? "N/A"}°C
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Current Temperature
                          </div>
                        </div>
                      </CarouselItem>
                      <CarouselItem>
                        <div className="flex flex-col items-center justify-center py-4">
                          <CloudRain className="h-8 w-8 text-blue-400 mb-2" />
                          <div className="text-2xl font-bold">
                            {weatherData?.current.cloudCover ?? "N/A"}%
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Cloud Cover
                          </div>
                        </div>
                      </CarouselItem>
                      <CarouselItem>
                        <div className="flex flex-col items-center justify-center py-4">
                          <Wind className="h-8 w-8 text-sky-500 mb-2" />
                          <div className="text-2xl font-bold">
                            {weatherData?.current.windSpeed.toFixed(0) ?? "N/A"}{" "}
                            km/h
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Wind Speed
                          </div>
                        </div>
                      </CarouselItem>
                      <CarouselItem>
                        <div className="flex flex-col items-center justify-center py-4">
                          <Droplets className="h-8 w-8 text-cyan-500 mb-2" />
                          <div className="text-2xl font-bold">
                            {weatherData?.current?.humidity ?? "N/A"}%
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Humidity
                          </div>
                        </div>
                      </CarouselItem>
                    </CarouselContent>
                  </Carousel>
                </CardContent>
                <CardFooter className="pt-0 px-4 pb-3">
                  <Link href="/dashboard/weather">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between text-xs md:text-sm"
                    >
                      <span className="hidden sm:inline">View Weather</span>
                      <span className="sm:hidden">View</span>
                      <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card className="bg-card border hover:border-primary/30 transition-colors">
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
                  <Link href="/dashboard/fields">
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
              <Card className="bg-card border hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2 px-4 py-3">
                  <CardTitle className="text-base md:text-lg font-medium flex items-center gap-2">
                    <Leaf className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    <span className="hidden sm:inline">Crops</span>
                    <span className="sm:hidden">Crops</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <div className="text-2xl md:text-3xl font-bold">
                    {cropCount}
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    Active crops
                  </p>
                </CardContent>
                <CardFooter className="pt-0 px-4 pb-3">
                  <Link href="/dashboard/crops">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between text-xs md:text-sm"
                    >
                      <span className="hidden sm:inline">View Crops</span>
                      <span className="sm:hidden">View</span>
                      <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card className="bg-card border hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2 px-4 py-3">
                  <CardTitle className="text-base md:text-lg font-medium flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    <span className="hidden sm:inline">Tasks</span>
                    <span className="sm:hidden">Tasks</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <div className="text-2xl md:text-3xl font-bold">
                    {pendingTaskCount}
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    Pending tasks
                  </p>
                </CardContent>
                <CardFooter className="pt-0 px-4 pb-3">
                  <Link href="/dashboard/tasks">
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
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="bg-card border hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2 px-4 py-3">
                  <CardTitle className="text-base md:text-lg font-medium flex items-center gap-2">
                    <TractorIcon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    <span className="hidden sm:inline">Quick Actions</span>
                    <span className="sm:hidden">Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 space-y-2">
                  <Link href="/dashboard/fields">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs md:text-sm"
                    >
                      <TractorIcon className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                      <span className="hidden sm:inline">Add New Field</span>
                      <span className="sm:hidden">Add Field</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/fields">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs md:text-sm"
                    >
                      <Leaf className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                      <span className="hidden sm:inline">Add New Crop</span>
                      <span className="sm:hidden">Add Crop</span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Field Summary */}
              <Card className="bg-card border hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2 px-4 py-3">
                  <CardTitle className="text-base md:text-lg font-medium flex items-center gap-2">
                    <TractorIcon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    <span className="hidden sm:inline">Field Summary</span>
                    <span className="sm:hidden">Fields</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Total Fields:
                      </span>
                      <span className="font-medium">{fieldCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Active Crops:
                      </span>
                      <span className="font-medium">{cropCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Pending Tasks:
                      </span>
                      <span className="font-medium">{pendingTaskCount}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 px-4 pb-3">
                  <Link href="/dashboard/fields">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between text-xs md:text-sm"
                    >
                      <span className="hidden sm:inline">Manage Fields</span>
                      <span className="sm:hidden">Manage</span>
                      <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2" />
                  Upcoming Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(() => {
                    const upcomingTasks = getUpcomingTasks();

                    if (upcomingTasks.length === 0) {
                      return (
                        <div className="text-center py-4 text-muted-foreground">
                          <p className="text-sm">No upcoming tasks found.</p>
                        </div>
                      );
                    }

                    return upcomingTasks.map((task: FarmerTask) => (
                      <div
                        key={task.id}
                        className="flex items-center space-x-3"
                      >
                        <CheckCircle
                          className={`h-4 w-4 ${
                            task.completed ? "text-green-500" : "text-gray-400"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Due: {formatDate(task.dueDate)}{" "}
                            {task.completed ? "(Completed)" : "(Pending)"}
                          </p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Active Crops */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Leaf className="h-5 w-5 mr-2" />
                    Active Crops
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getActiveGrowingCrops().map((crop: Crop) => (
                      <div
                        key={crop.id}
                        className="flex items-center space-x-3"
                      >
                        <Leaf className="h-4 w-4 text-green-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{crop.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Status: {crop.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generateWeatherInsights().map((insight, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-l-4 ${
                          insight.type === "warning"
                            ? "bg-yellow-50 border-l-yellow-400 dark:bg-yellow-900/20"
                            : insight.type === "success"
                            ? "bg-green-50 border-l-green-400 dark:bg-green-900/20"
                            : "bg-blue-50 border-l-blue-400 dark:bg-blue-900/20"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-lg flex-shrink-0">
                            {insight.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium truncate">
                                {insight.title}
                              </h4>
                              <Badge
                                variant={
                                  insight.priority === "high"
                                    ? "destructive"
                                    : insight.priority === "medium"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {insight.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {insight.message}
                            </p>
                            <div className="flex items-center text-xs font-medium text-primary">
                              <ArrowRight className="h-3 w-3 mr-1" />
                              {insight.action}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DashboardLayout>
    );
  }

  // For farmers, show the main dashboard
  return (
    <DashboardLayout title="Dashboard">
      {showWelcome && (
        <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Sparkles className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                  Welcome to Greenupp! 🎉
                </h3>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  Your account has been successfully created. Let's get you
                  started with smart farming!
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Complete Profile
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Add Your Fields
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Plan Your Crops
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWelcome(false)}
                className="text-green-600 hover:text-green-800"
              >
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* User Info Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <User className="h-5 w-5 mr-2" />
              Welcome Back
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">
                {user.firstName || user.username}
              </p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge variant="secondary" className="capitalize">
                {user.role}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Active Crops
                </span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Fields</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tasks</span>
                <span className="font-semibold">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Account Created</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      {/* Getting Started */}
      {user.role === "farmer" && profileCompletion < 100 && (
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Complete these steps to unlock the full potential of Greenupp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">
                    1
                  </span>
                </div>
                <div>
                  <h4 className="font-medium">Complete Your Profile</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add your farm details and preferences
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    2
                  </span>
                </div>
                <div>
                  <h4 className="font-medium">Add Your Fields</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Map and configure your farming areas
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-semibold">
                    3
                  </span>
                </div>
                <div>
                  <h4 className="font-medium">Plan Your Crops</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start tracking your crop cycles
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button className="bg-green-600 hover:bg-green-700">
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
