import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Centralised query keys so cache invalidation stays consistent.
export const queryKeys = {
  listings: (params?: unknown) => ['listings', params ?? {}] as const,
  listing: (id: string) => ['listing', id] as const,
  me: () => ['me'] as const,
  conversations: () => ['conversations'] as const,
  messages: (conversationId: string) =>
    ['messages', conversationId] as const,
};
