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
