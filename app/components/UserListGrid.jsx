"use client";

import Link from "next/link";
import FollowButton from "./FollowButton";

export default function UserListGrid({ users, currentUserId }) {
  if (!Array.isArray(users) || users.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 italic">
        No users to display.
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {users.map((user) => (
        <li
          key={user.id}
          className="border border-gray-100 p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 min-w-0">
            <img
              src={user.avatar_url || "/default-avatar.png"}
              alt={user.name || "User avatar"}
              className="h-12 w-12 rounded-full object-cover shrink-0"
            />
            <div className="min-w-0">
              <Link
                href={`/users/${user.id}`}
                className="block font-semibold text-indigo-700 truncate hover:underline"
              >
                {user.name}
              </Link>
              {user.profession && (
                <p className="text-sm text-gray-500 truncate">{user.profession}</p>
              )}
            </div>
          </div>

          {Number(user.id) !== Number(currentUserId) && (
            <div className="shrink-0">
              <FollowButton profileUserId={user.id} />
            </div>
          )}

        </li>
      ))}
    </ul>
  );
}
