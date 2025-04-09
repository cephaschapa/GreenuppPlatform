// Service Worker for Greenupp PWA
const CACHE_NAME = 'greenupp-cache-v1';
const DYNAMIC_CACHE_NAME = 'greenupp-dynamic-cache-v1';
const NOTIFICATION_ICON = '/icon-192x192.png';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME))
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Helper function to determine if request is an API call
const isApiRequest = (url) => {
  return url.pathname.startsWith('/api/');
};

// Helper to decide if we should cache this response
const shouldCacheResponse = (response) => {
  // Don't cache error responses
  if (!response || response.status !== 200) return false;
  return true;
};

// Helper to add items to dynamic cache
const addToDynamicCache = (request, response) => {
  // Clone the response as it can only be consumed once
  const responseToCache = response.clone();
  
  return caches.open(DYNAMIC_CACHE_NAME)
    .then(cache => {
      if (shouldCacheResponse(response)) {
        cache.put(request, responseToCache);
      }
      return response;
    });
};

// Fetch event strategy - Network first, falling back to cache
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Different strategies based on request type
  if (isApiRequest(requestUrl)) {
    // API requests: Network first, then cache, with fallback
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If successful, add to cache
          return addToDynamicCache(event.request, response);
        })
        .catch(() => {
          // If network fails, try from cache
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                // Return cached response with offline indicator
                return cachedResponse;
              }
              
              // If no cached response, return a basic offline JSON for API
              return new Response(
                JSON.stringify({ 
                  error: true, 
                  message: 'You are offline. This data could not be retrieved.' 
                }),
                { 
                  headers: { 'Content-Type': 'application/json' } 
                }
              );
            });
        })
    );
  } else {
    // Non-API requests: Cache first, then network
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If not in cache, get from network and cache for later
          return fetch(event.request)
            .then(response => {
              return addToDynamicCache(event.request, response);
            })
            .catch(() => {
              // Handle css, js, image files with a fallback
              if (event.request.url.match(/\.(jpe?g|png|gif|svg|css|js)$/)) {
                return new Response('', { 
                  status: 404, 
                  statusText: 'Not Found' 
                });
              }
              
              // For HTML requests, return offline page
              return caches.match('/');
            });
        })
    );
  }
});

// Background sync for offline data submission
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Function to handle synchronizing offline data
async function syncOfflineData() {
  try {
    // Get all pending offline actions from IndexedDB
    const offlineData = await getOfflineData();
    
    // Process each offline action
    for (const item of offlineData) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item.data),
        });
        
        if (response.ok) {
          // If successful, remove from offline storage
          await removeOfflineItem(item.id);
        }
      } catch (error) {
        console.error('Failed to sync item:', item, error);
        // Leave in offline storage to try again later
      }
    }
    
    // Notify clients that sync is complete
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        success: true
      });
    });
  } catch (error) {
    console.error('Failed to sync offline data:', error);
  }
}

// These functions would interact with IndexedDB
// They are implemented in the client-side code
function getOfflineData() {
  // This is a placeholder - implementation happens in indexedDB.js
  return [];
}

function removeOfflineItem(id) {
  // This is a placeholder - implementation happens in indexedDB.js
}

// Handle push events for notifications
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Push notification received:', data);
    
    // Extract data from the notification payload
    const options = {
      body: data.message || data.body || 'New notification from Greenupp',
      icon: data.icon || NOTIFICATION_ICON,
      badge: data.badge || NOTIFICATION_ICON,
      vibrate: [100, 50, 100],
      timestamp: data.timestamp || Date.now(),
      tag: data.tag || 'greenupp-notification',
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.id || 1,
        url: data.url || '/',
        ...data.data
      },
      actions: data.actions || []
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Greenupp Notification', options)
    );
  } catch (error) {
    console.error('Error processing push notification:', error);
    
    // Fallback for malformed push data
    event.waitUntil(
      self.registration.showNotification('Greenupp Notification', {
        body: 'New notification received',
        icon: NOTIFICATION_ICON,
        badge: NOTIFICATION_ICON
      })
    );
  }
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification);
  
  // Close the notification
  event.notification.close();

  // Check if action button was clicked
  if (event.action) {
    console.log('Action clicked:', event.action);
    // Handle specific actions if needed
  }

  // Get the target URL from notification data
  let url = '/';
  try {
    if (event.notification.data && event.notification.data.url) {
      url = event.notification.data.url;
    }
  } catch (err) {
    console.error('Error processing notification data:', err);
  }

  // This looks to see if the current window is open and focuses if it is
  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then((clientList) => {
      // If a window is already open, try to focus it
      for (const client of clientList) {
        // First try to match exact URL
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
        
        // Then try to match origin
        const clientUrl = new URL(client.url);
        const targetUrl = new URL(url, self.location.origin);
        
        if (clientUrl.origin === targetUrl.origin && 'focus' in client) {
          client.focus();
          return client.navigate(url);
        }
      }
      
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    }).catch(err => {
      console.error('Error handling notification click:', err);
    })
  );
});