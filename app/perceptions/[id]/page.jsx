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
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toggleLike = useLikeToggle();

  // Normalize replies recursively
  const normalize = (list = []) =>
    list.map((c) => ({ ...c, replies: normalize(c.replies) }));

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const headers = { Authorization: `Bearer ${token}` };

        const [uRes, pRes, cRes] = await Promise.all([
          fetch("/api/user", { headers }),
          fetch(`/api/perceptions/${id}`, { headers }),
          fetch(`/api/perceptions/${id}/comments`, { headers }),
        ]);

        if (!uRes.ok || !pRes.ok || !cRes.ok)
          throw new Error("Failed to load required data.");

        const [u, p, c] = await Promise.all([
          uRes.json(),
          pRes.json(),
          cRes.json(),
        ]);

        setMe(u);
        setPerception(p);
        setComments(normalize(c));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  const isOwner = me && perception?.user?.id === me.id;
  const hasCommented = me && comments.some((c) => c.user.id === me.id);

  const addComment = (c) => {
    setComments((curr) => [{ ...c, replies: [] }, ...curr]);
  };

  const addReply = (parentId, reply) => {
    const insert = (arr) =>
      arr.map((c) =>
        c.id === parentId
          ? { ...c, replies: [{ ...reply, replies: [] }, ...c.replies] }
          : { ...c, replies: insert(c.replies) }
      );

    setComments((cs) => insert(cs));
  };

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!perception) return <p>Perception not found.</p>;

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-8">
      <PerceptionCard
        perception={perception}
        onLike={() =>
          toggleLike(perception, (id, liked, count) =>
            setPerception((p) =>
              p.id === id ? { ...p, liked_by_user: liked, likes_count: count } : p
            )
          )
        }
        detailView
      />

      <section className="space-y-6">
        <h3 className="text-2xl font-bold">Perceive</h3>
        <NewCommentForm perceptionId={perception.id} onAdd={addComment} />

        {(isOwner || hasCommented || comments.length === 0) ? (
          <CommentsList comments={comments} onReplyAdded={addReply} />
        ) : (
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-5 rounded-2xl mx-auto w-fit">
            <p className="text-gray-900">
              Enter your Perception to see others' Perspectives.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
