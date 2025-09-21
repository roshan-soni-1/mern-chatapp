import React, { useState,useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { LogOut, MessageSquare, Settings, User,LogIn } from "lucide-react";
import { THEMES } from "../constants";
import UserProfilePage from "../components/UserProfile.jsx"

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode")=="true");
  const [notifications, setNotifications] = useState(true);
  const { authUser,logout } = useAuthStore();
  const { theme, setTheme,secondTheme,setSecondTheme } = useThemeStore();
  useEffect(() => {
    if (darkMode) {
      setSecondTheme("dark")
      localStorage.setItem("darkMode", "true");
      
    }else{
      setTheme(localStorage.getItem("chat-theme"))
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode,setTheme]);
  useEffect(() => {
    if (notifications && "Notification" in window) {
      Notification.requestPermission().then(async (permission) => {
        if (permission === "granted") {
          console.log("Notifications enabled!");
          new Notification("Notifications are enabled!", {
            icon: "/icon.png",
            body: "You’ll now receive updates.",
          });
        } else {
          console.log("Notifications denied or dismissed.");
        }
      });
    }
  }, [notifications]);
  const [UpdateProfile, setUpdateProfile] = useState(false);
  
  if (UpdateProfile) {
    return <UserProfilePage/>
  }else{

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">⚙️ Settings</h1>

      {/* Profile */}
      <div className="mb-6 border rounded-lg p-4 bg-base-200">
        <h2 className="text-lg font-semibold mb-3">Profile</h2>
        <div className="flex items-center gap-4">
          <img
          src={authUser?.profilePic || "/avatar.png"}
          alt="Profile"
          className="w-10 rounded-full object-cover border-4 "
              />
          
          <div>
            <p className="font-medium">{authUser?.fullName?? "John Doe"}</p>
            <p className="text-sm opacity-70">Available</p>
          </div>
        </div>
        {/*
        <Link
          to="/Profile"
          className="btn btn-sm mt-3"
        >
          Edit Profile
        </Link>
        */}
        <span className="btn btn-sm mt-3" onClick={()=>setUpdateProfile(true)}>Edit Profile
        </span>
      </div>

      {/* Appearance */}
      <div className="mb-6 border rounded-lg p-4 bg-base-200">
        <h2 className="text-lg font-semibold mb-3">Appearance</h2>
        <div className="flex items-center justify-between">
          <span>Dark Mode</span>
          <input
            type="checkbox"
            className="toggle"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
        </div>
        <Link
          to="/ThemesPage"
          className="btn btn-sm mt-3"
        >
          Choose Theme
        </Link>
      </div>

      {/* Notifications */}
      <div className="mb-6 border rounded-lg p-4 bg-base-200">
        <h2 className="text-lg font-semibold mb-3">Notifications</h2>
        <div className="flex items-center justify-between">
          <span>Enable Notifications</span>
          <input
            type="checkbox"
            className="toggle"
            checked={notifications}
            onChange={() => setNotifications(!notifications)}
          />
        </div>
      </div>

      {/* Privacy */}
      <div className="mb-6 border rounded-lg p-4 bg-base-200">
        <h2 className="text-lg font-semibold mb-3">Privacy</h2>
        <ul className="space-y-2">
          <li>
            <Link to="/BlockedUsers" className="link">
              Manage Blocked Users
            </Link>
          </li>
          <li>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="checkbox" />
              Show Read Receipts
            </label>
          </li>
        </ul>
      </div>

      {/* Account */}
      
      <div className="border rounded-lg p-4 bg-base-200">
        <h2 className="text-lg font-semibold mb-3">Account</h2>
        
          
          {!authUser?(<>
          <button className="btn btn-sm btn-success w-full">
            <Link to="/">
            <LogIn className="size-5" />Login
            <span className="hidden sm:inline">Login</span>
            </Link>
          </button>
          </>):(<>
            <button className="btn btn-sm btn-error w-full" onClick={logout}>
          <LogOut className="size-5" />
          Logout
          <span className="hidden sm:inline">Logout</span>
          </button>
          </>)
          }
      
          
        {/*<button className="btn btn-sm btn-outline btn-error w-full mt-2">
          Delete Account
        </button> */}
      </div>
    </div>
  );
}
};

export default SettingsPage;