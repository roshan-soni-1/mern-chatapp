import React, { useEffect, Suspense, lazy, useCallback } from "react";
import { Routes, Route, Navigate,useParams } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useChatStore } from "./store/useChatStore";
import { LoaderCircle } from "lucide-react";
import BottomNav from "./components/BottomNav.jsx";
import { Toaster } from "react-hot-toast";
import CheckEmail from "./components/CheckEmail.jsx";

import { 
  requestFirebaseNotificationPermission, 
  onMessageListener, 
  UpdateFcmToken 
} from "./firebase/firebaseMessaging.js";

//   Lazy load pages for better code splitting
const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const SignUpPage = lazy(() => import("./pages/SignUpPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const SettingsPage = lazy(() => import("./pages/SettingsPage.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));
const FriendsPage = lazy(() => import("./pages/FriendsPage.jsx"));
const ThemesPage = lazy(() => import("./pages/ThemesPage.jsx"));

//   Extract loading component for reusability
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <LoaderCircle className="size-10 animate-spin text-blue-500" />
  </div>
);

//   Extract protected route logic
const ProtectedRoute = ({ children, authUser, redirectTo = "/login" }) => {
  return authUser ? children : <Navigate to={redirectTo} replace />;
};

const PublicRoute = ({ children, authUser, redirectTo = "/" }) => {
  return !authUser ? children : <Navigate to={redirectTo} replace />;
};

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, isPendingUser } = useAuthStore();
  const { theme } = useThemeStore();
  const { selectedUser } = useChatStore();
  const { userId } = useParams();
  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  //show loading screen while checking auth
  if (isCheckingAuth && !authUser) {
    return <LoadingSpinner />;
  }

  // get theme from store instead of localStorage for consistency
  const currentTheme = theme === "dark" || localStorage.getItem("darkMode") === "true" ? "dark" : theme;

  return (
    <div data-theme={currentTheme}>
      {authUser && !selectedUser && !userId && <BottomNav />}

      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Home */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute authUser={authUser}>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute authUser={authUser}>
                <HomePage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/chat/:userId"
            element={
              <ProtectedRoute authUser={authUser}>
                <HomePage />
              </ProtectedRoute>
            }
          />
          {/* Sign Up */}
          <Route
            path="/signup"
            element={
              isPendingUser ? (
                <CheckEmail />
              ) : (
                <PublicRoute authUser={authUser}>
                  <SignUpPage />
                </PublicRoute>
              )
            }
          />

          {/* Login */}
          <Route 
            path="/login" 
            element={
              <PublicRoute authUser={authUser}>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute authUser={authUser}>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/themes" 
            element={
              <ProtectedRoute authUser={authUser}>
                <ThemesPage />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/profile"
            element={
              authUser ? (
                <Navigate to={`/profile/${authUser._id}`} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Profile by ID */}
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute authUser={authUser}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Friends page */}
          <Route
            path="/friends/:userId"
            element={
              <ProtectedRoute authUser={authUser}>
                <FriendsPage />
              </ProtectedRoute>
            }
          />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* Global toast notifications */}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: currentTheme === "dark" ? "#333" : "#fff",
            color: currentTheme === "dark" ? "#fff" : "#333",
          },
        }}
      />
    </div>
  );
};

export default App;