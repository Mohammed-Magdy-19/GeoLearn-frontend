/**
 * src/routes/ProtectedRoute.tsx
 *
 * Route guard component.
 *
 * Rendering logic:
 *   - While isHydrating (app boot, checking /me/): show a neutral loading state
 *   - If no user in Zustand after hydration: redirect to /login
 *   - If authenticated: render the child route
 *
 * Usage (in AppRoutes.tsx):
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<DashboardPage />} />
 *   </Route>
 */

import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export const ProtectedRoute = () => {
  const { user, isHydrating } = useAuthStore();

  // Still checking if the user has a valid session — don't redirect yet
  if (isHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // No authenticated user — send to login, preserving the intended destination
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render the matched child route
  return <Outlet />;
};

export const AdminRoute = () => {
  const { user, isHydrating } = useAuthStore();

  if (isHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Restrict access if the user is neither staff nor superuser
  if (!user.is_staff && !user.is_superuser) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
