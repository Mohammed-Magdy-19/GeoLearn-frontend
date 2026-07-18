/**
 * Header
 *
 * Sticky main navigation bar with brand logo, desktop nav links,
 * notification bell, theme toggle, language switcher, auth buttons,
 * and mobile/tablet hamburger.
 *
 * Layout:
 *   [Brand Logo + Tagline] [NotificationBell] [ThemeToggle] [LangSwitcher]  ←→  [Desktop Nav] [Auth Buttons] [Hamburger]
 *
 * Responsive breakpoints:
 *   - Mobile  (< 768px):  Hamburger menu with all nav + auth
 *   - Tablet  (768–1024px): Hamburger menu with all nav + auth
 *   - Desktop (≥ 1024px): Full horizontal nav + auth buttons
 */

import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { Menu, X, BookOpen, User, LayoutDashboard, FileText, LogIn, UserPlus } from "lucide-react";
import logo from "../../assets/GeoLearn-logo.jpeg";
import { Button } from "@/components/ui/button";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/useAuthStore";

const ThemeToggle = lazy(() => import("./ThemeToggle"));
const LanguageSwitcher = lazy(() => import("./LanguageSwitcher"));
const NotificationBell = lazy(() => import("../../features/notifications/components/NotificationBell"));

/** Tiny circular shimmer that matches an icon-button (40×40) */
function IconButtonSkeleton() {
  return (
    <span className="inline-block h-9 w-9 rounded-full bg-white/10 animate-pulse" />
  );
}

/** Navigation link item descriptor */
interface NavLink {
  labelKey: string;
  href: string;
}

const NAV_LINKS: readonly NavLink[] = [
  { labelKey: "nav.home", href: "/" },
  { labelKey: "nav.courses", href: "/courses" },
  { labelKey: "nav.metadata", href: "/metadata" },
  { labelKey: "nav.programs", href: "/programs" },
  { labelKey: "nav.spatialData", href: "/spatial-data" },
];

