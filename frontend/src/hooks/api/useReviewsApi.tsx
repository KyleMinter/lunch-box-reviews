import axios from "axios";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  reviewPaginatedResponseSchema,
  PaginationParameters,
  ReviewPaginatedResponse,
  Review,
} from "@lunch-box-reviews/shared-types";
import { API_URL } from "../../constants";
import useAppToast from "../useAppToast";
import useAuth from "../useAuth";


async function fetchReviews({ cursor, limit }: PaginationParameters) {
  const url = `${API_URL}reviews?limit=${limit}&cursor=${cursor ?? ''}`;
  const response = await axios.get<ReviewPaginatedResponse>(url);
  return reviewPaginatedResponseSchema.parse(response.data);
}

export function useReviews(pageSize: number) {
  return useInfiniteQuery({
    queryKey: ['reviews', pageSize],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      fetchReviews({ cursor: pageParam, limit: pageSize }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchOnWindowFocus: false
  });
}

async function fetchReviewsFromUser(userId: string, { cursor, limit }: PaginationParameters) {
  const url = `${API_URL}users/${userId}/reviews?limit=${limit}&cursor=${cursor ?? ''}`;
  const response = await axios.get<ReviewPaginatedResponse>(url);
  return reviewPaginatedResponseSchema.parse(response.data);
}

export function useReviewsFromUser(userId: string | undefined, pageSize: number) {
  return useInfiniteQuery({
    queryKey: ['reviews', 'user', userId, pageSize],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      fetchReviewsFromUser(userId!, {
        cursor: pageParam,
        limit: pageSize,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}

async function fetchReviewsFromFood(foodId: string, { cursor, limit }: PaginationParameters) {
  const url = `${API_URL}foods/${foodId}/reviews?limit=${limit}&cursor=${cursor ?? ''}`;
  const response = await axios.get<ReviewPaginatedResponse>(url);
  return reviewPaginatedResponseSchema.parse(response.data);
}

export function useReviewsFromFood(foodId: string | undefined, pageSize: number) {
  return useInfiniteQuery({
    queryKey: ['reviews', 'food', foodId, pageSize],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      fetchReviewsFromFood(foodId!, {
        cursor: pageParam,
        limit: pageSize,
      }),
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
