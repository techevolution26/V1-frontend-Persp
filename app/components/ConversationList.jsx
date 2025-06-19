// app/components/ConversationList.jsx
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function ConversationList({ convos }) {
  const router = useRouter();
  const params = useSearchParams();
  const selected = Number(params.get('peer'));

  return (
    <aside className="w-80 bg-white border-r border-gray-200 p-4 flex flex-col h-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Chats</h2>
      <ul className="flex-1 overflow-y-auto space-y-1">
        {convos.map((u) => {
          const lastMsgTime = u.lastMessage ? new Date(u.lastMessage) : null;

          return (
            <li key={u.id}>
              <div
                onClick={() => router.replace(`/messages?peer=${u.id}`)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${u.id === selected
                    ? "bg-indigo-50 border border-indigo-100 shadow-sm"
                    : "hover:bg-gray-50"
                  }`}
              >
                <div className="relative flex-shrink-0">
                  <Image
                    src={u.avatar_url || '/default-avatar.png'}
                    width={48}
                    height={48}
                    className="rounded-full object-cover border-2 border-white shadow"
                    alt={u.name}
                  />
                  {u.unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow">
                      {u.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <div className="font-semibold text-gray-900 truncate">{u.name}</div>
                    {lastMsgTime && (
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {lastMsgTime.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                  {u.lastMessagePreview && (
                    <div className="text-sm text-gray-500 truncate mt-0.5">
                      {u.lastMessagePreview}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}