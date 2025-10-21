import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "dark",
  secondTheme: localStorage.getItem("second-theme") || "wireframe",

  
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme });
  },

  setSecondTheme: (theme) => {
    localStorage.setItem("second-theme", theme);
    set({ theme });
  },
}));