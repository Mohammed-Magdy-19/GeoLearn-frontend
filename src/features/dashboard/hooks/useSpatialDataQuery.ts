/**
 * src/features/dashboard/hooks/useSpatialDataQuery.ts
 */
import { useQuery } from "@tanstack/react-query";
import { fetchAdminSpatialData } from "../api/spatialDataApi";

export const spatialDataKeys = {
  all: ["dashboard", "spatial-data"] as const,
  list: (page: number, search: string) =>
    [...spatialDataKeys.all, "list", page, search] as const,
};

export function useAdminSpatialData(page: number = 1, search: string = "") {
  return useQuery({
    queryKey: spatialDataKeys.list(page, search),
    queryFn: () => fetchAdminSpatialData(page, search),
    placeholderData: (prev) => prev,
  });
}
