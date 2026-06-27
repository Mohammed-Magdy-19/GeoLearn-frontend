/**
 * src/pages/errors/NotFound.tsx
 *
 * 404 — Page Not Found
 *
 * Used as:
 *   - The catch-all route element in AppRoutes.tsx  ( path="*" )
 *   - The notFoundComponent in __root.tsx (TanStack Router variant)
 *
 * Design: matches the brand teal/terracotta GeoLearn palette with
 * a subtle animated globe emoji and clear Arabic copy.
 */

import { Link } from "react-router-dom";
import { Globe, Home, GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function NotFound() {
    const { t } = useTranslation();
    return (
        <main
            className="flex min-h-screen flex-col items-center justify-center
                 bg-background px-6 text-center"
        >
            {/* Animated icon */}
            <div
                className="mb-6 grid h-24 w-24 place-items-center rounded-full
                      bg-brand-secondary text-5xl shadow-card
                      animate-[spin_8s_linear_infinite]"
                aria-hidden="true"
            >
                <Globe className="size-10 text-brand-warm" />
            </div>

            {/* Big 404 */}
            <p className="font-display text-[120px] font-black leading-none text-brand-primary/20 sm:text-[160px]">
                404
            </p>

            {/* Text — sits over the faded number via negative margin */}
            <div className="-mt-8 sm:-mt-12">
                <h1 className="font-display text-3xl font-black text-foreground sm:text-4xl">
                    {t("errors.pageNotFound")}
                </h1>
                <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground leading-relaxed">
                    {t("errors.notFoundDescription")}
                </p>
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-8 py-3 text-sm font-bold
                     text-white shadow-brand transition hover:scale-105
                     hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                    <Home className="size-4" /> {t("common.backToHome")}
                </Link>
                <Link
                    to="/#courses"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-brand-primary px-8 py-3 text-sm font-bold
                     text-brand-primary transition hover:bg-brand-primary hover:text-white
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                    <GraduationCap className="size-4" /> {t("errors.browseCourses")}
                </Link>
            </div>

            {/* Subtle breadcrumb hint */}
            <p className="mt-12 text-xs text-muted-foreground/60">
                {t("errors.errorCode")}: 404 — Page Not Found
            </p>
        </main>
    );
}