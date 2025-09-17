import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "./fiberbase.js"; // your firebase config

const messaging = getMessaging(app);

// ✅ Request permission + get token
export const requestFirebaseNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Permission denied for notifications");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: "BH8ecQHGBL3wzFgUXvmLuUm6e0hL9ELecBjPGYNbkYWQ2H3zP_QOA1POFllGkW9j9IIA4WIuivjYR589PzzsVpc", // From Firebase Console > Cloud Messaging > Web Push certificates
    });

    if (!token) {
      console.warn("No FCM token generated. User may have blocked notifications.");
      return null;
    }

    console.log("FCM Token:", token);

    // 👉 Send token to your backend API
    await fetch("/api/save-fcm-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fcmToken: token }),
      credentials: "include", // if using cookies for auth
    });

    return token;
  } catch (err) {
    console.error("FCM error:", err);
    return null;
  }
};

// ✅ Foreground listener
export const onMessageListener = (callback) => {
  onMessage(messaging, (payload) => {
    console.log("📩 Foreground message received: ", payload);
    callback(payload);
  });
};

// ✅ Handle token refresh (in case token expires or changes)
export const UpdateFcmToken = async (oldToken) => {
  const newToken = await getToken(messaging, { vapidKey: "BH8ecQHGBL3wzFgUXvmLuUm6e0hL9ELecBjPGYNbkYWQ2H3zP_QOA1POFllGkW9j9IIA4WIuivjYR589PzzsVpc" });
  if (newToken && newToken !== oldToken) {
    console.log("🔄 Token refreshed:", newToken);

    await fetch("/api/save-fcm-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fcmToken: newToken }),
      credentials: "include",
    });
  }
};