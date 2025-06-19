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

import { Suspense } from "react";

function MessagesHubContent({ peerId }) {
  const { user: me, loading: meLoading } = useCurrentUser();
  const token = typeof window !== "undefined" && localStorage.getItem("token");
  const convosQuery = useConversations(token);

  const router = useRouter();

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
  // console.log({ peerId, messages: messagesQuery.data, isFetching: messagesQuery.isFetching });  //& debuging  here to remove later

  return (
    <div className="flex h-screen w-full bg-gray-50">
      <ConversationSidebar
        conversations={convosQuery.data || []}
        selectedPeer={peerId}
        onSelect={(id) => {
          // console.log("selecting peer:", id);
          router.push(`/messages?peer=${id}`);
        }}
        className="h-full border-r border-gray-200"
      />

      {peerId ? (
        <div className="flex flex-1 flex-col h-full">
          <div className="flex-1 overflow-hidden">
            <ChatWindow
              messagesPages={messagesQuery.data}
              fetchNextPage={messagesQuery.fetchNextPage}
              hasNextPage={messagesQuery.hasNextPage}
              isLoading={messagesQuery.isLoading}
              className="h-full"
            />
          </div>
          <div className="shrink-0 p-4 border-t border-gray-200 bg-white">
            <MessageInput peerId={peerId} token={token} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
          <div className="text-center p-8 max-w-md">
            <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No conversation selected</h2>
            <p className="text-gray-500">
              Select a conversation from the sidebar or search for users to start chatting
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function PeerIdProvider({ children }) {
  const params = useSearchParams();
  const peerId = Number(params.get("peer")) || null;
  return children(peerId);
}

export default function MessagesHub() {
  return (
    <Suspense fallback={<p>Loading messages…</p>}>
      <PeerIdProvider>
        {(peerId) => <MessagesHubContent peerId={peerId} />}
      </PeerIdProvider>
    </Suspense>
  );
}