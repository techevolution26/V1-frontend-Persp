// app/topics/[id]/page.jsx

import TopicsCarousel from "../../components/TopicsCarousel";
import PerceptionsList from "../../components/PerceptionList";

export default async function TopicPage({ params }) {
  const { id } = await params;

  //Fetching topic details (public, no token required)
  const topicRes = await fetch(`http://localhost:8000/api/topics/${id}`, {
    headers: { Accept: "application/json" },
  });
  if (!topicRes.ok) {
    throw new Error(`Failed to load topic ${id}, status: ${topicRes.status}`);
  }
  const topic = await topicRes.json();

  return (
    <main className="p-6 space-y-6">
      {/* Topics carousel at the top */}
      {/* <TopicsCarousel /> */}

      {/* Topic title */}
      <h1 className="text-2xl font-bold">{topic.name}</h1>

      {/* Client‐side list of perceptions (handles its own loading/auth) */}
      <PerceptionsList topicId={id} />
    </main>
  );
}
