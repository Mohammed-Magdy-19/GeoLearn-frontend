/**
 * src/routes/useAppNavigate.ts
 *
 * DIP: Dependency Inversion Principle.
 * Type-safe navigation service hook that maps route keys to string paths,
 * resolving dynamic path parameters at compile-time and eliminating
 * hardcoded path strings throughout the application.
 */

import { useNavigate, type NavigateOptions } from "react-router-dom";
import { ROUTE_PATHS, type RouteKey } from "./routeKeys";

/**
 * Maps route keys that have dynamic parameters to their required parameter types.
 */
export type RouteParams = {
  COURSE_DETAIL: { courseId: string };
  WATCH_LESSON: { slug: string; lessonId: string };
  DASHBOARD_COURSE_DETAIL: { courseId: string };
};

/**
 * Resolves a route key and its dynamic parameters into a real path string.
 */
export function resolvePath<K extends RouteKey>(
  key: K,
  ...args: K extends keyof RouteParams ? [RouteParams[K]] : []
): string {
  let path: string = ROUTE_PATHS[key];
  const params = args[0] as Record<string, string> | undefined;

  if (params) {
    Object.entries(params).forEach(([paramName, paramValue]) => {
      path = path.replace(`:${paramName}`, encodeURIComponent(paramValue));
    });
  }
  return path;
}

/**
 * Hook for type-safe programmatic navigation and static path resolution.
 */
export function useAppNavigate() {
  const navigate = useNavigate();

  const navigateTo = <K extends RouteKey>(
    key: K,
    params?: K extends keyof RouteParams ? RouteParams[K] : undefined,
    options?: NavigateOptions
  ) => {
    const path = resolvePath(
      key,
      ...(params ? [params] : []) as K extends keyof RouteParams ? [RouteParams[K]] : []
    );
    navigate(path, options);
  };

  const getPath = <K extends RouteKey>(
    key: K,
    params?: K extends keyof RouteParams ? RouteParams[K] : undefined
  ): string => {
    return resolvePath(
      key,
      ...(params ? [params] : []) as K extends keyof RouteParams ? [RouteParams[K]] : []
    );
  };

  const goBack = () => {
    navigate(-1);
  };

  return {
    navigateTo,
    getPath,
    goBack,
    resolvePath,
  };
}

export type AppNavigateType = ReturnType<typeof useAppNavigate>;
