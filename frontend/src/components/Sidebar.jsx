import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { LoaderCircle,MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar= () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading,messages,authUser } = useChatStore();
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
  if (isUsersLoading) return <div className="flex justify-center h-screen w-screen">
        <LoaderCircle className="size-10 animate-spin" />
      </div>;

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
          <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
            <div className="w-24 h-24 mb-4 rounded-full border-4 border-gray-900 dark:border-white flex items-center justify-center">
              <MessageCircle className="w-12 h-12 text-gray-900 dark:text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No messages yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
              Start a conversation with your friends
            </p>
            <Link
              to={`/profile`}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Find Friends
            </Link>
          </div>)}
    </div>
  )
};

export default Sidebar;