export default function Header() {
  const { t } = useTranslation();
  const { user, isHydrating } = useAuthStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /** Track scroll position for header style changes */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /** Close mobile menu on route change */
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  /** Close mobile menu when a link is clicked */
  const handleNavClick = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  /** Check if a nav link is currently active */
  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-brand-secondary text-white transition-all duration-300",
        scrolled
          ? "shadow-lg shadow-black/20 py-2 backdrop-blur-sm bg-brand-secondary/95"
          : "shadow-md py-3"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* ── Left Section: Brand + NotificationBell + ThemeToggle + LangSwitcher ── */}
        <div className="flex items-center gap-3">
          {/* Brand logo and tagline */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <span
              className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-full shadow-md ring-2 ring-white/20 group-hover:ring-brand-warm/50 transition-all duration-200"
              style={{
                backgroundImage: `url(${logo})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="hidden sm:block">
              <p className="font-display text-lg font-bold leading-tight tracking-tight">
                {t("common.brandName")}
              </p>
              <p className="text-[11px] text-brand-warm/80 font-medium">
                {t("common.brandTagline")}
              </p>
            </div>
          </Link>

          {/* Separator */}
          <div className="hidden sm:block w-px h-7 bg-white/15 mx-1" />

          {/* Notification Bell (always visible when logged in) */}
          {user && (
            <Suspense fallback={<IconButtonSkeleton />}>
              <NotificationBell />
            </Suspense>
          )}

          {/* Theme Toggle (always visible) */}
          <Suspense fallback={<IconButtonSkeleton />}>
            <ThemeToggle />
          </Suspense>

          {/* Language Switcher */}
          <Suspense fallback={<IconButtonSkeleton />}>
            <LanguageSwitcher />
          </Suspense>
        </div>

        {/* ── Center: Desktop navigation links ── */}
        <nav className="hidden xl:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "relative px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive(link.href)
                  ? "text-brand-warm bg-white/10"
                  : "text-white/85 hover:text-white hover:bg-white/5"
              )}
            >
              {t(link.labelKey)}
              {/* Active indicator dot */}
              {isActive(link.href) && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-warm" />
              )}
            </Link>
          ))}
        </nav>

        {/* ── Right Section: Auth buttons (desktop) + Hamburger ── */}
        <div className="flex items-center gap-1.5">
          {/* Auth buttons — desktop only (xl+) */}
          <div className="hidden xl:flex items-center gap-1.5">
            {isHydrating ? (
              /* Skeleton placeholders while auth state is loading */
              <>
                <span className="h-9 w-20 rounded-full bg-white/10 animate-pulse" />
                <span className="h-9 w-16 rounded-full bg-white/10 animate-pulse" />
              </>
            ) : user ? (
              <>
                <Link
                  to="/my-courses"
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200",
                    "border border-white/20 text-white/90 hover:border-brand-warm/40 hover:bg-brand-warm/10 hover:text-white"
                  )}
                >
                  {t("nav.myCourses")}
                </Link>
                <Link
                  to="/summaries"
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200",
                    "border border-white/20 text-white/90 hover:border-brand-warm/40 hover:bg-brand-warm/10 hover:text-white"
                  )}
                >
                  {t("nav.summaries")}
                </Link>
                <Link
                  to="/profile"
                  className="rounded-full bg-brand-primary px-3 py-1.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:brightness-110 hover:shadow-lg"
                >
                  {t("nav.profile")}
                </Link>
                {(user.is_staff || user.is_superuser) && (
                  <Link
                    to="/dashboard"
                    className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:bg-white/20"
                  >
                    {t("nav.dashboard")}
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full bg-brand-primary px-4 py-1.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:brightness-110 hover:shadow-lg"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  className="rounded-full border-2 border-white/30 px-4 py-1.5 text-xs font-bold text-white transition-all duration-200 hover:border-brand-warm hover:bg-brand-warm/10"
                >
                  {t("nav.register")}
                </Link>
              </>
            )}
          </div>

          {/* Hamburger toggle — visible on mobile + tablet (< xl) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={cn(
              "xl:hidden h-10 w-10 rounded-lg transition-all duration-200",
              mobileMenuOpen
                ? "bg-white/15 text-brand-warm"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            )}
            aria-label={mobileMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* ── Mobile/Tablet Navigation Drawer ── */}
      <div
        className={cn(
          "xl:hidden overflow-hidden transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 pb-4 pt-3">
          {/* Divider */}
          <div className="h-px bg-gradient-to-l from-transparent via-white/20 to-transparent mb-3" />

          {/* Nav links */}
          <div className="space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive(link.href)
                    ? "bg-white/10 text-brand-warm"
                    : "text-white/80 hover:bg-white/5 hover:text-white"
                )}
              >
                {t(link.labelKey)}
                {isActive(link.href) && (
                  <span className="mr-auto w-1.5 h-1.5 rounded-full bg-brand-warm" />
                )}
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-l from-transparent via-white/15 to-transparent my-3" />

          {/* Auth actions */}
          <div className="space-y-2">
            {isHydrating ? (
              /* Skeleton placeholders while auth state is loading */
              <div className="flex flex-col gap-2">
                <span className="h-11 w-full rounded-lg bg-white/10 animate-pulse" />
                <span className="h-11 w-full rounded-lg bg-white/10 animate-pulse" />
              </div>
            ) : user ? (
              <>
                <Link
                  to="/my-courses"
                  onClick={handleNavClick}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white transition-all"
                >
                  <BookOpen className="size-4 shrink-0 text-brand-warm/70" />
                  {t("nav.myCourses")}
                </Link>
                <Link
                  to="/summaries"
                  onClick={handleNavClick}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white transition-all"
                >
                  <FileText className="size-4 shrink-0 text-brand-warm/70" />
                  {t("nav.summaries")}
                </Link>
                <Link
                  to="/profile"
                  onClick={handleNavClick}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white transition-all"
                >
                  <User className="size-4 shrink-0 text-brand-warm/70" />
                  {t("nav.profile")}
                </Link>
                {(user.is_staff || user.is_superuser) && (
                  <Link
                    to="/dashboard"
                    onClick={handleNavClick}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white transition-all"
                  >
                    <LayoutDashboard className="size-4 shrink-0 text-brand-warm/70" />
                    {t("nav.dashboard")}
                  </Link>
                )}
              </>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  to="/login"
                  onClick={handleNavClick}
                  className="flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:brightness-110 flex-1"
                >
                  <LogIn className="size-4" />
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  onClick={handleNavClick}
                  className="flex items-center justify-center gap-2 rounded-lg border-2 border-white/25 px-5 py-3 text-sm font-bold text-white transition-all hover:border-brand-warm hover:bg-brand-warm/10 flex-1"
                >
                  <UserPlus className="size-4" />
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile overlay backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-full bg-black/30 xl:hidden -z-10"
          onClick={handleNavClick}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
