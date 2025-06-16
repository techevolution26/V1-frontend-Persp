// app/components/ConversationList.jsx
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function ConversationList({ convos }) {
  const router = useRouter();
  const params = useSearchParams();
  const selected = Number(params.get('peer'));

  return (
    <aside className="w-80 border-r p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-2">Recent</h2>
      <ul className="flex-1 overflow-auto space-y-1">
        {convos.map((u) => (
          <li key={u.id}>
            <div
              onClick={() => router.replace(`/messages?peer=${u.id}`)}
              className={
                `flex items-center gap-2 p-2 rounded cursor-pointer ` +
                (u.id === selected
                  ? "bg-indigo-100"
                  : "hover:bg-gray-100")
              }
            >
              <Image
                src={u.avatar_url || '/default-avatar.png'}
                width={32}
                height={32}
                className="rounded-full"
                alt={u.name}
              />
              <div className="flex-1">
                <div className="font-medium">{u.name}</div>
                {u.unread > 0 && (
                  <span className="text-xs bg-red-500 text-white rounded-full px-2">
                    {u.unread}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
