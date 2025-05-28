// app/users/[id]/following/page.jsx

import Link from "next/link";

export default async function FollowingPage({ params }) {
  const { id } = await params;

  // Fetching from our Next proxy
  const res = await fetch(`http://localhost:3000/api/users/${id}/following`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to load following: ${res.status}`);
  }
  const following = await res.json();

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
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {following.map((user) => (
            <li
              key={user.id}
              className="border p-4 rounded-lg flex items-center space-x-4"
            >
              <img
                src={user.avatar_url || "/default-avatar.png"}
                alt={user.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <Link
                  href={`/users/${user.id}`}
                  className="font-medium hover:underline"
                >
                  {user.name}
                </Link>
                {user.profession && (
                  <p className="text-sm text-gray-500">{user.profession}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
