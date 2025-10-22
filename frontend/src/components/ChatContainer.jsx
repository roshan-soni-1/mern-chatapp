// ChatContainer.jsx
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef, useState, memo, useCallback } from "react";
import * as RW from "react-window";
const { FixedSizeList } = RW;

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import ImageModal from "./ImageModal";
import { formatMessageTime } from "../lib/utils";

// Memoized single message
const ChatMessage = memo(({ msg, isOwn, onImageClick, authUser, selectedUser }) => (
  <div className={`chat ${isOwn ? "chat-end" : "chat-start"}`}>
    <div className="chat-image avatar">
      <div className="size-10 rounded-full border">
        <img
          src={isOwn ? authUser.profilePic || "/avatar.png" : selectedUser?.profilePic || "/avatar.png"}
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
          onClick={() => onImageClick(msg.image)}
        />
      )}
      {msg.text && <p>{msg.text}</p>}
    </div>

    <span className="px-1 text-blue-300">
      {msg.seen && isOwn ? "seen" : ""}
    </span>
  </div>
));

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser, 
          subscribeToMessages, subscribeToSeen, unsubscribeFromMessages, hasMoreMessages } = useChatStore();
  const { authUser } = useAuthStore();

  const [openedImage, setOpenedImage] = useState(null);
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

  // Play send/receive sounds
  useEffect(() => {
    const prevLength = prevMessagesLengthRef.current;
    const newLength = messages.length;

    if (newLength > prevLength) {
      const lastMessage = messages[messages.length - 1];

      if (lastMessage.senderId !== authUser._id) {
        msgRecSound.current?.play().catch(() => {});
      } else {
        msgSendSound.current?.play().catch(() => {});
      }
    }

    prevMessagesLengthRef.current = newLength;
  }, [messages]);

  // Infinite scroll: load older messages
  const handleScroll = useCallback(async () => {
    if (!containerRef.current || !hasMoreMessages || isMessagesLoading) return;

    if (containerRef.current.scrollTop <= 10) {
      const prevHeight = containerRef.current.scrollHeight;
      await getMessages(selectedUser._id, { loadMore: true });
      const newHeight = containerRef.current.scrollHeight;
      containerRef.current.scrollTop = newHeight - prevHeight;
    }
  }, [hasMoreMessages, isMessagesLoading, selectedUser, getMessages]);

  // Auto-scroll to bottom if user near bottom
  useEffect(() => {
    if (!containerRef.current) return;
    const threshold = 100;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      containerRef.current.scrollTop = scrollHeight;
    }
  }, [messages]);

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
        className="flex-1 overflow-y-auto p-4 space-y-4 "
        ref={containerRef}
        onScroll={handleScroll}
      >
        {messages.map(msg => (
          <ChatMessage
            key={msg._id}
            msg={msg}
            isOwn={msg.senderId === authUser._id}
            onImageClick={setOpenedImage}
            authUser={authUser}
            selectedUser={selectedUser}
          />
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