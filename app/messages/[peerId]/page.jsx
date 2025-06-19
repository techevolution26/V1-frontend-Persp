// app/messages/[peerId]/page.jsx
"use client";

import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useMessages } from "../../hooks/useMessages";
import { useMessageStream } from "../../hooks/useMessageStream";
import useCurrentUser from "../../hooks/useCurrentUser";
import ChatWindow from "../../components/ChatWindow";
import MessageInput from "../../components/MessageInput";

export default function ChatPage() {
  const { peerId } = useParams();               // “123”
  const { user: me, loading: meLoading } = useCurrentUser();
  const token = me?.token;
  const messagesQuery = useMessages(Number(peerId), token);
  const queryClient = useQueryClient();

  // real‑time updates
  useMessageStream(Number(peerId), (newMsg) => {
    queryClient.setQueryData(["messages", Number(peerId)], (old) => {
      old.pages[0].data.push(newMsg);
      return { ...old };
    });
  });

  if (meLoading) return <p>Loading user…</p>;
  if (!me) return <p>Please log in.</p>;

  return (
    <ChatWindow
      messagesPages={messagesQuery.data}
      fetchNextPage={messagesQuery.fetchNextPage}
      hasNextPage={messagesQuery.hasNextPage}
    >
      <MessageInput peerId={Number(peerId)} token={token} />
    </ChatWindow>
  );
}
