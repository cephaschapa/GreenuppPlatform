import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FarmerProfile, Field, Crop, FarmerTask } from "@shared/schema";
import { Loader2, TractorIcon, Leaf, Calendar, ClipboardList, Cloud, Sparkles, ChevronRight } from "lucide-react";
import { Link } from "wouter";

export default function DashboardOverview() {
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
  
  // Fetch fields
  const { data: fields, isLoading: fieldsLoading } = useQuery<Field[]>({
    queryKey: ['/api/fields'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/fields');
        if (!response.ok) {
          throw new Error("Failed to fetch fields");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching fields:", error);
        return [];
      }
    }
  });
  
  // Fetch crops
  const { data: crops, isLoading: cropsLoading } = useQuery<Crop[]>({
    queryKey: ['/api/crops'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/crops');
        if (!response.ok) {
          throw new Error("Failed to fetch crops");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching crops:", error);
        return [];
      }
    }
  });
  
  // Fetch tasks
  const { data: tasks, isLoading: tasksLoading } = useQuery<FarmerTask[]>({
    queryKey: ['/api/tasks'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/tasks');
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
      }
    }
  });
  
  // Get counts
  const fieldCount = fields?.length || 0;
  const cropCount = crops?.length || 0;
  const pendingTaskCount = tasks?.filter(task => !task.completed).length || 0;
  
  // Weather data
  const { data: weatherData, isLoading: weatherLoading } = useQuery({
    queryKey: ['/api/weather'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/weather');
        if (!response.ok) {
          throw new Error("Failed to fetch weather");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching weather:", error);
        return null;
      }
    }
  });
  
  // Check if any section is loading
  const isLoading = profileLoading || fieldsLoading || cropsLoading || tasksLoading || weatherLoading;
  
  // Helper to format date
  const formatDate = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString();
  };
  
  // Filter crops by status
  const getActiveGrowingCrops = () => {
    return crops?.filter(crop => crop.status === 'growing' || crop.status === 'planted') || [];
  };
  
  // Get upcoming tasks (next 7 days)
  const getUpcomingTasks = () => {
    if (!tasks) return [];
    
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return tasks
      .filter(task => {
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
  
  return (
    <DashboardLayout
      title={`Welcome, ${farmerProfile?.farmName || "Farmer"}`}
      description="Your farming operations at a glance"
    >
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <TractorIcon className="h-5 w-5 text-primary" />
                  Fields
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{fieldCount}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Total registered fields
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/dashboard/fields">
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    View Fields
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="bg-green-950/10 border-green-600/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  Crops
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{cropCount}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Active crops ({getActiveGrowingCrops().length} growing)
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/dashboard/fields">
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    Manage Crops
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="bg-blue-950/10 border-blue-600/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                  Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pendingTaskCount}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Pending tasks
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/dashboard/tasks">
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    View Tasks
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="bg-sky-950/10 border-sky-600/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-sky-600" />
                  Weather
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weatherData ? (
                  <>
                    <div className="text-3xl font-bold">
                      {weatherData.current.temp}°C
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {weatherData.location} - {weatherData.current.condition}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    Weather data unavailable
                  </p>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/dashboard/weather">
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    Weather Details
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
          
          {/* Quick Access Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Upcoming Tasks</CardTitle>
                <CardDescription>Tasks due in the next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {getUpcomingTasks().length > 0 ? (
                  <div className="space-y-3">
                    {getUpcomingTasks().map((task) => (
                      <div key={task.id} className="p-3 border rounded-lg flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Due: {formatDate(task.dueDate)}
                          </p>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === 'high' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' 
                            : task.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No upcoming tasks for the next 7 days.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/tasks">
                  <Button variant="outline" className="w-full">View All Tasks</Button>
                </Link>
              </CardFooter>
            </Card>
            
            {/* Active Crops */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Active Crops</CardTitle>
                <CardDescription>Currently growing crops</CardDescription>
              </CardHeader>
              <CardContent>
                {getActiveGrowingCrops().length > 0 ? (
                  <div className="space-y-3">
                    {getActiveGrowingCrops().slice(0, 5).map((crop) => (
                      <div key={crop.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{crop.name} ({crop.variety})</h4>
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            {crop.status.charAt(0).toUpperCase() + crop.status.slice(1)}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground grid grid-cols-2 gap-2">
                          <p>Planted: {formatDate(crop.plantingDate)}</p>
                          <p>Harvest: {formatDate(crop.harvestDate)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No active crops currently growing.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/fields">
                  <Button variant="outline" className="w-full">Manage Crops</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
          
          {/* AI Insights and Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Insights */}
            <Card className="border-primary/30 bg-gradient-to-br from-background to-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI-Powered Insights
                </CardTitle>
                <CardDescription>
                  Get intelligent predictions for your crops
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Use our AI technology to predict crop yields, analyze soil conditions,
                  and get recommendations based on weather patterns.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/predictions">
                  <Button className="w-full">Generate Predictions</Button>
                </Link>
              </CardFooter>
            </Card>
            
            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and actions
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Link href="/dashboard/fields">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <TractorIcon className="h-4 w-4" />
                    Add Field
                  </Button>
                </Link>
                <Link href="/dashboard/tasks">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <ClipboardList className="h-4 w-4" />
                    New Task
                  </Button>
                </Link>
                <Link href="/dashboard/weather">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Cloud className="h-4 w-4" />
                    Weather
                  </Button>
                </Link>
                <Link href="/dashboard/predictions">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Sparkles className="h-4 w-4" />
                    Predictions
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}