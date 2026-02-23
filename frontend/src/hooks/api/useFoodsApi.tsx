import axios from "axios";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  FoodItemPaginatedResponse,
  foodItemPaginatedResponseSchema,
  FoodItem,
  foodItemSchema,
  supportedFoodAttributes,
  foodFilterSchema,
} from "@lunch-box-reviews/shared-types";
import { API_URL } from "../../constants";
import useSearchState from "../useSearchState";
import SearchFilters from "../../utils/search/searchFilters";


function buildFoodFilterQuery(searchFilters: SearchFilters): string {
  for (const attribute of supportedFoodAttributes) {
    const filter = searchFilters[attribute];

    if (!filter || !filter.selected) continue;

    const value = searchFilters.searchInput?.trim();
    if (!value) continue;

    const parsed = foodFilterSchema.safeParse({
      filterAttribute: attribute,
      filterString: value,
    });

    if (!parsed.success) continue;

    return `&${attribute}=${encodeURIComponent(value)}`;
  }

  return '';
}

export function useFoodItems(pageSize: number) {
  const { searchFilters } = useSearchState();
  const filterQuery = buildFoodFilterQuery(searchFilters);

  return useInfiniteQuery({
    queryKey: ['foods', pageSize, filterQuery],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const url = `${API_URL}foods?limit=${pageSize}&cursor=${pageParam ?? ''}${filterQuery ?? ''}`;
      const response = await axios.get<FoodItemPaginatedResponse>(url);
      return foodItemPaginatedResponseSchema.parse(response.data);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchOnWindowFocus: false
  });
}

export function useFood(foodId?: string) {
  return useQuery<FoodItem, Error>({
    queryKey: ['food', foodId],
    queryFn: async () => {
      const url = `${API_URL}foods/${foodId}`
      const response = await axios.get<FoodItem>(url);
      return foodItemSchema.parse(response.data);
    },
  })
}