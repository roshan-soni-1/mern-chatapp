import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { sendNotification } from "../lib/sendNotification.js";


export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Get logged-in user's friends and blocked users
    const user = await User.findById(loggedInUserId).select("friends blockedUser").exec();
    const friends = user.friends || [];
    const blocked = user.blockedUser || [];
    //const suggested = User.

    // Get users who messaged or were messaged by the logged-in user
    const messages = await Message.find({
      $or: [
        { sender: loggedInUserId },
        { receiver: loggedInUserId }
      ]
    }).select("sender receiver").exec();

    // Collect unique user IDs from messages
    const messagedUserIds = new Set();
    messages.forEach(msg => {
      if (msg.sender.toString() !== loggedInUserId.toString()) messagedUserIds.add(msg.sender.toString());
      if (msg.receiver.toString() !== loggedInUserId.toString()) messagedUserIds.add(msg.receiver.toString());
    });

    // Combine friends and messaged users
    const combinedUserIds = Array.from(new Set([...friends.map(id => id.toString()), ...messagedUserIds]));

    // Remove blocked users
    const finalUserIds = combinedUserIds.filter(id => !blocked.includes(id));

    // Fetch user details
    const users = await User.find({ _id: { $in: finalUserIds } })
      .select("_id userName profilePic friends")
      .exec();

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};




export const getAllMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

     const messages = await Message.find({
       $or: [
         { senderId: myId, receiverId: userToChatId },
         { senderId: userToChatId, receiverId: myId },
       ],
     });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // query: ?before=<oldest messageId>
    const beforeId = req.query.before;

    // base query
    const query = {
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    };

    //if ?before- only get older messages
    if (beforeId) {
      query._id = { $lt: beforeId }; 
    }

    const limit = 20;

    // newest DB query
    const messages = await Message.find(query)
      .sort({ _id: -1 }) // newest
      .limit(limit);

    const orderedMessages = messages.reverse();

    res.status(200).json(orderedMessages);
  } catch (error) {
    console.error("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};





export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
        // PUSH NOTIFICATION
  const recipient = await User.findById(receiverId);
  const sender = await User.findById(senderId); ;
    if (recipient.fcmToken) {
      await sendNotification(
    recipient.fcmToken,
    `New message from ${sender.fullName}`,
    Message.text
  );
}

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const markSeen = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOneAndUpdate(
      { _id: messageId, receiverId: userId, seen: false },
      { seen: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: "Message not found or already seen" });
    }

    // Notify sender
    const senderSocketId = getReceiverSocketId(message.senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageSeen", { messageId });
    }

    res.status(200).json({ message: "Message marked as seen", messageData: message });
  } catch (error) {
    console.error("Error in markMessageAsSeen:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};