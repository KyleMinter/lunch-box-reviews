import axios from "axios";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  UserPaginatedResponse,
  userPaginatedResponseSchema,
  User,
  userSchema,
  supportedUserAttributes,
  userFilterSchema,
} from "@lunch-box-reviews/shared-types";
import { API_URL } from "../../constants";
import SearchFilters from "../../utils/search/searchFilters";
import useSearchState from "../useSearchState";


function buildUserFilterQuery(searchFilters: SearchFilters): string {
  for (const attribute of supportedUserAttributes) {
    const filter = searchFilters[attribute];

    if (!filter || !filter.selected) continue;

    const value = searchFilters.searchInput?.trim();
    if (!value) continue;

    const parsed = userFilterSchema.safeParse({
      filterAttribute: attribute,
      filterString: value,
    });

    if (!parsed.success) continue;

    return `&${attribute}=${encodeURIComponent(value)}`;
  }

  return '';
}

export function useUsers(pageSize: number) {
  const { searchFilters } = useSearchState();
  const filterQuery = buildUserFilterQuery(searchFilters);

  return useInfiniteQuery({
    queryKey: ['users', pageSize, filterQuery],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const url = `${API_URL}users?limit=${pageSize}&cursor=${pageParam ?? ''}${filterQuery ?? ''}`
      const response = await axios.get<UserPaginatedResponse>(url);
      return userPaginatedResponseSchema.parse(response.data);
    },
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
  })
}
