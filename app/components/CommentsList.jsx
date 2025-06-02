// components/CommentsList.jsx

"use client";
import { useState } from "react";
import NewReplyForm from "./NewReplyForm";

function CommentItem({ comment, onReplyAdded, depth = 0 }) {
  const [openForm, setOpenForm] = useState(false);
  const [openReplies, setOpenReplies] = useState(false);
  const replies = Array.isArray(comment.replies) ? comment.replies : [];

  return (
    <li
      style={{ paddingLeft: depth * 16 }}
      className={`border-l mb-4 ${depth > 0 ? "border-gray-300" : "border-gray-500"
        }`}
    >
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <img
            src={comment.user.avatar_url || "/default-avatar.png"}
            alt={comment.user.name}
            className="h-8 w-8 rounded-full object-cover"
          /> <p className="font-semibold">{comment.user.name}</p>
          <p className="text-xs text-grey-300 italic">{comment.user.profession}</p>

        </div>

        <p>{comment.body}</p>

        {comment.media_url && /\.(mp4|webm|ogg)$/i.test(comment.media_url) ? (
          <video src={comment.media_url} controls className="mt-2 max-w-full" />
        ) : (
          comment.media_url && (
            <img src={comment.media_url} alt="" className="mt-2 max-w-full" />
          )
        )}

        <small className="block text-gray-500">
          {new Date(comment.created_at).toLocaleString()}
        </small>
      </div>

      {/* Reply / Toggle buttons */}
      <div className="flex space-x-4 text-sm mt-2">
        <button
          onClick={() => setOpenForm((v) => !v)}
          className="text-blue-600"
        >
          {openForm ? "Cancel reply" : "Reply"}
        </button>

        {replies.length > 0 && (
          <button
            onClick={() => setOpenReplies((v) => !v)}
            className="text-blue-600"
          >
            {openReplies
              ? `Hide replies (${replies.length})`
              : `View replies (${replies.length})`}
          </button>
        )}
      </div>

      {/* Inline reply form */}
      {openForm && (
        <div className="mt-2">
          <NewReplyForm
            parentId={comment.id}
            perceptionId={comment.perception_id}
            onAdd={(newReply) => {
              onReplyAdded(comment.id, newReply);
              setOpenForm(false);
              setOpenReplies(true);
            }}
          />
        </div>
      )}

      {/* Nested replies */}
      {openReplies && replies.length > 0 && (
        <ul className="mt-4 space-y-4">
          {replies.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              onReplyAdded={onReplyAdded}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function CommentsList({ comments, onReplyAdded }) {
  if (!Array.isArray(comments) || comments.length === 0) {
    return <p className="text-gray-500">No comments yet.</p>;
  }

  return (
    <ul className="space-y-6">
      {comments.map((c) => (
        <CommentItem key={c.id} comment={c} onReplyAdded={onReplyAdded} />
      ))}
    </ul>
  );
}
