// app/perceptions/[id]/page.jsx
"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import PerceptionCard from "../../components/PerceptionCard";
import NewCommentForm from "../../components/NewCommentForm";
import CommentsList from "../../components/CommentsList";
import useLikeToggle from "../../hooks/useLikeToggle";

export default function PerceptionDetailPage() {
  const { id } = useParams();
  const [perception, setPerception] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toggleLike = useLikeToggle();

  // Helper: recursively ensuring every node has replies: []
  function normalize(list) {
    return (list || []).map((c) => ({
      ...c,
      replies: normalize(c.replies),
    }));
  }

  // Fetching perception + comments
  useEffect(() => {
    async function loadAll() {
      try {
        const [pRes, cRes] = await Promise.all([
          fetch(`/api/perceptions/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          // setPerception(await res.json()),

          fetch(`/api/perceptions/${id}/comments`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);

        if (!pRes.ok)
          throw new Error(`Perception fetch failed: ${pRes.status}`);
        if (!cRes.ok)
          throw new Error(`Comments fetch failed:   ${cRes.status}`);

        const [pData, cData] = await Promise.all([pRes.json(), cRes.json()]);

        setPerception(pData);
        setComments(normalize(cData));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [id]);

  function handleLikeUpdate(pid, liked, likes_count) {
    setPerception((p) =>
      p.id === pid ? { ...p, liked_by_user: liked, likes_count } : p
    );
  }
  // Safely prepending a new top‐level comment
  const addComment = (newComment) => {
    setComments((prev) => [{ ...newComment, replies: [] }, ...prev]);
  };

  // Safely inserting a reply under the correct parent
  const addReply = (parentId, reply) => {
    function insert(items) {
      return items.map((item) => {
        // item.replies is guaranteed an array by normalize
        if (item.id === parentId) {
          return {
            ...item,
            replies: [{ ...reply, replies: [] }, ...item.replies],
          };
        }
        if (item.replies.length) {
          return { ...item, replies: insert(item.replies) };
        }
        return item;
      });
    }
    setComments((prev) => insert(prev));
  };

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!perception) return <p>Perception not found.</p>;

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-8">
      <PerceptionCard
        perception={perception}
        onLike={() => toggleLike(perception, handleLikeUpdate)}
        detailView
      />

      <section className="space-y-6">
        <h3 className="text-2xl font-bold">Perceive</h3>

        <NewCommentForm perceptionId={perception.id} onAdd={addComment} />

        <CommentsList comments={comments} onReplyAdded={addReply} />
      </section>
    </main>
  );
}
