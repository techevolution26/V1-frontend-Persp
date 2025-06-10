"use client";

import { PlusIcon, BellIcon, HomeIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import useCurrentUser from "../hooks/useCurrentUser";

export default function Sidebar({ onNewClick = () => { } }) {
  const { user, loading } = useCurrentUser();
  const router = useRouter();

  const go = (path) => router.push(path);

  return (
    <nav className="flex flex-col items-center space-y-6">
      <button
        onClick={onNewClick}
        title="New Perception"
        aria-label="Create New"
        className="hover:bg-gray-100 p-2 rounded-full transition"
      >
        <PlusIcon className="h-6 w-6 text-gray-600" />
      </button>

      <button
        title="Notifications"
        aria-label="Notifications"
        className="hover:bg-gray-100 p-2 rounded-full transition"
      >
        <BellIcon className="h-6 w-6 text-gray-600" />
      </button>

      <button
        onClick={() => go("/")}
        title="Home"
        aria-label="Home"
        className="hover:bg-gray-100 p-2 rounded-full transition"
      >
        <HomeIcon className="h-6 w-6 text-gray-600" />
      </button>

      <button
        onClick={() => user && go(`/users/${user.id}`)}
        title="My Profile"
        aria-label="Profile"
        className="hover:ring-2 ring-indigo-300 p-1 rounded-full transition"
      >
        {loading ? (
          <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
        ) : user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-300" />
        )}
      </button>
    </nav>
  );
}
