import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore.js";
import { axiosInstance } from "../../lib/axios.js";

const FriendsList = () => {
  const { authUser } = useAuthStore();
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch friends from backend
  const fetchFriends = async () => {
    try {
      const res = await axiosInstance.get("/friends"); // endpoint should return array of friend objects
      setFriends(res.data.friends || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  // Filter friends based on search term
  const filteredFriends = friends.filter((friend) =>
    friend.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">My Friends</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search friends..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />

      {/* Friends List */}
      {filteredFriends.length === 0 ? (
        <p className="text-center text-gray-500">No friends found.</p>
      ) : (
        <ul className="space-y-3">
          {filteredFriends.map((friend) => (
            <li
              key={friend._id}
              className="flex items-center gap-3 border p-3 rounded"
            >
              <img
                src={friend.profilePic || "/avatar.png"}
                alt={friend.userName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-medium">{friend.userName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FriendsList;