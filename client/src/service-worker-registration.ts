import { Workbox } from 'workbox-window';

// This optional code is used to register a service worker.
// register() is not called by default.

export function register(): void {
  if ('serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support service workers
    const publicUrl = new URL(window.location.href);

    // Our service worker won't work if PUBLIC_URL is on a different origin
    // from what our page is served on. This might happen if a CDN is used to
    // serve assets; see https://github.com/facebook/create-react-app/issues/2374
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `/service-worker.js`;

      registerValidSW(swUrl);
    });
  }
}

function registerValidSW(swUrl: string): void {
  const wb = new Workbox(swUrl);

  // Add an event listener to detect when the registered service worker has installed
  // but is waiting to activate.
  wb.addEventListener('waiting', (event) => {
    // Show a UI prompt to the user to let them know a new version is available
    if (confirm('A new version of this application is available. Reload to update?')) {
      // Send a message to the service worker to skip waiting and activate the new version
      wb.messageSkipWaiting();
    }
  });

  // Add an event listener to reload the page as soon as the new
  // service worker takes control.
  wb.addEventListener('controlling', (event) => {
    window.location.reload();
  });

  wb.register().catch((error) => {
    console.error('Service worker registration failed:', error);
  });
}

export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}