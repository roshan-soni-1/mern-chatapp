import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore.js";
import { axiosInstance } from "../../lib/axios.js";
import { UserCheck, UserX } from "lucide-react";
import toast from "react-hot-toast";

const ManageFriendRequests = () => {
  const { authUser, setAuthUser } = useAuthStore();
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await axiosInstance.get(`/friends/manage`);
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to fetch requests");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Accept friend request
  const handleAccept = async (requesterId) => {
    try {
      await axiosInstance.post(`/friends/accept/${requesterId}`);
      toast.success("Friend request accepted!");
      setRequests((prev) => prev.filter((r) => r._id !== requesterId));
      setAuthUser({
        ...authUser,
        friends: [...(authUser.friends || []), requesterId],
      });
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to accept request");
    }
  };

  // Reject a friend request
  const handleReject = async (requesterId) => {
    try {
      await axiosInstance.post(`/friends/decline/${requesterId}`);
      toast.success("Friend request rejected!");
      setRequests((prev) => prev.filter((r) => r._id !== requesterId));
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to reject request");
    }
  };

  if (requests.length === 0) return <p>No incoming friend requests.</p>;

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Friend Requests</h2>
      <ul className="space-y-3">
        {requests.map((request) => (
          <li
            key={request._id}
            className="flex items-center justify-between border p-3 rounded"
          >
            <div className="flex items-center gap-3">
              <img
                src={request.profilePic || "/avatar.png"}
                alt={request.userName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-medium">{request.userName}</span>
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-sm btn-success flex items-center gap-1"
                onClick={() => handleAccept(request._id)}
              >
                <UserCheck className="w-4 h-4" /> Accept
              </button>
              <button
                className="btn btn-sm btn-error flex items-center gap-1"
                onClick={() => handleReject(request._id)}
              >
                <UserX className="w-4 h-4" /> Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageFriendRequests;