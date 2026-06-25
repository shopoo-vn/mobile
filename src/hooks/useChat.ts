import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as chatApi from '@/api/chat';
import { queryKeys } from '@/query/queryClient';
import { onIncomingMessage, sendMessage } from '@/realtime/socket';
import { useAuthStore } from '@/store/authStore';
import { useSocketStore } from '@/store/socketStore';
import { Message } from '@/types';

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations(),
    queryFn: chatApi.fetchConversations,
  });
}

// Loads message history (REST) and reconciles live socket messages into the
// same React Query cache so the UI has a single source of truth.
export function useMessages(conversationId: string) {
  const qc = useQueryClient();
  const clearUnread = useSocketStore((s) => s.clearUnread);

  const query = useQuery({
    queryKey: queryKeys.messages(conversationId),
    queryFn: () => chatApi.fetchMessages(conversationId),
    enabled: Boolean(conversationId),
  });

  useEffect(() => {
    clearUnread(conversationId);
    const off = onIncomingMessage((incoming: Message) => {
      if (incoming.conversationId !== conversationId) return;
      qc.setQueryData<Message[]>(
        queryKeys.messages(conversationId),
        (prev: Message[] = []) => {
          // Reconcile optimistic echo by clientMsgId, else append.
          const idx = incoming.clientMsgId
            ? prev.findIndex((m) => m.clientMsgId === incoming.clientMsgId)
            : -1;
          if (idx >= 0) {
            const next = prev.slice();
            next[idx] = incoming;
            return next;
          }
          if (prev.some((m) => m.id === incoming.id)) return prev;
          return [...prev, incoming];
        },
      );
    });
    return off;
  }, [conversationId, qc, clearUnread]);

  return query;
}

export function useSendMessage(conversationId: string) {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id ?? '');

  return useMutation({
    mutationFn: async (body: string) => {
      const clientMsgId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const optimistic: Message = {
        id: clientMsgId,
        conversationId,
        senderId: userId,
        body,
        clientMsgId,
        createdAt: new Date().toISOString(),
      };
      qc.setQueryData<Message[]>(
        queryKeys.messages(conversationId),
        (prev = []) => [...prev, optimistic],
      );
      sendMessage({ conversationId, body, clientMsgId });
      return optimistic;
    },
  });
}
