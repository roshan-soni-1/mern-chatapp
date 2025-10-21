import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuthStore } from "../../store/useAuthStore.js";
import { axiosInstance } from "../../lib/axios.js";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Search, 
  Users, 
  Loader2, 
  MessageCircle, 
  UserMinus,
  X,
  ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";

const FriendsList = () => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const { userId } = useParams();

  const fetchFriends = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/friends/list/${userId}`);
      setFriends(res.data.friends || []);
    } catch (err) {
      console.error("Error fetching friends:", err);
      toast.error(err?.response?.data?.message || "Failed to load friends");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const handleRemoveFriend = useCallback(async (friendId, friendName) => {
    if (!window.confirm(`Remove ${friendName} from your friends?`)) return;

    setRemovingId(friendId);
    try {
      await axiosInstance.delete(`/friends/remove/${friendId}`);
      toast.success(`Removed ${friendName}`);
      setFriends((prev) => prev.filter((f) => f._id !== friendId));
    } catch (err) {
      console.error("Error removing friend:", err);
      toast.error(err?.response?.data?.message || "Failed to remove friend");
    } finally {
      setRemovingId(null);
    }
  }, []);

  const handleMessageFriend = useCallback((friendId) => {
    navigate(`/chat/${friendId}`);
  }, [navigate]);

  const filteredAndSortedFriends = useMemo(() => {
    let result = friends.filter((friend) =>
      friend.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === "name") {
      result.sort((a, b) => a.userName.localeCompare(b.userName));
    } else if (sortBy === "recent") {
      result.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    }

    return result;
  }, [friends, searchTerm, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Friends
              </h1>
              
              {friends.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
                  >
                    {sortBy === "name" ? "Name" : "Recent"}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showSortMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowSortMenu(false)}
                      />
                      <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden z-20">
                        <button
                          onClick={() => {
                            setSortBy("name");
                            setShowSortMenu(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                            sortBy === "name"
                              ? "bg-gray-100 dark:bg-gray-800 font-semibold"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800"
                          } text-gray-900 dark:text-white`}
                        >
                          Name
                        </button>
                        <button
                          onClick={() => {
                            setSortBy("recent");
                            setShowSortMenu(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                            sortBy === "recent"
                              ? "bg-gray-100 dark:bg-gray-800 font-semibold"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800"
                          } text-gray-900 dark:text-white`}
                        >
                          Recent
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {friends.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-900 border-none rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-2">
          {friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 mb-4 rounded-full border-4 border-gray-900 dark:border-white flex items-center justify-center">
                <Users className="w-12 h-12 text-gray-900 dark:text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                No Friends Yet
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                When you add friends, they'll appear here.
              </p>
            </div>
          ) : filteredAndSortedFriends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No results found for "{searchTerm}"
              </p>
            </div>
          ) : (
            <>
              <div className="py-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  All Friends · {filteredAndSortedFriends.length}
                </p>
              </div>
              
              <div className="divide-y divide-gray-100 dark:divide-gray-900">
                {filteredAndSortedFriends.map((friend) => {
                  const isRemoving = removingId === friend._id;
                  
                  return (
                    <div
                      key={friend._id}
                      className="py-2 flex items-center justify-between group" onClick={() => navigate(`/profile/${friend._id}`)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          <img
                            src={friend.profilePic || "/avatar.png"}
                            alt={friend.userName}
                            className="w-11 h-11 rounded-full object-cover"
                          />
                          {friend.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-black" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {friend.userName}
                          </p>
                          {friend.fullName && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {friend.fullName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <button
                          onClick={() => handleMessageFriend(friend._id)}
                          className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                          Message
                        </button>
                        
                        <button
                          onClick={() => handleRemoveFriend(friend._id, friend.userName)}
                          disabled={isRemoving}
                          className="px-4 py-1.5 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-900 dark:text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isRemoving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Remove"
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsList;