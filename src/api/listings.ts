import { listingClient } from './client';
import { Listing, ListingCondition, Paginated } from '@/types';

export type ListingSort = 'newest' | 'price_asc' | 'price_desc';

export interface ListingQuery {
  page?: number;
  limit?: number;
  q?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  condition?: ListingCondition;
  sort?: ListingSort;
}

export async function fetchListings(
  query: ListingQuery,
): Promise<Paginated<Listing>> {
  const res = await listingClient.get<Paginated<Listing>>('/listings', {
    params: query,
  });
  return res.data;
}

export async function fetchListing(id: string): Promise<Listing> {
  const res = await listingClient.get<Listing>(`/listings/${id}`);
  return res.data;
}

export interface CreateListingPayload {
  title: string;
  description?: string;
  price: number;
  categoryId: string;
  location?: string;
  condition: ListingCondition;
  mediaIds?: string[];
}

export async function createListing(
  payload: CreateListingPayload,
): Promise<Listing> {
  const res = await listingClient.post<Listing>('/listings', payload);
  return res.data;
}
