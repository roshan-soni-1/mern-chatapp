import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  LogOut,
  MessageCircle,
  UserPlus,
  UserX,
  MoreHorizontal,
  Settings,
  Loader2,
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
  const [showMenu, setShowMenu] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleFriendRequest = async () => {
    try {
      setActionLoading(true);
      await axiosInstance.post(`/friends/request/${userId}`);
      setRequestSent(true);
      toast.success("Friend request sent");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlock = async () => {
    try {
      setActionLoading(true);
      await axiosInstance.post(`/friends/block/${userId}`);
      setBlocked(true);
      setShowMenu(false);
      toast.success("User blocked");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to block user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-white dark:bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">User not found</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = authUser?._id === user._id;

  return (
    <div className="min-h-screen w-screen bg-white dark:bg-black flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
        {/* Profile Header */}
        <div className="px-4 py-8 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-start gap-8 mb-6 flex-wrap">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.userName}
                className="w-20 h-20 md:w-36 md:h-36 rounded-full object-cover"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <h1 className="text-xl font-light text-gray-900 dark:text-white">
                  {user.userName}
                </h1>

                {isOwnProfile ? (
                  <>
                    <Link
                      to="/settings"
                      className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-semibold text-gray-900 dark:text-white rounded-lg transition-colors"
                    >
                      Edit profile
                    </Link>
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <Settings className="w-6 h-6 text-gray-900 dark:text-white" />
                    </button>
                  </>
                ) : blocked ? (
                  <button
                    disabled
                    className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-sm font-semibold text-gray-400 rounded-lg cursor-not-allowed"
                  >
                    Blocked
                  </button>
                ) : isFriend ? (
                  <>
                    <button className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-semibold text-gray-900 dark:text-white rounded-lg transition-colors">
                      Friends
                    </button>
                    <button className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-sm font-semibold text-white rounded-lg transition-colors flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </button>
                  </>
                ) : requestSent ? (
                  <button
                    disabled
                    className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-sm font-semibold text-gray-400 rounded-lg cursor-not-allowed"
                  >
                    Requested
                  </button>
                ) : (
                  <button
                    onClick={handleFriendRequest}
                    disabled={actionLoading}
                    className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-sm font-semibold text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    Follow
                  </button>
                )}

                {!isOwnProfile && !blocked && (
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-6 h-6 text-gray-900 dark:text-white" />
                    </button>

                    {showMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowMenu(false)}
                        />
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden z-20">
                          <button
                            onClick={handleBlock}
                            disabled={actionLoading}
                            className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            {actionLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <UserX className="w-4 h-4" />
                            )}
                            Block User
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-8 mb-4 flex-wrap">
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">0</span>
                  <span className="ml-1 text-gray-900 dark:text-white">posts</span>
                </div>
                <Link
                  to={`/friends/${userId}`}
                  className="hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
                >
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {user?.friends?.length || 0}
                  </span>
                  <span className="ml-1 text-gray-900 dark:text-white">friends</span>
                </Link>
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">0</span>
                  <span className="ml-1 text-gray-900 dark:text-white">following</span>
                </div>
              </div>

              {/* Bio */}
              <div className="text-sm">
                {user.fullName && (
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    {user.fullName}
                  </p>
                )}
                {user.statusMessage && (
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {user.statusMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Friend Request Management */}
        {isOwnProfile && (
          <div className="px-4 py-6 space-y-6">
            <ManageFriendRequests />
            <SendFriendRequest />
          </div>
        )}

        {/* Posts Grid Placeholder */}
        <div className="px-4 py-12 flex-1 flex flex-col justify-center items-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-gray-900 dark:border-white mb-4">
              <MessageCircle className="w-8 h-8 text-gray-900 dark:text-white" />
            </div>
            <h3 className="text-2xl font-light text-gray-900 dark:text-white mb-2">
              No Posts Yet
            </h3>
            {isOwnProfile && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                When you share photos, they'll appear on your profile.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;