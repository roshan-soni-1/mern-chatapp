import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../../store/useAuthStore.js";
import { axiosInstance } from "../../lib/axios.js";
import { UserCheck, UserX, Loader2, Users, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const ManageFriendRequests = () => {
  const { authUser, setAuthUser } = useAuthStore();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState(new Set());

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/friends/manage`);
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error("Error fetching friend requests:", err);
      toast.error(err?.response?.data?.message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAccept = useCallback(async (requesterId) => {
    if (processingIds.has(requesterId)) return;

    setProcessingIds((prev) => new Set(prev).add(requesterId));

    try {
      await axiosInstance.post(`/friends/accept/${requesterId}`);
      
      toast.success(
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Friend request accepted!</span>
        </div>,
        { duration: 3000 }
      );
      
      setRequests((prev) => prev.filter((r) => r._id !== requesterId));
      setAuthUser({
        ...authUser,
        friends: [...(authUser.friends || []), requesterId],
      });
    } catch (err) {
      console.error("Error accepting friend request:", err);
      toast.error(err?.response?.data?.message || "Failed to accept request");
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requesterId);
        return newSet;
      });
    }
  }, [authUser, setAuthUser, processingIds]);

  const handleReject = useCallback(async (requesterId) => {
    if (processingIds.has(requesterId)) return;

    setProcessingIds((prev) => new Set(prev).add(requesterId));

    try {
      await axiosInstance.post(`/friends/decline/${requesterId}`);
      toast.success("Friend request declined");
      setRequests((prev) => prev.filter((r) => r._id !== requesterId));
    } catch (err) {
      console.error("Error rejecting friend request:", err);
      toast.error(err?.response?.data?.message || "Failed to reject request");
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requesterId);
        return newSet;
      });
    }
  }, [processingIds]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600 dark:text-purple-400" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">
              Loading friend requests...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (requests.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 dark:from-purple-600 dark:to-blue-600">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              No Friend Requests
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
              You're all caught up! No pending friend requests at the moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Friend Requests
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {requests.length} {requests.length === 1 ? "request" : "requests"} pending
              </p>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <ul className="space-y-3">
          {requests.map((request, index) => {
            const isProcessing = processingIds.has(request._id);
            
            return (
              <li
                key={request._id}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                style={{
                  animation: `slideIn 0.3s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="flex items-center justify-between p-4">
                  {/* User Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative">
                      <img
                        src={request.profilePic || "/avatar.png"}
                        alt={request.userName}
                        className="w-14 h-14 rounded-full object-cover ring-4 ring-purple-100 dark:ring-purple-900 group-hover:ring-purple-300 dark:group-hover:ring-purple-700 transition-all"
                        loading="lazy"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-lg truncate">
                        {request.userName}
                      </p>
                      {request.fullName && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {request.fullName}
                        </p>
                      )}
                      {request.mutualFriends > 0 && (
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                          {request.mutualFriends} mutual {request.mutualFriends === 1 ? "friend" : "friends"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 ml-4">
                    <button
                      className={`
                        px-4 py-2 rounded-lg font-medium text-sm
                        flex items-center gap-2 transition-all duration-200
                        ${isProcessing 
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        }
                      `}
                      onClick={() => handleAccept(request._id)}
                      disabled={isProcessing}
                      aria-label={`Accept friend request from ${request.userName}`}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">Accept</span>
                    </button>
                    
                    <button
                      className={`
                        px-4 py-2 rounded-lg font-medium text-sm
                        flex items-center gap-2 transition-all duration-200
                        ${isProcessing 
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 dark:bg-gray-700 hover:bg-red-500 dark:hover:bg-red-600 text-gray-700 dark:text-gray-300 hover:text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        }
                      `}
                      onClick={() => handleReject(request._id)}
                      disabled={isProcessing}
                      aria-label={`Reject friend request from ${request.userName}`}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserX className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">Decline</span>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
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

export default ManageFriendRequests;