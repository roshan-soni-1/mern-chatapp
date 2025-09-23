import PendingUser from "../models/PendingUser.model.js";
import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";



const verifyEmail = async (req, res) => {
  const { token } = req.query;

  const pending = await PendingUser.findOne({ token });
  if (!pending || pending.expires < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  // Create the actual user
  const newUser = await User.create({
    fullName: pending.fullName,
    userName: pending.userName,
    email: pending.email,
    password: pending.password,
  });
console.log(PendingUser)
  // Delete pending record
  try {
  await PendingUser.deleteOne({ _id: pending._id });
    
  } catch (err) {
    console.error('Error:', err);
    
  }

  // Generate JWT token for logged-in session
  generateToken(newUser._id, res);
const redirectRoute =(process.env.MODE_ENV== "development")? "http://localhost:5173/":process.env.SERVE_URL ;
res.redirect(redirectRoute);
};

export default verifyEmail
  