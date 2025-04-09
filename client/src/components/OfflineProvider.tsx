import { 
  createContext, 
  ReactNode, 
  useContext, 
  useEffect, 
  useState,
  useCallback
} from 'react';
import { setOnlineStatus, setOfflineModeEnabled } from '@/lib/queryClient';
import { 
  getOfflineRequests, 
  removeOfflineRequest,
  clearCache
} from '@/lib/indexedDB';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Wifi, WifiOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OfflineContextType {
  isOnline: boolean;
  offlineModeEnabled: boolean;
  pendingRequests: number;
  isSyncing: boolean;
  enableOfflineMode: () => void;
  disableOfflineMode: () => void;
  syncOfflineData: () => Promise<void>;
  clearOfflineData: () => Promise<void>;
  registerServiceWorker: () => Promise<boolean>;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineModeEnabled, setOfflineModeEnabled] = useState<boolean>(
    localStorage.getItem('offlineModeEnabled') === 'true'
  );
  const [pendingRequests, setPendingRequests] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [serviceWorkerRegistered, setServiceWorkerRegistered] = useState<boolean>(false);
  const { toast } = useToast();

  // Update the global state in queryClient.ts
  useEffect(() => {
    setOnlineStatus(isOnline);
    setOfflineModeEnabled(offlineModeEnabled);
    
    // Save offline mode preference to localStorage
    localStorage.setItem('offlineModeEnabled', offlineModeEnabled.toString());
  }, [isOnline, offlineModeEnabled]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "You're back online",
        description: pendingRequests > 0 
          ? `You have ${pendingRequests} pending tasks to sync.` 
          : "Your connection has been restored.",
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

    // Listen for service worker messages (sync complete)
    const handleSyncMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_COMPLETE') {
        refreshPendingCount();
        setIsSyncing(false);
        
        toast({
          title: "Sync complete",
          description: "Your offline changes have been synchronized.",
          variant: "default",
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('message', handleSyncMessage);
    }

    // Initialize
    refreshPendingCount();
    if (!serviceWorkerRegistered) {
      registerServiceWorker();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.removeEventListener('message', handleSyncMessage);
      }
    };
  }, [pendingRequests, offlineModeEnabled, serviceWorkerRegistered]);

  // Get count of pending offline requests
  const refreshPendingCount = useCallback(async () => {
    try {
      const requests = await getOfflineRequests();
      setPendingRequests(requests.length);
    } catch (error) {
      console.error('Failed to get offline request count', error);
    }
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('ServiceWorker registered with scope:', registration.scope);
        setServiceWorkerRegistered(true);
        return true;
      } catch (error) {
        console.error('ServiceWorker registration failed:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Enable offline mode
  const enableOfflineMode = useCallback(() => {
    setOfflineModeEnabled(true);
    toast({
      title: "Offline mode enabled",
      description: "Your data will be cached for offline use.",
      variant: "default",
    });
  }, []);

  // Disable offline mode
  const disableOfflineMode = useCallback(() => {
    setOfflineModeEnabled(false);
    toast({
      title: "Offline mode disabled",
      description: "Offline caching has been turned off.",
      variant: "default",
    });
  }, []);

  // Sync pending offline requests
  const syncOfflineData = useCallback(async () => {
    if (!isOnline) {
      toast({
        title: "Cannot sync while offline",
        description: "Please connect to the internet and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    
    try {
      // Get all pending requests
      const requests = await getOfflineRequests();
      
      if (requests.length === 0) {
        toast({
          title: "No pending changes",
          description: "There are no offline changes to sync.",
          variant: "default",
        });
        setIsSyncing(false);
        return;
      }
      
      // If we have a service worker with background sync
      if ('serviceWorker' in navigator && 'SyncManager' in window && navigator.serviceWorker.controller) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.sync.register('sync-offline-data');
          toast({
            title: "Sync started",
            description: "Your changes are being synchronized in the background.",
            variant: "default",
          });
        } catch (error) {
          console.error('Failed to register background sync:', error);
          await manualSync(requests);
        }
      } else {
        // Fallback to manual sync
        await manualSync(requests);
      }
    } catch (error) {
      console.error('Error syncing offline data:', error);
      toast({
        title: "Sync failed",
        description: "There was an error synchronizing your offline changes.",
        variant: "destructive",
      });
      setIsSyncing(false);
    }
  }, [isOnline]);

  // Manual sync function for browsers that don't support background sync
  const manualSync = async (requests: any[]) => {
    let successCount = 0;
    let failCount = 0;
    
    for (const request of requests) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(request.data)
        });

        if (response.ok) {
          await removeOfflineRequest(request.id);
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error('Failed to process offline request:', error);
        failCount++;
      }
    }

    await refreshPendingCount();
    setIsSyncing(false);
    
    toast({
      title: "Sync completed",
      description: `${successCount} requests synced successfully. ${failCount} failed.`,
      variant: failCount > 0 ? "destructive" : "default",
    });
  };

  // Clear all pending offline data
  const clearOfflineData = useCallback(async () => {
    try {
      // Clear pending requests
      const requests = await getOfflineRequests();
      for (const request of requests) {
        await removeOfflineRequest(request.id!);
      }
      
      // Clear cache
      await clearCache();
      
      await refreshPendingCount();
      
      toast({
        title: "Offline data cleared",
        description: "All cached data and pending requests have been cleared.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error clearing offline data:', error);
      toast({
        title: "Error clearing data",
        description: "There was an error clearing your offline data.",
        variant: "destructive",
      });
    }
  }, [refreshPendingCount]);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        offlineModeEnabled,
        pendingRequests,
        isSyncing,
        enableOfflineMode,
        disableOfflineMode,
        syncOfflineData,
        clearOfflineData,
        registerServiceWorker
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
                <>
                  <p>Offline mode is enabled. Your changes will be saved locally.</p>
                  {pendingRequests > 0 && (
                    <p>You have {pendingRequests} pending {pendingRequests === 1 ? 'change' : 'changes'} to sync when you're back online.</p>
                  )}
                </>
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
      
      {/* Pending sync notification */}
      {isOnline && pendingRequests > 0 && (
        <div className="fixed bottom-20 md:bottom-4 left-0 right-0 z-50 px-4 py-2 flex justify-center">
          <Alert variant="default" className="max-w-md bg-primary/20 border-primary">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <AlertTitle className="flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  Pending changes
                </AlertTitle>
                <AlertDescription>
                  You have {pendingRequests} {pendingRequests === 1 ? 'change' : 'changes'} ready to sync.
                </AlertDescription>
              </div>
              <Button
                size="sm"
                onClick={syncOfflineData}
                disabled={isSyncing}
                className="flex items-center gap-1"
              >
                <Check className="h-4 w-4" />
                {isSyncing ? 'Syncing...' : 'Sync now'}
              </Button>
            </div>
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