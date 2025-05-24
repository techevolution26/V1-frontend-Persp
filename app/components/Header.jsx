// components/Header.jsx
"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [user, setUser] = useState(null);

  // Fetching the logged-in user on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/user", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  return (
    <header className="flex items-center space-x-4 p-4 bg-white shadow">
      {/* Avatar (or placeholder) */}
      {user && user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.name}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-gray-300" />
      )}

      {/* Greeting */}
      <h1 className="text-lg font-semi-bold">
        {user ? `Welcome Back, ${user.name}` : "Welcome"}
      </h1>

      <div className="flex-1" />
    </header>
  );
}
