import { io, Socket } from 'socket.io-client';
import { API } from '@/config/env';
import { useAuthStore } from '@/store/authStore';
import { useSocketStore } from '@/store/socketStore';
import { Message } from '@/types';

// Single socket.io connection for the whole app, established AFTER login with
// the JWT in the handshake `auth`. Lifecycle is tied to auth + AppState by the
// caller (see useSocketLifecycle).

let socket: Socket | null = null;

type IncomingMessageHandler = (message: Message) => void;
const messageHandlers = new Set<IncomingMessageHandler>();

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(): void {
  const token = useAuthStore.getState().accessToken;
  if (!token) return;
  if (socket?.connected) return;

  // Tear down a stale instance before reconnecting with a fresh token.
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  useSocketStore.getState().setStatus('connecting');

  socket = io(API.chatBaseUrl, {
    transports: ['websocket'],
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    reconnectionAttempts: Infinity,
  });

  socket.on('connect', () => useSocketStore.getState().setStatus('connected'));
  socket.on('disconnect', () =>
    useSocketStore.getState().setStatus('disconnected'),
  );
  socket.io.on('reconnect_attempt', () =>
    useSocketStore.getState().setStatus('connecting'),
  );

  // chat-service emits { message }; unwrap to the bare Message for handlers.
  socket.on('message:new', (payload: { message: Message }) => {
    messageHandlers.forEach((h) => h(payload.message));
  });
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  useSocketStore.getState().setStatus('disconnected');
}

export function onIncomingMessage(handler: IncomingMessageHandler): () => void {
  messageHandlers.add(handler);
  return () => messageHandlers.delete(handler);
}

export interface SendMessageInput {
  conversationId: string;
  body: string;
  // Client-generated id for idempotency + optimistic echo reconciliation.
  clientMsgId: string;
}

export function sendMessage(input: SendMessageInput): void {
  socket?.emit('message:send', input);
}

export function emitTyping(conversationId: string): void {
  socket?.emit('typing', { conversationId });
}

export function emitRead(conversationId: string): void {
  socket?.emit('message:read', { conversationId });
}
