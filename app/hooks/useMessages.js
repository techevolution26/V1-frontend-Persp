// app/hooks/useMessages.js

import { useInfiniteQuery } from "@tanstack/react-query";

export function useMessages(peerId, token) {
  return useInfiniteQuery({
    queryKey: ["messages", peerId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(
        `/api/conversations/${peerId}?page=${pageParam}&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch messages");
      const messages = await res.json(); // raw array of messages
      return {
        data: messages,
        // our backend doesn’t paginate further, so:
        nextPage: undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: Boolean(peerId && token),
    staleTime: 1000 * 60 * 5,
  });
}
