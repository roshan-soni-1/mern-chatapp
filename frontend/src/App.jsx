import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import ThemesPage from "./pages/ThemesPage.jsx";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";

import { LoaderCircle } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useChatStore } from "./store/useChatStore";
import CheckEmail from "./components/CheckEmail.jsx"

import { 
  requestFirebaseNotificationPermission, 
  onMessageListener, 
  UpdateFcmToken 
} from "./firebase/firebaseMessaging.js";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth,isPendingUser } = useAuthStore();
  const { theme } = useThemeStore();
  const { selectedUser } = useChatStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Request token on load
    requestFirebaseNotificationPermission();

    // Handle foreground messages
    onMessageListener((payload) => {
      alert(`New message: ${payload.notification.title} - ${payload.notification.body}`);
    });

    // Setup token refresh
    UpdateFcmToken();
  }, []);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderCircle className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={(localStorage.getItem("darkMode")=="true")?"dark":theme}>
      {!selectedUser && <Navbar />}
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        {/*
          <Route path="/signup" element={ !authUser ? (isPendingUser ? <CheckEmailPage /> : <SignUpPage />
              ) : (
                <Navigate to="/" />
              )
            }
          />
       */ }
                 <Route path="/signup" element={  isPendingUser ? <CheckEmail/> :!authUser?<SignUpPage/>:
                <Navigate to="/" />
                 
            }
          />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/ThemesPage" element={<ThemesPage />} />
        
        <Route
          path="/profile"
          element={authUser ? <Navigate to={`/profile/${authUser._id}`} /> : <Navigate to="/login" />}
        />

        
        <Route path="/profile/:userId" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;