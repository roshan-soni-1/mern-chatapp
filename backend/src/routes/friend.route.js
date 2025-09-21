import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  blockUser,
  getFriends,
  manageFriendRequests
} from "../controllers/friends.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Send a friend request
router.post("/request/:receiverId",protectRoute, sendFriendRequest);

// Accept a friend request
router.post("/accept/:senderId",protectRoute, acceptFriendRequest);

// Decline a friend request
router.post("/decline/:senderId", protectRoute,declineFriendRequest);

// Block a user
router.post("/block/:blockedId", protectRoute,blockUser);
router.get("/manage", protectRoute,manageFriendRequests);

// Get friends list
router.get("/list/:userId", getFriends);

export default router;