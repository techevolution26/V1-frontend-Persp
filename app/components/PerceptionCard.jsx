// app/components/PerceptionCard.jsx
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartIcon, ChatBubbleOvalLeftIcon } from "@heroicons/react/24/outline";
import { useClickAway } from "react-use";
import { format, isThisYear } from "date-fns";
import { createPortal } from "react-dom";
import html2canvas from "html2canvas-pro";
import useCurrentUser from "../hooks/useCurrentUser";

export default function PerceptionCard({
  perception,
  onLike,
  onComment,
  onEdit,
  onDelete,
  detailView = false,
  showMenu = true,
  showOwnerActions = false,
}) {
  const router = useRouter();
  const { user: me } = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const menuRef = useRef(null);
  const cardRef = useRef(null);

  useClickAway(menuRef, () => setMenuOpen(false));

  const {
    id,
    user,
    body,
    media_url: media,
    likes_count: likes,
    comments_count: comments,
    topic,
    created_at,
  } = perception;

  const isOwner = me?.id === user.id;
  const isVideo = /\.(mp4|webm|ogg)$/i.test(media || "");

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const sec = Math.floor((now - date) / 1000);
    if (sec < 60) return "Just now";
    if (sec < 3600) return `${Math.floor(sec / 60)}m`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
    if (sec < 604800) return `${Math.floor(sec / 86400)}d`;
    return isThisYear(date) ? format(date, "d MMM") : format(date, "d MMM yy");
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    const menuEl = cardRef.current.querySelector(".perception-menu");
    const hiddenEls = cardRef.current.querySelectorAll(".exclude-from-snapshot");
    menuEl && (menuEl.style.visibility = "hidden");
    hiddenEls.forEach((el) => (el.style.visibility = "hidden"));

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#fff",
        ignoreElements: (el) => el.classList?.contains("exclude-from-snapshot"),
      });
      canvas.toBlob((blob) => {
        if (!blob) return alert("Snapshot failed");
        const file = new File([blob], "perception.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          navigator.share({ files: [file], title: "Perception" });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = "perception.png";
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }
      });
    } catch (err) {
      console.error("Snapshot error:", err);
      alert("Snapshot failed");
    } finally {
      menuEl && (menuEl.style.visibility = "visible");
      hiddenEls.forEach((el) => (el.style.visibility = "visible"));
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        className="bg-white shadow-xl rounded-lg flex flex-col relative"
        onDoubleClick={() => router.push(`/perceptions/${id}`)}
      >
        {/* Header */}
        <div className="flex items-center px-4 py-2">
          <img
            src={user.avatar_url || "/default-avatar.png"}
            alt={user.name}
            className="h-8 w-8 rounded-full mr-3 object-cover"
          />
          <div className="flex-1">
            <Link href={`/users/${user.id}`} className="font-medium hover:underline">
              {user.name}
            </Link>
            <p className="text-xs text-gray-500">in {topic.name}</p>
          </div>
          <span className="text-xs text-gray-400 mr-2">
            {formatRelativeTime(created_at)}
          </span>

          {showMenu && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="p-1 hover:bg-gray-200 rounded-full"
                title="Actions"
              >
                <span className="text-lg font-bold text-gray-600">⋮</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow perception-menu z-50">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleShare();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    Share Snapshot
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link copied");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    Copy Link
                  </button>
                  {isOwner && showOwnerActions && (
                    <>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onEdit?.(id);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete?.(id);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-4 py-2">
          <p className="text-gray-800 whitespace-pre-wrap">{body}</p>
        </div>

        {/* Media */}
        {media && (
          <div className="w-full">
            {isVideo ? (
              <video src={media} controls className="w-full max-h-80 object-contain" />
            ) : (
              <img
                src={media}
                alt=""
                className="w-full max-h-80 object-contain exclude-from-snapshot cursor-pointer"
                onClick={() => setShowImagePreview(true)}
              />
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto px-4 py-2 flex items-center space-x-6 text-gray-600 border-t border-gray-100">
          <button onClick={() => onLike?.(id)} className="flex items-center space-x-1 hover:text-red-500">
            <HeartIcon className="h-5 w-5" />
            <span className="text-sm">{likes}</span>
          </button>
          <button
            onClick={() => {
              if (!detailView) {
                router.push(`/perceptions/${id}`);
              }
            }} className={`flex items-center space-x-1 hover:text-blue-500 ${detailView ? "opacity-50 cursor-not-allowed" : ""
              }`}
            disabled={detailView}
          >
            <ChatBubbleOvalLeftIcon className="h-5 w-5" />
            <span className="text-sm">{comments}</span>
          </button>
        </div>
      </div>

      {/* Image preview modal */}
      {showImagePreview &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setShowImagePreview(false)}
          >
            <img
              src={media}
              alt=""
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body
        )}
    </>
  );
}
