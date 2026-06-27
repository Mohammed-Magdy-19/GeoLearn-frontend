/**
 * src/layouts/DashboardLayout.tsx
 *
 * Sidebar + main content layout for authenticated admin/student views.
 * Supports RTL Arabic layout, role-based navigation, and responsive design.
 *
 * Modifications from original:
 *   - Added admin navigation items with role-based conditional rendering
 *   - Full Arabic UI labels with RTL support
 *   - Enhanced sidebar with icons and active state indicators
 *   - Confirm dialog integration for destructive actions
 */

import { lazy, Suspense } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/useAuthStore";
import NotificationBell from "../features/notifications/components/NotificationBell";
import { useUIStore } from "../store/useUIStore";
import { useLogoutMutation } from "../features/auth/hooks/useAuthMutations";
import { useDashboardStore } from "../store/useDashboardStore";

const LanguageSwitcher = lazy(() => import("../components/navigation/LanguageSwitcher"));

/** Tiny circular shimmer that matches an icon-button */
function IconButtonSkeleton() {
  return (
    <span className="inline-block h-9 w-9 rounded-full bg-muted animate-pulse" />
  );
}

// ─────────────────────────────────────────────────────────────
// Navigation Configuration
// ─────────────────────────────────────────────────────────────

/** Navigation item definition */
interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ReactNode;
  /** Required role to see this item — null = visible to all */
  requiredRole?: "admin" | "instructor" | null;
}

/** SVG icon components for navigation */
const Icons = {
  dashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
  ),
  users: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  ),
  courses: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
  ),
  videos: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>
  ),
  home: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
  ),
  summaries: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>
  ),
  notifications: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
  ),
  metadata: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></svg>
  ),
  spatialData: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
  ),

};

/** All navigation items — filtered by role at runtime */
const ALL_NAV_ITEMS: NavItem[] = [
  {
    labelKey: "dashboard.navDashboard",
    href: "/dashboard",
    icon: Icons.dashboard,
    requiredRole: null,
  },
  {
    labelKey: "dashboard.navManageUsers",
    href: "/dashboard/users",
    icon: Icons.users,
    requiredRole: "admin",
  },
  {
    labelKey: "dashboard.navManageCourses",
    href: "/dashboard/courses",
    icon: Icons.courses,
    requiredRole: "admin",
  },
  {
    labelKey: "dashboard.navManageSummaries",
    href: "/dashboard/summaries",
    icon: Icons.summaries,
    requiredRole: "admin",
  },
  {
    labelKey: "dashboard.navManageMetadata",
    href: "/dashboard/metadata",
    icon: Icons.metadata,
    requiredRole: "admin",
  },
  {
    labelKey: "dashboard.navManageSpatialData",
    href: "/dashboard/spatial-data",
    icon: Icons.spatialData,
    requiredRole: "admin",
  },
  {
    labelKey: "dashboard.navManageNotifications",
    href: "/dashboard/notifications",
    icon: Icons.notifications,
    requiredRole: "admin",
  },
  {
    labelKey: "dashboard.navHomePage",
    href: "/",
    icon: Icons.home,
    requiredRole: "admin",
  },
];

// ─────────────────────────────────────────────────────────────
// Helper: Determine user role
// ─────────────────────────────────────────────────────────────

function getUserRole(user: {
  is_superuser?: boolean;
  is_staff?: boolean;
} | null): "admin" | "instructor" | "student" {
  if (!user) return "student";
  if (user.is_superuser) return "admin";
  if (user.is_staff) return "instructor";
  return "student";
}

function canAccessItem(
  userRole: "admin" | "instructor" | "student",
  item: NavItem
): boolean {
  if (!item.requiredRole) return true;
  if (item.requiredRole === "admin") return userRole === "admin";
  if (item.requiredRole === "instructor")
    return userRole === "admin" || userRole === "instructor";
  return true;
}

// ─────────────────────────────────────────────────────────────
// Confirm Dialog Component
// ─────────────────────────────────────────────────────────────

