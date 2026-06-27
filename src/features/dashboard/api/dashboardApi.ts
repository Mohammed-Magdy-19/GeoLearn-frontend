/**
 * src/features/dashboard/api/dashboardApi.ts
 *
 * Axios-based API service for dashboard analytics and KPIs.
 * All endpoints are prefixed with /api/admin/ and require staff privileges.
 */

import api from "../../../services/api";
import type {
  DashboardStats,
  EnrollmentTrend,
  CoursePopularity,
} from "../types/dashboardTypes";

// ─────────────────────────────────────────────────────────────
// KPI & Analytics
// ─────────────────────────────────────────────────────────────

/**
 * Fetch aggregated dashboard statistics.
 * GET /api/admin/stats/
 */
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get<DashboardStats>("/admin/stats/");
  return data;
};

/**
 * Fetch monthly enrollment trends for the chart.
 * GET /api/admin/stats/enrollment-trends/
 */
export const fetchEnrollmentTrends = async (): Promise<EnrollmentTrend[]> => {
  const { data } = await api.get<EnrollmentTrend[]>(
    "/admin/stats/enrollment-trends/"
  );
  return data;
};

/**
 * Fetch course popularity rankings.
 * GET /api/admin/stats/course-popularity/
 */
export const fetchCoursePopularity = async (): Promise<CoursePopularity[]> => {
  const { data } = await api.get<CoursePopularity[]>(
    "/admin/stats/course-popularity/"
  );
  return data;
};
