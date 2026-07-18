/**
 * src/routes/types.ts
 *
 * ISP: Interface Segregation Principle.
 * Defines specialized, lightweight TypeScript interfaces for standard routes,
 * protected routes, auth routes, and admin routes.
 */

import type { ComponentType, LazyExoticComponent } from "react";
import type { RouteKey } from "./routeKeys";

export interface BaseRouteConfig {
  key: RouteKey;
  path: string;
  component: LazyExoticComponent<ComponentType<any>>;
}

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

export type RouteConfig =
  | PublicRouteConfig
  | ProtectedRouteConfig
  | AuthRouteConfig
  | AdminRouteConfig;
