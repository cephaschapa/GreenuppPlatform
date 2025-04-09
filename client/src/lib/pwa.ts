// PWA utilities

// This code captures the beforeinstallprompt event to handle PWA installation
export function setupPWA() {
  // Initialize deferredPrompt for use in install button
  (window as any).deferredPrompt = null;

  // Event listener for beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (event) => {
    // Prevent Chrome 67+ from automatically showing the prompt
    event.preventDefault();
    
    // Stash the event so it can be triggered later.
    (window as any).deferredPrompt = event;
    
    // Optionally notify the user the app can be installed
    console.log('App can be installed. Install button should be shown.');
    
    // Optionally dispatch an event that can be used to show install UI
    window.dispatchEvent(new Event('pwaInstallable'));
  });

  // Track when the app is installed
  window.addEventListener('appinstalled', () => {
    // Clear the deferredPrompt
    (window as any).deferredPrompt = null;
    
    // Log or track the installation
    console.log('PWA was installed');
  });
}

// Check if the app is running in standalone mode (installed as PWA)
export function isRunningAsPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

// Handles the update of the service worker
export function setupServiceWorkerUpdates(onUpdateFound?: () => void) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      // Check for updates periodically
      setInterval(() => {
        registration.update().catch(err => {
          console.error('Error updating service worker:', err);
        });
      }, 60 * 60 * 1000); // Check every hour
      
      // Listen for new service worker installation
      registration.addEventListener('updatefound', () => {
        // A new service worker is installing
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is installed but waiting to activate
              console.log('New version available! Ready to update.');
              
              // Notify the app if callback provided
              if (onUpdateFound) {
                onUpdateFound();
              }
            }
          });
        }
      });
    });
    
    // Handle controller change when new service worker activates
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        // Refresh the page once when the new service worker takes over
        refreshing = true;
        window.location.reload();
      }
    });
  }
}