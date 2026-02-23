import axios from "axios";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  reviewPaginatedResponseSchema,
  ReviewPaginatedResponse,
  Review,
  dateFilterSchema,
} from "@lunch-box-reviews/shared-types";
import { API_URL } from "../../constants";
import useAppToast from "../useAppToast";
import useAuth from "../useAuth";
import SearchFilters from "../../utils/search/searchFilters";
import useSearchState from "../useSearchState";


export function buildReviewFilterQuery(
  searchFilters: SearchFilters
): string {
  const startDate =
    searchFilters.startDate?.selected && searchFilters.startDate.value
      ? searchFilters.startDate.value.toISOString()
      : undefined;

  const endDate =
    searchFilters.endDate?.selected && searchFilters.endDate.value
      ? searchFilters.endDate.value.toISOString()
      : undefined;

  if (!startDate && !endDate) {
    return '';
  }

  const parsed = dateFilterSchema.safeParse({ startDate, endDate });
  if (!parsed.success) {
    return '';
  }

  let query = '';

  if (startDate) {
    query += `&startDate=${encodeURIComponent(startDate)}`;
  }

  if (endDate) {
    query += `&endDate=${encodeURIComponent(endDate)}`;
  }

  return query;
}

export function useReviews(pageSize: number) {
  const { searchFilters } = useSearchState();
  const filterQuery = buildReviewFilterQuery(searchFilters);

  return useInfiniteQuery({
    queryKey: ['reviews', pageSize, filterQuery],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const url = `${API_URL}reviews?limit=${pageSize}&cursor=${pageParam ?? ''}${filterQuery ?? ''}`;
      const response = await axios.get<ReviewPaginatedResponse>(url);
      return reviewPaginatedResponseSchema.parse(response.data);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchOnWindowFocus: false
  });
}

export function useReviewsFromUser(userId: string | undefined, pageSize: number) {
  return useInfiniteQuery({
    queryKey: ['reviews', 'user', userId, pageSize],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const url = `${API_URL}users/${userId}/reviews?limit=${pageSize}&cursor=${pageParam ?? ''}`;
      const response = await axios.get<ReviewPaginatedResponse>(url);
      return reviewPaginatedResponseSchema.parse(response.data);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}

export function useReviewsFromFood(foodId: string | undefined, pageSize: number) {
  return useInfiniteQuery({
    queryKey: ['reviews', 'food', foodId, pageSize],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const url = `${API_URL}foods/${foodId}/reviews?limit=${pageSize}&cursor=${pageParam ?? ''}`;
      const response = await axios.get<ReviewPaginatedResponse>(url);
      return reviewPaginatedResponseSchema.parse(response.data);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!foodId,
    refetchOnWindowFocus: false,
  });
}

export function useDeleteReview() {
  const toast = useAppToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, getAccessTokenSilently } = useAuth();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      if (!isAuthenticated) {
        throw new Error('User is not authenticated');
      }
      const token = await getAccessTokenSilently();
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      const url = `${API_URL}reviews/${reviewId}`;
      await axios.delete(url, { headers: headers });
    },

    // Optimistic update
    onMutate: async (reviewId) => {
      await queryClient.cancelQueries({ queryKey: ['reviews'] });

      const previousData = queryClient.getQueriesData({
        queryKey: ['reviews']
      });

      // Remove review from all review queries
      queryClient.setQueriesData(
        { queryKey: ['reviews'] },
        (oldData: any) => {
          if (!oldData) return oldData;

          // Handle infinite query structure
          if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                items: page.items.filter(
                  (review: Review) => review.entityId !== reviewId
                )
              }))
            };
          }

          return oldData;
        }
      );

      return { previousData };
    },

    onSuccess: () => {
      toast.success('Review deleted');
    },

    // If request fails, rollback
    onError: (_err, _reviewId, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([keyboard, data]) => {
          queryClient.setQueryData(keyboard, data);
        });
      }
      toast.error('Failed to delete review');
    },

    // After success or error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    }
  });
}
