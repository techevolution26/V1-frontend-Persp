import ProfileSection from "../../components/ProfileSection";
import RecentPerceptions from "../../components/RecentPerceptions";

export default async function UserProfile({ params }) {
  const { id } = await params;

  const res = await fetch(`http://localhost:8000/api/users/${id}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`Failed to fetch User ${id} data`);

  const user = await res.json();

  return (
    <main className="p-6 space-y-6">
      <ProfileSection user={user} />
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Perceptions</h2>
        <RecentPerceptions userId={id} />
      </section>
    </main>
  );
}
