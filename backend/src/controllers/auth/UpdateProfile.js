import bcrypt from "bcryptjs";
import User from "../../models/user.model.js";

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
).select('-password');

res.status(200).json(updatedUser);

} catch (error) {
console.error("Error in update profile:", error.message);
res.status(500).json({ message: "Internal server error" });
}
};



export const updatePassword = async (req, res) => {
  try {
    const userId = req.user._id; // Provided by auth middleware
    const { old_password, new_password } = req.body;
    if (!old_password || !new_password) {
      return res.status(400).json({ message: "Both old and new passwords are required" });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // email verification for google login account
    if (!user.password) {
      return res.status(400).json({
        message: "This account was created with Google. Please log in using Google Sign-In.",
      });
    }

    // Compare old password with hashed password
    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Old password is incorrect. Please try again or reset your password.",
      });
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in updatePassword:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
