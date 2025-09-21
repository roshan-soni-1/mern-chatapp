// models/PendingUser.js
import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // optional: ensures no duplicate pending requests
  },
  fullName: {
    type: String,
    required: true,
  },
  userName: {
      type: String,
      required: false,
      unique: true, // makes username unique
      trim: true,
      minlength: 5,
    },
  password: {
    type: String, // optional: hash if you store it
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expires: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

const PendingUser = mongoose.model("PendingUser", pendingUserSchema);

export default PendingUser;