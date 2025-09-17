import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import admin from "../lib/firebaseAdmin.js"

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

    const user = await User.findOne({ email });
    const userNotUnique = await User.findOne({ userName });

    if (user) return res.status(400).json({ message: "Email already exists" });
    if (userNotUnique) return res.status(400).json({message: "username not available"})

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      userName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        userName: newUser.userName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
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

    // ✅ Verify Firebase ID token
    const decoded = await admin.auth().verifyIdToken(idToken);

    // ✅ Check if user exists
    let user = await User.findOne({ email: decoded.email });

    if (!user) {
      // If new user, create in Mongo
      user = await User.create({
        fullName: decoded.name || "New User",
        userName: decoded.email.split("@")[0], // fallback username
        email: decoded.email,
        profilePic: decoded.picture || "/avatar.png",
        password: null, // Firebase users won’t use local password
      });
    }

    // ✅ Generate cookie-based JWT for your app
    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      userName: user.userName,
      email: user.email,
      profilePic: user.profilePic,
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

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
