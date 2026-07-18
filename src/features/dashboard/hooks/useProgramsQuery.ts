/**
 * src/features/dashboard/hooks/useProgramsQuery.ts
 */
import { useQuery } from "@tanstack/react-query";
import { fetchAdminPrograms } from "../api/programsApi";

export const programKeys = {
  all: ["dashboard", "programs"] as const,
  list: (page: number, search: string) =>
    [...programKeys.all, "list", page, search] as const,
};

export function useAdminPrograms(page: number = 1, search: string = "") {
  return useQuery({
    queryKey: programKeys.list(page, search),
    queryFn: () => fetchAdminPrograms(page, search),
    placeholderData: (prev) => prev,
  });
}
