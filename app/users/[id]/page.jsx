import RecentPerceptions from "../../components/RecentPerceptions";
import ProfileEditor from "../../components/ProfileEditor";
import FollowButton from "@/app/components/FollowButton";
// import TopicsCarousel from "../../components/TopicsCarousel";
import Link from "next/link";

export default async function UserProfile({ params }) {
  const { id } = await params;

  const res = await fetch(`http://localhost:8000/api/users/${id}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error("Failed to fetch User ${id} data");
  const user = await res.json();

  return (
    <main className="p-6 space-y-6">
      {/* <TopicsCarousel /> */}
      {/*Profile header*/}
      <ProfileEditor initialUser={user} isOwnProfile={false} />
      <section className="border-b pb-4 mb-6">
        {/* <h1 className="text-3xl font-bold">{user.name}</h1> */}
        <p className="text-gray-600">
          Joined {new Date(user.created_at).toLocaleDateString()}
        </p>
        <div className="flex space-x-6 mt-2 text-sm text-gray-700">
          <Link href={`/users/${id}/perceptions`} className="hover:underline">
            {user.perceptions_count} perceptions
          </Link>

          <Link href={`/users/${id}/followers`} className="hover:underline">
            {user.follower_count} followers
          </Link>

          <Link href={`/users/${id}/following`} className="hover:underline">
            {user.following_count} following
          </Link>
        </div>
      </section>
      {/*Show recent perceptions*/}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Perceptions</h2>
        <RecentPerceptions userId={id} />
      </section>
    </main>
  );
}
