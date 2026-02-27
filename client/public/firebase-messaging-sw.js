/* eslint-env serviceworker */
/* eslint-disable no-undef */
/* global importScripts, firebase, self, clients */

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyDOAcY1c4CQXJwIEPbe7NVDF3ed9B9SZCk",
  authDomain: "greenupp.firebaseapp.com",
  projectId: "greenupp-864f6",
  storageBucket: "greenupp.appspot.com",
  messagingSenderId: "1057907399907",
  appId: "1:1057907399907:web:329c23f87405831b91b9d6",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  // eslint-disable-next-line no-console
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: payload.data,
    actions: [
      {
        action: "view",
        title: "View",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events
self.addEventListener("notificationclick", function (event) {
  // eslint-disable-next-line no-console
  console.log("[firebase-messaging-sw.js] Notification click received.");

  event.notification.close();

  // Get the action URL from the notification data
  const actionUrl = event.notification.data?.actionUrl;

  if (event.action === "dismiss") {
    // Just close the notification
    return;
  }

  // Default action or "view" action - open the app (resolve relative paths to full URL)
  const urlToOpen = actionUrl
    ? (actionUrl.startsWith("http") ? actionUrl : new URL(actionUrl, self.location.origin).href)
    : self.location.origin;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        // Check if there's already a window/tab open with the target URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }

        // If no existing window/tab, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
