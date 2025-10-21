import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore.js";
import { axiosInstance } from "../../lib/axios.js";
import { UserPlus } from "lucide-react";
import toast from "react-hot-toast";

const SendFriendRequest = () => {
  const { authUser, setAuthUser } = useAuthStore();
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  // Fetch suggested users on mount
  const fetchSuggested = async () => {
    try {
      const res = await axiosInstance.get(`/friends/manage`);
      // backend returns { requests: [...], suggested: [...] }
      setSuggestedUsers(res.data.suggested || []);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to fetch suggestions");
    }
  };

  useEffect(() => {
    fetchSuggested();
  }, []);

  // Send friend request to a suggested user
  const sendFriendRequest = async (userId) => {
    try {
      await axiosInstance.post(`/friends/request/${userId}`);
      toast.success("Friend request sent!");
      // Remove from UI after sending
      setSuggestedUsers((prev) => prev.filter((s) => s._id !== userId));
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to send request");
    }
  };

  if (suggestedUsers.length === 0)
    return <p className="text-center">No suggested users available.</p>;

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Suggested Users</h2>
      <ul className="space-y-3">
        {suggestedUsers.map((user) => (
          <li
            key={user._id}
            className="flex items-center justify-between p-3 rounded"
          >
            <div className="flex items-center gap-3">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.userName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-medium">{user.userName}</span>
            </div>
            <button
              className="btn btn-sm btn-primary flex items-center gap-1"
              onClick={() => sendFriendRequest(user._id)}
            >
              <UserPlus className="w-4 h-4" /> Add Friend
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SendFriendRequest;