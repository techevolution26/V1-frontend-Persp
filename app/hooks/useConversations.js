import { useQuery } from '@tanstack/react-query';

export function useConversations(token) {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await fetch('/api/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch conversations');
      }
      return res.json();
    },
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,  // cache for 5 minutes
  });
}
