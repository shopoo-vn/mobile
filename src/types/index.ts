// Shared types mirroring the backend REST contract.

export type Role = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  phone?: string | null;
  display_name: string;
  avatar_url?: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  // Auth service may include an expiry hint; optional and not relied upon.
  expires_in?: number;
}

export interface LoginResponse {
  user: User;
  tokens: TokenPair;
}

export type ListingCondition = 'new' | 'like_new' | 'used';
export type ListingStatus = 'pending' | 'active' | 'rejected' | 'sold' | 'hidden';

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  location: string | null;
  condition: ListingCondition;
  status: ListingStatus;
  mediaIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

// Standard list envelope used by paginated endpoints.
export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export interface Conversation {
  id: string;
  listingId: string | null;
  // The other participant (resolved by the chat service).
  peerId: string;
  peerName?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  // Optimistic client-generated id for idempotent send/echo reconciliation.
  clientMsgId?: string;
  createdAt: string;
}

export interface UploadedMedia {
  id: string;
  url: string;
}

// Backend error shape is always { "error": string }.
export interface ApiError {
  error: string;
}
