import User from "../../models/user.model.js";
import PendingUser from '../../models/PendingUser.model.js';


export const checkAuth = async (req, res) => {
  try {
    // Validate request
    if (!req.user || !req.user.email) {
      return res.status(400).json({ message: "User info missing from request" });
    }
    
    // Check if user is pending verification
    const isPending = await PendingUser.exists({ email: req.user.email });

    if (isPending) {
      return res.status(401).json({ status: "pending", user: req.user });
    }
    
    return res.status(200).json({ status: "verified", user: req.user });
  } catch (error) {
    console.error("Error in checkAuth controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};