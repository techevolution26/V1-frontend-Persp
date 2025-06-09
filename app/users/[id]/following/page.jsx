// app/users/[id]/following/page.jsx

import Link from "next/link";
import UserListGrid from "../../../components/UserListGrid";

export default async function FollowingPage({ params }) {
  const { id } = await params;

  // Fetching following
  const res = await fetch(`http://localhost:3000/api/users/${id}/following`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to load following: ${res.status}`);
  }

  let following = [];
  const json = await res.json();
  following = Array.isArray(json)
    ? json
    : Array.isArray(json.data)
      ? json.data
      : [];

  // Fetching current user (anonymous)
  const meRes = await fetch("http://localhost:8000/api/user", {
    headers: {
      Accept: "application/json",
    },
  });

  const me = meRes.ok ? await meRes.json() : null;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {following.length
          ? `Following ${following.length} People`
          : "Not following anyone yet"}
      </h1>

      {following.length === 0 ? (
        <p className="text-gray-500">This user isn’t following anyone yet.</p>
      ) : (
        <UserListGrid users={following} currentUserId={me?.id} />
      )}
    </main>
  );
}
