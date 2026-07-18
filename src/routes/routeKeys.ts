/**
 * src/routes/routeKeys.ts
 *
 * DIP: Dependency Inversion Principle.
 * Maps route semantic keys to their string paths. Eliminates hardcoded
 * path strings and ensures type safety when referencing routes.
 */

export const ROUTE_PATHS = {
  HOME: "/",
  COURSES: "/courses",
  COURSE_DETAIL: "/courses/:courseId",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  MY_COURSES: "/my-courses",
  SUMMARIES: "/summaries",
  METADATA: "/metadata",
  PROGRAMS: "/programs",
  SPATIAL_DATA: "/spatial-data",
  NOTIFICATIONS: "/notifications",
  WATCH_LESSON: "/courses/:slug/watch/:lessonId",
  DASHBOARD: "/dashboard",
  DASHBOARD_USERS: "/dashboard/users",
  DASHBOARD_COURSES: "/dashboard/courses",
  DASHBOARD_COURSE_DETAIL: "/dashboard/courses/:courseId",
  DASHBOARD_SUMMARIES: "/dashboard/summaries",
  DASHBOARD_METADATA: "/dashboard/metadata",
  DASHBOARD_PROGRAMS: "/dashboard/programs",
  DASHBOARD_SPATIAL_DATA: "/dashboard/spatial-data",
  DASHBOARD_NOTIFICATIONS: "/dashboard/notifications",
} as const;

export type RouteKey = keyof typeof ROUTE_PATHS;
