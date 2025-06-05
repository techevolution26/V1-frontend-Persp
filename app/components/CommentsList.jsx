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
      style={{ paddingLeft: depth * 24 }}
      className={`relative pl-6 mb-5 ${depth > 0 ? "ml-2" : ""}`}
    >
      {/* Vertical connector line */}
      <div className={`absolute top-8 bottom-0 left-0 w-0.5 
        ${depth > 0 ? "bg-indigo-100" : "bg-gradient-to-b from-indigo-300 to-purple-300"}`}></div>

      {/* Comment card */}
      <div className={`relative rounded-xl overflow-hidden transition-all duration-300
        shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]
        ${depth > 0 ? "bg-gradient-to-br from-white to-indigo-50" : "bg-gradient-to-br from-white to-blue-50"}`}>

        {/* Accent bar */}
        <div className={`absolute left-0 top-0 h-full w-1 
          ${depth > 0 ? "bg-indigo-200" : "bg-gradient-to-b from-indigo-400 to-purple-400"}`}></div>

        <div className="p-5">
          {/* User header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="relative">
              <img
                src={comment.user.avatar_url || "/default-avatar.png"}
                alt={comment.user.name}
                className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 border-2 border-white"></div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-baseline gap-2">
                <h3 className="font-bold text-gray-800 truncate">{comment.user.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium italic">
                  {comment.user.profession}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(comment.created_at).toLocaleString([], {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Comment body */}
          <p className="text-gray-700 mb-4 pl-1">{comment.body}</p>

          {/* Media */}
          {comment.media_url && /\.(mp4|webm|ogg)$/i.test(comment.media_url) ? (
            <div className="rounded-xl overflow-hidden mb-3 border border-gray-100 shadow-sm">
              <video src={comment.media_url} controls className="w-full max-h-64" />
            </div>
          ) : (
            comment.media_url && (
              <div className="rounded-xl overflow-hidden mb-3 border border-gray-100 shadow-sm">
                <img
                  src={comment.media_url}
                  alt=""
                  className="w-full max-h-64 object-contain"
                />
              </div>
            )
          )}

          {/* Action buttons */}
          <div className="flex gap-4 text-sm pt-2 border-t border-gray-100">
            <button
              onClick={() => setOpenForm((v) => !v)}
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors group"
            >
              <span className="bg-gray-100 group-hover:bg-indigo-100 rounded-full p-1 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </span>
              {openForm ? "Cancel reply" : "Reply"}
            </button>

            {replies.length > 0 && (
              <button
                onClick={() => setOpenReplies((v) => !v)}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors group"
              >
                <span className="bg-gray-100 group-hover:bg-indigo-100 rounded-full p-1 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </span>
                {openReplies
                  ? `Hide replies (${replies.length})`
                  : `View replies (${replies.length})`}
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

      {/* Nested replies */}
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
      <div className="text-center ">
        <div className="inline-block bg-gradient-to-r from-indigo-100 to-purple-100 p-5 rounded-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-700 mt-2">No perceptions yet. Be the first to share your thoughts!</p>
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