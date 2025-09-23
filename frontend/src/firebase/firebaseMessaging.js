import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "./fiberbase.js";
import { axiosInstance } from "../lib/axios.js";

const messaging = getMessaging(app);
export const requestFirebaseNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Permission denied for notifications");
      return null;
    }

    // 👇 Register your service worker first
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Service Worker registered for FCM:', registration);

    const token = await getToken(messaging, {
      vapidKey: "BH8ecQHGBL3wzFgUXvmLuUm6e0hL9ELecBjPGYNbkYWQ2H3zP_QOA1POFllGkW9j9IIA4WIuivjYR589PzzsVpc",
      serviceWorkerRegistration: registration // 👈 important for Chrome
    });

    if (!token) {
      console.warn("No FCM token generated. User may have blocked notifications.");
      return null;
    }

    //console.log("FCM Token:", token);

    await axiosInstance.post(
      "/notify/save-fcm-token",
      { fcmToken: token },
      { withCredentials: true }
    );

    return token;
  } catch (err) {
    console.error("FCM error:", err);
    return null;
  }
};


export const onMessageListener = (callback) => {
  onMessage(messaging, (payload) => {
    console.log("📩 Foreground message received: ", payload);
    callback(payload);
  });
};
export const UpdateFcmToken = async (oldToken) => {
  const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
  const newToken = await getToken(messaging, {
    vapidKey: "BH8ecQHGBL3wzFgUXvmLuUm6e0hL9ELecBjPGYNbkYWQ2H3zP_QOA1POFllGkW9j9IIA4WIuivjYR589PzzsVpc",
    serviceWorkerRegistration: registration
  });
  if (newToken && newToken !== oldToken) {
    console.log("🔄 Token refreshed:", newToken);

    await axiosInstance.post(
      "/notify/save-fcm-token",
      { fcmToken: newToken },
      { withCredentials: true }
    );
  }
};
