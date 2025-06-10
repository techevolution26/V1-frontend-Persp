// app/users/[id]/followers/page.jsx

import Link from "next/link";
import UserListGrid from "../../../components/UserListGrid";
import { cookies } from "next/headers";

export default async function FollowersPage({ params }) {
  const { id } = await params;

  //Fetching profile user (server component)
  const userRes = await fetch(`http://localhost:3000/api/users/${id}`, {
    headers: { Accept: "application/json" },
    // no auth needed for public profile
  });
  if (!userRes.ok) throw new Error(`Failed to load user ${id}`);
  const user = await userRes.json();

  //Fetching followers list via our Next proxy
  const folRes = await fetch(`http://localhost:3000/api/users/${id}/followers`, {
    headers: { Accept: "application/json" },
  });
  if (!folRes.ok) throw new Error(`Failed to load followers: ${folRes.status}`);
  const folJson = await folRes.json();
  const followers = Array.isArray(folJson)
    ? folJson
    : Array.isArray(folJson.data)
      ? folJson.data
      : [];

  return (
    <main className="p-6 space-y-6">
      <section>
        <h1 className="text-2xl font-bold">{user.name}’s Followers</h1>
        {followers.length === 0 ? (
          <p className="text-gray-500 mt-4">
            No one is following {user.name} yet.
          </p>
        ) : (
          <UserListGrid users={followers} />
        )}
      </section>
    </main>
  );
}
