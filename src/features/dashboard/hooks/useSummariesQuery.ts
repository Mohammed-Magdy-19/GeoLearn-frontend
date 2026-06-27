/**
 * src/features/dashboard/hooks/useSummariesQuery.ts
 *
 * TanStack Query hook for fetching admin summaries.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchAdminSummaries } from "../api/summariesApi";

export const summaryKeys = {
  all: ["dashboard", "summaries"] as const,
  list: (page: number, search: string) =>
    [...summaryKeys.all, "list", page, search] as const,
};

/**
 * Fetch paginated admin summaries with search filter.
 */
export function useAdminSummaries(
  page: number = 1,
  search: string = ""
) {
  return useQuery({
    queryKey: summaryKeys.list(page, search),
    queryFn: () => fetchAdminSummaries(page, search),
    placeholderData: (prev) => prev,
  });
}
