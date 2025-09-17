import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    hasMoreMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();

  const messageEndRef = useRef(null);
  const containerRef = useRef(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Sounds
  const msgSendSound = useRef(new Audio("/Msg_send.mp3")).current;
  const msgRecSound = useRef(new Audio("/Msg_rec.mp3")).current;
  msgRecSound.volume = 0.1;
  msgSendSound.volume = 0.1;

  // Initial load and subscription
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Auto-scroll for new messages (bottom only) + play sounds
  useEffect(() => {
    if (!messageEndRef.current) return;

    const prevLength = prevMessagesLengthRef.current;
    const newLength = messages.length;

    // Scroll only if new message added at bottom
    if (newLength > prevLength) {
      const lastMessage = messages[messages.length - 1];
      //messageEndRef.current.scrollIntoView({ behavior: "smooth" });

      if (lastMessage.senderId !== authUser._id) {
        msgRecSound.play().catch(() => {});
      } else {
        msgSendSound.play().catch(() => {});
      }
    }

    prevMessagesLengthRef.current = newLength;
  }, [messages]);

  // Load older messages when scroll reaches top
  const handleScroll = async (e) => {
    if (!hasMoreMessages || isMessagesLoading) return;

    const top = e.currentTarget.scrollTop;
    if (top === 0) {
      const prevHeight = e.currentTarget.scrollHeight;
      await getMessages(selectedUser._id, { loadMore: true });
      const newHeight = e.currentTarget.scrollHeight;

      // preserve scroll position after prepending older messages
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
        {messages.map((message, index) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={index === messages.length - 1 ? messageEndRef : null} // last message ref
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;