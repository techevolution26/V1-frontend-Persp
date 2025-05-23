"use client";
import { useEffect, useState } from "react";
// import TopicsCarousel from './components/TopicsCarousel'

export default function HomePage() {
  const [topics, setTopics] = useState([]);
  const [perceptions, setPerceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    async function load() {
      // get topics
      const t = await fetch("/api/topics", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      setTopics(t);

      //get all perceptions with counts
      // const p = await fetch('/api/perceptions', {
      //   headers:{ Authorization:`Bearer ${token}` }
      // }).then(r=>r.json())
      // setPerceptions(p)
      const res2 = await fetch("/api/perceptions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let perData = [];
      if (res2.ok) {
        // try to parse, fallback to empty array
        const text = await res2.text();
        perData = text ? JSON.parse(text) : [];
      } else {
        console.error("Error fetching perceptions:", res2.status);
      }

      setPerceptions(perData);

      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) return <p>Loading…</p>;

  // group by topic
  const byTopic = topics.map((topic) => ({
    ...topic,
    items: perceptions.filter((p) => p.topic.id === topic.id).slice(0, 3),
  }));

  return (
    <main className="p-6 space-y-12">
      {/* <TopicsCarousel /> */}

      {byTopic.map((group) => (
        <section key={group.id}>
          <h2 className="text-xl font-semibold mb-4">{group.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {group.items.map((p) => (
              <article key={p.id} className="border rounded-lg p-4 relative">
                <div className="flex items-center mb-2">
                  <img
                    src={p.user.avatar_url}
                    alt={p.user.name}
                    className="h-8 w-8 rounded-full mr-2"
                  />
                  <span className="font-medium">{p.user.name}</span>
                  <span className="ml-auto text-sm text-gray-500">
                    {/* three-dot menu */}⋮
                  </span>
                </div>
                <p className="h-20 overflow-hidden text-gray-800">{p.body}</p>
                <div className="flex items-center mt-4 text-sm text-gray-600 space-x-4">
                  <button className="flex items-center">
                    <svg className="h-5 w-5 mr-1" /* ♥ icon */></svg>
                    {p.likes_count}
                  </button>
                  <button className="flex items-center">
                    <svg className="h-5 w-5 mr-1" /* 💬 icon */></svg>
                    {p.comments_count}
                  </button>
                </div>
              </article>
            ))}
            {/* if fewer than 3, you could show an “→” card linking to /topics/[id] */}
            {group.items.length >= 3 && (
              <div className="flex items-center justify-center border rounded-lg">
                <a href={`/topics/${group.id}`} className="text-blue-600">
                  →
                </a>
              </div>
            )}
          </div>
        </section>
      ))}
    </main>
  );
}
