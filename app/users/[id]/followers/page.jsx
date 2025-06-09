// app/users/[id]/followers/page.jsx
import Link from "next/link";
import UserListGrid from "../../../components/UserListGrid";

export default async function FollowersPage({ params }) {
  const { id } = await params;

  // Fetching users
  const userRes = await fetch(`http://localhost:8000/api/users/${id}`);
  if (!userRes.ok) {
    throw new Error(`Failed to load user ${id}`);
  }
  const user = await userRes.json();

  // Fetching followers
  const res = await fetch(`http://localhost:8000/api/users/${id}/followers`);
  let followers = [];
  if (res.ok) {
    const json = await res.json();
    followers = Array.isArray(json)
      ? json
      : Array.isArray(json.data)
        ? json.data
        : [];
  }

  // Fetch current user (anonymous, no token)
  const meRes = await fetch("http://localhost:8000/api/user", {
    headers: {
      Accept: "application/json",
    },
  });
  const me = meRes.ok ? await meRes.json() : null;

  return (
    <main className="p-6 space-y-6">
      <section>
        <h1 className="text-2xl font-bold">{user.name}’s Followers</h1>
        {followers.length === 0 ? (
          <p className="text-gray-500 mt-4">No one is following {user.name} yet.</p>
        ) : (
          <UserListGrid users={followers} currentUserId={me?.id} />
        )}
      </section>
    </main>
  );
}
