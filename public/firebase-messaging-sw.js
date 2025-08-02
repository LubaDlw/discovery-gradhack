// This handles background messages
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDAlVzUeNuEYCnCWvg_v5rw80q9YXvysYc",
  authDomain: "discovery-gradhack25jnb-108.firebaseapp.com",
  projectId: "discovery-gradhack25jnb-108",
  storageBucket: "discovery-gradhack25jnb-108.firebasestorage.app",
  messagingSenderId: "1011454667050",
  appId: "1:1011454667050:web:230f3a6ca09b9c5907d653"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
