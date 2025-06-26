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
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/favicon.ico",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
