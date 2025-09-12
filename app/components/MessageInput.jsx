// app/components/MessageInput.jsx
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export default function MessageInput({ peerId, token }) {
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [viewportInfo, setViewportInfo] = useState({
    vh: typeof window !== "undefined" ? window.innerHeight : 0,
    vw: typeof window !== "undefined" ? window.innerWidth : 0,
    keyboardOffset: 0,
  });
  const [mounted, setMounted] = useState(false);

  const queryClient = useQueryClient();
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const pickerRootRef = useRef(null);
  const toggleRef = useRef(null);

  // portal root for emoji picker
  useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.createElement("div");
    el.setAttribute("id", "emoji-picker-root");
    el.className = "emoji-picker-portal-root";
    pickerRootRef.current = el;
    document.body.appendChild(el);
    setMounted(true);
    return () => {
      try {
        document.body.removeChild(el);
      } catch (e) { }
    };
  }, []);

  // autosize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [input]);

  // visualViewport handling (mobile)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let keyboardOffset = 0;
      if (window.visualViewport) {
        const vv = window.visualViewport;
        keyboardOffset = Math.max(0, vh - vv.height - (vv.offsetTop || 0));
      }
      setViewportInfo({ vh, vw, keyboardOffset });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      window.visualViewport.addEventListener("scroll", handleResize);
    }
    return () => {
      window.removeEventListener("resize", handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
        window.visualViewport.removeEventListener("scroll", handleResize);
      }
    };
  }, []);

  // outside-click detection for portal
  useEffect(() => {
    const isNode = (n) =>
      n && typeof n === "object" && (typeof n.nodeType === "number" || (typeof Node !== "undefined" && n instanceof Node));

    const onDocPointerUp = (e) => {
      if (!pickerRootRef.current) return;
      if (!showEmoji) return;

      let path = [];
      try {
        path = e.composedPath ? e.composedPath() : e.path || [];
      } catch (err) {
        path = e.path || [];
      }
      if (!Array.isArray(path)) path = [];

      const clickedInsidePortal = path.some((n) => {
        if (n === pickerRootRef.current) return true;
        return isNode(n) && isNode(pickerRootRef.current) && pickerRootRef.current.contains(n);
      });

      const clickedToggle = path.some((n) => n === toggleRef.current);
      const clickedInput =
        e.target === inputRef.current || e.target === textareaRef.current || path.some((n) => n === textareaRef.current || n === inputRef.current);

      if (!clickedInsidePortal && !clickedToggle && !clickedInput) {
        setShowEmoji(false);
      }
    };

    document.addEventListener("pointerup", onDocPointerUp);
    return () => document.removeEventListener("pointerup", onDocPointerUp);
  }, [showEmoji]);

  // ----- Mutation with optimistic update + broadcast -----
  const sendMutation = useMutation({
    mutationFn: async (body) => {
      const res = await fetch(`/api/conversations/${peerId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Send failed: ${res.status} ${res.statusText} - ${errorText}`);
      }
      return res.json(); // should be the server-created message object
    },

    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: ["messages", peerId] });
      const prev = queryClient.getQueryData(["messages", peerId]);
      const tempId = `temp-${Date.now()}`;

      queryClient.setQueryData(["messages", peerId], (old) => {
        if (!old || !Array.isArray(old.pages) || !old.pages[0] || !Array.isArray(old.pages[0].data)) return old;
        const fake = {
          id: tempId,
          body,
          from_user_id: queryClient.getQueryData(["me"])?.id,
          sending: true,
          created_at: new Date().toISOString(),
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

      return { prev, tempId };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["messages", peerId], ctx.prev);
    },

    onSuccess: (serverMsg, _vars, ctx) => {
      const tempId = ctx?.tempId;
      queryClient.setQueryData(["messages", peerId], (old) => {
        if (!old || !Array.isArray(old.pages)) return old;

        // try to replace temp message
        let replaced = false;
        const pages = old.pages.map((pg) => {
          const data = pg.data.map((m) => {
            if (m.id === tempId) {
              replaced = true;
              return serverMsg;
            }
            return m;
          });
          return { ...pg, data };
        });

        if (replaced) return { ...old, pages };

        // dedupe: if serverMsg already exists, return old unchanged
        const exists = old.pages.some((pg) => pg.data.some((m) => m.id === serverMsg.id));
        if (exists) return old;

        // otherwise prepend serverMsg to first page
        const newFirst = { ...pages[0], data: [serverMsg, ...pages[0].data] };
        return { ...old, pages: [newFirst, ...(pages.slice(1) || [])] };
      });

      // broadcast to other tabs (simulate server push)
      try {
        if (typeof BroadcastChannel !== "undefined") {
          const bc = new BroadcastChannel("perception-messages");
          bc.postMessage({ type: "message_created", peerId, message: serverMsg });
          bc.close();
        } else {
          // fallback: localStorage event
          try {
            localStorage.setItem(
              "perception_message_event",
              JSON.stringify({ t: Date.now(), type: "message_created", peerId, message: serverMsg })
            );
            setTimeout(() => localStorage.removeItem("perception_message_event"), 50);
          } catch (err) {
            // ignore
          }
        }
      } catch (err) {
        // ignore broadcast errors
        console.warn("broadcast failed", err);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", peerId], refetchType: "all" });
    },
  });

  const send = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMutation.mutate(trimmed, {
      onSuccess: () => {
        setInput("");
        inputRef.current?.focus();
      },
    });
  }, [input, peerId, sendMutation]);

  const onEmojiClick = (emojiData) => {
    const char = emojiData?.emoji ?? "";
    setInput((i) => i + char);
    setShowEmoji(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const toggleEmoji = () => {
    if (!showEmoji) {
      textareaRef.current?.blur();
      setTimeout(() => setShowEmoji(true), 80);
    } else {
      setShowEmoji(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const computePickerStyle = () => {
    const baseBottom = 16;
    const keyboardOffset = viewportInfo.keyboardOffset || 0;
    const bottom = `calc(env(safe-area-inset-bottom, 0px) + ${baseBottom + keyboardOffset}px)`;
    const vw = Math.max(320, viewportInfo.vw || (typeof window !== "undefined" ? window.innerWidth : 1024));
    const maxWidth = Math.min(420, Math.max(240, vw - 24));
    const finalWidth = Math.min(360, maxWidth);
    return {
      position: "fixed",
      left: "50%",
      transform: "translateX(-50%)",
      bottom,
      zIndex: 9999,
      width: finalWidth + "px",
      maxWidth: "95%",
      boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
      borderRadius: "12px",
      overflow: "hidden",
    };
  };

  const picker =
    showEmoji && mounted && pickerRootRef.current
      ? createPortal(
        <div style={computePickerStyle()}>
          <div style={{ background: "white", borderRadius: 12, overflow: "hidden" }}>
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              previewConfig={{ showPreview: false }}
              skinTonesDisabled
              searchDisabled={false}
              lazyLoadEmojis
              height={320}
              width="100%"
            />
          </div>
        </div>,
        pickerRootRef.current
      )
      : null;

  return (
    <div className="relative">
      <div className="flex items-end bg-white rounded-xl shadow-sm border border-gray-200 p-2 transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
        <button
          ref={toggleRef}
          onClick={toggleEmoji}
          className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 text-gray-500 hover:text-indigo-600 transition-colors duration-200"
          type="button"
          aria-label="Toggle emoji picker"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <textarea
          ref={(el) => {
            textareaRef.current = el;
            inputRef.current = el;
          }}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          onFocus={() => {
            setShowEmoji(false);
          }}
          className="flex-1 min-h-[40px] max-h-40 px-3 py-2.5 focus:outline-none resize-none text-sm leading-5"
          placeholder="Type a message…"
          aria-label="Message"
        />

        <button
          onClick={send}
          disabled={sendMutation.isLoading || !input.trim()}
          className={`flex items-center justify-center h-10 w-10 rounded-full transition-all duration-200 ${input.trim() ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-gray-100 text-gray-400"}`}
          type="button"
          aria-label="Send message"
        >
          {sendMutation.isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      {picker}
    </div>
  );
}
