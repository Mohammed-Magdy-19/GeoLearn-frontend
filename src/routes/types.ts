/**
 * src/routes/types.ts
 *
 * ISP: Interface Segregation Principle.
 * SRP: Single Responsibility Principle.
 *
 * Enterprise-grade type system for the routing architecture.
 * Defines specialized interfaces for route configurations with embedded
 * metadata payloads (roles, SEO data, layout types) inside the type definitions.
 */

import type { SEOMetadata } from "@/components/seo/SEOHead";
import type { RouteKey } from "./routeKeys";

// ── User Role System ───────────────────────────────────────────────────────

/**
 * Discriminated role types matching the backend's user model.
 * - 'guest': unauthenticated visitors
 * - 'student': authenticated standard users
 * - 'instructor': staff-level users (is_staff = true)
 * - 'admin': superusers (is_superuser = true)
 */
export type UserRole = "guest" | "student" | "instructor" | "admin";

// ── Layout System ──────────────────────────────────────────────────────────

/**
 * Layout wrapper types — determines which shell wraps the route's component.
 * - 'main': Public site shell (Header + Footer + Outlet)
 * - 'auth': Authentication pages shell (split-screen layout)
 * - 'dashboard': Admin sidebar shell
 * - 'none': No layout wrapper (raw full-screen rendering)
 */
export type LayoutType = "main" | "auth" | "dashboard" | "none";

// ── Route Guard Configuration ──────────────────────────────────────────────

/**
 * Extensible guard configuration attached to each route.
 * The RouteGuardEngine evaluates these conditions at render time.
 */
export interface RouteGuardConfig {
  /** Whether the route requires an authenticated user. */
  requiresAuth: boolean;
  /** Roles allowed to access this route. Empty array = all roles. */
  allowedRoles: UserRole[];
}

// ── Base Route Configuration ───────────────────────────────────────────────

/**
 * Base route config shared by all route types.
 * Every route in the registry must satisfy this contract.
 */
export interface BaseRouteConfig {
  /** Unique key mapping to ROUTE_PATHS — used for type-safe navigation. */
  key: RouteKey;
  /** URL path pattern (e.g., "/courses/:courseId"). */
  path: string;
  /** Dynamic import function that returns the page component module. */
  loader: () => Promise<{ default: React.ComponentType }>;
  /** Layout shell wrapping this route's rendered component. */
  layout: LayoutType;
  /** Access control configuration for the route guard engine. */
  guard: RouteGuardConfig;
  /** SEO metadata injected via React Helmet Async on route activation. */
  meta: SEOMetadata;
  /** Whether this is the index route for its parent layout. */
  index?: boolean;
}

// ── Discriminated Route Types ──────────────────────────────────────────────

export interface PublicRouteConfig extends BaseRouteConfig {
  type: "public";
}

export interface ProtectedRouteConfig extends BaseRouteConfig {
  type: "protected";
}

export interface AuthRouteConfig extends BaseRouteConfig {
  type: "auth";
}

export interface AdminRouteConfig extends BaseRouteConfig {
  type: "admin";
}

/**
 * Union of all route configuration types.
 * Use discriminated union on `type` field for narrowing.
 */
export type RouteConfig =
  | PublicRouteConfig
  | ProtectedRouteConfig
  | AuthRouteConfig
  | AdminRouteConfig;
