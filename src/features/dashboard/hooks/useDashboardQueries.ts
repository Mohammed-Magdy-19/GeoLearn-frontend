/**
 * src/features/dashboard/hooks/useDashboardQueries.ts
 *
 * TanStack Query hooks for dashboard analytics and data fetching.
 * Provides cached, background-refreshed KPI data and chart datasets.
 */

import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboardStats,
  fetchEnrollmentTrends,
  fetchCoursePopularity,
} from "../api/dashboardApi";

// ─────────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────────

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  trends: () => [...dashboardKeys.all, "trends"] as const,
  popularity: () => [...dashboardKeys.all, "popularity"] as const,
};

// ─────────────────────────────────────────────────────────────
// KPI Stats Hook
// ─────────────────────────────────────────────────────────────

/**
 * Fetch dashboard KPI statistics.
 * Refreshes every 60 seconds to keep data current.
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: fetchDashboardStats,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // Auto-refresh every 60s
    refetchOnWindowFocus: true,
    retry: 2,
  });
};

// ─────────────────────────────────────────────────────────────
// Enrollment Trends Hook
// ─────────────────────────────────────────────────────────────

/**
 * Fetch monthly enrollment trends for charting.
 */
export const useEnrollmentTrends = () => {
  return useQuery({
    queryKey: dashboardKeys.trends(),
    queryFn: fetchEnrollmentTrends,
    staleTime: 5 * 60_000, // 5 minutes
    retry: 2,
  });
};

// ─────────────────────────────────────────────────────────────
// Course Popularity Hook
// ─────────────────────────────────────────────────────────────

/**
 * Fetch course popularity rankings.
 */
export const useCoursePopularity = () => {
  return useQuery({
    queryKey: dashboardKeys.popularity(),
    queryFn: fetchCoursePopularity,
    staleTime: 5 * 60_000,
    retry: 2,
  });
};
