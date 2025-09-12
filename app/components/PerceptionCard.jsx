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
    if (menuEl) menuEl.style.visibility = "hidden";
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
          a.href = url;
          a.download = "perception.png";
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
      if (menuEl) menuEl.style.visibility = "visible";
      hiddenEls.forEach((el) => (el.style.visibility = "visible"));
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        className="bg-white shadow-xl rounded-xl flex flex-col relative overflow-hidden"
        onDoubleClick={() => router.push(`/perceptions/${id}`)}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-3 py-3 sm:px-4 sm:py-2">
          <img
            src={user.avatar_url || "/default-avatar.png"}
            alt={user.name}
            className="flex-shrink-0 h-10 w-10 rounded-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`/users/${user.id}`}
                  className="font-medium text-sm sm:text-base block truncate hover:underline"
                  title={user.name}
                >
                  {user.name}
                </Link>
                <div className="text-xs text-gray-500 truncate">
                  <span className="mr-1">in</span>
                  <span className="font-medium text-gray-600">{topic?.name}</span>
                </div>
              </div>

              <div className="text-xs text-gray-400 whitespace-nowrap ml-2">
                {formatRelativeTime(created_at)}
              </div>
            </div>
          </div>

          {showMenu && (
            <div className="relative ml-1" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="p-1.5 hover:bg-gray-100 rounded-full"
                aria-expanded={menuOpen}
                aria-haspopup="true"
                title="Actions"
              >
                <span className="text-lg font-bold text-gray-600 select-none">⋮</span>
              </button>

              {menuOpen && (
                /* Positioning adaptively so it won't overflow on small screens */
                <div
                  className="absolute right-0 mt-2 w-44 sm:w-40 bg-white border rounded-lg shadow-lg perception-menu z-50"
                  role="menu"
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleShare();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    role="menuitem"
                  >
                    Share Snapshot
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link copied");
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    role="menuitem"
                  >
                    Copy Link
                  </button>

                  {isOwner && showOwnerActions && (
                    <>
                      <hr />
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onEdit?.(id);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                        role="menuitem"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete?.(id);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-red-600"
                        role="menuitem"
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
        <div className="px-3 sm:px-4 pb-2">
          <p className="text-sm sm:text-base text-gray-800 whitespace-pre-wrap break-words">
            {body}
          </p>
        </div>

        {/* Media */}
        {media && (
          <div className="w-full px-0 sm:px-0 pb-2">
            {isVideo ? (
              <video
                src={media}
                controls
                className="w-full max-h-[38vh] sm:max-h-[46vh] object-contain rounded-b-lg"
              />
            ) : (
              <img
                src={media}
                alt=""
                className="w-full max-h-[48vh] sm:max-h-[60vh] object-cover cursor-pointer"
                loading="lazy"
                decoding="async"
                onClick={() => setShowImagePreview(true)}
              />
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto px-3 sm:px-4 py-2 flex items-center gap-3 text-gray-600 border-t border-gray-300">
          <button
            onClick={() => onLike?.(id)}
            className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 active:scale-95 transition"
            aria-label={`Like perception ${id}`}
            style={{ touchAction: "manipulation" }}
          >
            <HeartIcon className="h-5 w-5 text-gray-700" />
            <span className="text-sm">{likes}</span>
          </button>

          <button
            onClick={() => (detailView ? null : router.push(`/perceptions/${id}`))}
            disabled={detailView}
            className={`flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 active:scale-95 transition ${detailView ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label={`View comments for perception ${id}`}
            style={{ touchAction: "manipulation" }}
          >
            <ChatBubbleOvalLeftIcon className="h-5 w-5 text-gray-700" />
            <span className="text-sm">{comments}</span>
          </button>

          {/* optional extra actions could go here (share, bookmark...) */}
        </div>
      </div>

      {/* Image preview modal */}
      {showImagePreview &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4"
            onClick={() => setShowImagePreview(false)}
          >
            <img
              src={media}
              alt=""
              className="max-w-full max-h-[92vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
              loading="lazy"
              decoding="async"
            />
          </div>,
          typeof document !== "undefined" ? document.body : null
        )}
    </>
  );
}
