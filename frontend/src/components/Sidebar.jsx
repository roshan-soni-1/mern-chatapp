import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const Sidebar= () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading,messages } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;
    
  const getLastMessage = (userId) => {
    const userMessages = messages.filter((m) => m.senderId === userId || m.receiverId === userId
    );
    return userMessages[userMessages.length - 1];
  };
  if (isUsersLoading) return <p className="p-4">Loading...</p>;

  return (
    <div className="flex-1 overflow-y-auto bg-base-100">
      {filteredUsers.map((user) => (
        <button
          key={user._id}
          onClick={() => setSelectedUser(user)}
          className={`
            w-full flex items-center gap-4 p-4 border-b border-base-300
            hover:bg-base-200 transition-colors
            ${selectedUser?._id === user._id ? "bg-base-200" : ""}
          `}
        >
          {/* Avatar */}
          <div className="relative">
            <img
            loading="lazy"
              src={user.profilePic || "/avatar.png"}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            {onlineUsers.includes(user._id) && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-base-100" />
            )}
          </div>

          {/* User info */}
          <div className="flex-1 text-left min-w-0">
            <div className="font-medium truncate">{user.userName}</div>
            <div className="text-sm text-zinc-500 truncate">
              {/*onlineUsers.includes(user._id) ? "Online" : "Offline"*/}
              {(() => {
        const lastMsg = getLastMessage(user._id);
        return lastMsg?.text || (lastMsg?.image && "📷 Photo") || "No messages yet";
      })()
              }
            </div>
          </div>
        </button>
      ))}

      {filteredUsers.length === 0 && (
        <div className="text-center text-zinc-500 py-6">No users found</div>
      )}
    </div>
  );
};

export default Sidebar;