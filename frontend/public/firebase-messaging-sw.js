importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js");
firebase.initializeApp( {
 apiKey: "AIzaSyByKreslJHYkxXEltf7aH5e_V5s5Leh2EY",
 authDomain: "chatty-60f74.firebaseapp.com",
 projectId: "chatty-60f74",
 messagingSenderId: "1021892372825",
 appId: "1:1021892372825:web:b7d001c5f49e97c374c448",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log("Received background message ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = { body: payload.notification.body };
  self.registration.showNotification(notificationTitle, notificationOptions);
});