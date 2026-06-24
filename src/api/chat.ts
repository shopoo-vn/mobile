import { chatClient } from './client';
import { Conversation, Message } from '@/types';

export async function fetchConversations(): Promise<Conversation[]> {
  const res = await chatClient.get<{ items: Conversation[] }>('/conversations');
  return res.data.items;
}

export interface MessageHistoryQuery {
  // Cursor: fetch messages older than this ISO timestamp (keyset pagination).
  before?: string;
  limit?: number;
}

export async function fetchMessages(
  conversationId: string,
  query: MessageHistoryQuery = {},
): Promise<Message[]> {
  const res = await chatClient.get<{ items: Message[] }>(
    `/conversations/${conversationId}/messages`,
    { params: query },
  );
  return res.data.items;
}

// Opens (or fetches) a conversation with a seller about a listing. Used by the
// "Chat với người bán" button on ListingDetail.
export async function openConversation(params: {
  peerId: string;
  listingId?: string;
}): Promise<Conversation> {
  const res = await chatClient.post<Conversation>('/conversations', params);
  return res.data;
}
