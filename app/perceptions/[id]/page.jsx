"use client";

import { useParams } from "next/navigation";
import PerceptionCard from "../../components/PerceptionCard";
import NewCommentForm from "../../components/NewCommentForm";
import CommentsList from "../../components/CommentsList";
import { usePerceptionDetail } from "../../hooks/usePerceptionDetail";
import useLikeToggle from "../../hooks/useLikeToggle";
import { useRouter } from "next/navigation";

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-100 rounded w-full" />
      <div className="h-32 bg-gray-100 rounded-xl" />
    </div>
  );
}

export default function PerceptionDetailPage() {
  const { id } = useParams();
  const {
    me,
    perception,
    comments,
    loading,
    error,
    reload,
    setPerception,
    setComments,
  } = usePerceptionDetail(id);
  const toggleLike = useLikeToggle();
  const router= useRouter();

  const isOwner = me?.id === perception?.user?.id;
  const hasCommented = comments.some((c) => c.user.id === me?.id);

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

  if (loading) {
    return (
      <main className="p-6 max-w-3xl mx-auto space-y-8">
        <Skeleton />
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6 max-w-3xl mx-auto space-y-4 text-center">
        <p className="text-red-500">Error: {error}</p>
        <button
          onClick={reload}
          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Retry
        </button>
      </main>
    );
  }

  if (!perception) {
    return <p className="text-center py-8 text-gray-500">Perception not found.</p>;
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-8">
      {!isOwner && (
  <button
    onClick={() => router.push(`/messages?peer=${perception.user.id}`)}
    className="mt-2 text-sm text-green-600 hover:underline"
  >
    📩 Message {perception.user.name}
  </button>
)}
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
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-5 rounded-2xl mx-auto w-fit text-gray-900">
            Enter your Perception to see others' Perspectives.
          </div>
        )}
      </section>
    </main>
  );
}
