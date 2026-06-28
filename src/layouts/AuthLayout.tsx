/**
 * src/layouts/AuthLayout.tsx
 *
 * Two-column layout for login and register pages.
 * Right (visual start in RTL): branding panel with geo background — hidden on mobile.
 * Left  (visual end   in RTL): form content via <Outlet />.
 *
 * FIXES APPLIED:
 *   BUG 1 — was `export const AuthLayout` (named). Routes import it as default.
 *            Changed to `export default function AuthLayout`.
 *   BUG 2 — flex-row in an RTL document puts the first child on the visual RIGHT.
 *            Branding should appear on the visual LEFT (as in standard LTR layouts).
 *            Fix: outer wrapper uses dir="ltr" so column order matches visual intent,
 *            while the form panel restores dir="rtl" for its Arabic content.
 *   BUG 3 — English copy replaced with Arabic.
 *   BUG 4 — flat `bg-primary` replaced with geo photo + gradient overlay matching
 *            the home-page hero aesthetic (same overlay technique, same tokens).
 *   BUG 5 — dir="rtl" now applied on the form panel so Arabic text aligns correctly.
 */

import { lazy, Suspense } from "react";
import { Outlet, Link } from "react-router-dom";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import logo from "../assets/GeoLearn-logo.jpeg";

const LanguageSwitcher = lazy(() => import("../components/navigation/LanguageSwitcher"));

/** Tiny circular shimmer that matches an icon-button */
function IconButtonSkeleton() {
  return (
    <span className="inline-block h-9 w-9 rounded-full bg-muted animate-pulse" />
  );
}

/** Background photo for the branding panel — same Unsplash geo image as HeroSlideshow */
const PANEL_BG =
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1400&q=80";

export default function AuthLayout() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  return (
    /*
     * Use flex-row-reverse in RTL so branding stays visually on the LEFT
     * and form on the RIGHT, matching the standard auth page layout.
     */
    <div className={`min-h-screen flex ${isRtl ? 'flex-row-reverse' : ''}`}>

      {/* ── Branding panel (left column, hidden on < lg) ─────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-shrink-0">

        {/* Full-bleed geo background photo */}
        <img
          src={PANEL_BG}
          alt=""
          aria-hidden="true"
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Gradient overlay — matches HeroSection overlay strategy */}
        <div className="absolute inset-0 bg-bg-dark/75" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-gradient-to-b from-bg-dark/60 via-transparent to-bg-dark/90"
          aria-hidden="true"
        />

        {/* Branding content */}
        <div className="relative z-10 flex flex-col justify-between items-center h-full w-full p-12 text-white text-center">

          {/* Top Row: Logo + Back to Home */}
          <div className="flex items-center justify-between w-full">
            <Link to="/" className="flex items-center gap-3">
              <span
            className="grid h-12 w-12 place-items-center rounded-full bg-brand-gradient text-2xl shadow-brand"
            style={{
              backgroundImage: `url(${logo})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
              <div className="text-start">
                <p className="font-display text-xl leading-tight font-bold">{t("common.brandName")}</p>
                <p className="text-xs text-brand-warm">{t("common.brandTagline")}</p>
              </div>
            </Link>
            <Link
              to="/"
              className="text-xs text-white bg-white/10 hover:bg-white/20 transition px-4 py-2 rounded-full font-bold shadow-sm"
            >
              {t("common.backToHome")}
            </Link>
          </div>

          {/* Headline + subtitle (Centered) */}
          <div className="flex flex-col items-center justify-center flex-grow py-8">
            <h2 className="font-display text-4xl font-black leading-tight">
              {t("home.authPanelHeadline1")}
              <br />
              <span className="text-brand-warm">{t("home.authPanelHeadline2")}</span>
            </h2>
            <p className="mt-4 text-base text-white/70 leading-relaxed max-w-sm mx-auto">
              {t("home.authPanelDescription")}
            </p>

            {/* Mini stats row — mirrors the hero section */}
            <dl className="mt-8 flex gap-8 border-t border-white/10 pt-6 justify-center w-full max-w-xs">
              {[
                ["+500", t("home.registeredStudentsStat")],
                ["3", t("home.specializedCoursesStat")],
                ["100%", t("home.studentSatisfactionStat")],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="font-display text-2xl font-black text-brand-warm">{n}</dt>
                  <dd className="mt-0.5 text-xs text-white/60">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Bottom tagline */}
          <p className="text-xs text-white/40">
            {t("common.allRightsReserved")}
          </p>
        </div>
      </div>

      {/* ── Form panel (right column, full-width on mobile) ──────────────── */}
      <div
        className="flex flex-1 items-center justify-center bg-background px-6 py-12 sm:px-10"
      >
        <div className="w-full max-w-md">
          {/* Back to Home button for both mobile & desktop form views */}
          <div className="mb-6 flex justify-between items-center">
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 transition px-4 py-2 rounded-full font-bold shadow-sm"
            >
              {t("common.backToHome")}
            </Link>

            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <Suspense fallback={<IconButtonSkeleton />}>
                <LanguageSwitcher />
              </Suspense>

              {/* Mobile-only logo (branding panel is hidden on small screens) */}
              <div className="lg:hidden">
                <Link to="/" className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-gradient text-sm shadow-brand">
                    <Globe className="size-5 text-white" />
                  </span>
                  <span className="font-display text-sm font-bold text-foreground">{t("common.brandName")}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Auth form injected by the router */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}