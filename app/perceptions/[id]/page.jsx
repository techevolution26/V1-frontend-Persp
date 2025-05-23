// app/perceptions/[id]/page.jsx

"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import CommentsList from "../../components/CommentsList";
import NewCommentForm from "../../components/NewCommentForm";

export default function PerceptionDetail() {
  const { id } = useParams();
  const [perception, setPerception] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/perceptions/${id}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        setPerception(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id, token]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!perception) return <p>No data</p>;

  return (
    <main className="p-6 space-y-6">
      <article className="border p-4 rounded-lg">
        <h2 className="text-xl font-bold">{perception.body}</h2>
        <p className="text-gray-500">
          by <strong>{perception.user.name}</strong> in{" "}
          <em>{perception.topic.name}</em>
        </p>
      </article>

      <section>
        <h3 className="text-lg font-semibold mb-2">Comments</h3>
        <CommentsList perceptionId={id} />
        <NewCommentForm
          perceptionId={id}
          onAdd={(newComment) => {
            // lift state or refetch comments:
            // simplest: reload CommentsList by keying it on a state -ill reconfigure later
          }}
        />
      </section>
    </main>
  );
}
