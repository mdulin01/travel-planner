// Firebase Cloud Messaging Service Worker
// This file MUST be at the root of the public directory

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB4pbBVj7Dryy3C57V2s6L4N_znGEyuib0",
  authDomain: "trip-planner-5cc84.firebaseapp.com",
  projectId: "trip-planner-5cc84",
  storageBucket: "trip-planner-5cc84.firebasestorage.app",
  messagingSenderId: "803115812045",
  appId: "1:803115812045:web:d49aa3df4ee4038c5fd584",
});

const messaging = firebase.messaging();

// Handle background push notifications
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message:', payload);

  const title = payload.notification?.title || 'Mike & Adam';
  const options = {
    body: payload.notification?.body || 'You have a new update!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: payload.data?.url || '/' },
    vibrate: [200, 100, 200],
  };

  self.registration.showNotification(title, options);
});

// Handle notification click — open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url.includes('trip-planner') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new tab
      return clients.openWindow(url);
    })
  );
});
