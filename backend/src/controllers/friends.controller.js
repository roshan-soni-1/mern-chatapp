import User from "../models/user.model.js";

// Send Friend Request
export const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user?._id;
    const receiverId = req.params.receiverId;

    if (!senderId) return res.status(401).json({ message: "Unauthorized" });
    if (senderId.toString() === receiverId)
      return res.status(400).json({ message: "Cannot send request to yourself" });

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver)
      return res.status(404).json({ message: "User not found" });

    // Defensive defaults
    sender.friends = sender.friends || [];
    sender.friendRequestSent = sender.friendRequestSent || [];
    receiver.friendRequestRecieved = receiver.friendRequestRecieved || [];
    receiver.blockedUser = receiver.blockedUser || [];

    if (sender.friends.includes(receiverId))
      return res.status(400).json({ message: "Already friends" });

    if (receiver.friendRequestRecieved.includes(senderId))
      return res.status(400).json({ message: "Request already sent" });

    if (receiver.blockedUser.includes(senderId))
      return res.status(403).json({ message: "You are blocked by this user" });

    // Add friend request
    sender.friendRequestSent.push(receiverId);
    receiver.friendRequestRecieved.push(senderId);

    await sender.save();
    await receiver.save();

    res.json({ message: "Friend request sent!" });
  } catch (err) {
    console.error("Error in sendFriendRequest:", err);
    res.status(500).json({ message: err.message });
  }
};

// Accept Friend Request
export const acceptFriendRequest = async (req, res) => {
  try {
    const receiverId = req.user._id;
    const senderId = req.params.senderId;

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver || !sender)
      return res.status(404).json({ message: "User not found" });

    // Defensive defaults
    receiver.friendRequestRecieved = receiver.friendRequestRecieved || [];
    receiver.friends = receiver.friends || [];
    sender.friends = sender.friends || [];
    sender.friendRequestSent = sender.friendRequestSent || [];

    if (!receiver.friendRequestRecieved.includes(senderId))
      return res.status(400).json({ message: "No pending request" });

    // Add each other as friends
    receiver.friends.push(senderId);
    sender.friends.push(receiverId);

    // Remove the friend request
    receiver.friendRequestRecieved = receiver.friendRequestRecieved.filter(
      (id) => id.toString() !== senderId.toString()
    );
    sender.friendRequestSent = sender.friendRequestSent.filter(
      (id) => id.toString() !== receiverId.toString()
    );

    await receiver.save();
    await sender.save();

    res.json({ message: "Friend request accepted!" });
  } catch (err) {
    console.error("Error in acceptFriendRequest:", err);
    res.status(500).json({ message: err.message });
  }
};

// Decline Friend Request
export const declineFriendRequest = async (req, res) => {
  try {
    const receiverId = req.user._id;
    const senderId = req.params.senderId;

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver || !sender)
      return res.status(404).json({ message: "User not found" });

    // Defensive defaults
    receiver.friendRequestRecieved = receiver.friendRequestRecieved || [];
    sender.friendRequestSent = sender.friendRequestSent || [];

    // Remove the friend request
    receiver.friendRequestRecieved = receiver.friendRequestRecieved.filter(
      (id) => id.toString() !== senderId.toString()
    );
    sender.friendRequestSent = sender.friendRequestSent.filter(
      (id) => id.toString() !== receiverId.toString()
    );

    await receiver.save();
    await sender.save();

    res.json({ message: "Friend request declined!" });
  } catch (err) {
    console.error("Error in declineFriendRequest:", err);
    res.status(500).json({ message: err.message });
  }
};

// Block User
export const blockUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const blockedId = req.params.blockedId;

    const user = await User.findById(userId);
    const blockedUser = await User.findById(blockedId);

    if (!user || !blockedUser)
      return res.status(404).json({ message: "User not found" });

    // Defensive defaults
    user.friends = user.friends || [];
    blockedUser.friends = blockedUser.friends || [];
    user.friendRequestSent = user.friendRequestSent || [];
    user.friendRequestRecieved = user.friendRequestRecieved || [];
    blockedUser.friendRequestSent = blockedUser.friendRequestSent || [];
    blockedUser.friendRequestRecieved = blockedUser.friendRequestRecieved || [];
    user.blockedUser = user.blockedUser || [];

    // Remove from friends
    user.friends = user.friends.filter(id => id.toString() !== blockedId.toString());
    blockedUser.friends = blockedUser.friends.filter(id => id.toString() !== userId.toString());

    // Remove pending friend requests
    user.friendRequestSent = user.friendRequestSent.filter(id => id.toString() !== blockedId.toString());
    user.friendRequestRecieved = user.friendRequestRecieved.filter(id => id.toString() !== blockedId.toString());
    blockedUser.friendRequestSent = blockedUser.friendRequestSent.filter(id => id.toString() !== userId.toString());
    blockedUser.friendRequestRecieved = blockedUser.friendRequestRecieved.filter(id => id.toString() !== userId.toString());

    // Add to blocked list if not already blocked
    if (!user.blockedUser.includes(blockedId)) user.blockedUser.push(blockedId);

    await user.save();
    await blockedUser.save();

    res.json({ message: "User blocked!" });
  } catch (err) {
    console.error("Error in blockUser:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get Friends List
export const getFriends = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate("friends", "fullName userName profilePic");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ friends: user.friends });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const manageFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the logged-in user
    const user = await User.findById(userId).exec();
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get the IDs of users who sent friend requests
    const requestersIds = user.friendRequestRecieved || [];
    const blockedUser = user.blockedUser || [];
    const friend = user.friends ||[];
    const RequestSentUser = user.friendRequestSent || [];
    const excludeSuggested = [...friend,...blockedUser,...RequestSentUser,userId]
    // Fetch basic info of each requester
    
    const requesters = await User.find({ _id: { $in: requestersIds } })
      .select("userName profilePic")
      .exec();
      
    const suggested = await User.find({_id: { $nin: excludeSuggested }}).select("username profilePic").exec();

    res.json({ requests: requesters,suggested });
  } catch (err) {
    console.error("Error fetching incoming friend requests:", err);
    res.status(500).json({ message: err.message });
  }
};