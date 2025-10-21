import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    userName: {
      type: String,
      required: false,
      unique: true, // makes username unique
      trim: true,
      minlength: 5,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: false,
      minlength: 6,
    },
    authProvider:{
      type: String,
    },
    firebaseUid:{
      type: String,
    },
    profilePic: {
      type: String,
      default: "/avatar.png",
    },
    // models/user.model.js
    fcmToken: {
      type: String,
      default: null,
    },
    friends:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      ],
    friendRequestRecieved:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      ],
    friendRequestSent:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      ],
    blockedUser:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      ],
    
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;