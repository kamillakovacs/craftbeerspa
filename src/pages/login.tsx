"use client";
import { useEffect, useState } from "react";
import AuthForm from "../components/authform";
import router from "next/router";
const Signup: React.FC = () => {
  const [message, setMessage] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async (data: { id: string; password: string }) => {
    useEffect(() => {
      if (isLoggedIn) {
        router.push("/admin");
      }
    }, [isLoggedIn]);

    const res = await fetch("/api/auth/password/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    setMessage(result.message);

    if (res.status === 201) {
      setIsSuccessful(true);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
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
          <AuthForm mode="Signup" onSubmit={handleLogin} />
        )}
        {message && (
          <p className={`text-center mt-4 ${setIsLoggedIn ? "text-green-500" : "text-red-500"}`}>{message}</p>
        )}
      </div>
    </div>
  );
};
export default Signup;
