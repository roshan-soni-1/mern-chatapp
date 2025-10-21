// ChatContainer.jsx
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import ImageModal from "./ImageModal";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser, 
          subscribeToMessages, subscribeToSeen, unsubscribeFromMessages, hasMoreMessages } = useChatStore();
  const { authUser } = useAuthStore();

  const [openedImage, setOpenedImage] = useState(null);
  const messageEndRef = useRef(null);
  const containerRef = useRef(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Audio refs
  const msgSendSound = useRef(null);
  const msgRecSound = useRef(null);

  useEffect(() => {
    msgSendSound.current = new Audio("/Msg_send.mp3");
    msgRecSound.current = new Audio("/Msg_rec.mp3");
    msgSendSound.current.volume = 0.1;
    msgRecSound.current.volume = 0.1;
  }, []);

  // Socket: seen messages
  useEffect(() => {
    const socket = authUser?.socket;
    if (!socket) return;

    const handleSeen = ({ messageId }) => {
      useChatStore.setState(state => ({
        messages: state.messages.map(m =>
          m._id === messageId ? { ...m, seen: true } : m
        )
      }));
    };

    socket.on("messageSeen", handleSeen);
    return () => socket.off("messageSeen", handleSeen);
  }, [authUser]);

  // Load messages and subscribe
  useEffect(() => {
    if (!selectedUser?._id) return;
    getMessages(selectedUser._id);
    subscribeToMessages();
    subscribeToSeen();

    return () => unsubscribeFromMessages();
  }, [selectedUser?._id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    const prevLength = prevMessagesLengthRef.current;
    const newLength = messages.length;

    if (newLength > prevLength) {
      const lastMessage = messages[messages.length - 1];
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });

      if (lastMessage.senderId !== authUser._id) {
        msgRecSound.current?.play().catch(() => {});
      } else {
        msgSendSound.current?.play().catch(() => {});
      }
    }

    prevMessagesLengthRef.current = newLength;
  }, [messages]);

  // Infinite scroll: load older messages
  const handleScroll = async (e) => {
    if (!hasMoreMessages || isMessagesLoading) return;
    if (e.currentTarget.scrollTop === 0) {
      const prevHeight = e.currentTarget.scrollHeight;
      await getMessages(selectedUser._id, { loadMore: true });
      const newHeight = e.currentTarget.scrollHeight;
      e.currentTarget.scrollTop = newHeight - prevHeight;
    }
  };

  if (isMessagesLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        ref={containerRef}
        onScroll={handleScroll}
      >
        {messages.map((msg, idx) => (
          <div
            key={msg._id}
            className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={idx === messages.length - 1 ? messageEndRef : undefined}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={msg.senderId === authUser._id ? authUser.profilePic || "/avatar.png" : selectedUser?.profilePic || "/avatar.png"}
                  alt="profile pic"
                />
              </div>
            </div>

            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">{formatMessageTime(msg.createdAt)}</time>
            </div>

            <div className="chat-bubble flex flex-col">
              {msg.image && (
                <img
                  src={msg.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2 cursor-pointer"
                  onClick={() => setOpenedImage(msg.image)}
                />
              )}
              {msg.text && <p>{msg.text}</p>}
            </div>

            <span className="px-1 text-blue-300">
              {msg.seen && authUser._id === msg.senderId ? "seen" : ""}
            </span>
          </div>
        ))}
      </div>

      <MessageInput selectedUser={selectedUser} />
      
      {openedImage && (
        <ImageModal src={openedImage} onClose={() => setOpenedImage(null)} />
      )}
    </div>
  );
};

export default ChatContainer;