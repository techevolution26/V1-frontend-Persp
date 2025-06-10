// app/users/[id]/following/page.jsx

import Link from "next/link";
import UserListGrid from "../../../components/UserListGrid";

export default async function FollowingPage({ params }) {
  const { id } = await params;

  //Fetching the list of users this profile follows
  const res = await fetch(`http://localhost:3000/api/users/${id}/following`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Failed to load following: ${res.status}`);
  }
  const json = await res.json();
  const following = Array.isArray(json)
    ? json
    : Array.isArray(json.data)
      ? json.data
      : [];

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">
        {following.length
          ? `Following ${following.length} user${following.length > 1 ? "s" : ""}`
          : "Not following anyone yet"}
      </h1>

      {following.length === 0 ? (
        <p className="text-gray-500">
          This user isn’t following anyone yet.
        </p>
      ) : (
        <UserListGrid users={following} />
      )}
    </main>
  );
}
