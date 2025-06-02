"use client";
import { PlusIcon, BellIcon, HomeIcon, HomeModernIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar({ onNewClick = () => { } }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

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

  const handleHomeClick = () => {
    router.push("/");
  };

  const handleUserAvatar = () => {
    router.push(`/users/${user.id}`);
  };


  return (
    <>
      <button title="Create New" onClick={onNewClick}>
        <PlusIcon className="h-6 w-6 text-gray-600" />
      </button>

      <button title="Notifications">
        <BellIcon className="h-6 w-6 text-gray-600" />
      </button>
      <button title="Home" onClick={handleHomeClick}>
        <HomeIcon className="h-6 w-6 text-gray-600" />
      </button>
      <button title="My Profile" onClick={handleUserAvatar}>
        {user && user.avatar_url ? (
          <img
            src={user.avatar_url || `/default-avatar.png`}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-300" />
        )}
      </button>
    </>
  );
}
