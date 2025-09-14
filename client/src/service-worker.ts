/// <reference lib="webworker" />
/* eslint-env serviceworker */
/* global self, caches, ExtendableEvent, ServiceWorkerGlobalScope, FetchEvent, Response, SyncEvent, MessageEvent, indexedDB, IDBDatabase */

const CACHE_NAME = "greenupp-v1";
const STATIC_CACHE_NAME = "greenupp-static-v1";
const API_CACHE_NAME = "greenupp-api-v1";
const IMAGE_CACHE_NAME = "greenupp-images-v1";
const FONT_CACHE_NAME = "greenupp-fonts-v1";

// Assets to be cached immediately upon service worker installation
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/icon.svg",
];

// Install event - cache critical assets
self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache the offline page separately to ensure it's available
      caches.open(CACHE_NAME).then((cache) => {
        return cache.add("/offline.html");
      }),
    ]).then(() => {
      // Skip waiting to activate the new service worker immediately
      return (self as unknown as ServiceWorkerGlobalScope).skipWaiting();
    })
  );
});

// Activation event - clean up old caches
self.addEventListener("activate", (event: ExtendableEvent) => {
  const currentCaches = [
    CACHE_NAME,
    STATIC_CACHE_NAME,
    API_CACHE_NAME,
    IMAGE_CACHE_NAME,
    FONT_CACHE_NAME,
  ];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter(
          (cacheName) => !currentCaches.includes(cacheName)
        );
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => {
        // Claim clients to control them immediately
        return (self as unknown as ServiceWorkerGlobalScope).clients.claim();
      })
  );
});

// Fetch event - handle resource requests
self.addEventListener("fetch", (event: FetchEvent) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle GET requests, let others pass through
  if (request.method !== "GET") {
    return;
  }

  // Handle navigation requests (HTML pages)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        // If offline, serve the cached offline page
        return caches.match("/offline.html") as Promise<Response>;
      })
    );
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith("/api/")) {
    // For weather API, use "stale while revalidate" strategy
    if (url.pathname.includes("/api/weather")) {
      event.respondWith(
        caches.open(API_CACHE_NAME).then((cache) => {
          return cache.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request)
              .then((networkResponse) => {
                // If we got a valid response, cache it
                if (networkResponse.ok) {
                  // Clone the response since it can only be used once
                  cache.put(request, networkResponse.clone());
                }
                return networkResponse;
              })
              .catch(() => {
                // If fetch fails and we have no cached response, return offline data
                if (!cachedResponse) {
                  return new Response(
                    JSON.stringify({
                      offline: true,
                      message: "You are offline. Using cached data.",
                    }),
                    {
                      headers: { "Content-Type": "application/json" },
                    }
                  );
                }
                return cachedResponse;
              });

            // Return cached response immediately if available, otherwise wait for network
            return cachedResponse || fetchPromise;
          });
        })
      );
      return;
    }

    // For other API requests, network first with cache fallback
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Try to get from cache if fetch fails
          return caches.match(request).then((cachedResponse) => {
            // If we have a cached response, return it
            if (cachedResponse) {
              return cachedResponse;
            }

            // Otherwise, return a JSON response indicating offline status
            if (request.headers.get("Accept")?.includes("application/json")) {
              return new Response(
                JSON.stringify({
                  offline: true,
                  message: "You are offline and no cached data is available.",
                }),
                {
                  headers: { "Content-Type": "application/json" },
                }
              );
            }

            // For other resources, return offline page
            return caches.match("/offline.html") as Promise<Response>;
          });
        })
    );
    return;
  }

  // Handle font requests with cache first strategy
  if (
    request.url.includes("fonts.googleapis.com") ||
    request.url.includes("fonts.gstatic.com") ||
    request.destination === "font"
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          if (!response || !response.ok) {
            return response;
          }

          const clonedResponse = response.clone();
          caches.open(FONT_CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });

          return response;
        });
      })
    );
    return;
  }

  // Handle image requests with cache first strategy
  if (request.destination === "image") {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          if (!response || !response.ok) {
            return response;
          }

          const clonedResponse = response.clone();
          caches.open(IMAGE_CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });

          return response;
        });
      })
    );
    return;
  }

  // Default strategy for other resources - network first, falling back to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clonedResponse = response.clone();
          caches.open(STATIC_CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });
        }
        return response;
      })
      .catch(() => {
        // Try to get from cache if fetch fails
        return caches.match(request) as Promise<Response>;
      })
  );
});

// Background sync for storing form submissions when offline
self.addEventListener("sync", (event: SyncEvent) => {
  if (event.tag === "sync-forms") {
    event.waitUntil(syncForms());
  }
});

// Message event - for controlling service worker
self.addEventListener("message", (event: MessageEvent) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    (self as unknown as ServiceWorkerGlobalScope).skipWaiting();
  }
});

// Helper function to synchronize forms when back online
async function syncForms() {
  // Open the IndexedDB database
  const dbPromise = indexedDB.open("greenupp-db", 1);

  dbPromise.onupgradeneeded = (_event) => {
    const db = dbPromise.result;
    if (!db.objectStoreNames.contains("formData")) {
      db.createObjectStore("formData", { keyPath: "id", autoIncrement: true });
    }
  };

  // Wait for database to open
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    dbPromise.onsuccess = () => resolve(dbPromise.result);
    dbPromise.onerror = () => reject(dbPromise.error);
  });

  // Get all stored form data
  const formDataList = await new Promise<unknown[]>((resolve, reject) => {
    const transaction = db.transaction("formData", "readonly");
    const store = transaction.objectStore("formData");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  // Process each stored form submission
  for (const formData of formDataList) {
    try {
      // Try to send the form data
      const response = await fetch(formData.url, {
        method: formData.method,
        headers: formData.headers,
        body: formData.body,
      });

      // If successful, remove from database
      if (response.ok) {
        const transaction = db.transaction("formData", "readwrite");
        const store = transaction.objectStore("formData");
        await store.delete(formData.id);
      }
    } catch (error) {
      // console.error("Error syncing form data:", error);
      // Will be retried on next sync event
    }
  }
}
