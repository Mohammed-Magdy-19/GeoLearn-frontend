/**
 * src/routes/AppRoutes.tsx
 *
 * Central routing configuration using React Router v6.
 *
 * All page-level route components are code-split via React.lazy()
 * and wrapped in a Suspense boundary with an ErrorBoundary parent
 * to gracefully handle chunk-loading failures.
 *
 * Route tree:
 *   /                   → MainLayout (public marketing pages)
 *   /login              → AuthLayout > LoginForm
 *   /register           → AuthLayout > RegisterForm
 *   /dashboard/*        → ProtectedRoute > DashboardLayout (private)
 *   *                   → 404 redirect to /
 */

import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ProtectedRoute, AdminRoute } from "./ProtectedRoute";

// ── Layouts (loaded eagerly — they wrap everything) ─────────────────────────
import { DashboardLayout } from "../layouts/DashboardLayout";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

// ── Shared boundary components ──────────────────────────────────────────────
import ErrorBoundary from "@/components/feedback/ErrorBoundary";
import PageLoader from "@/components/feedback/PageLoader";

// ── Lazy route-level components ─────────────────────────────────────────────
//
// Components with `export default` load directly.
// Components with only named exports use a .then() adapter.
//
// Auth pages
const LoginForm = lazy(() => import("@/features/auth/components/LoginForm"));
const RegisterForm = lazy(() => import("@/features/auth/components/RegisterForm"));

// Public pages
const Home = lazy(() => import("@/features/home/page/Home"));
const CoursesPage = lazy(() =>
  import("@/features/courses/pages/CoursesPage").then((m) => ({ default: m.CoursesPage }))
);
const CourseDetailPage = lazy(() =>
  import("@/features/courses/pages/CourseDetailPage").then((m) => ({ default: m.CourseDetailPage }))
);

// Protected student pages
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

// Admin dashboard pages
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

// ── Suspense + ErrorBoundary wrapper (DRY) ──────────────────────────────────

/**
 * Wraps a lazily loaded page component with both an ErrorBoundary
 * (catches chunk-load / render failures) and a Suspense boundary
 * (shows a spinner while the chunk downloads).
 *
 * The ErrorBoundary receives a `key` derived from the current URL pathname.
 * This forces React to unmount/remount the boundary when navigating between
 * routes, which clears any stale error state from the previous page.
 */
function Lazy({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <ErrorBoundary key={location.pathname}>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// ── Route Tree ──────────────────────────────────────────────────────────────

export const AppRoutes = () => (
  <Routes>
    {/* ── Public & Protected Student Routes ───────────────── */}
    <Route element={<MainLayout />}>
      <Route index element={<Lazy><Home /></Lazy>} />
      <Route path="/courses" element={<Lazy><CoursesPage /></Lazy>} />
      <Route path="/courses/:courseId" element={<Lazy><CourseDetailPage /></Lazy>} />

      {/* Protected Student Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Lazy><ProfilePage /></Lazy>} />
        <Route path="/my-courses" element={<Lazy><MyCoursesPage /></Lazy>} />
        <Route path="/summaries" element={<Lazy><SummariesPage /></Lazy>} />
        <Route path="/metadata" element={<Lazy><MetadataPage /></Lazy>} />
        <Route path="/programs" element={<Lazy><ProgramsPage /></Lazy>} />
        <Route path="/spatial-data" element={<Lazy><SpatialDataPage /></Lazy>} />
        <Route path="/notifications" element={<Lazy><NotificationsPage /></Lazy>} />
        <Route path="/courses/:slug/watch/:lessonId" element={<Lazy><WatchPage /></Lazy>} />
      </Route>
    </Route>

    {/* ── Auth Routes ─────────────────────────────────────── */}
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<Lazy><LoginForm /></Lazy>} />
      <Route path="/register" element={<Lazy><RegisterForm /></Lazy>} />
    </Route>

    {/* ── Admin/Teacher Protected Routes ──────────────────── */}
    <Route element={<AdminRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Lazy><DashboardPage /></Lazy>} />
        <Route path="/dashboard/users" element={<Lazy><UsersManagementPage /></Lazy>} />
        <Route path="/dashboard/courses" element={<Lazy><CoursesManagementPage /></Lazy>} />
        <Route path="/dashboard/courses/:courseId" element={<Lazy><CoursesManagementPage /></Lazy>} />
        <Route path="/dashboard/summaries" element={<Lazy><SummariesManagementPage /></Lazy>} />
        <Route path="/dashboard/metadata" element={<Lazy><MetadataManagementPage /></Lazy>} />
        <Route path="/dashboard/programs" element={<Lazy><ProgramsManagementPage /></Lazy>} />
        <Route path="/dashboard/spatial-data" element={<Lazy><SpatialDataManagementPage /></Lazy>} />
        <Route path="/dashboard/notifications" element={<Lazy><NotificationsManagementPage /></Lazy>} />
      </Route>
    </Route>

    {/* ── Catch-all ───────────────────────────────────────── */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
