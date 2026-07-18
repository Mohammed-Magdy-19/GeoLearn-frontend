/**
 * src/routes/AppRoutes.tsx
 *
 * SRP: Single Responsibility Principle.
 * This component is a pure router renderer. It maps declarative route data
 * from the registry to React Router v6 elements. It has no responsibility
 * for importing components or configuring paths directly.
 */

import { Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ProtectedRoute, AdminRoute } from "./ProtectedRoute";

// ── Layouts (loaded eagerly — they wrap everything) ─────────────────────────
import { DashboardLayout } from "../layouts/DashboardLayout";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

// ── Shared boundary components ──────────────────────────────────────────────
import ErrorBoundary from "@/components/feedback/ErrorBoundary";
import PageLoader from "@/components/feedback/PageLoader";

// ── Route Configurations ────────────────────────────────────────────────────
import {
  publicRoutes,
  authRoutes,
  protectedRoutes,
  adminRoutes,
} from "./routeRegistry";

// ── Suspense + ErrorBoundary wrapper ────────────────────────────────────────

interface LazyWrapperProps {
  children: React.ReactNode;
}

/**
 * Wraps page components with both an ErrorBoundary (catches render failures)
 * and a Suspense boundary (renders loader during chunk fetching).
 */
function Lazy({ children }: LazyWrapperProps) {
  const location = useLocation();
  return (
    <ErrorBoundary key={location.pathname}>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// ── Router Renderer ─────────────────────────────────────────────────────────

export const AppRoutes = () => (
  <Routes>
    {/* ── Public & Protected Student Layout Wrapper ──────────────────────── */}
    <Route element={<MainLayout />}>
      {/* Public Pages */}
      {publicRoutes.map((route) => {
        const Component = route.component;
        return (
          <Route
            key={route.key}
            path={route.path}
            element={
              <Lazy>
                <Component />
              </Lazy>
            }
          />
        );
      })}

      {/* Protected Student Pages */}
      <Route element={<ProtectedRoute />}>
        {protectedRoutes.map((route) => {
          const Component = route.component;
          return (
            <Route
              key={route.key}
              path={route.path}
              element={
                <Lazy>
                  <Component />
                </Lazy>
              }
            />
          );
        })}
      </Route>
    </Route>

    {/* ── Auth Layout Wrapper ─────────────────────────────────────────────── */}
    <Route element={<AuthLayout />}>
      {authRoutes.map((route) => {
        const Component = route.component;
        return (
          <Route
            key={route.key}
            path={route.path}
            element={
              <Lazy>
                <Component />
              </Lazy>
            }
          />
        );
      })}
    </Route>

    {/* ── Admin Dashboard Layout Wrapper ─────────────────────────────────── */}
    <Route element={<AdminRoute />}>
      <Route element={<DashboardLayout />}>
        {adminRoutes.map((route) => {
          const Component = route.component;
          return (
            <Route
              key={route.key}
              path={route.path}
              element={
                <Lazy>
                  <Component />
                </Lazy>
              }
            />
          );
        })}
      </Route>
    </Route>

    {/* ── Catch-all Fallback ─────────────────────────────────────────────── */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
