import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useChatStore } from "./store/useChatStore";
import { LoaderCircle } from "lucide-react";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import CheckEmail from "./components/CheckEmail.jsx";

import { 
  requestFirebaseNotificationPermission, 
  onMessageListener, 
  UpdateFcmToken 
} from "./firebase/firebaseMessaging.js";

// ✅ Lazy load pages (automatic chunk splitting)
const HomePage = lazy(() => import("./pages/HomePage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const FriendsPage = lazy(() => import("./pages/FriendsPage.jsx"));
const ThemesPage = lazy(() => import("./pages/ThemesPage.jsx"));

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, isPendingUser } = useAuthStore();
  const { theme } = useThemeStore();
  const { selectedUser } = useChatStore();

  // ✅ Check authentication on load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ✅ Firebase notification setup
  useEffect(() => {
    requestFirebaseNotificationPermission();

    // Listen for foreground messages
    onMessageListener((payload) => {
      alert(`New message: ${payload.notification.title} - ${payload.notification.body}`);
    });

    // Refresh FCM token if needed
    UpdateFcmToken();
  }, []);

  // ✅ Show loading screen while checking auth
  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderCircle className="size-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div data-theme={localStorage.getItem("darkMode") === "true" ? "dark" : theme}>
      {/* Navbar hidden when chat is open */}
      {!selectedUser && <Navbar />}

      {/* Lazy loading fallback */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <LoaderCircle className="size-10 animate-spin text-blue-500" />
          </div>
        }
      >
        <Routes>
          {/* Home */}
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />

          {/* Sign Up */}
          <Route
            path="/signup"
            element={
              isPendingUser ? (
                <CheckEmail />
              ) : !authUser ? (
                <SignUpPage />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* Login */}
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />

          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />

          {/* Themes */}
          <Route path="/ThemesPage" element={<ThemesPage />} />

          {/* Profile redirect for self */}
          <Route
            path="/profile"
            element={
              authUser ? (
                <Navigate to={`/profile/${authUser._id}`} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Profile by ID */}
          <Route
            path="/profile/:userId"
            element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
          />

          {/* Friends page */}
          <Route
            path="/friends/:userId"
            element={authUser ? <FriendsPage /> : <Navigate to="/login" />}
          />
        </Routes>
      </Suspense>

      <Toaster />
    </div>
  );
};

export default App;