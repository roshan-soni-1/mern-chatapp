import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    
  });
  socket.on("markSeen", async ({ messageIds, userId }) => {
  try {
    console.log("markseen called")
    const result = await Message.updateMany(
      { _id: { $in: messageIds }, receiverId: userId, seen: false },
      { $set: { seen: true } }
    );
    console.log("modify called")
    
    if (result.modifiedCount > 0) {
      
      const messages = await Message.find({ _id: { $in: messageIds } });
      for (const message of messages) {
        const senderSocketId = getReceiverSocketId(message.senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messageSeen", { messageId: message._id });
        }
      }
    }
    
    
    
    // const updatedMessages = await Message.updateMany(
//       { _id: { $in: messageIds }, receiverId: userId, seen: false },
//       { $set: { seen: true } }
//     );

  } catch (err) {
    console.error("Error marking messages seen:", err);
  }
});
});

export { io, app, server };
