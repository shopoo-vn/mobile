import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import * as listingsApi from '@/api/listings';
import { queryKeys } from '@/query/queryClient';
import { Listing, Paginated } from '@/types';

const PAGE_LIMIT = 20;

// Infinite feed for Home + Search. `filters` excludes paging fields.
export function useListingsFeed(filters: Omit<listingsApi.ListingQuery, 'page' | 'limit'> = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.listings(filters),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      listingsApi.fetchListings({ ...filters, page: pageParam, limit: PAGE_LIMIT }),
    getNextPageParam: (lastPage: Paginated<Listing>) => {
      const loaded = lastPage.page * lastPage.limit;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: queryKeys.listing(id),
    queryFn: () => listingsApi.fetchListing(id),
    enabled: Boolean(id),
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: listingsApi.CreateListingPayload) =>
      listingsApi.createListing(payload),
    onSuccess: () => {
      // New listing invalidates every feed variant.
      qc.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}
