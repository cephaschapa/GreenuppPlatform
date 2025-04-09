import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import BasicHome from "@/pages/BasicHome"; // Using simplified home page temporarily
import { ThemeProvider } from "@/components/ThemeProvider";

function Router() {
  return (
    <Switch>
      <Route path="/" component={BasicHome} />
      <Route path="/auth" component={NotFound} />
      <Route path="/dashboard" component={NotFound} />
      <Route path="/dashboard/weather" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Commenting out PWA functionality temporarily to debug rendering issues
/*
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
*/

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
