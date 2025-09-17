import admin from "./firebaseAdmin.js"; // your admin setup

export const sendNotification = async (fcmToken, title, body) => {
  const message = {
    notification: { title, body },
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Notification sent:", response);
  } catch (err) {
    console.error("Error sending notification:", err);
  }
};