import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../../store/useAuthStore.js";
import { axiosInstance } from "../../lib/axios.js";
import { UserCheck, UserX, Loader2 } from "lucide-react";
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
      toast.success("Friend request accepted");
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

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Friend Requests
          </h2>
          {requests.length > 3 && (
            <button className="text-sm font-semibold text-blue-500 hover:text-blue-600">
              See All
            </button>
          )}
        </div>

        <div className="space-y-3">
          {requests.slice(0, 3).map((request) => {
            const isProcessing = processingIds.has(request._id);
            
            return (
              <div
                key={request._id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img
                      src={request.profilePic || "/avatar.png"}
                      alt={request.userName}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {request.userName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {request.fullName || "Wants to be your friend"}
                    </p>
                    {request.mutualFriends > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {request.mutualFriends} mutual {request.mutualFriends === 1 ? "friend" : "friends"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAccept(request._id)}
                    disabled={isProcessing}
                    className="px-6 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Confirm"
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleReject(request._id)}
                    disabled={isProcessing}
                    className="px-6 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Delete"
                    )}
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

export default ManageFriendRequests;