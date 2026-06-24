import { create } from 'zustand';

export type SocketStatus = 'disconnected' | 'connecting' | 'connected';

interface SocketState {
  status: SocketStatus;
  // Map of conversationId -> unread message count, for tab badges.
  unreadByConversation: Record<string, number>;

  setStatus: (status: SocketStatus) => void;
  setUnread: (conversationId: string, count: number) => void;
  incrementUnread: (conversationId: string) => void;
  clearUnread: (conversationId: string) => void;
  totalUnread: () => number;
  reset: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  status: 'disconnected',
  unreadByConversation: {},

  setStatus: (status) => set({ status }),

  setUnread: (conversationId, count) =>
    set((s) => ({
      unreadByConversation: { ...s.unreadByConversation, [conversationId]: count },
    })),

  incrementUnread: (conversationId) =>
    set((s) => ({
      unreadByConversation: {
        ...s.unreadByConversation,
        [conversationId]: (s.unreadByConversation[conversationId] ?? 0) + 1,
      },
    })),

  clearUnread: (conversationId) =>
    set((s) => {
      const next = { ...s.unreadByConversation };
      delete next[conversationId];
      return { unreadByConversation: next };
    }),

  totalUnread: () =>
    Object.values(get().unreadByConversation).reduce((a, b) => a + b, 0),

  reset: () => set({ status: 'disconnected', unreadByConversation: {} }),
}));
