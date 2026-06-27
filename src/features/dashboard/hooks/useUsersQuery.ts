/**
 * src/features/dashboard/hooks/useUsersQuery.ts
 *
 * TanStack Query hook for fetching paginated users with filters.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "../api/usersApi";
import type { UserFilters } from "../types/dashboardTypes";

const usersListKey = ["dashboard", "users"] as const;

/**
 * Fetch paginated users list with filters.
 * Supports search, role filter, and active status filter.
 */
export const useUsersQuery = (
  filters: UserFilters,
  page: number = 1,
  pageSize: number = 20
) => {
  return useQuery({
    queryKey: [...usersListKey, filters, page, pageSize],
    queryFn: () => fetchUsers(filters, page, pageSize),
    staleTime: 15_000, // 15 seconds
    retry: 2,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
};
