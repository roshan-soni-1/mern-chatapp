import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, PlusSquare, User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser } = useAuthStore();

  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
      isActive: location.pathname === "/"
    },
//     {
//       icon: PlusSquare,
//       label: "Create",
//       path: "/create",
//       isActive: location.pathname === "/create"
//     },
    {
      icon: User,
      label: "Profile",
      path: `/profile/${authUser?._id}`,
      isActive: location.pathname === `/profile/${authUser?._id}`,
      isProfile: true
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 z-50 ">
      <div className="flex items-center justify-around h-12">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex items-center justify-center flex-1 h-full relative"
              aria-label={item.label}
            >
              {item.isProfile ? (
                <div className="relative">
                  <img
                    src={authUser?.profilePic || "/avatar.png"}
                    alt="Profile"
                    className={`w-6 h-6 rounded-full object-cover ${
                      item.isActive
                        ? "ring-2 ring-gray-900 dark:ring-white"
                        : ""
                    }`}
                  />
                </div>
              ) : (
                <Icon
                  className={`w-6 h-6 ${
                    item.isActive
                      ? "text-gray-900 dark:text-gray-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                  strokeWidth={item.isActive ? 2.5 : 2}
                  fill={item.isActive ? "currentColor" : "none"}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;