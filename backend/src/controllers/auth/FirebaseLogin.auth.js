
import admin from "../../lib/firebaseAdmin.js";
import User from "../../models/user.model.js";


export const firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ message: "No Firebase token provided" });
    }

    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(idToken);

    // Find or create user
    let user = await User.findOne({
      $or: [{ firebaseUid: decoded.uid }, { email: decoded.email }],
    });

    if (!user) {
      // Create new user from Firebase data
      user = await User.create({
        fullName: decoded.name || "New User",
        userName: decoded.email
          ? decoded.email.split("@")[0]
          : `user_${decoded.uid.substring(0, 6)}`,
        email: decoded.email || null,
        profilePic: decoded.picture || "/avatar.png",
        password: null, // Firebase users don't need password
        authProvider: "firebase",
        firebaseUid: decoded.uid, 
      });
    } else if (!user.firebaseUid) {
      // Link existing user with Firebase
      user.firebaseUid = decoded.uid;
      user.authProvider = "firebase";
      await user.save();
    }

    // Generate JWT token
    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      userName: user.userName,
      email: user.email,
      profilePic: user.profilePic,
      firebaseUid: user.firebaseUid,
    });
  } catch (error) {
    console.error("Error in firebaseLogin:", error.message);
    res.status(500).json({ message: "Firebase login failed" });
  }
};
