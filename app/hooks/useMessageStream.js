// app/hooks/useMessageStream.js
import { useEffect } from "react";
import Pusher from "pusher-js";
import Echo from "laravel-echo";

let echoInstancePromise = null;

function initEcho() {
  if (!echoInstancePromise) {
    echoInstancePromise = (async () => {
      window.Pusher = Pusher;
      return new Echo({
        broadcaster: "pusher",
        key: process.env.NEXT_PUBLIC_PUSHER_KEY,
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        forceTLS: true,
      });
    })();
  }
  return echoInstancePromise;
}

export function useMessageStream(peerId, onNewMessage) {
  useEffect(() => {
    if (!peerId) return;
    let channel;
    let mounted = true;

    (async () => {
      const echo = await initEcho();
      if (!mounted) return;
      channel = echo.channel(`conversations.${peerId}`);
      channel.listen("NewMessage", ({ message }) => {
        if (mounted) onNewMessage(message);
      });
    })();

    return () => {
      mounted = false;
      if (channel) channel.stopListening("NewMessage");
    };
  }, [peerId, onNewMessage]);
}
