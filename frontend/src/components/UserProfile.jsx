import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { 
  Camera, 
  Mail, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ChevronRight,
  LogOut,
  Shield,
  Bell,
  Moon,
  Globe,
  HelpCircle,
  Info,
  Loader2,
  X,
  Check
} from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const UserProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, logout } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const img = new Image();
      img.src = reader.result;

      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 500;
        const maxHeight = 500;
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        setSelectedImg(compressedBase64);

        try {
          await updateProfile({ profilePic: compressedBase64 });
          toast.success("Profile picture updated");
        } catch (err) {
          toast.error("Failed to update profile picture");
        }
        canvas.remove();
      };
    };
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await axiosInstance.put("/auth/update-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success("Password updated successfully");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setActiveSection(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      toast.success("Logged out successfully");
    }
  };

  const settingsSections = [
    {
      id: "account",
      icon: User,
      title: "Account",
      description: "Edit profile, change password",
      color: "text-blue-500"
    },
    {
      id: "security",
      icon: Shield,
      title: "Security & Privacy",
      description: "Password, two-factor authentication",
      color: "text-green-500"
    },
    {
      id: "notifications",
      icon: Bell,
      title: "Notifications",
      description: "Push, email, SMS notifications",
      color: "text-purple-500"
    },
    {
      id: "appearance",
      icon: Moon,
      title: "Appearance",
      description: "Dark mode, theme preferences",
      color: "text-orange-500"
    },
    {
      id: "language",
      icon: Globe,
      title: "Language",
      description: "Change language preferences",
      color: "text-pink-500"
    },
    {
      id: "help",
      icon: HelpCircle,
      title: "Help & Support",
      description: "Get help, contact support",
      color: "text-cyan-500"
    },
    {
      id: "about",
      icon: Info,
      title: "About",
      description: "App info, terms, privacy policy",
      color: "text-gray-500"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-16 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Settings
            </h1>
            {activeSection && (
              <button
                onClick={() => setActiveSection(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-900 dark:text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {!activeSection ? (
          <>
            {/* Profile Section */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <img
                    src={selectedImg || authUser?.profilePic || "/avatar.png"}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <label
                    aria-label="Upload profile picture"
                    className={`
                      absolute bottom-0 right-0 
                      bg-blue-500 hover:bg-blue-600
                      p-1.5 rounded-full cursor-pointer 
                      transition-all duration-200
                      ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                    `}
                  >
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUpdatingProfile}
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {authUser?.userName}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {authUser?.email}
                  </p>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Full Name</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {authUser?.fullName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Member Since</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {authUser?.createdAt 
                        ? new Date(authUser.createdAt).toLocaleDateString() 
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status</span>
                    <span className="font-medium text-green-500 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Sections */}
            <div className="space-y-2 mb-6">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  >
                    <div className={`p-2 rounded-lg bg-white dark:bg-black ${section.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {section.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {section.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                );
              })}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </button>
          </>
        ) : activeSection === "security" ? (
          /* Password Change Form */
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Change Password
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Update your password to keep your account secure
              </p>
            </div>

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>

            {/* Forgot Password */}
            <div className="text-center">
              <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                Forgot your password?
              </button>
            </div>
          </div>
        ) : (
          /* Other sections placeholder */
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {settingsSections.find(s => s.id === activeSection)?.title} settings coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;