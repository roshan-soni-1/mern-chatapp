import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  hasMoreMessages: true,
  page: 1, // current page for pagination

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMessages: async (userId, { loadMore = false } = {}) => {
    const { messages } = get();
    set({ isMessagesLoading: true });
  
    try {
      const oldestMessageId =
        loadMore && messages.length > 0 ? messages[0]._id : null;
  
      const url = oldestMessageId
        ? `/messages/${userId}?before=${oldestMessageId}`
        : `/messages/${userId}`;
  
      const res = await axiosInstance.get(url);
  
      const newMessages = res.data.messages.map(m => ({
        ...m,
        seen: m.seen ?? false
      }));
  
      if (loadMore) {
        // Avoid duplicates when prepending
        const uniqueNew = newMessages.filter(
          m => !messages.some(msg => msg._id === m._id)
        );
  
        set({
          messages: [...uniqueNew, ...messages],
          hasMoreMessages: uniqueNew.length > 0,
        });
      } else {
        const currentUser = useAuthStore.getState().user;
        
        // Mark unseen messages as seen
        const unseenIds = newMessages
          .filter(m => m.senderId === userId && !m.seen)
          .map(m => m._id);
  
        if (unseenIds.length) {
          get().markSeen(unseenIds);
        }
  
        set({
          messages: newMessages,
          hasMoreMessages: newMessages.length > 0,
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
      console.error(error);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  
  markSeen: (messageIds) => {
    const socket = useAuthStore.getState().socket;
    const currentUser = useAuthStore.getState().authUser;
    if (!socket || !messageIds.length) return;
  
    socket.emit("markSeen", {
      messageIds,               //   use the argument passed in
      userId: currentUser._id,  
    });
  },
  
  
  
  
  
  
  
  subscribeToSeen: () => {
    const socket = useAuthStore.getState().socket;
  
    socket.on("messageSeen", ({ messageId }) => {
      set({
        messages: get().messages.map(m =>
          m._id === messageId ? { ...m, seen: true } : m
        ),
      });
    });
  },
  unsubscribeFromSeen: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("messageSeen");
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] }); // append new message at bottom
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageFromSelectedUser) return;

      set({ messages: [...get().messages, newMessage] });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },
  
  selectUserById: async (userId) => {
    const { users, setSelectedUser } = get();
  
    // 1. Check in existing users list
    let user = users.find(u => u._id === userId);
  
    // 2. If not found, fetch user from backend
    if (!user) {
      try {
        const res = await axiosInstance.get(`/users/${userId}`);
        user = res.data;
      } catch (err) {
        toast.error("User not found");
        return;
      }
    }
  
    // 3. Select the user normally
    setSelectedUser(user);
  },
  setSelectedUser: (selectedUser) =>
    set({
      selectedUser,
      messages: [],
      page: 1,
      hasMoreMessages: true,
    }),
  
}));