//app/components/PerceptionCard

"use client";

import Link from "next/link";
import { HeartIcon, ChatBubbleOvalLeftIcon } from "@heroicons/react/24/outline";
import { formatDistanceToNow, format, isThisYear } from "date-fns";
import { useRouter } from "next/navigation";

export default function PerceptionCard({ perception, onLike }) {
  const router = useRouter();
  const perceptionCardClicked = () => {
    router.push(`/perceptions/${id}`);
  };

  function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;

    // Current year
    if (isThisYear(date)) {
      return format(date, "d MMM"); // "13 May"
    }

    // Older
    return format(date, "d MMM yy"); // "15 Sep 24"
  }

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

  const isVideo = media?.match(/\.(mp4|webm|ogg)$/i);

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden flex flex-col" onDoubleClick={perceptionCardClicked}>
      {/* Header */}
      <div className="flex items-center px-4 py-2">
        <img
          src={user.avatar_url || "/default-avatar.png"}
          alt={user.name}
          className="h-8 w-8 rounded-full object-cover mr-3"
        />
        <div className="flex-1">
          <Link
            href={`/users/${user.id}`}
            className="font-medium hover:underline"
          >
            {user.name}
          </Link>
          <p className="text-xs text-gray-500">in {topic.name}</p>
        </div>
        <span className="text-xs text-gray-400">
          {formatRelativeTime(created_at)}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-2">
        <p className="text-gray-800 whitespace-pre-wrap">{body}</p>
      </div>

      {/* Media: only renders when media exists */}
      {media ? (
        <div className="w-full">
          {isVideo ? (
            <video
              src={media}
              controls
              className="w-full max-h-80 object-contain"
            />
          ) : (
            <img
              src={media}
              alt="attached media"
              className="w-full max-h-80 object-contain"
            />
          )}
        </div>
      ) : null}

      {/* Footer */}
      <div className="mt-auto px-4 py-2 flex items-center space-x-6 text-gray-600 border-t border-gray-100">
        <button
          onClick={onLike}
          className="flex items-center space-x-1 hover:text-red-500"
        >
          <HeartIcon className="h-5 w-5" />
          <span className="text-sm">{likes}</span>
        </button>

        <button>
          <Link
            href={`/perceptions/${id}`}
            className="flex items-center space-x-1 hover:text-blue-500"
          >
            <ChatBubbleOvalLeftIcon className="h-5 w-5" />
            <span className="text-sm">{comments}</span>
          </Link>
        </button>
      </div>
    </div>
  );
}
