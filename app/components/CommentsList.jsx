"use client";
import { useState } from "react";
import NewReplyForm from "./NewReplyForm";

function CommentItem({ comment, onReplyAdded, depth = 0 }) {
  const [openForm, setOpenForm] = useState(false);
  const [openReplies, setOpenReplies] = useState(false);
  const replies = Array.isArray(comment.replies) ? comment.replies : [];

  return (
    <li
      style={{ paddingLeft: depth * 24 }}
      className={`relative pl-6 mb-5 ${depth > 0 ? "ml-2" : ""}`}
    >
      {/* Vertical connector */}
      <div className={`absolute top-8 bottom-0 left-0 w-0.5 ${depth > 0 ? "bg-indigo-100" : "bg-gradient-to-b from-indigo-300 to-purple-300"
        }`} />

      {/* Comment Card */}
      <div className={`relative rounded-xl transition-all shadow-sm hover:shadow-md ${depth > 0
        ? "bg-gradient-to-br from-white to-indigo-50"
        : "bg-gradient-to-br from-white to-blue-50"
        }`}>
        <div
          className={`absolute left-0 top-0 h-full w-1 ${depth > 0 ? "bg-indigo-200" : "bg-gradient-to-b from-indigo-400 to-purple-400"
            }`}
        />
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <img
              src={comment.user.avatar_url || "/default-avatar.png"}
              alt={comment.user.name}
              className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 truncate">{comment.user.name}</h3>
              {comment.user.profession && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium italic">
                  {comment.user.profession}
                </span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {new Date(comment.created_at).toLocaleString([], {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <p className="text-gray-700 mb-4 pl-1">{comment.body}</p>

          {comment.media_url &&
            (/\.(mp4|webm|ogg)$/i.test(comment.media_url) ? (
              <video src={comment.media_url} controls className="rounded-xl w-full max-h-64 mb-3" />
            ) : (
              <img src={comment.media_url} className="rounded-xl w-full max-h-64 mb-3 object-contain" />
            ))}

          {/* Actions */}
          <div className="flex gap-4 text-sm pt-2 border-t border-gray-100 items-center">
            <button
              onClick={() => setOpenForm((v) => !v)}
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition group"
            >
              <span className="bg-gray-100 group-hover:bg-indigo-100 rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </span>
              {openForm ? "Cancel reply" : "Reply"}
            </button>

            {replies.length > 0 && (
              <button
                onClick={() => setOpenReplies((v) => !v)}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition group"
              >
                <span className="bg-gray-100 group-hover:bg-indigo-100 rounded-full px-2 py-1 text-xs font-semibold">
                  {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reply form */}
      {openForm && (
        <div className="mt-4 ml-3">
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

      {/* Nested Replies */}
      {openReplies && replies.length > 0 && (
        <ul className="mt-5 space-y-5">
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
    return (
      <div className="text-center">
        <div className="inline-block bg-gradient-to-r from-indigo-100 to-purple-100 p-5 rounded-2xl">
          <p className="text-gray-700">No perceptions yet. Be the first to share your thoughts!</p>
        </div>
      </div>
    );
  }

  return (
    <ul className="space-y-6">
      {comments.map((c) => (
        <CommentItem key={c.id} comment={c} onReplyAdded={onReplyAdded} />
      ))}
    </ul>
  );
}