import User from "../../models/user.model.js";
import bcrypt from "bcryptjs";
import PendingUser from '../../models/PendingUser.model.js';
import { generateToken, createTransporter } from "../../lib/utils.js";



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
