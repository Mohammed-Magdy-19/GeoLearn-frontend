/**
 * src/routes/AppRouter.tsx
 *
 * Enterprise Router Engine.
 * SRP: Instantiates and maps data-driven route configurations to DOM trees.
 * Dynamically mounts React Helmet Async and Route Guard components.
 */

import React, { lazy, Suspense, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { allRoutes } from "./routeRegistry";
import { RouteGuardEngine } from "./RouteGuardEngine";
import { SEOHead } from "../components/seo/SEOHead";

// ── Layouts (loaded eagerly to prevent shell flickering) ────────────────────
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";

// ── Shared Feedback Components ──────────────────────────────────────────────
import ErrorBoundary from "@/components/feedback/ErrorBoundary";
import PageLoader from "@/components/feedback/PageLoader";

// ── Lazy Component Initialization ──────────────────────────────────────────

/**
 * Maps route keys to their React.lazy() wrapper instances.
 * Pre-created at module load time to prevent component re-creation and
 * subsequent unmount/remount layout cycles during renders.
 */
const lazyPageComponents = new Map<string, React.LazyExoticComponent<any>>();

allRoutes.forEach((route) => {
  lazyPageComponents.set(route.key, lazy(route.loader));
});

// ── Page Wrapper Component ──────────────────────────────────────────────────

interface PageWrapperProps {
  routeKey: string;
  meta: React.ComponentProps<typeof SEOHead>;
}

/**
 * Wraps page-level content with dynamic SEO head metadata injection.
 */
function PageWrapper({ routeKey, meta }: PageWrapperProps) {
  const LazyComponent = lazyPageComponents.get(routeKey);

  if (!LazyComponent) {
    console.error(`[AppRouter] Dynamic page component not found for key: ${routeKey}`);
    return null;
  }

  return (
    <>
      <SEOHead {...meta} />
      <LazyComponent />
    </>
  );
}

// ── Core Router Renderer ────────────────────────────────────────────────────

export function AppRouter() {
  const location = useLocation();

  // Segregate routes by layout type to mount them within layouts dynamically (SRP)
  const mainLayoutRoutes = useMemo(() => allRoutes.filter((r) => r.layout === "main"), []);
  const authLayoutRoutes = useMemo(() => allRoutes.filter((r) => r.layout === "auth"), []);
  const dashboardLayoutRoutes = useMemo(
    () => allRoutes.filter((r) => r.layout === "dashboard"),
    []
  );
  const rawRoutes = useMemo(() => allRoutes.filter((r) => r.layout === "none"), []);

  return (
    <Routes>
      {/* ── Public & Protected Main Website Shell ── */}
      <Route element={<MainLayout />}>
        {mainLayoutRoutes.map((route) => (
          <Route
            key={route.key}
            path={route.path}
            element={
              <ErrorBoundary key={location.pathname}>
                <Suspense fallback={<PageLoader />}>
                  <RouteGuardEngine guard={route.guard}>
                    <PageWrapper routeKey={route.key} meta={route.meta} />
                  </RouteGuardEngine>
                </Suspense>
              </ErrorBoundary>
            }
          />
        ))}
      </Route>

      {/* ── Auth Layout Shell ── */}
      <Route element={<AuthLayout />}>
        {authLayoutRoutes.map((route) => (
          <Route
            key={route.key}
            path={route.path}
            element={
              <ErrorBoundary key={location.pathname}>
                <Suspense fallback={<PageLoader />}>
                  <RouteGuardEngine guard={route.guard}>
                    <PageWrapper routeKey={route.key} meta={route.meta} />
                  </RouteGuardEngine>
                </Suspense>
              </ErrorBoundary>
            }
          />
        ))}
      </Route>

      {/* ── Dashboard Layout Shell ── */}
      <Route element={<DashboardLayout />}>
        {dashboardLayoutRoutes.map((route) => (
          <Route
            key={route.key}
            path={route.path}
            element={
              <ErrorBoundary key={location.pathname}>
                <Suspense fallback={<PageLoader />}>
                  <RouteGuardEngine guard={route.guard}>
                    <PageWrapper routeKey={route.key} meta={route.meta} />
                  </RouteGuardEngine>
                </Suspense>
              </ErrorBoundary>
            }
          />
        ))}
      </Route>

      {/* ── Raw Routes (No Shell) ── */}
      {rawRoutes.map((route) => (
        <Route
          key={route.key}
          path={route.path}
          element={
            <ErrorBoundary key={location.pathname}>
              <Suspense fallback={<PageLoader />}>
                <RouteGuardEngine guard={route.guard}>
                  <PageWrapper routeKey={route.key} meta={route.meta} />
                </RouteGuardEngine>
              </Suspense>
            </ErrorBoundary>
          }
        />
      ))}

      {/* ── Default Catch-all Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
