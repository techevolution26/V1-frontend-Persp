// app/users/[id]/following/page.jsx

import Link from "next/link";
import TopicsCarousel from "../../../components/TopicsCarousel";

export default async function FollowingPage({ params }) {
  const { id } = await params;

  // Loading profile user to headers
  const userRes = await fetch(`http://localhost:3000/api/users/${id}`, {
    headers: { Accept: "application/json" },
  });
  if (!userRes.ok) {
    throw new Error(`Failed to load user ${id}, status ${userRes.status}`);
  }
  const user = await userRes.json();

  // Loading following list via your proxy
  const res = await fetch(`http://localhost:3000/api/users/${id}/following`, {
    headers: { Accept: "application/json" },
  });

  let following = [];
  if (res.ok) {
    const json = await res.json();

    if (Array.isArray(json)) {
      following = json;
    } else if (Array.isArray(json.data)) {
      // handling  ResourceCollection
      following = json.data;
    } else {
      console.warn("Unexpected following payload:", json);
    }
  } else {
    console.error(`Error fetching following: ${res.status}`);
  }

  return (
    <main className="p-6 space-y-6">
      {/* <TopicsCarousel /> */}

      <section>
        <h1 className="text-2xl font-bold">Users {user.name} Is Following</h1>

        {following.length === 0 ? (
          <p className="text-gray-500 mt-4">
            {user.name} isn’t following anyone yet.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {following.map((u) => (
              <li
                key={u.id}
                className="border p-4 rounded-lg flex items-center space-x-4"
              >
                <img
                  src={u.avatar_url || "/default-avatar.png"}
                  alt={u.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <Link
                    href={`/users/${u.id}`}
                    className="font-medium hover:underline"
                  >
                    {u.name}
                  </Link>
                  {u.profession && (
                    <p className="text-sm text-gray-600">{u.profession}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
