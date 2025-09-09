// app/topics/[id]/page.jsx

import TopicsCarousel from "../../components/TopicsCarousel";
import PerceptionsList from "../../components/PerceptionList";

export default async function TopicPage({ params }) {
  const { id } = await params;
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";


  const topicRes = await fetch(`${API_BASE}/api/topics/${id}`, {
    headers: { Accept: "application/json" },
    // Optionally: cache: "no-store" for real-time
  });

  if (!topicRes.ok) {
    throw new Error(`Failed to load topic ${id}, status: ${topicRes.status}`);
  }

  const topic = await topicRes.json();

  return (
    <main className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-1">{topic.name}</h1>
        {topic.description && (
          <p className="text-sm text-gray-500">{topic.description}</p>
        )}
      </div>

      <PerceptionsList topic={topic} />
    </main>
  );
}