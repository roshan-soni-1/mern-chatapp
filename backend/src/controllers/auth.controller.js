import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import admin from "../lib/firebaseAdmin.js"
import validator from "validator"
//import sendVerification from "../middleware/sendMail.middleware.js"
import crypto from 'crypto';
import { createTransporter} from "../lib/utils.js"
import PendingUser from '../models/PendingUser.model.js'; // Mongo model for pending sign-ups



const transporter = createTransporter();

export const signup = async (req, res) => {
  const { fullName, email, password,userName } = req.body;
  
  
  try {
    if (!fullName || !email || !password || !userName) {
      return res.status(400).json({ message: "All fields are required including username" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (userName.length < 5) {
      return res.status(400).json({ message: "userName must be at least 5 characters" });
    }
    const isRealEmail = validator.isEmail(email);
    if (!isRealEmail) {
      return res.status(400).json({ message: "use correct email"});
    }

    const user = await User.exists({ email });
    const userNotUnique = await User.exists({ userName });

    if (user) return res.status(400).json({ message: "Email already exists" });
    if (userNotUnique) return res.status(400).json({message: "username not available"})

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const token = crypto.randomBytes(32).toString('hex');
    
    const pendingUserExists = await PendingUser.exists({ email });
    
    if (pendingUserExists) {
      return res.status(400).json({ message: "Check your email" });
    }
    const newPendingUser= new PendingUser({
    email,
    fullName,
    userName,
    password:hashedPassword, 
    token,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  });
  await newPendingUser.save();
  const url = process.env.SERVE_URL;
  let link = (process.env.MODE_ENV=="development") ? "http://localhost:5001/" : url;
  
  link = link+`verify/email?token=${token}`;
  await transporter.sendMail({
  from: '"Chatty" <roshan.soniin@gmail.com>',
  to: email,
  subject: 'Verify Your Email',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; text-align: center; background-color: #f9f9f9;">
      <h2 style="color: #333;">Welcome to Our Platform!</h2>
      <p style="color: #555;">Please verify your email address to get started.</p>
      <a href="${link}" 
         style="display: inline-block; padding: 12px 25px; margin-top: 20px; font-size: 16px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">
         Verify Email
      </a>
      <p style="color: #999; font-size: 12px; margin-top: 20px;">
        If you did not sign up for this account, you can ignore this email.
      </p>
    </div>
  `
});
      res.status(200).json({message:"verfication message send on email"})
    }
   catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    let user = await User.findOne({ email});
    if (!user) {
      user = await User.findOne({ userName: email });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.UserName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "No Firebase token provided" });
    }

    // Verify token
    const decoded = await admin.auth().verifyIdToken(idToken);

    let user = await User.findOne({
      $or: [{ firebaseUid: decoded.uid }, { email: decoded.email }],
    });

    if (!user) {
      user = await User.create({
        fullName: decoded.name || "New User",
        userName: decoded.email
          ? decoded.email.split("@")[0]
          : `user_${decoded.uid.substring(0, 6)}`,
        email: decoded.email || null,
        profilePic: decoded.picture || "/avatar.png",
        password: null,
        authProvider: "firebase",
        firebaseUid: decoded.uid, 
      });
    } else if (!user.firebaseUid) {
      // If  no uid
      user.firebaseUid = decoded.uid;
      user.authProvider = "firebase";
      await user.save();
    }

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


export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const checkAuth = async (req, res) => {
  try {
    // Make sure req.user exists
    if (!req.user || !req.user.email) {
      return res.status(400).json({ message: "User info missing from request" });
    }
    const isPending = await PendingUser.exists({ email: req.user.email });

    if (isPending) {
      return res.status(401).json({ status: "pending", user: req.user });
    }
    return res.status(200).json({ status: "verified", user: req.user });
  } catch (error) {
    console.error("Error in checkAuth controller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
