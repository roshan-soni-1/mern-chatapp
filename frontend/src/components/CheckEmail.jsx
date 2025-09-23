import React from "react";
import { MailCheck, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore.js";

const CheckEmail = ({ email }) => {
  
  const {authUser}=useAuthStore();
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <motion.div
        className="bg-white p-8 rounded-lg shadow-md text-center max-w-sm w-full"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="flex justify-center mb-4 text-green-600"
          initial={{ scale: 0.5, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <MailCheck size={48} />
        </motion.div>

        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Check your email!
        </h2>

        <p className="text-gray-700">
          We’ve sent a verification link to{" "}
          <strong>{authUser.email || "your email"}</strong>.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Please click the link in your inbox to activate your account.
        </p>

        <motion.div
          className="mt-6 inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full cursor-pointer"
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <Mail size={20} />
          Open Email
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CheckEmail;