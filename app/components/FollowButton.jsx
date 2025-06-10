// app/components/FollowButton.jsx
"use client";

import { useState, useEffect } from "react";
import { UserPlusIcon, UserMinusIcon } from "@heroicons/react/24/outline";
import useCurrentUser from "../hooks/useCurrentUser";
import { Spinner } from "./Spinner";

export default function FollowButton({ profileUserId }) {
  // get current user
  const { user: me, loading: meLoading } = useCurrentUser();

  // local state for “am I following?” and for button action loading
  const [isFollowing, setIsFollowing] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // once we know me.id, fetch the followers list and decide
  useEffect(() => {
    if (!me) {
      setIsFollowing(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/users/${profileUserId}/followers`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const payload = await res.json();
        const followers = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.data)
            ? payload.data
            : [];
        if (!cancelled) {
          setIsFollowing(followers.some((u) => u.id === me.id));
        }
      } catch (err) {
        console.error("Failed to load followers:", err);
        if (!cancelled) setIsFollowing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [me, profileUserId]);

  // clicking toggles follow/unfollow
  const handleClick = async () => {
    if (!me) {
      alert("Please log in to follow users.");
      return;
    }
    setActionLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`/api/users/${profileUserId}/follow`, {
        method,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed (${res.status}): ${text}`);
      }
      setIsFollowing((prev) => !prev);
    } catch (err) {
      console.error("Follow/unfollow error:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // rendering skeleton until we know isFollowing
  if (meLoading || isFollowing === null) {
    return <div className="h-10 w-24 bg-gray-100 animate-pulse rounded-lg" />;
  }

  return (
    <button
      onClick={handleClick}
      disabled={actionLoading}
      className={`
        relative flex items-center justify-center gap-2
        px-4 py-2 rounded-lg font-medium text-sm
        transition-all duration-200 ease-out
        shadow-sm hover:shadow-md
        ${isFollowing
          ? "bg-white text-gray-800 border border-gray-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          : "bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
        }
        ${actionLoading ? "opacity-80 pointer-events-none" : ""}
        overflow-hidden group
      `}
    >
      {actionLoading ? (
        <Spinner className="h-4 w-4 text-current" />
      ) : (
        <>
          {isFollowing ? (
            <UserMinusIcon className="h-4 w-4" />
          ) : (
            <UserPlusIcon className="h-4 w-4" />
          )}
          <span>{isFollowing ? "Following" : "Follow"}</span>
        </>
      )}
      <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
    </button>
  );
}
