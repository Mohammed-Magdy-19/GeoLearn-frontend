/**
 * src/routes/routeRegistry.ts
 *
 * SRP: Single Responsibility Principle — pure data, zero rendering logic.
 * OCP: Open/Closed Principle — new routes are added by appending objects.
 *
 * Enterprise route registry. Each entry is a strongly-typed data object
 * containing the route path, dynamic import loader, layout type, guard
 * configuration, and SEO metadata. No JSX, no React.lazy() calls.
 *
 * Lazy loading is deferred to the AppRouter renderer.
 */

import { ROUTE_PATHS } from "./routeKeys";
import type {
  PublicRouteConfig,
  ProtectedRouteConfig,
  AuthRouteConfig,
  AdminRouteConfig,
} from "./types";

// ── Public Routes ──────────────────────────────────────────────────────────

export const publicRoutes: PublicRouteConfig[] = [
  {
    key: "HOME",
    path: ROUTE_PATHS.HOME,
    type: "public",
    layout: "main",
    index: true,
    loader: () => import("@/features/home/page/Home"),
    guard: { requiresAuth: false, allowedRoles: [] },
    meta: {
      title: "GeoLearn - Interactive Geography & Spatial Data Learning",
      rawTitle: true,
      description:
        "GeoLearn - An interactive, modern platform for learning geography, spatial data science, and GIS mapping.",
      canonical: "/",
      keywords: "geography, GIS, spatial data, learning, courses, mapping",
    },
  },
  {
    key: "COURSES",
    path: ROUTE_PATHS.COURSES,
    type: "public",
    layout: "main",
    loader: () =>
      import("@/features/courses/pages/CoursesPage").then((m) => ({
        default: m.CoursesPage,
      })),
    guard: { requiresAuth: false, allowedRoles: [] },
    meta: {
      title: "Courses",
      description:
        "Browse all available GeoLearn courses on geography, GIS, and spatial data science.",
      canonical: "/courses",
      keywords: "courses, geography courses, GIS training",
    },
  },
  {
    key: "COURSE_DETAIL",
    path: ROUTE_PATHS.COURSE_DETAIL,
    type: "public",
    layout: "main",
    loader: () =>
      import("@/features/courses/pages/CourseDetailPage").then((m) => ({
        default: m.CourseDetailPage,
      })),
    guard: { requiresAuth: false, allowedRoles: [] },
    meta: {
      title: "Course Details",
      description: "View detailed information about this GeoLearn course.",
      ogType: "article",
    },
  },
];

// ── Auth Routes ────────────────────────────────────────────────────────────

export const authRoutes: AuthRouteConfig[] = [
  {
    key: "LOGIN",
    path: ROUTE_PATHS.LOGIN,
    type: "auth",
    layout: "auth",
    loader: () => import("@/features/auth/components/LoginForm"),
    guard: { requiresAuth: false, allowedRoles: [] },
    meta: {
      title: "Sign In",
      description: "Sign in to your GeoLearn account to access courses and resources.",
      canonical: "/login",
      robots: "noindex, follow",
    },
  },
  {
    key: "REGISTER",
    path: ROUTE_PATHS.REGISTER,
    type: "auth",
    layout: "auth",
    loader: () => import("@/features/auth/components/RegisterForm"),
    guard: { requiresAuth: false, allowedRoles: [] },
    meta: {
      title: "Create Account",
      description: "Create a free GeoLearn account to start learning geography and GIS.",
      canonical: "/register",
      robots: "noindex, follow",
    },
  },
];

// ── Protected Student Routes ───────────────────────────────────────────────

