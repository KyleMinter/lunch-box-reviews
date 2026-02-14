import axios from "axios";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { 
  reviewPaginatedResponseSchema,
  PaginationParameters,
  ReviewPaginatedResponse,
  UserPaginatedResponse,
  userPaginatedResponseSchema,
  FoodItemPaginatedResponse,
  foodItemPaginatedResponseSchema,
  User,
  userSchema,
  FoodItem,
  foodItemSchema,
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
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchOnWindowFocus: false
  });
}

async function fetchUserById(userId: string) {
  const url = `${API_URL}users/${userId}`
  const response = await axios.get<User>(url);
  return userSchema.parse(response.data);
}

export function useUser(userId?: string) {
  return useQuery<User, Error>({
    queryKey: ['user', userId],
    queryFn: () => fetchUserById(userId!),
    enabled: !!userId
  })
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
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchOnWindowFocus: false
  });
}

async function fetchFoodById(foodId: string) {
  const url = `${API_URL}foods/${foodId}`
  const response = await axios.get<FoodItem>(url);
  return foodItemSchema.parse(response.data);
}

export function useFood(foodId?: string) {
  return useQuery<FoodItem, Error>({
    queryKey: ['food', foodId],
    queryFn: () => fetchFoodById(foodId!),
    enabled: !!foodId
  })
}