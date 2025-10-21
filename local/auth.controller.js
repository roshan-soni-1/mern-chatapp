import { generateToken, createTransporter } from "../lib/utils.js";
import User from "../models/user.model.js";
import PendingUser from '../models/PendingUser.model.js';
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import admin from "../lib/firebaseAdmin.js";
import validator from "validator";
import crypto from 'crypto';

const transporter = createTransporter();

// Validation helper
const validateSignupData = (fullName, email, password, userName) => {
  if (!fullName || !email || !password || !userName) {
    return { valid: false, message: "All fields are required including username" };
  }
  
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters" };
  }
  
  if (userName.length < 5) {
    return { valid: false, message: "Username must be at least 5 characters" };
  }
  
  if (!validator.isEmail(email)) {
    return { valid: false, message: "Please use a valid email address" };
  }
  
  return { valid: true };
};

export const signup = async (req, res) => {
  const { fullName, email, password, userName } = req.body;
  
  try {
    // Validate input
    const validation = validateSignupData(fullName, email, password, userName);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    // Check if user already exists (optimized with single query)
    const [existingUser, existingUsername, pendingUser] = await Promise.all([
      User.exists({ email }),
      User.exists({ userName }),
      PendingUser.exists({ email })
    ]);

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    
    if (existingUsername) {
      return res.status(400).json({ message: "Username not available" });
    }
    
    if (pendingUser) {
      return res.status(400).json({ message: "Verification email already sent. Please check your email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const token = crypto.randomBytes(32).toString('hex');
    
    // Create pending user
    const newPendingUser = new PendingUser({
      email,
      fullName,
      userName,
      password: hashedPassword, 
      token,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });
    
    await newPendingUser.save();
    
    // Generate verification link
    const baseUrl = process.env.NODE_ENV === "development" 
      ? "http://localhost:5001" 
      : process.env.SERVE_URL;
    const verificationLink = `${baseUrl}/verify/email?token=${token}`;
    
    // Send verification email
    await transporter.sendMail({
      from: '"Chatty" <roshan.soniin@gmail.com>',
      to: email,
      subject: 'Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; text-align: center; background-color: #f9f9f9;">
          <h2 style="color: #333;">Welcome to Chatty!</h2>
          <p style="color: #555;">Please verify your email address to get started.</p>
          <a href="${verificationLink}" 
             style="display: inline-block; padding: 12px 25px; margin-top: 20px; font-size: 16px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">
             Verify Email
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            If you did not sign up for this account, you can ignore this email.
          </p>
          <p style="color: #999; font-size: 12px;">
            This link will expire in 10 minutes.
          </p>
        </div>
      `
    });
    
    res.status(200).json({ message: "Verification email sent successfully" });
  } catch (error) {
    console.error("Error in signup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email or username (optimized single query)
    const user = await User.findOne({
      $or: [{ email }, { userName: email }]
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      userName: user.userName, // Fixed: was user.UserName (inconsistent casing)
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in login controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

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

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    
    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    ).select('-password'); // Don't return password

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in update profile:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

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