
import React from "react";

const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen w-screen bg-white dark:bg-black flex flex-col animate-pulse p-4">
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col space-y-8">
        {/* Profile Header Skeleton */}
        <div className=" flex items-start gap-8 flex-wrap">
          {/* Avatar Skeleton */}
          <div className=" skeleton w-20 h-20 md:w-36 md:h-36 bg-gray-300 dark:bg-gray-700 rounded-full" />

          {/* Info Skeleton */}
          <div className=" flex-1 flex flex-col gap-4 min-w-0">
            {/* Username and Buttons */}
            <div className=" flex items-center gap-4 flex-wrap">
              <div className="h-6 w-40 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-6 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-6 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>

            {/* Stats Skeleton */}
            <div className=" flex gap-8 flex-wrap">
              <div className="h-4 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>

            {/* Bio Skeleton */}
            <div className=" flex flex-col gap-2">
              <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        </div>

        {/* Posts Placeholder Skeleton */}
        <div className=" flex-1 flex flex-col justify-center items-center space-y-4">
          <div className="w-16 h-16 rounded-full border-2 border-gray-900 dark:border-white"></div>
          <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;