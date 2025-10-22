// SidebarSkeleton.jsx
import React from "react";

const SidebarSkeleton = () => {
  // Render 6 placeholder items
  const placeholders = Array.from({ length: 6 });

  return (
    <div className="flex-1 overflow-y-auto bg-base-100 p-4 space-y-4">
      {placeholders.map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 p-4 border-b border-base-300 animate-pulse"
        >
          {/* Avatar skeleton */}
          <div className=" skeleton w-12 h-12 bg-gray-500 rounded-full" />

          {/* Text skeleton */}
          <div className="  flex-1 space-y-2 min-w-0">
            <div className=" skeleton h-4 bg-gray-500 rounded w-3/4" />
            <div className="skeleton h-3 bg-gray-400 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SidebarSkeleton;