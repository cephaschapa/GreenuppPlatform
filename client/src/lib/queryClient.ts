import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Default values since OfflineProvider is temporarily disabled
let isOnline = navigator.onLine;
let offlineModeEnabled = localStorage.getItem('offlineModeEnabled') === 'true';

// Stubs for offline storage until we properly implement IndexedDB
async function queueOfflineRequest(url: string, method: string, data?: unknown) {
  console.log('Offline request queued (stub):', { url, method, data });
  return Promise.resolve();
}

async function getCachedData(key: string) {
  console.log('Getting cached data (stub):', key);
  return null;
}

async function cacheData(key: string, data: unknown, expiry?: number) {
  console.log('Caching data (stub):', { key, data, expiry });
  return Promise.resolve();
}

// Update online status
export function setOnlineStatus(status: boolean) {
  isOnline = status;
}

// Enable/disable offline mode features
export function setOfflineModeEnabled(enabled: boolean) {
  offlineModeEnabled = enabled;
  localStorage.setItem('offlineModeEnabled', enabled.toString());
}

// Error handler for API requests
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Enhanced API request function with offline support
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: {
    skipOfflineQueue?: boolean;
    cacheKey?: string;
    cacheExpiry?: number;
  }
): Promise<Response> {
  const { skipOfflineQueue = false, cacheKey, cacheExpiry } = options || {};
  
  // If we're online, try to process normally
  if (isOnline) {
    try {
      const res = await fetch(url, {
        method,
        headers: data ? { "Content-Type": "application/json" } : {},
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });

      await throwIfResNotOk(res);
      
      // Cache successful GET responses when offline mode is enabled
      if (offlineModeEnabled && method === 'GET' && cacheKey) {
        const responseData = await res.clone().json();
        await cacheData(cacheKey, responseData, cacheExpiry);
      }
      
      return res;
    } catch (error) {
      // If offline mode is enabled and this is a write operation, queue it
      if (offlineModeEnabled && !skipOfflineQueue && method !== 'GET') {
        await queueOfflineRequest(url, method, data);
        
        // Return a mock response for successful queueing
        const mockResponse = new Response(JSON.stringify({
          success: true,
          message: 'Request has been queued for processing when online',
          offlineQueued: true
        }), {
          status: 202,
          headers: { 'Content-Type': 'application/json' }
        });
        
        return mockResponse;
      }
      
      throw error;
    }
  } else {
    // We're offline
    if (offlineModeEnabled) {
      // For GET requests, try to retrieve from cache
      if (method === 'GET' && cacheKey) {
        const cachedData = await getCachedData(cacheKey);
        
        if (cachedData) {
          // Return cached data as a response
          const mockResponse = new Response(JSON.stringify(cachedData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
          
          // Add a header to indicate this is from cache
          mockResponse.headers.append('X-From-Cache', 'true');
          
          return mockResponse;
        }
      }
      
      // For other requests, queue them if possible
      if (!skipOfflineQueue && method !== 'GET') {
        await queueOfflineRequest(url, method, data);
        
        // Return a mock response for successful queueing
        const mockResponse = new Response(JSON.stringify({
          success: true,
          message: 'You are offline. This request has been queued for when you go back online.',
          offlineQueued: true
        }), {
          status: 202,
          headers: { 'Content-Type': 'application/json' }
        });
        
        return mockResponse;
      }
    }
    
    // If we can't handle offline, throw an error
    throw new Error('You are offline and this request cannot be processed offline');
  }
}

/**
 * Enhanced query function with offline support
 */
type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
  offlineOptions?: {
    cacheKey?: string;
    cacheExpiry?: number;
  };
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior, offlineOptions }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const cacheKey = offlineOptions?.cacheKey || url;
    
    try {
      // If offline but have offline mode enabled, try to get from cache
      if (!isOnline && offlineModeEnabled) {
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
          return cachedData as T;
        }
      }
      
      // Otherwise proceed with normal fetch
      const res = await fetch(url, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      const data = await res.json();
      
      // Cache the response for offline use if enabled
      if (offlineModeEnabled && cacheKey) {
        await cacheData(cacheKey, data, offlineOptions?.cacheExpiry);
      }
      
      return data;
    } catch (error) {
      // If offline but have offline mode enabled, try to get from cache as fallback
      if (!isOnline && offlineModeEnabled) {
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
          return cachedData as T;
        }
      }
      
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
