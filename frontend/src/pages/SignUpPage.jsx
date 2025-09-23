import { useState,useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";

import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";
import { createUserWithEmailAndPassword } from "firebase/auth";
import CheckEmail from "../components/CheckEmail.jsx"
import { axiosNoPrefix } from "../lib/axios.js";

const SignUpPage = () => {
  const {loginWithGoogle,firebaseSignup,authUser} = useAuthStore();
  
  
  
  
  
  const [showPassword, setShowPassword] = useState(false);
  const [isUsernameAvailable, setisUsernameAvailable] = useState(false);
  console.log(isUsernameAvailable)
  const [isEmailCorrect, setisEmailCorrect] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    userName: "",
  });

  const { signup, isSigningUp,isPendingUser } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

    return true;
    };
    useEffect(() => {
    if (!formData.email) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await axiosNoPrefix.get(
          `/verify/check-email?email=${encodeURIComponent(formData.email)}`,
          { signal: controller.signal }
        );
        setisEmailCorrect(res.data.isCorrect);
      } catch (err) {
        if (err.name !== 'CanceledError') console.error(err);
      }
    }, 1000);
  
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [formData.email]);

  useEffect(() => {
    if (!formData.userName) return;
  
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await axiosNoPrefix.get(
          `/verify/check-username?username=${encodeURIComponent(formData.userName)}`,
          { signal: controller.signal }
        );
        setisUsernameAvailable(res.data.available);
      } catch (err) {
        if (err.name !== 'CanceledError') {
          console.error("Username availability check error:", err);
        }
      }
    }, 1000);
  
    return () => {
      clearTimeout(timer);
      controller.abort(); // cancel previous request
    };
  }, [formData.userName]);  

  const handleSubmit = (e) => {
    e.preventDefault();

    const success = validateForm();

    if (success === true && isUsernameAvailable && isEmailCorrect) signup(formData);
  };
  
 if (isPendingUser) {
  return <CheckEmail email={authUser?.email} />;
}
 else{
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* LOGO */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-colors"
              >
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">Get started with your free account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" />
                </div>
                
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Username</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="full_name"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                />
                {formData.userName && (
                  <p className={`mt-1 text-sm ${isUsernameAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    {isUsernameAvailable ? 'Username available ✅' : 'Username taken ❌'}
                  </p>
                )}
              </div>
            </div>
            
            
            

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                {formData.email && (
                  <p className={`mt-1 text-sm ${isEmailCorrect ? "text-green-600" : "text-red-600"}`}>
                    {isEmailCorrect ? "" : "Email is invalid ❌"}
                  </p>
                )}
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}>
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
                    <button
    onClick={loginWithGoogle}
    className="w-full flex items-center justify-center gap-x-3 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-100 transition duration-300 active:bg-gray-100"
>
    <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_17_40)">
            <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4" />
            <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853" />
            <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04" />
            <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335" />
        </g>
        <defs>
            <clipPath id="clip0_17_40">
                <rect width="48" height="48" fill="white" />
            </clipPath>
        </defs>
    </svg>
    Continue with Google
</button>

          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* right side */}

      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />
    </div>
  );
};
}
export default SignUpPage;
