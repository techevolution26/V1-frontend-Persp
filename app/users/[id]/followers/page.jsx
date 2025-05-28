// app/users/[id]/followers/page.jsx

import Link from "next/link";
import TopicsCarousel from "../../../components/TopicsCarousel";

export default async function FollowersPage({ params }) {
  const { id } = await params;

  // Fetching user info
  const userRes = await fetch(`http://localhost:8000/api/users/${id}`, {
    headers: { Accept: "application/json" },
  });
  if (!userRes.ok) {
    throw new Error(`Failed to load user ${id}, status ${userRes.status}`);
  }
  const user = await userRes.json();

  // Fetching followers list via our proxy
  const res = await fetch(`http://localhost:8000/api/users/${id}/followers`, {
    headers: { Accept: "application/json" },
  });

  let followers = [];
  if (res.ok) {
    const json = await res.json();

    // Normalize to an array
    if (Array.isArray(json)) {
      followers = json;
    } else if (Array.isArray(json.data)) {
      //Backend ResourceCollections come as { data: [...] }
      followers = json.data;
    } else {
      console.warn("Unexpected followers payload:", json);
      followers = [];
    }
  } else {
    console.error(`Error fetching followers: ${res.status}`);
    // throwing error here || page
  }

  return (
    <main className="p-6 space-y-6">
      {/* <TopicsCarousel /> */}

      <section>
        <h1 className="text-2xl font-bold">{user.name}’s Followers</h1>

        {followers.length === 0 ? (
          <p className="text-gray-500 mt-4">
            No one is following {user.name} yet.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {followers.map((f) => (
              <li
                key={f.id}
                className="border p-4 rounded-lg flex items-center space-x-4"
              >
                <img
                  src={f.avatar_url || "/default-avatar.png"}
                  alt={f.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <Link
                    href={`/users/${f.id}`}
                    className="font-medium hover:underline"
                  >
                    {f.name}
                  </Link>
                  {f.profession && (
                    <p className="text-sm text-gray-600">{f.profession}</p>
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
