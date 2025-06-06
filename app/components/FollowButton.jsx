"use client";

import { useState, useEffect } from "react";
import { UserPlusIcon, UserMinusIcon } from "@heroicons/react/24/outline";
import { Spinner } from "./Spinner";

export default function FollowButton({ profileUserId }) {
  const [isFollowing, setIsFollowing] = useState(null);
  const [loading, setLoading] = useState(false);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) return setIsFollowing(false);

    (async () => {
      try {
        // Fetching followers list
        const res = await fetch(`/api/users/${profileUserId}/followers`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(res.status);

        let payload = await res.json();

        // Normalizing to an array
        const followers = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.data)
            ? payload.data
            : [];

        // Fetching current user
        const meRes = await fetch("/api/user", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!meRes.ok) throw new Error(meRes.status);
        const me = await meRes.json();

        // Checking if current user is in followers
        setIsFollowing(followers.some((u) => u.id === me.id));
      } catch (err) {
        console.error("FollowButton init error:", err);
        setIsFollowing(false);
      }
    })();
  }, [profileUserId, token]);

  const handleClick = async () => {
    if (!token) return alert("Please log in to follow users.");
    setLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`/api/users/${profileUserId}/follow`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(res.status);
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error("FollowButton action error:", err);
      alert("Action failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isFollowing === null) {
    return <div className="w-24 h-10 rounded-lg bg-gray-100 animate-pulse" />;
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        relative flex items-center justify-center gap-2
        px-4 py-2 rounded-lg font-medium text-sm
        transition-all duration-200 ease-out
        shadow-sm hover:shadow-md
        ${isFollowing
          ? "bg-white text-gray-800 border border-gray-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          : "bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
        }
        ${loading ? "opacity-80 pointer-events-none" : ""}
        overflow-hidden group
      `}
    >
      {loading ? (
        <Spinner className="h-4 w-4" />
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

      {/* Animated background effect */}
      <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
    </button>
  );
}