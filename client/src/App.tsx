import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import ProfileCreationPage from "@/pages/profile-creation-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { ThemeProvider } from "@/components/ThemeProvider";
import { setupPWA, setupServiceWorkerUpdates } from "@/lib/pwa";
import { useToast } from "@/hooks/use-toast";
import { OfflineProvider } from "@/components/OfflineProvider";

// Import farmer-specific pages
import FieldsPage from "@/pages/farmer/FieldsPage";
import TasksPage from "@/pages/farmer/TasksPage";
import WeatherPage from "@/pages/farmer/WeatherPage";
import PredictionsPage from "@/pages/farmer/PredictionsPage";
import SettingsPage from "@/pages/farmer/SettingsPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Dashboard routes */}
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/dashboard/fields" component={FieldsPage} />
      <ProtectedRoute path="/dashboard/tasks" component={TasksPage} />
      <ProtectedRoute path="/dashboard/weather" component={WeatherPage} />
      <ProtectedRoute path="/dashboard/predictions" component={PredictionsPage} />
      <ProtectedRoute path="/dashboard/settings" component={SettingsPage} />
      <ProtectedRoute path="/profile-creation" component={ProfileCreationPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function PWAInitializer() {
  const { toast } = useToast();
  
  useEffect(() => {
    // Setup PWA functionality
    setupPWA();
    
    // Handle service worker updates
    setupServiceWorkerUpdates(() => {
      toast({
        title: "Update Available",
        description: "A new version of the app is available. Refresh to update.",
        variant: "default",
        action: (
          <button 
            className="bg-primary text-white px-3 py-1 rounded-md text-xs"
            onClick={() => window.location.reload()}
          >
            Update
          </button>
        ),
        duration: 0, // Don't auto-dismiss
      });
    });
  }, []);
  
  return null;
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {/* Temporarily disabled OfflineProvider to fix rendering issues */}
          {/* <OfflineProvider> */}
            <PWAInitializer />
            <Router />
            <Toaster />
          {/* </OfflineProvider> */}
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
