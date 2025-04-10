// Service worker registration
// This handles registering and updating the service worker

export function register(): void {
  if ('serviceWorker' in navigator) {
    // Wait for the page to load
    window.addEventListener('load', () => {
      // The service worker URL
      const swUrl = `/service-worker.js`;

      // Register the service worker
      navigator.serviceWorker.register(swUrl)
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
          
          // Check for updates when registration is active
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }
            
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // At this point, the updated content has been fetched,
                  // but the previous service worker will still serve the older content
                  console.log('New content is available; please refresh.');
                  
                  // Show a notification to the user that an update is available
                  const updateConfirm = window.confirm(
                    'A new version of this application is available. Reload to update?'
                  );
                  
                  if (updateConfirm) {
                    // Send skip waiting message to the service worker
                    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                } else {
                  // At this point, everything has been precached.
                  console.log('Content is cached for offline use.');
                }
              }
            };
          };
        })
        .catch(error => {
          console.error('Error during service worker registration:', error);
        });
      
      // Handle service worker updates
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    });
  }
}

// Unregister the service worker (used for development or if PWA is no longer needed)
export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}

// Copy service worker file to public directory for browsers to access
export function copyServiceWorkerFile(): void {
  if (typeof window !== 'undefined') {
    // This function would only be relevant in a build process
    // For Vite, we'd need to handle this differently
    console.log('Service worker file will be handled by build process');
  }
}