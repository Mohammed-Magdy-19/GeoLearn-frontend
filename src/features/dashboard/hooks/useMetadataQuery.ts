/**
 * src/features/dashboard/hooks/useMetadataQuery.ts
 */
import { useQuery } from "@tanstack/react-query";
import { fetchAdminMetadata } from "../api/metadataApi";

export const metadataKeys = {
  all: ["dashboard", "metadata"] as const,
  list: (page: number, search: string) =>
    [...metadataKeys.all, "list", page, search] as const,
};

export function useAdminMetadata(page: number = 1, search: string = "") {
  return useQuery({
    queryKey: metadataKeys.list(page, search),
    queryFn: () => fetchAdminMetadata(page, search),
    placeholderData: (prev) => prev,
  });
}
