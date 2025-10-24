import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import {
  Sun,
  CloudRain,
  Cloud,
  CloudDrizzle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Droplets,
  Leaf,
  Camera,
  ClipboardList,
  TrendingUp,
  ChevronRight,
  Sprout,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInDays, format, formatDistanceToNow } from "date-fns";

interface Crop {
  id: number;
  name: string;
  variety?: string;
  status: string;
  plantingDate?: string;
  expectedHarvestDate?: string;
  fieldId?: number;
  field?: { name: string };
}

interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  priority?: string;
  cropId?: number;
  fieldId?: number;
}

interface WeatherData {
  current: {
    temp: number;
    condition: string;
    description: string;
    humidity: number;
  };
  forecast: Array<{
    date: string;
    condition: string;
    precipitation: number;
  }>;
  alerts?: Array<{
    event: string;
    severity: string;
  }>;
}

export function TodayDashboard() {
  console.log("🎉 TodayDashboard component is rendering!");
  const { user } = useAuth();

  // Fetch today's tasks
  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    enabled: !!user?.id,
  });

  // Fetch active crops
  const { data: crops } = useQuery<Crop[]>({
    queryKey: ["/api/crops"],
    enabled: !!user?.id,
  });

  // Fetch weather
  const { data: farmerProfile } = useQuery({
    queryKey: ["/api/farmer-profile"],
    enabled: !!user?.id,
  });

  const { data: weatherData } = useQuery<WeatherData>({
    queryKey: ["/api/weather", farmerProfile?.farmLocation],
    queryFn: async () => {
      if (!farmerProfile?.farmLocation) throw new Error("No location");
      const response = await fetch(
        `/api/weather?location=${encodeURIComponent(
          farmerProfile.farmLocation
        )}`
      );
      if (!response.ok) throw new Error("Failed to fetch weather");
      return await response.json();
    },
    enabled: !!farmerProfile?.farmLocation,
  });

  // Filter today's tasks
  const todaysTasks =
    tasks?.filter((task) => {
      if (task.completed) return false;
      if (!task.dueDate) return false;

      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return dueDate.toDateString() === today.toDateString();
    }) || [];

  // Get overdue tasks
  const overdueTasks =
    tasks?.filter((task) => {
      if (task.completed) return false;
      if (!task.dueDate) return false;

      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return dueDate < today;
    }) || [];

  // Get active crops (planted or growing)
  const activeCrops =
    crops?.filter((crop) => ["planted", "growing"].includes(crop.status)) || [];

  // Get crops needing attention (within 7 days of harvest)
  const cropsNeedingAttention = activeCrops.filter((crop) => {
    if (!crop.expectedHarvestDate) return false;
    const daysUntilHarvest = differenceInDays(
      new Date(crop.expectedHarvestDate),
      new Date()
    );
    return daysUntilHarvest <= 7 && daysUntilHarvest >= 0;
  });

  // Get weather icon
  const getWeatherIcon = (condition: string) => {
    const cond = condition?.toLowerCase() || "";
    if (cond.includes("rain"))
      return <CloudRain className="h-6 w-6 text-blue-500" />;
    if (cond.includes("cloud"))
      return <Cloud className="h-6 w-6 text-gray-500" />;
    if (cond.includes("drizzle"))
      return <CloudDrizzle className="h-6 w-6 text-blue-300" />;
    return <Sun className="h-6 w-6 text-yellow-500" />;
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Greeting Card with Weather */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1">
                {getGreeting()}, {user?.firstName || "Farmer"}! 👋
              </h2>
              <p className="text-sm text-muted-foreground">
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
            {weatherData && (
              <div className="flex items-center gap-3 bg-white/50 dark:bg-black/20 rounded-lg p-3">
                {getWeatherIcon(weatherData.current.condition)}
                <div>
                  <div className="text-2xl font-bold">
                    {Math.round(weatherData.current.temp)}°C
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {weatherData.current.description}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weather Alert */}
      {weatherData?.alerts && weatherData.alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5" />
              Weather Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weatherData.alerts.map((alert, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <Badge variant="destructive" className="text-xs">
                  {alert.severity}
                </Badge>
                <span className="text-sm">{alert.event}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Today's Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base md:text-lg">
              <span className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Today's Tasks
              </span>
              <Badge variant="secondary">{todaysTasks.length}</Badge>
            </CardTitle>
            {overdueTasks.length > 0 && (
              <CardDescription className="text-red-600 dark:text-red-400">
                {overdueTasks.length} overdue task
                {overdueTasks.length > 1 ? "s" : ""}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {todaysTasks.length === 0 && overdueTasks.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tasks for today!</p>
              </div>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {/* Overdue tasks first */}
                  {overdueTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
                    >
                      <Clock className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {task.title}
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400">
                          Overdue • Due{" "}
                          {format(new Date(task.dueDate!), "MMM d")}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Today's tasks */}
                  {todaysTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div className="h-4 w-4 rounded border-2 border-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            <Link href="/dashboard/tasks">
              <Button variant="ghost" size="sm" className="w-full mt-3">
                View All Tasks <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Crops Needing Attention */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base md:text-lg">
              <span className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-green-600" />
                Crops Needing Attention
              </span>
              <Badge variant="secondary">{activeCrops.length} active</Badge>
            </CardTitle>
            <CardDescription>
              Monitor your crops and log daily observations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeCrops.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Leaf className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active crops</p>
                <Link href="/dashboard/fields">
                  <Button variant="outline" size="sm" className="mt-2">
                    Plant Your First Crop
                  </Button>
                </Link>
              </div>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {/* Crops close to harvest */}
                  {cropsNeedingAttention.map((crop) => (
                    <div
                      key={crop.id}
                      className="flex items-start gap-2 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800"
                    >
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {crop.name} {crop.variety && `(${crop.variety})`}
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-400">
                          Harvest in{" "}
                          {differenceInDays(
                            new Date(crop.expectedHarvestDate!),
                            new Date()
                          )}{" "}
                          days
                        </p>
                        {crop.field && (
                          <p className="text-xs text-muted-foreground">
                            {crop.field.name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* All active crops */}
                  {activeCrops.slice(0, 5).map((crop) => {
                    if (cropsNeedingAttention.find((c) => c.id === crop.id))
                      return null;

                    const daysGrowing = crop.plantingDate
                      ? differenceInDays(
                          new Date(),
                          new Date(crop.plantingDate)
                        )
                      : 0;
                    const daysUntilHarvest = crop.expectedHarvestDate
                      ? differenceInDays(
                          new Date(crop.expectedHarvestDate),
                          new Date()
                        )
                      : null;

                    return (
                      <div
                        key={crop.id}
                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50"
                      >
                        <Leaf className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {crop.name} {crop.variety && `(${crop.variety})`}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{daysGrowing} days growing</span>
                            {daysUntilHarvest !== null && (
                              <span className="text-green-600">
                                • {daysUntilHarvest} days to harvest
                              </span>
                            )}
                          </div>
                          {crop.field && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {crop.field.name}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {crop.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
            <Link href="/dashboard/fields">
              <Button variant="ghost" size="sm" className="w-full mt-3">
                View All Crops <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
          <CardDescription>Common tasks for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <Link href="/dashboard/fields">
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex-col gap-2"
              >
                <Camera className="h-6 w-6" />
                <span className="text-xs">Log Observation</span>
              </Button>
            </Link>

            <Link href="/dashboard/tasks">
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex-col gap-2"
              >
                <ClipboardList className="h-6 w-6" />
                <span className="text-xs">Add Task</span>
              </Button>
            </Link>

            <Link href="/dashboard/weather">
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex-col gap-2"
              >
                <Cloud className="h-6 w-6" />
                <span className="text-xs">Check Weather</span>
              </Button>
            </Link>

            <Link href="/dashboard/diagnose">
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex-col gap-2"
              >
                <Leaf className="h-6 w-6" />
                <span className="text-xs">Diagnose Plant</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Weather Forecast Summary */}
      {weatherData && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              This Week's Weather
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {weatherData.forecast?.slice(0, 7).map((day, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center p-2 rounded-lg bg-muted/50 text-center"
                >
                  <span className="text-xs font-medium mb-1">
                    {idx === 0 ? "Today" : format(new Date(day.date), "EEE")}
                  </span>
                  {getWeatherIcon(day.condition)}
                  <div className="flex items-center gap-1 mt-1">
                    <Droplets className="h-3 w-3 text-blue-500" />
                    <span className="text-xs">{day.precipitation}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Farm Activity Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            This Week's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {activeCrops.length}
              </div>
              <p className="text-xs text-muted-foreground">Active Crops</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {tasks?.filter((t) => !t.completed).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Open Tasks</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {tasks?.filter(
                  (t) =>
                    t.completed &&
                    t.dueDate &&
                    differenceInDays(new Date(), new Date(t.dueDate)) <= 7
                ).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Tasks Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {cropsNeedingAttention.length}
              </div>
              <p className="text-xs text-muted-foreground">Need Attention</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
