"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export default function MessageInput({ peerId, token }) {
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const queryClient = useQueryClient();
  const inputRef = useRef();

  const sendMutation = useMutation({
    mutationFn: async (body) => {
      const res = await fetch(`/api/conversations/${peerId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body }), // body is already the string, so this is correct
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Send failed: ${res.status} ${res.statusText} - ${errorText}`);
      }
      return res.json();
    },
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: ["messages", peerId] });
      const prev = queryClient.getQueryData(["messages", peerId]);
      // optimistic update
      queryClient.setQueryData(["messages", peerId], (old) => {
        if (
          !old ||
          !Array.isArray(old.pages) ||
          !old.pages[0] ||
          !Array.isArray(old.pages[0].data)
        ) {
          return old;
        }
        const fake = {
          id: Date.now(),
          body, // body is the string message
          from_user_id: queryClient.getQueryData(["me"])?.id,
          sending: true,
        };
        return {
          ...old,
          pages: [
            {
              ...old.pages[0],
              data: [fake, ...old.pages[0].data],
            },
            ...old.pages.slice(1),
          ],
        };
      });
      return { prev };
    },
    onError: (_err, _body, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(["messages", peerId], ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['messages', peerId],   // exact key
        refetchType: 'all'              // refetch _all_ pages
      });
    }
  });

  // const send = useCallback(() => {
  //   const trimmed = input.trim();
  //   if (!trimmed) return;
  //   sendMutation.mutate(trimmed, {
  //     onSuccess: () => {
  //       setInput("");
  //       inputRef.current?.focus();
  //     },
  //   });
  // }, [input, sendMutation]);
  const send = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    console.log("$$$ Sending message:", trimmed, "to peer", peerId);
    sendMutation.mutate(trimmed, {
      onSuccess: () => {
        console.log("<<|>> Mutation success");
        setInput("");
        inputRef.current?.focus();
      },
      onError: (err) => console.error("!!!Mutation error", err),
    });
  }, [input, peerId, sendMutation]);

  const onEmojiClick = (emoji) => setInput((i) => i + emoji.emoji);

  return (
    <div className="relative">
      <textarea
        ref={inputRef}
        rows={2}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        className="w-full border rounded px-3 py-2 pr-24"
        placeholder="Type a message…"
      />

      <div className="absolute right-2 bottom-2 flex gap-2">
        <button
          onClick={() => setShowEmoji((v) => !v)}
          className="text-xl"
          type="button"
        >
          😊
        </button>
        <button
          onClick={send}
          disabled={sendMutation.isLoading || !input.trim()}
          className="bg-indigo-600 text-white px-3 py-1 rounded disabled:opacity-50"
          type="button"
        >
          Send
        </button>
      </div>

      {showEmoji && (
        <div className="absolute bottom-12 right-2 z-20">
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}
    </div>
  );
}
