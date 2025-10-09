import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Cloud,
  TrendingUp,
  Sprout,
  ListTodo,
  MessageSquare,
  AlertCircle,
  MapPin,
  DollarSign,
} from "lucide-react";

export function LiteModeDashboard() {
  const { user } = useAuth();

  // Get weather data
  const { data: weatherData } = useQuery({
    queryKey: ["/api/weather/current"],
    enabled: !!user,
  });

  // Get fields count
  const { data: fieldsData } = useQuery({
    queryKey: ["/api/fields"],
    enabled: !!user,
  });

  // Get pending tasks count
  const { data: tasksData } = useQuery({
    queryKey: ["/api/tasks"],
    enabled: !!user,
  });

  const fieldsCount = Array.isArray(fieldsData) ? fieldsData.length : 0;
  const pendingTasks = Array.isArray(tasksData)
    ? tasksData.filter((task: any) => task.status !== "completed").length
    : 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4 py-6">
      {/* Welcome Message */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">
          {getGreeting()}, {user?.firstName || user?.username}!
        </h1>
        <p className="text-lg text-muted-foreground">
          Let's grow together today 🌱
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <MapPin className="h-12 w-12 mx-auto mb-2 text-blue-600" />
            <p className="text-3xl font-bold">{fieldsCount}</p>
            <p className="text-sm text-muted-foreground">My Fields</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <ListTodo className="h-12 w-12 mx-auto mb-2 text-orange-600" />
            <p className="text-3xl font-bold">{pendingTasks}</p>
            <p className="text-sm text-muted-foreground">Pending Tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Weather Quick View */}
      {weatherData && (
        <Card className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cloud className="h-10 w-10 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Today's Weather</p>
                  <p className="text-2xl font-bold">
                    {Math.round(weatherData.current?.temp_c || 0)}°C
                  </p>
                </div>
              </div>
              <Link href="/farmer/weather">
                <Button variant="outline" size="lg" className="text-lg h-12">
                  View Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Actions - Large Buttons */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold mb-3">Quick Actions</h2>

        <Link href="/farmer/fields">
          <Button
            variant="outline"
            size="lg"
            className="w-full h-20 text-lg flex items-center justify-start gap-4 hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-300"
          >
            <MapPin className="h-8 w-8 text-green-600" />
            <div className="text-left">
              <p className="font-semibold">My Fields</p>
              <p className="text-sm text-muted-foreground">View and manage fields</p>
            </div>
          </Button>
        </Link>

        <Link href="/farmer/crops">
          <Button
            variant="outline"
            size="lg"
            className="w-full h-20 text-lg flex items-center justify-start gap-4 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-300"
          >
            <Sprout className="h-8 w-8 text-emerald-600" />
            <div className="text-left">
              <p className="font-semibold">My Crops</p>
              <p className="text-sm text-muted-foreground">Track crop health</p>
            </div>
          </Button>
        </Link>

        <Link href="/farmer/tasks">
          <Button
            variant="outline"
            size="lg"
            className="w-full h-20 text-lg flex items-center justify-start gap-4 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:border-orange-300"
          >
            <ListTodo className="h-8 w-8 text-orange-600" />
            <div className="text-left">
              <p className="font-semibold">My Tasks</p>
              <p className="text-sm text-muted-foreground">
                {pendingTasks} pending
              </p>
            </div>
          </Button>
        </Link>

        <Link href="/farmer/weather">
          <Button
            variant="outline"
            size="lg"
            className="w-full h-20 text-lg flex items-center justify-start gap-4 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-300"
          >
            <Cloud className="h-8 w-8 text-blue-600" />
            <div className="text-left">
              <p className="font-semibold">Weather</p>
              <p className="text-sm text-muted-foreground">Forecast & alerts</p>
            </div>
          </Button>
        </Link>

        <Link href="/marketplace">
          <Button
            variant="outline"
            size="lg"
            className="w-full h-20 text-lg flex items-center justify-start gap-4 hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:border-purple-300"
          >
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div className="text-left">
              <p className="font-semibold">Marketplace</p>
              <p className="text-sm text-muted-foreground">Buy & sell products</p>
            </div>
          </Button>
        </Link>

        <Link href="/farming-assistant">
          <Button
            variant="outline"
            size="lg"
            className="w-full h-20 text-lg flex items-center justify-start gap-4 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:border-indigo-300"
          >
            <MessageSquare className="h-8 w-8 text-indigo-600" />
            <div className="text-left">
              <p className="font-semibold">Ask AI Assistant</p>
              <p className="text-sm text-muted-foreground">Get farming advice</p>
            </div>
          </Button>
        </Link>
      </div>

      {/* Help Section */}
      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-100">
                Need Help?
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Contact support or visit our help center for farming tips and tutorials.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to get greeting based on time
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

