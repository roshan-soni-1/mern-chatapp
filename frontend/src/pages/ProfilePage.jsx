import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  LogOut,
  MessageSquare,
  User,
  UserPlus,
  UserX,
  MessageCircleMore,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import ManageFriendRequests from "../components/userComponent/ManageRequest.jsx";
import SendFriendRequest from "../components/userComponent/ManageSuggested.jsx";

const ProfilePage = () => {
  const { authUser, logout } = useAuthStore();
  const { userId } = useParams();

  const [user, setUser] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/users/${userId}`);
        const data = res.data;
        setUser(data);

        setIsFriend(authUser?.friends?.includes(userId));
        setRequestSent(authUser?.friendRequestsSent?.includes(userId));
        setBlocked(authUser?.blockedUsers?.includes(userId));
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to load user");
        setUser(authUser);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, authUser]);

  // Friend Request Handler
  const handleFriendRequest = async () => {
    try {
      await axiosInstance.post(`/friends/request/${userId}`);
      setRequestSent(true);
      toast.success("Friend request sent!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  // Block Handler
  const handleBlock = async () => {
    try {
      await axiosInstance.post(`/friends/block/${userId}`);
      setBlocked(true);
      toast.success("User blocked");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to block user");
    }
  };

  // Logout Handler
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        User not found 😕
      </div>
    );
  }

  return (
    <div className="max-w-screen-sm mx-auto p-6 mt-12 bg-white dark:bg-gray-900 rounded-2xl shadow-md transition duration-300">
      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-6">
        <img
          loading="lazy"
          src={user.profilePic || "/avatar.png"}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 shadow-sm"
        />
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {user.userName || "Unknown User"}
          </h2>
          <p className="text-sm mt-1 text-gray-600 dark:text-gray-300 italic">
            {user.statusMessage || "Hey there! I'm using ChatApp 😎"}
          </p>
        </div>
        <div className="ml-auto">
          {!blocked && authUser?._id !== user._id && (
            <button
              onClick={handleBlock}
              className="p-2 rounded-full hover:bg-red-50 text-red-500 transition"
              title="Block user"
            >
              <UserX className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Buttons / Stats */}
      <div className="flex justify-around mb-6 text-center">
        {authUser?._id === user._id ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-sm transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        ) : blocked ? (
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 text-sm bg-red-100 text-red-600 rounded-lg shadow-sm"
          >
            <UserX className="w-4 h-4" /> Blocked
          </button>
        ) : isFriend ? (
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg shadow-sm transition"
          >
            <MessageSquare className="w-4 h-4" /> Message
          </button>
        ) : requestSent ? (
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-500 rounded-lg shadow-sm"
          >
            Request Sent
          </button>
        ) : (
          <button
            onClick={handleFriendRequest}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition"
          >
            <UserPlus className="w-4 h-4" /> Add Friend
          </button>
        )}

        {/* Friends Count */}
        <Link
          to={`/friends/${userId}`}
          className="text-center hover:scale-105 transition-transform"
        >
          <p className="font-bold text-lg text-gray-800 dark:text-white">
            {user?.friends?.length || 0}
          </p>
          <p className="text-sm text-gray-500">Friends</p>
        </Link>

        {/* Message Shortcut */}
        <button
          className="p-3 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition"
          title="Chat"
        >
          <MessageCircleMore />
        </button>
      </div>

      {/* Friend Request Panels */}
      <ManageFriendRequests />
      <SendFriendRequest />
    </div>
  );
};

export default ProfilePage;