export const protectedRoutes: ProtectedRouteConfig[] = [
  {
    key: "PROFILE",
    path: ROUTE_PATHS.PROFILE,
    type: "protected",
    layout: "main",
    loader: () => import("@/features/user-profile/pages/ProfilePage"),
    guard: { requiresAuth: true, allowedRoles: ["student", "instructor", "admin"] },
    meta: {
      title: "My Profile",
      description: "Manage your GeoLearn profile and account settings.",
      robots: "noindex, nofollow",
    },
  },
  {
    key: "MY_COURSES",
    path: ROUTE_PATHS.MY_COURSES,
    type: "protected",
    layout: "main",
    loader: () => import("@/features/courses/pages/MyCoursesPage"),
    guard: { requiresAuth: true, allowedRoles: ["student", "instructor", "admin"] },
    meta: {
      title: "My Courses",
      description: "View and manage your enrolled GeoLearn courses.",
      robots: "noindex, nofollow",
    },
  },
  {
    key: "SUMMARIES",
    path: ROUTE_PATHS.SUMMARIES,
    type: "protected",
    layout: "main",
    loader: () => import("@/features/courses/pages/SummariesPage"),
    guard: { requiresAuth: true, allowedRoles: ["student", "instructor", "admin"] },
    meta: {
      title: "Summaries",
      description: "Access course summaries and study materials.",
      robots: "noindex, nofollow",
    },
  },
  {
    key: "METADATA",
    path: ROUTE_PATHS.METADATA,
    type: "protected",
    layout: "main",
    loader: () => import("@/features/courses/pages/MetadataPage"),
    guard: { requiresAuth: true, allowedRoles: ["student", "instructor", "admin"] },
    meta: {
      title: "Metadata",
      description: "Browse geospatial metadata resources.",
      robots: "noindex, nofollow",
    },
  },
  {
    key: "PROGRAMS",
    path: ROUTE_PATHS.PROGRAMS,
    type: "protected",
    layout: "main",
    loader: () => import("@/features/courses/pages/ProgramsPage"),
    guard: { requiresAuth: true, allowedRoles: ["student", "instructor", "admin"] },
    meta: {
      title: "Programs",
      description: "Explore GeoLearn educational programs.",
      robots: "noindex, nofollow",
    },
  },
  {
    key: "SPATIAL_DATA",
    path: ROUTE_PATHS.SPATIAL_DATA,
    type: "protected",
    layout: "main",
    loader: () => import("@/features/courses/pages/SpatialDataPage"),
    guard: { requiresAuth: true, allowedRoles: ["student", "instructor", "admin"] },
    meta: {
      title: "Spatial Data",
      description: "Access and explore spatial datasets.",
      robots: "noindex, nofollow",
    },
  },
  {
    key: "NOTIFICATIONS",
    path: ROUTE_PATHS.NOTIFICATIONS,
    type: "protected",
    layout: "main",
    loader: () => import("@/features/notifications/pages/NotificationsPage"),
    guard: { requiresAuth: true, allowedRoles: ["student", "instructor", "admin"] },
    meta: {
      title: "Notifications",
      description: "View your latest notifications.",
      robots: "noindex, nofollow",
    },
  },
  {
    key: "WATCH_LESSON",
    path: ROUTE_PATHS.WATCH_LESSON,
    type: "protected",
    layout: "main",
    loader: () =>
      import("@/features/video/components/WatchPage").then((m) => ({
        default: m.WatchPage,
      })),
    guard: { requiresAuth: true, allowedRoles: ["student", "instructor", "admin"] },
    meta: {
      title: "Watch Lesson",
      description: "Watch your GeoLearn video lesson.",
      robots: "noindex, nofollow",
    },
  },
];

// ── Admin Dashboard Routes ─────────────────────────────────────────────────

