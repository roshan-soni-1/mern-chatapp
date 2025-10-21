import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuthStore } from "../../store/useAuthStore.js";
import { axiosInstance } from "../../lib/axios.js";
import { 
  Search, 
  Users, 
  Loader2, 
  MessageCircle, 
  UserMinus,
  X,
  Filter
} from "lucide-react";
import toast from "react-hot-toast";

const FriendsList = () => {
  const { authUser } = useAuthStore();
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [sortBy, setSortBy] = useState("name"); // name, recent

  const fetchFriends = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/friends");
      setFriends(res.data.friends || []);
    } catch (err) {
      console.error("Error fetching friends:", err);
      toast.error(err?.response?.data?.message || "Failed to load friends");
    } finally {
      setLoading(false);}
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // Handle remove friend
  const handleRemoveFriend = useCallback(async (friendId, friendName) => {
    if (!window.confirm(`Remove ${friendName} from your friends?`)) return;

    setRemovingId(friendId);
    try {
      await axiosInstance.delete(`/friends/remove/${friendId}`);
      toast.success(`${friendName} removed from friends`);
      setFriends((prev) => prev.filter((f) => f._id !== friendId));
    } catch (err) {
      console.error("Error removing friend:", err);
      toast.error(err?.response?.data?.message || "Failed to remove friend");
    } finally {
      setRemovingId(null);
    }
  }, []);

  // Handle message friend
  const handleMessageFriend = useCallback((friendId, friendName) => {
    // Navigate to chat with friend or open chat modal
    toast.success(`Opening chat with ${friendName}`);
    // Add your navigation logic here
    // Example: navigate(`/chat/${friendId}`);
  }, []);

  // Filter and sort friends
  const filteredAndSortedFriends = useMemo(() => {
    let result = friends.filter((friend) =>
      friend.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort friends
    if (sortBy === "name") {
      result.sort((a, b) => a.userName.localeCompare(b.userName));
    } else if (sortBy === "recent") {
      result.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    }

    return result;
  }, [friends, searchTerm, sortBy]);

  // Clear search
  const clearSearch = () => setSearchTerm("");

  // Loading state
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 dark:text-blue-400" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">
              Loading your friends...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                My Friends
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {friends.length} {friends.length === 1 ? "friend" : "friends"}
              </p>
            </div>
          </div>

          {/* Sort Dropdown */}
          {friends.length > 0 && (
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="name">Sort by Name</option>
                <option value="recent">Recently Added</option>
              </select>
              <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Search Bar */}
        {friends.length > 0 && (
          <div className="mb-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search friends by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 dark:text-white placeholder-gray-400"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        )}

        {/* Friends List */}
        {friends.length === 0 ? (
          // Empty state when no friends at all
          <div className="text-center py-12 space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 dark:from-blue-600 dark:to-indigo-600">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              No Friends Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
              Start connecting with people to build your network!
            </p>
          </div>
        ) : filteredAndSortedFriends.length === 0 ? (
          // Empty state when search returns no results
          <div className="text-center py-12 space-y-4">
            <Search className="w-16 h-16 text-gray-400 mx-auto" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              No Results Found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              No friends match "{searchTerm}"
            </p>
            <button
              onClick={clearSearch}
              className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredAndSortedFriends.map((friend, index) => {
              const isRemoving = removingId === friend._id;
              
              return (
                <li
                  key={friend._id}
                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  style={{
                    animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
                  }}
                >
                  <div className="flex items-center justify-between p-4">
                    {/* User Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative">
                        <img
                          src={friend.profilePic || "/avatar.png"}
                          alt={friend.userName}
                          className="w-14 h-14 rounded-full object-cover ring-4 ring-blue-100 dark:ring-blue-900 group-hover:ring-blue-300 dark:group-hover:ring-blue-700 transition-all"
                          loading="lazy"
                        />
                        {friend.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-lg truncate">
                          {friend.userName}
                        </p>
                        {friend.fullName && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {friend.fullName}
                          </p>
                        )}
                        {friend.lastActive && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Last active: {friend.lastActive}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleMessageFriend(friend._id, friend.userName)}
                        className="p-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                        aria-label={`Message ${friend.userName}`}
                        title="Send Message"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => handleRemoveFriend(friend._id, friend.userName)}
                        disabled={isRemoving}
                        className={`
                          p-2.5 rounded-lg font-medium text-sm
                          transition-all duration-200
                          ${isRemoving 
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                            : "bg-gray-200 dark:bg-gray-700 hover:bg-red-500 dark:hover:bg-red-600 text-gray-700 dark:text-gray-300 hover:text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          }
                        `}
                        aria-label={`Remove ${friend.userName}`}
                        title="Remove Friend"
                      >
                        {isRemoving ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <UserMinus className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Results count */}
        {filteredAndSortedFriends.length > 0 && searchTerm && (
          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredAndSortedFriends.length} of {friends.length} friends
          </div>
        )}
      </div>

      {/* Inline CSS for animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default FriendsList;