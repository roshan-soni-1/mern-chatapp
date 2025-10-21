import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../../store/useAuthStore.js";
import { axiosInstance } from "../../lib/axios.js";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const SendFriendRequest = () => {
  const { authUser, setAuthUser } = useAuthStore();
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingIds, setSendingIds] = useState(new Set());

  const fetchSuggested = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/friends/manage`);
      setSuggestedUsers(res.data.suggested || []);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to fetch suggestions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggested();
  }, [fetchSuggested]);

  const sendFriendRequest = async (userId, userName) => {
    if (sendingIds.has(userId)) return;

    setSendingIds((prev) => new Set(prev).add(userId));

    try {
      await axiosInstance.post(`/friends/request/${userId}`);
      toast.success("Friend request sent");
      setSuggestedUsers((prev) => prev.filter((s) => s._id !== userId));
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to send request");
    } finally {
      setSendingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleRemoveSuggestion = (userId) => {
    setSuggestedUsers((prev) => prev.filter((s) => s._id !== userId));
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  if (suggestedUsers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Suggestions For You
          </h2>
          {suggestedUsers.length > 5 && (
            <button className="text-sm font-semibold text-blue-500 hover:text-blue-600">
              See All
            </button>
          )}
        </div>

        <div className="space-y-3">
          {suggestedUsers.slice(0, 5).map((user) => {
            const isSending = sendingIds.has(user._id);
            
            return (
              <div
                key={user._id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.userName}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user.userName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.fullName || "Suggested for you"}
                    </p>
                    {user.mutualFriends > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {user.mutualFriends} mutual {user.mutualFriends === 1 ? "friend" : "friends"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => sendFriendRequest(user._id, user.userName)}
                    disabled={isSending}
                    className="px-6 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors disabled:cursor-not-allowed min-w-[80px] flex items-center justify-center"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Follow"
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleRemoveSuggestion(user._id)}
                    disabled={isSending}
                    className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SendFriendRequest;