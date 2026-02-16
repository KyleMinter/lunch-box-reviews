import axios from "axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { 
  reviewPaginatedResponseSchema,
  PaginationParameters,
  ReviewPaginatedResponse,
} from "@lunch-box-reviews/shared-types";
import { API_URL } from "../../constants";


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
