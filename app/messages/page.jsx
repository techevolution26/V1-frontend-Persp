//app/messages/page.jsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import useCurrentUser from "../hooks/useCurrentUser";
import { useConversations } from "../hooks/useConversations";
import { useMessages } from "../hooks/useMessages";
import { useMessageStream } from "../hooks/useMessageStream";
import ConversationSidebar from "../components/ConversationSidebar";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";

export default function MessagesHub() {
  const { user: me, loading: meLoading } = useCurrentUser();
  const token = typeof window !== "undefined" && localStorage.getItem("token");
  const convosQuery = useConversations(token);

  const router = useRouter();
  const params = useSearchParams();
  const peerId = Number(params.get("peer")) || null;

  const messagesQuery = useMessages(peerId, token);
  const queryClient = useQueryClient();

  // Real‑time message stream
  useMessageStream(peerId, (newMsg) => {
    queryClient.setQueryData(
      ["messages", peerId],
      (old) => {
        if (!old) return old;
        const updated = { ...old };
        updated.pages[0].data.push(newMsg);
        return updated;
      }
    );
  });

  if (meLoading) return <p>Loading your account…</p>;
  if (!me) return <p>Please log in to view messages.</p>;
  console.log({ peerId, messages: messagesQuery.data, isFetching: messagesQuery.isFetching });  //& debuging  here to remove later
  return (
    <div className="flex h-screen w-screen max-w-full max-h-screen overflow-hidden">
      <ConversationSidebar
        conversations={convosQuery.data || []}
        selectedPeer={peerId}
        onSelect={(id) => {
          console.log("selecting peer:", id); // debug log here i'll remove later
          router.push(`/messages?peer=${id}`);
        }}
        className="h-full max-h-screen"
      />

      {peerId ? (
        <div className="flex flex-1 flex-col h-full max-h-screen overflow-hidden min-w-0">
          <div className="flex-1 min-h-0 min-w-0" style={{ overflow: "auto" }}>
            <ChatWindow
              messagesPages={messagesQuery.data}
              fetchNextPage={messagesQuery.fetchNextPage}
              hasNextPage={messagesQuery.hasNextPage}
              isLoading={messagesQuery.isLoading}
              style={{ height: "100%", overflow: "auto" }}
            />
          </div>
          <div className="shrink-0">
            <MessageInput peerId={peerId} token={token} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 min-w-0">
          Select a conversation or search above to start chatting
        </div>
      )}
    </div>
  );
}
