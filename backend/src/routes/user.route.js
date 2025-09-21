import express from "express";
import User from "../models/user.model.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();
router.get("/:userId", protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "_id userName profilePic friends"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;