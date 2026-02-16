import axios from "axios";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { 
  PaginationParameters,
  UserPaginatedResponse,
  userPaginatedResponseSchema,
  User,
  userSchema,
} from "@lunch-box-reviews/shared-types";
import { API_URL } from "../../constants";


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
  })
}