const ConfirmDialog = () => {
  const { t } = useTranslation();
  const { confirmDialog, closeConfirmDialog } = useDashboardStore();

  if (!confirmDialog.isOpen) return null;

  const variantColors = {
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    warning: "bg-brand-warm text-bg-dark hover:bg-brand-warm/90",
    info: "bg-primary text-primary-foreground hover:bg-primary/90",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-card border border-border rounded-lg shadow-lg p-6 max-w-md w-full mx-4 animate-fade-in-up">
        <h3 className="text-lg font-bold text-foreground mb-2">
          {confirmDialog.title}
        </h3>
        <p className="text-muted-foreground mb-6">
          {confirmDialog.message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={closeConfirmDialog}
            className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground
                       bg-muted hover:bg-muted/80 transition-colors"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={() => {
              confirmDialog.onConfirm?.();
              closeConfirmDialog();
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${variantColors[confirmDialog.variant]}`}
          >
            {t("common.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Main Layout Component
// ─────────────────────────────────────────────────────────────

export const DashboardLayout = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { isSidebarOpen, closeSidebar } = useUIStore();
  const { mutate: logout } = useLogoutMutation();
  const location = useLocation();

  const userRole = getUserRole(user);
  const navItems = ALL_NAV_ITEMS.filter((item) =>
    canAccessItem(userRole, item)
  );

  return (
    <div
      className="min-h-screen flex bg-background text-foreground"
    >
      {/* ── Mobile overlay ── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 right-0 z-30 w-64 bg-card border-l border-border
          transform transition-transform duration-200 ease-in-out
          lg:relative lg:translate-x-0 lg:flex lg:flex-col
          ${isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-center px-6 border-b border-border shrink-0">
          <Link
            to="/"
            className="text-lg font-bold text-gradient-brand font-display"
          >
            {t("common.brandName")}
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={closeSidebar}
                className={`
                  flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium mb-1
                  transition-all duration-200
                  ${isActive
                    ? "bg-primary/10 text-primary border-r-2 border-primary"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground border-r-2 border-transparent"
                  }
                `}
              >
                <span className="shrink-0">{item.icon}</span>
                <span>{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Role badge */}
        <div className="px-4 pb-2">
          <span
            className={`
              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${userRole === "admin"
                ? "bg-brand-warm/20 text-brand-warm border border-brand-warm/30"
                : userRole === "instructor"
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-muted text-muted-foreground border border-border"
              }
            `}
          >
            {userRole === "admin"
              ? t("dashboard.roleAdmin")
              : userRole === "instructor"
                ? t("dashboard.roleInstructor")
                : t("dashboard.roleStudent")}
          </span>
        </div>

        {/* Notification bell */}
        <div className="px-4 pb-2 flex justify-center gap-2">
          <NotificationBell />
          {/* Language Switcher */}
          <Suspense fallback={<IconButtonSkeleton />}>
            <LanguageSwitcher />
          </Suspense>
        </div>

        {/* User info + logout */}
        <div className="shrink-0 border-t border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            {/* User avatar */}
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.full_name}
                loading="lazy"
                className="h-9 w-9 rounded-full object-cover shrink-0 ring-2 ring-brand-warm/30"
              />
            ) : (
              <div
                className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-warm to-brand-warm/70
                           flex items-center justify-center text-bg-dark text-sm font-bold shrink-0"
              >
                {user?.full_name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.full_name}
              </p>
              <p className="text-xs text-muted-foreground truncate" dir="ltr">
                {user?.email || user?.username}
              </p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 text-sm
                       text-muted-foreground hover:text-destructive
                       hover:bg-destructive/5 transition-colors px-3 py-2 rounded-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            {t("nav.logout")}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="h-16 flex items-center px-4 border-b border-border lg:hidden shrink-0">
          <button
            onClick={() => useUIStore.getState().toggleSidebar()}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground
                       hover:bg-accent transition-colors"
            aria-label="Toggle sidebar"
          >
            {/* Hamburger icon */}
            <div className="space-y-1.5">
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
            </div>
          </button>
          <span className="mr-3 text-sm font-medium text-foreground flex-1">
            {t("dashboard.mobileHeader")}
          </span>
          <NotificationBell />
          {/* Language Switcher */}
          <Suspense fallback={<IconButtonSkeleton />}>
            <LanguageSwitcher />
          </Suspense>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* ── Global Confirm Dialog ── */}
      <ConfirmDialog />
    </div>
  );
};
