import axios from "axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { 
  reviewPaginatedResponseSchema,
  PaginationParameters,
  ReviewPaginatedResponse,
  UserPaginatedResponse,
  userPaginatedResponseSchema,
  FoodItemPaginatedResponse,
  foodItemPaginatedResponseSchema
} from "@lunch-box-reviews/shared-types";
import { API_URL } from "../constants";


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
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined
  });
}

async function fetchUsers({ cursor, limit }: PaginationParameters) {
  const url = `${API_URL}users?limit=${limit}&cursor=${cursor ?? ''}`
  const response = await axios.get<UserPaginatedResponse>(url);
  return userPaginatedResponseSchema.parse(response.data);
}

export function useUsers(pageSize: number) {
  return useInfiniteQuery({
    queryKey: ['users', pageSize],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      fetchUsers({ cursor: pageParam, limit: pageSize }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined
  });
}

async function fetchFoodItems({ cursor, limit }: PaginationParameters) {
  const url = `${API_URL}foods?limit=${limit}&cursor=${cursor ?? ''}`;
  const response = await axios.get<FoodItemPaginatedResponse>(url);
  return foodItemPaginatedResponseSchema.parse(response.data);
}

export function useFoodItems(pageSize: number) {
  return useInfiniteQuery({
    queryKey: ['foods', pageSize],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      fetchFoodItems({ cursor: pageParam, limit: pageSize }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined
  });
}