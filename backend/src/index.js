import dotenv from "dotenv";
dotenv.config({ path: '../.env' });
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import friendRoutes from "./routes/friend.route.js"
import userRoute from "./routes/user.route.js"


import NotificationRoutes from "./routes/notification.route.js"
import { app, server } from "./lib/socket.js";
import verifyEmail from "./routes/verifyEmail.route.js"

app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ limit: "10mb", extended: true }));



const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notify", NotificationRoutes);
app.use("/api/friends",friendRoutes)
app.get("/verify", verifyEmail);
app.use("/api/users",userRoute)


if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// ----- Start server -----
server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});