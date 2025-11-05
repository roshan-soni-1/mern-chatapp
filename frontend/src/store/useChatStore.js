import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create(
  persist(
    (set, get) => ({
      messages: [],
      users: [],
      usersCacheTime: 0,   //  cache timestamp
      selectedUser: null,
      isUsersLoading: false,
      isMessagesLoading: false,
      hasMoreMessages: true,
      page: 1,

      //  FETCH USERS WITH CACHE EXPIRY
      getUsers: async () => {
        const { users, usersCacheTime, isUsersLoading } = get();

        const now = Date.now();
        const cacheExpired = now - usersCacheTime > 10 * 60 * 1000; // 10 minutes

        //  Use cached version if valid
        if (users.length > 0 && !cacheExpired && !isUsersLoading) return;

        set({ isUsersLoading: true });

        try {
          const res = await axiosInstance.get("/messages/users");

          set({
            users: res.data,
            usersCacheTime: Date.now(), //  update cache time
          });
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to load users");
        } finally {
          set({ isUsersLoading: false });
        }
      },

      //  Load messages (unchanged)
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

          const newMessages = res.data.messages.map((m) => ({
            ...m,
            seen: m.seen ?? false,
          }));

          if (loadMore) {
            const uniqueNew = newMessages.filter(
              (m) => !messages.some((msg) => msg._id === m._id)
            );

            set({
              messages: [...uniqueNew, ...messages],
              hasMoreMessages: uniqueNew.length > 0,
            });
          } else {
            const unseenIds = newMessages
              .filter((m) => m.senderId === userId && !m.seen)
              .map((m) => m._id);

            if (unseenIds.length) {
              get().markSeen(unseenIds);
            }

            set({
              messages: newMessages,
              hasMoreMessages: newMessages.length > 0,
            });
          }
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to load messages"
          );
          console.error(error);
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      //  mark seen
      markSeen: (messageIds) => {
        const socket = useAuthStore.getState().socket;
        const currentUser = useAuthStore.getState().authUser;
        if (!socket || !messageIds.length) return;

        socket.emit("markSeen", {
          messageIds,
          userId: currentUser._id,
        });
      },

      //  subscribe to seen
      subscribeToSeen: () => {
        const socket = useAuthStore.getState().socket;

        socket.on("messageSeen", ({ messageId }) => {
          set({
            messages: get().messages.map((m) =>
              m._id === messageId ? { ...m, seen: true } : m
            ),
          });
        });
      },

      unsubscribeFromSeen: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("messageSeen");
      },

      //  send message
      sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
          const res = await axiosInstance.post(
            `/messages/send/${selectedUser._id}`,
            messageData
          );
          set({ messages: [...messages, res.data] });
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to send message");
        }
      },

      //  real-time messages
      subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => {
          const isMessageFromSelectedUser =
            newMessage.senderId === selectedUser._id;
          if (!isMessageFromSelectedUser) return;

          set({ messages: [...get().messages, newMessage] });
        });
      },

      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
      },

      //  select user
      selectUserById: async (userId) => {
        const { users, setSelectedUser } = get();

        let user = users.find((u) => u._id === userId);

        if (!user) {
          try {
            const res = await axiosInstance.get(`/users/${userId}`);
            user = res.data;
          } catch (err) {
            toast.error("User not found");
            return;
          }
        }

        setSelectedUser(user);
      },

      setSelectedUser: (selectedUser) =>
        set({
          selectedUser,
          messages: [],
          page: 1,
          hasMoreMessages: true,
        }),
    }),

    {
      name: "chat-storage",

      //  Only persist specific fields
      partialize: (state) => ({
        users: state.users,
        usersCacheTime: state.usersCacheTime,
      }),
    }
  )
);