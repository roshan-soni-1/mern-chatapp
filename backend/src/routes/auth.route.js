import express from "express";
//import { checkAuth, login,firebaseLogin, logout, signup, updateProfile } from "../controllers/auth.controller.js";
import {checkAuth} from '../controllers/auth/CheckAuth.auth.js'
import {login} from '../controllers/auth/LoginAuth.js'
import {firebaseLogin} from '../controllers/auth/FirebaseLogin.auth.js'
import {logout} from '../controllers/auth/Logout.auth.js'
import {signup} from '../controllers/auth/Signup.auth.js'
import {updateProfile,updatePassword} from '../controllers/auth/UpdateProfile.js'

import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/firebase-login", firebaseLogin)

router.put("/update-profile", protectRoute, updateProfile);
router.put("/update-password", protectRoute, updatePassword);

router.get("/check", protectRoute, checkAuth);

export default router;
