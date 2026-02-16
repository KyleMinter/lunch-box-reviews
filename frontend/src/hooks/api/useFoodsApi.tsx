import axios from "axios";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { 
  PaginationParameters,
  FoodItemPaginatedResponse,
  foodItemPaginatedResponseSchema,
  FoodItem,
  foodItemSchema,
} from "@lunch-box-reviews/shared-types";
import { API_URL } from "../../constants";


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
  })
}