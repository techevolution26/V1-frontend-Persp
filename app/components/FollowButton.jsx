"use client";

import { useState, useEffect } from "react";

export default function FollowButton({ profileUserId }) {
  const [isFollowing, setIsFollowing] = useState(null);
  const [loading, setLoading] = useState(false);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) return setIsFollowing(false);

    (async () => {
      try {
        //fetching followers list
        const res = await fetch(`/api/users/${profileUserId}/followers`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(res.status);

        let payload = await res.json();

        //normalizing to an array
        const followers = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.data)
          ? payload.data
          : [];

        //fetching current user
        const meRes = await fetch("/api/user", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!meRes.ok) throw new Error(meRes.status);
        const me = await meRes.json();

        //checking if current user is in followers
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
    return null; // or a spinner
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        px-4 py-2 rounded 
        ${
          isFollowing
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }
        ${loading ? "opacity-50 cursor-wait" : ""}
      `}
    >
      {loading ? "…" : isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
}
