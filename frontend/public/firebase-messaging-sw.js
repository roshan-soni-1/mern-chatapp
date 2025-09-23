import {app} from "../firebase/firebase.js"
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log("Background message received: ", payload);
  const { title, body } = payload.notification || {};
  if (title && body) {
    self.registration.showNotification(title, { body });
  }
});