import { 
  createContext, 
  ReactNode, 
  useContext, 
  useEffect, 
  useState,
  useCallback
} from 'react';
import { setOnlineStatus, setOfflineModeEnabled } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Simplified OfflineContext for now
interface OfflineContextType {
  isOnline: boolean;
  offlineModeEnabled: boolean;
  enableOfflineMode: () => void;
  disableOfflineMode: () => void;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineModeEnabled, setOfflineModeEnabled] = useState<boolean>(
    localStorage.getItem('offlineModeEnabled') === 'true'
  );
  const { toast } = useToast();

  // Update the global state in queryClient.ts
  useEffect(() => {
    setOnlineStatus(isOnline);
    setOfflineModeEnabled(offlineModeEnabled);
    
    // Save offline mode preference to localStorage
    localStorage.setItem('offlineModeEnabled', offlineModeEnabled.toString());

    // Setup online/offline listeners
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "You're back online",
        description: "Your connection has been restored.",
        variant: "default",
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description: offlineModeEnabled 
          ? "Offline mode is enabled. Your changes will be saved locally." 
          : "Offline mode is disabled. Some features may not work.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline, offlineModeEnabled, toast]);

  // Register service worker on mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('ServiceWorker registration failed:', error);
        });
    }
  }, []);

  // Enable offline mode
  const enableOfflineMode = useCallback(() => {
    setOfflineModeEnabled(true);
    toast({
      title: "Offline mode enabled",
      description: "Your data will be cached for offline use.",
      variant: "default",
    });
  }, [toast]);

  // Disable offline mode
  const disableOfflineMode = useCallback(() => {
    setOfflineModeEnabled(false);
    toast({
      title: "Offline mode disabled",
      description: "Offline caching has been turned off.",
      variant: "default",
    });
  }, [toast]);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        offlineModeEnabled,
        enableOfflineMode,
        disableOfflineMode
      }}
    >
      {children}
      
      {/* Offline status indicator */}
      {!isOnline && (
        <div className="fixed top-16 md:top-4 left-0 right-0 z-50 px-4 py-2 flex justify-center">
          <Alert variant="destructive" className="max-w-md">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>You're offline</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              {offlineModeEnabled ? (
                <p>Offline mode is enabled. Your changes will be saved locally.</p>
              ) : (
                <>
                  <p>Offline mode is disabled. Some features may not work properly.</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-2" 
                    onClick={enableOfflineMode}
                  >
                    Enable Offline Mode
                  </Button>
                </>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </OfflineContext.Provider>
  );
}

export function useOfflineStatus() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOfflineStatus must be used within an OfflineProvider');
  }
  return context;
}