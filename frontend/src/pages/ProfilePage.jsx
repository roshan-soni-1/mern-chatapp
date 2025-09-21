import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LogOut, MessageSquare, User, UserPlus, UserX,MessageCircleMore} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import ManageFriendRequests from "../components/userComponent/ManageRequest.jsx"

const ProfilePage = () => {
  const { authUser } = useAuthStore();
  let { userId } = useParams();
  userId = userId ?? authUser._id
  
  const [user, setUser] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`/users/${userId}`);
        setUser(res.data);
        console.log(res)
  
        
        if (authUser?.friends?.includes(userId)) setIsFriend(true);
        if (authUser?.friendRequestsSent?.includes(userId)) setRequestSent(true);
        if (authUser?.blockedUsers?.includes(userId)) setBlocked(true);
  
      } catch (err) {
        console.error(err);
        toast.error(err.data?.message)
        setUser(authUser)
      }
    };
  
    fetchUser();
  }, [userId, authUser]);

  const handleFriendRequest = async () => {
    try {
      await axiosInstance.post(`/friends/request/${userId}`);
      setRequestSent(true);
      toast.success("request sent")
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlock = async () => {
    try {
      await axiosInstance.post(`/friends/block/${userId}`);
      setBlocked(true);
    } catch (err) {
      console.error(err);
    }
  };
  console.log(user)

  if (!user) return <p>Loading...</p>;

  return (
    <div className="max-w-screen-sm mx-auto p-6 mt-12">
      {/* Profile header */}
      <div className="flex items-center gap-6 mb-6">
        <img
        loading="lazy"
          src={user.profilePic || "/avatar.png"}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border-2"
        />
        <div>
          <h2 className="text-xl font-bold">{user.userName||"unknown"}</h2>
          <p className="text-sm mt-1">{user.statusMessage}
          good morning
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          {!blocked && authUser?._id !== user._id && (
            <button
              className="btn btn-sm  text-red-400 flex items-center gap-1"
              onClick={handleBlock}
            >
              <UserX className="w-4 h-4  " /></button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-around mb-6 text-center">
      
          {authUser?._id === user._id ? (
            <button className="btn btn-sm btn-outline flex items-center gap-1">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          ) : blocked ? (
            <button className="btn btn-sm btn-error flex items-center gap-1" disabled>
              <UserX className="w-4 h-4" /> Blocked
            </button>
          ) : isFriend ? (
            <button className="btn btn-sm btn-outline flex items-center gap-1">
              <MessageSquare className="w-4 h-4" /> Message
            </button>
          ) : requestSent ? (
            <button className="btn btn-sm btn-disabled flex items-center gap-1">
              Request Sent
            </button>
          ) : (
            <button
              className="btn btn-sm btn-primary flex items-center gap-1 "
              onClick={handleFriendRequest}
            >
              <UserPlus className="w-4 h-4" /> Request
            </button>
          )}
        
          
    
        
        
        
        
        
        <div>
          <p className="font-bold">{user?.friends?.length || "∞"}</p>
          <p className="text-sm opacity-70">Friends</p>
        </div>
        <div className="">
          <button className="">
            <MessageCircleMore/>
          </button>
        </div>
      </div>
    <ManageFriendRequests/>
    </div>
  );
};

export default ProfilePage;