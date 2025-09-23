import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import axios from "axios";

// Firebase imports
import { auth, googleProvider } from "../firebase/fiberbase.js";
import { signInWithPopup,createUserWithEmailAndPassword,sendEmailVerification } from "firebase/auth";


const BASE_URL =
  import.meta.env.MODE_ENV === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isPendingUser:false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // 🔹 Check session
checkAuth: async () => {
  try {
    const res = await axiosInstance.get("/auth/check");
    set({ authUser: res.data.user, isPendingUser: false });
    get().connectSocket();

  } catch (error) {
    const status = error.response?.status;

    if (status === 401 && error.response?.data?.status === "pending") {
      // Pending user
      set({ isPendingUser: true, authUser: null });
    } else {
      // Other errors
      set({ authUser: null, isPendingUser: false });
      console.error("Error in checkAuth:", error);
    }
  } finally {
    set({ isCheckingAuth: false });
  }
},




  // 🔹 Regular signup
signup: async (data) => {
  set({ isSigningUp: true });
  try {
    const res = await axiosInstance.post("/auth/signup", data);

    set({ authUser: res.data, isPendingUser: true });
    toast.success("Verification email sent");
  } catch (error) {
    toast.error(error.response?.data?.message || "Signup failed");
    console.error(error);
  } finally {
    set({ isSigningUp: false });
  }
},


  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      console.error(error)
    } finally {
      set({ isLoggingIn: false });
    }
  },
  loginWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken(); // Firebase JWT token

      // Send token to backend for verification + user creation
      const res = await axiosInstance.post("/auth/firebase-login", { idToken });

      set({ authUser: res.data });
      toast.success("Logged in with Google successfully");

      get().connectSocket();
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Google sign-in failed");
    }
  },

  // 🔹 Logout
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  // 🔹 Update profile
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in update profile:", error);
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  // 🔹 Socket connection
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: { userId: authUser._id },
    });

    socket.connect();
    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));