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
  console.log("delete")
    
  } catch (err) {
    console.error('Error:', err);
    
  }

  // Generate JWT token for logged-in session
  generateToken(newUser._id, res);

  // res.status(201).json({
//     _id: newUser._id,
//     fullName: newUser.fullName,
//     userName: newUser.userName,
//     email: newUser.email,
//     profilePic: newUser.profilePic,
//   });
res.redirect("http://localhost:5173/");
};
export default verifyEmail;
  