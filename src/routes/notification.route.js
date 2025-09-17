// routes/notification.route.js
import express from "express";
import { saveFcmToken } from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js"; // your auth middleware

const router = express.Router();

router.post("/save-fcm-token", protectRoute, saveFcmToken);

export default router;