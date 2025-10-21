
import verifyEmail from "../controllers/emailVerify.controller.js"
import {checkEmail,checkUsernameAvailable} from "../service/GetAvailable.service.js"

import express from "express";
const router = express.Router();
router.get("/email", verifyEmail);
router.get("/check-email",checkEmail)
router.get("/check-username",checkUsernameAvailable);

export default router;


  