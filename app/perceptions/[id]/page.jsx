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
  const [me, setMe] = useState(null);
  const toggleLike = useLikeToggle();

  // ensure every comment has replies: []
  const normalize = (list = []) =>
    list.map(c => ({ ...c, replies: normalize(c.replies) }));

  useEffect(() => {
    async function loadAll() {
      try {
        const token = localStorage.getItem("token") || "";
        // fetch me, perception, comments in parallel
        const [uRes, pRes, cRes] = await Promise.all([
          fetch("/api/user", { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/perceptions/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/perceptions/${id}/comments`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!uRes.ok) throw new Error("Failed to fetch user");
        if (!pRes.ok) throw new Error("Failed to fetch perception");
        if (!cRes.ok) throw new Error("Failed to fetch comments");

        const [uData, pData, cData] = await Promise.all([uRes.json(), pRes.json(), cRes.json()]);

        setMe(uData);
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

  // have they already commented?
  const hasCommented =
    me && comments.some(c => c.user.id === me.id);

  // owner can always see
  const isOwner = me && perception?.user?.id === me.id;

  // prepend a new comment
  const addComment = c => setComments(cs => [{ ...c, replies: [] }, ...cs]);

  // nested replies insertion
  const addReply = (parentId, reply) => {
    function insert(arr) {
      return arr.map(item => {
        if (item.id === parentId) {
          return { ...item, replies: [{ ...reply, replies: [] }, ...item.replies] };
        }
        return item.replies.length
          ? { ...item, replies: insert(item.replies) }
          : item;
      });
    }
    setComments(cs => insert(cs));
  };

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!perception) return <p>Perception not found.</p>;

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-8">
      <PerceptionCard
        perception={perception}
        onLike={() => toggleLike(perception, (id, liked, count) => {
          setPerception(p => p.id === id ? { ...p, liked_by_user: liked, likes_count: count } : p);
        })}
        detailView
      />

      <section className="space-y-6">
        <h3 className="text-2xl font-bold">Perceive</h3>

        {/* always show the “add comment” form */}
        <NewCommentForm perceptionId={perception.id} onAdd={addComment} />

        {/* only show the existing thread if you’re the owner or have commented */}
        {
          isOwner || hasCommented
            ? (
              <CommentsList comments={comments} onReplyAdded={addReply} />
            ) : (
              comments.length > 0
                ? <p className="text-gray-500">
                  Enter your Perception to see other's Perspectives..</p>
                : null
            )
        }
      </section>
    </main>
  );
}
