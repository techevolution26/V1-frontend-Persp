"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartIcon, ChatBubbleOvalLeftIcon } from "@heroicons/react/24/outline";
import { useClickAway } from "react-use";
import { format, isThisYear } from "date-fns";
import { createPortal } from "react-dom";
import html2canvas from "html2canvas-pro";

export default function PerceptionCard({
  perception,
  onLike,
  onComment,
  onEdit,
  onDelete,
  detailView = false,
  showMenu = true,
  showOwnerActions = false
}) {
  const router = useRouter();
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const cardRef = useRef(null);

  useClickAway(menuRef, () => setMenuOpen(false));

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((r) => r.json())
      .then((me) => setCurrentUserId(me.id))
      .catch(() => setCurrentUserId(null));
  }, []);

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

  const isOwner = currentUserId === user.id;
  const isVideo = media?.match(/\.(mp4|webm|ogg)$/i);

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    if (isThisYear(date)) return format(date, "d MMM");
    return format(date, "d MMM yy");
  };

  const handleShare = async () => {
    if (!cardRef.current) return;

    const menu = cardRef.current.querySelector(".perception-menu");
    const excludedImages = cardRef.current.querySelectorAll(".exclude-from-snapshot");

    if (menu) menu.style.visibility = "hidden";
    excludedImages.forEach((img) => (img.style.visibility = "hidden"));

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#fff",
        useCORS: false,
        ignoreElements: (el) => el.classList?.contains("exclude-from-snapshot"),
      });

      canvas.toBlob((blob) => {
        if (!blob) return alert("Snapshot failed.");
        const file = new File([blob], "perception.png", { type: "image/png" });

        if (navigator.canShare?.({ files: [file] })) {
          navigator.share({
            files: [file],
            title: "Perception",
            text: "Check out this perception!",
          });
        } else {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "perception.png";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, "image/png");
    } catch (err) {
      alert("Error capturing snapshot.");
      console.error("Snapshot error:", err);
    } finally {
      if (menu) menu.style.visibility = "visible";
      excludedImages.forEach((img) => (img.style.visibility = "visible"));
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowImagePreview(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);



  return (
    <>
      <div
        className="bg-white shadow-xl rounded-lg flex flex-col relative" ref={cardRef}
        onDoubleClick={() => router.push(`/perceptions/${id}`)}
      >
        {/* Header */}
        <div className="flex items-center px-4 py-2">
          <img
            src={user.avatar_url || "/default-avatar.png"}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover mr-3"
          />
          <div className="flex-1">
            <Link href={`/users/${user.id}`} className="font-medium hover:underline">
              {user.name}
            </Link>
            <p className="text-xs text-gray-500">in {topic.name}</p>
          </div>
          <span className="text-xs text-gray-400 mr-2">{formatRelativeTime(created_at)}</span>

          {showMenu && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-1 hover:bg-gray-200 rounded-full"
                title="Actions"
              >
                <span className="text-lg font-bold text-gray-600">⋮</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md z-50 perception-menu">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleShare();
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Share Snapshot
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      const url = `${window.location.origin}/perceptions/${id}`;
                      navigator.clipboard.writeText(url).then(() => {
                        alert("Link copied to clipboard!");
                      });
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Copy Link
                  </button>

                  {isOwner && showOwnerActions && (
                    <>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onEdit?.(perception);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete?.(perception);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
              <img src={media} alt="media" className="w-full max-h-80 object-contain exclude-from-snapshot" onClick={() => setShowImagePreview(true)}
              />
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto px-4 py-2 flex items-center space-x-6 text-gray-600 border-t border-gray-100">
          <button
            onClick={() => onLike?.(id)}
            className="flex items-center space-x-1 hover:text-red-500"
          >
            <HeartIcon className="h-5 w-5" />
            <span className="text-sm">{likes}</span>
          </button>

          <button
            onClick={() => {
              if (!detailView) {
                router.push(`/perceptions/${id}`);
              }
            }}
            className={`flex items-center space-x-1 hover:text-blue-500 ${detailView ? "opacity-50 cursor-not-allowed" : ""
              }`}
            disabled={detailView}
          >
            <ChatBubbleOvalLeftIcon className="h-5 w-5" />
            <span className="text-sm">{comments}</span>
          </button>
        </div>
      </div>
      {showImagePreview &&
        createPortal(
          <div
            className="fixed inset-0 bg-black bg-opacity-80 z-[1000] flex items-center justify-center p-4 sm:p-8"
            onClick={() => setShowImagePreview(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="max-w-screen max-h-screen overflow-hidden rounded-lg"
            >
              <img
                src={media}
                alt="Zoomed"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl transition-opacity duration-200 ease-in-out"
              />
            </div>
          </div>,
          document.body
        )}

    </>
  );
}
