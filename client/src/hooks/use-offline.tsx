import { useState, useEffect, useCallback } from 'react';
import { 
  queueOfflineRequest, 
  getOfflineRequests, 
  removeOfflineRequest,
  cacheData,
  getCachedData
} from '@/lib/indexedDB';

export function useOffline() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingRequests, setPendingRequests] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Listen for online/offline events
  useEffect(() => {
    // Update online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Listen for service worker messages (sync complete)
    const handleSyncMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_COMPLETE') {
        refreshPendingCount();
        setIsSyncing(false);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSyncMessage);
    }

    // Initialize pending count
    refreshPendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSyncMessage);
      }
    };
  }, []);

  // Get count of pending offline requests
  const refreshPendingCount = useCallback(async () => {
    try {
      const requests = await getOfflineRequests();
      setPendingRequests(requests.length);
    } catch (error) {
      console.error('Failed to get offline request count', error);
    }
  }, []);

  // Function to handle API requests with offline support
  const offlineSafeRequest = useCallback(async <T extends {}>(
    url: string,
    method: string,
    data?: any,
    options?: {
      cacheKey?: string,
      cacheExpiry?: number,
      skipOfflineQueue?: boolean
    }
  ): Promise<{ data: T | null; fromCache: boolean; error?: string }> => {
    const { cacheKey, cacheExpiry, skipOfflineQueue = false } = options || {};
    
    // If we're online, try to fetch data normally
    if (isOnline) {
      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: data ? JSON.stringify(data) : undefined
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const responseData = await response.json();

        // Cache the response if a cache key is provided
        if (cacheKey && (method === 'GET' || method === 'POST')) {
          await cacheData(cacheKey, responseData, cacheExpiry);
        }

        return { data: responseData, fromCache: false };
      } catch (error) {
        console.error('Error making request:', error);

        // If online request failed, try to get from cache if we have a cache key
        if (cacheKey) {
          const cachedData = await getCachedData(cacheKey);
          if (cachedData) {
            return { data: cachedData, fromCache: true };
          }
        }

        // If not a GET request and not skipOfflineQueue, queue it for later
        if (!skipOfflineQueue && method !== 'GET') {
          await queueOfflineRequest(url, method, data);
          refreshPendingCount();
          return { 
            data: null, 
            fromCache: false, 
            error: 'Request failed but has been queued for when you\'re back online' 
          };
        }

        return { 
          data: null, 
          fromCache: false, 
          error: 'Request failed and could not be processed offline' 
        };
      }
    } else {
      // We're offline
      // First check cache for GET requests
      if (method === 'GET' && cacheKey) {
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
          return { data: cachedData, fromCache: true };
        }
      }

      // For non-GET requests, queue them to be processed when online
      if (!skipOfflineQueue && method !== 'GET') {
        await queueOfflineRequest(url, method, data);
        refreshPendingCount();
        return { 
          data: null, 
          fromCache: false, 
          error: 'You are offline. Your request has been saved and will be processed when you are back online.' 
        };
      }

      return { 
        data: null, 
        fromCache: false, 
        error: 'You are offline and this request cannot be processed offline.' 
      };
    }
  }, [isOnline, refreshPendingCount]);

  // Manually trigger a sync of pending offline requests
  const syncOfflineData = useCallback(async () => {
    if (!isOnline) {
      return { success: false, message: 'Cannot sync while offline' };
    }

    setIsSyncing(true);

    // If we have ServiceWorker and SyncManager, use background sync
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-offline-data');
        // The rest will be handled by the service worker and the sync event
        return { success: true, message: 'Sync initiated' };
      } catch (error) {
        console.error('Failed to register background sync:', error);
        setIsSyncing(false);
        return { success: false, message: 'Failed to initiate sync' };
      }
    } else {
      // Manual sync for browsers that don't support background sync
      try {
        const requests = await getOfflineRequests();
        
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
              await removeOfflineRequest(request.id!);
            }
          } catch (error) {
            console.error('Failed to process offline request:', error);
          }
        }

        // Update pending count after sync
        await refreshPendingCount();
        setIsSyncing(false);
        return { success: true, message: 'Manual sync completed' };
      } catch (error) {
        console.error('Manual sync failed:', error);
        setIsSyncing(false);
        return { success: false, message: 'Manual sync failed' };
      }
    }
  }, [isOnline, refreshPendingCount]);

  // Clear all pending offline requests
  const clearOfflineData = useCallback(async () => {
    const requests = await getOfflineRequests();
    
    for (const request of requests) {
      await removeOfflineRequest(request.id!);
    }
    
    await refreshPendingCount();
    return { success: true, message: 'All offline requests cleared' };
  }, [refreshPendingCount]);

  return {
    isOnline,
    pendingRequests,
    isSyncing,
    offlineSafeRequest,
    syncOfflineData,
    clearOfflineData
  };
}