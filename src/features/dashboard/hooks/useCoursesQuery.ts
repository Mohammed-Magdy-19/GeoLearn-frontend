/**
 * src/features/dashboard/hooks/useCoursesQuery.ts
 *
 * TanStack Query hooks for course management data fetching.
 */

import { useQuery } from "@tanstack/react-query";
import {
  fetchAdminCourses,
  fetchAdminCourseDetail,
} from "../api/coursesApi";

const coursesListKey = ["dashboard", "courses"] as const;

/**
 * Fetch paginated admin courses list with optional search.
 */
export const useAdminCourses = (page: number = 1, search: string = "") => {
  return useQuery({
    queryKey: [...coursesListKey, page, search],
    queryFn: () => fetchAdminCourses(page, search),
    staleTime: 15_000,
    retry: 2,
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Fetch single course detail with nested modules & lessons.
 */
export const useAdminCourseDetail = (courseId: string) => {
  return useQuery({
    queryKey: [...coursesListKey, courseId],
    queryFn: () => fetchAdminCourseDetail(courseId),
    staleTime: 30_000,
    retry: 2,
    enabled: !!courseId, // Only fetch when courseId is provided
  });
};
