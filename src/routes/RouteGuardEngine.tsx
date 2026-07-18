/**
 * src/routes/RouteGuardEngine.tsx
 *
 * Unified Route Guard Engine.
 * Implements extensible middleware-pipe access control using registry metadata,
 * handling authentication states, session hydration, and multi-role checks.
 */

import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import type { RouteGuardConfig, UserRole } from "./types";

interface RouteGuardEngineProps {
  guard: RouteGuardConfig;
  children?: React.ReactNode;
}

/**
 * Determines the role of an authenticated user based on staff and superuser flags.
 */
function getUserRole(user: ReturnType<typeof useAuthStore.getState>["user"]): UserRole {
  if (!user) return "guest";
  if (user.is_superuser) return "admin";
  if (user.is_staff) return "instructor";
  return "student";
}

export function RouteGuardEngine({ guard, children }: RouteGuardEngineProps) {
  const { user, isHydrating } = useAuthStore();

  // 1. Session Hydration State
  if (isHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // 2. Authentication Check
  if (guard.requiresAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Authorization / Role Check
  if (guard.requiresAuth && user && guard.allowedRoles.length > 0) {
    const userRole = getUserRole(user);
    const hasRole = guard.allowedRoles.includes(userRole);

    if (!hasRole) {
      // Direct unauthorized student users or instructors to root home directory
      return <Navigate to="/" replace />;
    }
  }

  // Render children (if route is configured as a layout/wrapper) or matched outlet component
  return children ? <>{children}</> : <Outlet />;
}

export default RouteGuardEngine;
