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
    // console.log("$$$ Sending message:", trimmed, "to peer", peerId);
    sendMutation.mutate(trimmed, {
      onSuccess: () => {
        // console.log("<<|>> Mutation success");
        setInput("");
        inputRef.current?.focus();
      },
      onError: (err) => console.error("!!!Mutation error", err),
    });
  }, [input, peerId, sendMutation]);

  const onEmojiClick = (emoji) => setInput((i) => i + emoji.emoji);


  return (
    <div className="relative">
      <div className="flex items-end bg-white rounded-xl shadow-sm border border-gray-200 p-2 transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
        <button
          onClick={() => setShowEmoji((v) => !v)}
          className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 text-gray-500 hover:text-indigo-600 transition-colors duration-200"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          className="flex-1 min-h-[40px] max-h-32 px-3 py-2.5 focus:outline-none resize-none"
          placeholder="Type a message…"
        />

        <button
          onClick={send}
          disabled={sendMutation.isLoading || !input.trim()}
          className={`flex items-center justify-center h-10 w-10 rounded-full transition-all duration-200 ${input.trim()
              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
              : "bg-gray-100 text-gray-400"
            }`}
          type="button"
        >
          {sendMutation.isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      {showEmoji && (
        <div className="absolute bottom-16 right-0 z-20 shadow-xl rounded-lg overflow-hidden">
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            previewConfig={{ showPreview: false }}
            skinTonesDisabled
            searchDisabled={false}
            lazyLoadEmojis
            height={350}
            width={300}
          />
        </div>
      )}
    </div>
  );
}