export const adminRoutes: AdminRouteConfig[] = [
  {
    key: "DASHBOARD",
    path: ROUTE_PATHS.DASHBOARD,
    type: "admin",
    layout: "dashboard",
    loader: () =>
      import("@/features/dashboard/pages/DashboardPage").then((m) => ({
        default: m.DashboardPage,
      })),
    guard: { requiresAuth: true, allowedRoles: ["admin", "instructor"] },
    meta: {
      title: "Dashboard",
      description: "Admin dashboard overview.",
      robots: "noindex, nofollow",
    },
  },
  {
    key: "DASHBOARD_USERS",
    path: ROUTE_PATHS.DASHBOARD_USERS,
    type: "admin",
    layout: "dashboard",
    loader: () => import("@/features/dashboard/pages/UsersManagementPage"),
    guard: { requiresAuth: true, allowedRoles: ["admin"] },
    meta: {
      title: "Manage Users",
      description: "User management dashboard.",
      robots: "noindex, nofollow",
    },
  },
  {
    key: "DASHBOARD_COURSES",
    path: ROUTE_PATHS.DASHBOARD_COURSES,
    type: "admin",
    layout: "dashboard",
    loader: () => import("@/features/dashboard/pages/CoursesManagementPage"),
    guard: { requiresAuth: true, allowedRoles: ["admin"] },
    meta: {
      title: "Manage Courses",
      description: "Course management dashboard.",
      robots: "noindex, nofollow",
    },
  },
  {
    key: "DASHBOARD_COURSE_DETAIL",
    path: ROUTE_PATHS.DASHBOARD_COURSE_DETAIL,
    type: "admin",
    layout: "dashboard",
    loader: () => import("@/features/dashboard/pages/CoursesManagementPage"),
    guard: { requiresAuth: true, allowedRoles: ["admin"] },
    meta: {
      title: "Course Details",
      description: "Course detail management.",
      robots: "noindex, nofollow",
    },
  },
  {
    key: "DASHBOARD_SUMMARIES",
    path: ROUTE_PATHS.DASHBOARD_SUMMARIES,
    type: "admin",
    layout: "dashboard",
    loader: () => import("@/features/dashboard/pages/SummariesManagementPage"),
    guard: { requiresAuth: true, allowedRoles: ["admin"] },
    meta: {
      title: "Manage Summaries",
      description: "Summaries management dashboard.",
      robots: "noindex, nofollow",
    },
  },
  {
    key: "DASHBOARD_METADATA",
    path: ROUTE_PATHS.DASHBOARD_METADATA,
    type: "admin",
    layout: "dashboard",
    loader: () => import("@/features/dashboard/pages/MetadataManagementPage"),
    guard: { requiresAuth: true, allowedRoles: ["admin"] },
    meta: {
      title: "Manage Metadata",
      description: "Metadata management dashboard.",
      robots: "noindex, nofollow",
    },
  },
  {
    key: "DASHBOARD_PROGRAMS",
    path: ROUTE_PATHS.DASHBOARD_PROGRAMS,
    type: "admin",
    layout: "dashboard",
    loader: () => import("@/features/dashboard/pages/ProgramsManagementPage"),
    guard: { requiresAuth: true, allowedRoles: ["admin"] },
    meta: {
      title: "Manage Programs",
      description: "Programs management dashboard.",
      robots: "noindex, nofollow",
    },
  },
  {
    key: "DASHBOARD_SPATIAL_DATA",
    path: ROUTE_PATHS.DASHBOARD_SPATIAL_DATA,
    type: "admin",
    layout: "dashboard",
    loader: () => import("@/features/dashboard/pages/SpatialDataManagementPage"),
    guard: { requiresAuth: true, allowedRoles: ["admin"] },
    meta: {
      title: "Manage Spatial Data",
      description: "Spatial data management dashboard.",
      robots: "noindex, nofollow",
    },
  },
  {
    key: "DASHBOARD_NOTIFICATIONS",
    path: ROUTE_PATHS.DASHBOARD_NOTIFICATIONS,
    type: "admin",
    layout: "dashboard",
    loader: () => import("@/features/dashboard/pages/NotificationsManagementPage"),
    guard: { requiresAuth: true, allowedRoles: ["admin"] },
    meta: {
      title: "Manage Notifications",
      description: "Notifications management dashboard.",
      robots: "noindex, nofollow",
    },
  },
];

// ── Aggregate Registry ─────────────────────────────────────────────────────

/**
 * All routes in a single flat array for iteration by the router engine.
 */
export const allRoutes = [
  ...publicRoutes,
  ...authRoutes,
  ...protectedRoutes,
  ...adminRoutes,
] as const;
