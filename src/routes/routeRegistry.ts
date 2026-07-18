/**
 * src/routes/routeRegistry.ts
 *
 * SRP: Single Responsibility Principle.
 * OCP: Open/Closed Principle.
 * Holds all route configuration data. The registry is completely decoupled
 * from the rendering components. New routes can be registered by adding
 * configs here without modifying the core AppRoutes rendering component.
 */

import { lazy } from "react";
import { ROUTE_PATHS } from "./routeKeys";
import type {
  PublicRouteConfig,
  ProtectedRouteConfig,
  AuthRouteConfig,
  AdminRouteConfig,
} from "./types";

// ── Lazy page-level components ─────────────────────────────────────────────

// Auth
const LoginForm = lazy(() => import("@/features/auth/components/LoginForm"));
const RegisterForm = lazy(() => import("@/features/auth/components/RegisterForm"));

// Public Pages
const Home = lazy(() => import("@/features/home/page/Home"));
const CoursesPage = lazy(() =>
  import("@/features/courses/pages/CoursesPage").then((m) => ({ default: m.CoursesPage }))
);
const CourseDetailPage = lazy(() =>
  import("@/features/courses/pages/CourseDetailPage").then((m) => ({ default: m.CourseDetailPage }))
);

// Protected Student Pages
const ProfilePage = lazy(() => import("@/features/user-profile/pages/ProfilePage"));
const MyCoursesPage = lazy(() => import("@/features/courses/pages/MyCoursesPage"));
const SummariesPage = lazy(() => import("@/features/courses/pages/SummariesPage"));
const MetadataPage = lazy(() => import("@/features/courses/pages/MetadataPage"));
const ProgramsPage = lazy(() => import("@/features/courses/pages/ProgramsPage"));
const SpatialDataPage = lazy(() => import("@/features/courses/pages/SpatialDataPage"));
const NotificationsPage = lazy(() => import("@/features/notifications/pages/NotificationsPage"));
const WatchPage = lazy(() =>
  import("@/features/video/components/WatchPage").then((m) => ({ default: m.WatchPage }))
);

// Admin Dashboard Pages
const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);
const UsersManagementPage = lazy(() => import("@/features/dashboard/pages/UsersManagementPage"));
const CoursesManagementPage = lazy(() => import("@/features/dashboard/pages/CoursesManagementPage"));
const SummariesManagementPage = lazy(() => import("@/features/dashboard/pages/SummariesManagementPage"));
const MetadataManagementPage = lazy(() => import("@/features/dashboard/pages/MetadataManagementPage"));
const ProgramsManagementPage = lazy(() => import("@/features/dashboard/pages/ProgramsManagementPage"));
const SpatialDataManagementPage = lazy(() => import("@/features/dashboard/pages/SpatialDataManagementPage"));
const NotificationsManagementPage = lazy(() => import("@/features/dashboard/pages/NotificationsManagementPage"));

// ── Route Collections ───────────────────────────────────────────────────────

export const publicRoutes: PublicRouteConfig[] = [
  {
    key: "HOME",
    path: ROUTE_PATHS.HOME,
    component: Home,
    type: "public",
  },
  {
    key: "COURSES",
    path: ROUTE_PATHS.COURSES,
    component: CoursesPage,
    type: "public",
  },
  {
    key: "COURSE_DETAIL",
    path: ROUTE_PATHS.COURSE_DETAIL,
    component: CourseDetailPage,
    type: "public",
  },
];

export const authRoutes: AuthRouteConfig[] = [
  {
    key: "LOGIN",
    path: ROUTE_PATHS.LOGIN,
    component: LoginForm,
    type: "auth",
  },
  {
    key: "REGISTER",
    path: ROUTE_PATHS.REGISTER,
    component: RegisterForm,
    type: "auth",
  },
];

export const protectedRoutes: ProtectedRouteConfig[] = [
  {
    key: "PROFILE",
    path: ROUTE_PATHS.PROFILE,
    component: ProfilePage,
    type: "protected",
  },
  {
    key: "MY_COURSES",
    path: ROUTE_PATHS.MY_COURSES,
    component: MyCoursesPage,
    type: "protected",
  },
  {
    key: "SUMMARIES",
    path: ROUTE_PATHS.SUMMARIES,
    component: SummariesPage,
    type: "protected",
  },
  {
    key: "METADATA",
    path: ROUTE_PATHS.METADATA,
    component: MetadataPage,
    type: "protected",
  },
  {
    key: "PROGRAMS",
    path: ROUTE_PATHS.PROGRAMS,
    component: ProgramsPage,
    type: "protected",
  },
  {
    key: "SPATIAL_DATA",
    path: ROUTE_PATHS.SPATIAL_DATA,
    component: SpatialDataPage,
    type: "protected",
  },
  {
    key: "NOTIFICATIONS",
    path: ROUTE_PATHS.NOTIFICATIONS,
    component: NotificationsPage,
    type: "protected",
  },
  {
    key: "WATCH_LESSON",
    path: ROUTE_PATHS.WATCH_LESSON,
    component: WatchPage,
    type: "protected",
  },
];

export const adminRoutes: AdminRouteConfig[] = [
  {
    key: "DASHBOARD",
    path: ROUTE_PATHS.DASHBOARD,
    component: DashboardPage,
    type: "admin",
  },
  {
    key: "DASHBOARD_USERS",
    path: ROUTE_PATHS.DASHBOARD_USERS,
    component: UsersManagementPage,
    type: "admin",
  },
  {
    key: "DASHBOARD_COURSES",
    path: ROUTE_PATHS.DASHBOARD_COURSES,
    component: CoursesManagementPage,
    type: "admin",
  },
  {
    key: "DASHBOARD_COURSE_DETAIL",
    path: ROUTE_PATHS.DASHBOARD_COURSE_DETAIL,
    component: CoursesManagementPage, // Shared management view
    type: "admin",
  },
  {
    key: "DASHBOARD_SUMMARIES",
    path: ROUTE_PATHS.DASHBOARD_SUMMARIES,
    component: SummariesManagementPage,
    type: "admin",
  },
  {
    key: "DASHBOARD_METADATA",
    path: ROUTE_PATHS.DASHBOARD_METADATA,
    component: MetadataManagementPage,
    type: "admin",
  },
  {
    key: "DASHBOARD_PROGRAMS",
    path: ROUTE_PATHS.DASHBOARD_PROGRAMS,
    component: ProgramsManagementPage,
    type: "admin",
  },
  {
    key: "DASHBOARD_SPATIAL_DATA",
    path: ROUTE_PATHS.DASHBOARD_SPATIAL_DATA,
    component: SpatialDataManagementPage,
    type: "admin",
  },
  {
    key: "DASHBOARD_NOTIFICATIONS",
    path: ROUTE_PATHS.DASHBOARD_NOTIFICATIONS,
    component: NotificationsManagementPage,
    type: "admin",
  },
];
