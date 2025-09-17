// controllers/notification.controller.js
import User from "../models/user.model.js";

export const saveFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user._id; // comes from your auth middleware
    console.log(fcmToken)
    if (!fcmToken) {
      return res.status(400).json({ message: "No FCM token provided" });
      console.log("No FCM token provided")
    }

    await User.findByIdAndUpdate(userId, { fcmToken }, { new: true });

    res.status(200).json({ message: "FCM token saved successfully" });
  } catch (err) {
    console.error("Error saving FCM token:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};