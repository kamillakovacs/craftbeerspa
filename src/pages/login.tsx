"use client";
import React, { useEffect, useState } from "react";
import AuthForm from "../components/authform";
import { Router } from "next/router";
const Signup: React.FC = () => {
  const [message, setMessage] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);

  const handleLogin = async (data: { id: string; password: string }) => {
    const res = await fetch("/api/auth/password/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    setMessage(result.message);

    if (res.status === 200) {
      setIsSuccessful(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md">
        {isSuccessful ? (
          <>
            <p className="text-green-500 text-center text-lg font-semibold">Welcome!</p>
          </>
        ) : (
          <AuthForm mode="Login" onSubmit={handleLogin} />
        )}
        {message && <p className={`text-center mt-4 `}>{message}</p>}
      </div>
    </div>
  );
};
export default Signup;
