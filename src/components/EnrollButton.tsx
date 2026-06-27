/**
 * EnrollButton
 *
 * Call-to-action button on every course card.
 *
 * Shows "Continue" if the user is already enrolled,
 * otherwise shows "Enroll Now".
 *
 * Props:
 *   slug       — course URL slug (used to build the navigation target)
 *   title      — human-readable course name (used for the aria-label)
 *   isEnrolled — whether the current user is enrolled in this course
 */

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface EnrollButtonProps {
    /** Course URL slug — matches the :slug param in AppRoutes */
    slug: string;
    /** Human-readable course name for accessible label */
    title: string;
    /** Whether the current user is enrolled in this course */
    isEnrolled?: boolean;
}

export default function EnrollButton({ slug, title, isEnrolled = false }: EnrollButtonProps) {
    const { t } = useTranslation();
    const label = isEnrolled ? t("courses.continue") : t("courses.enrollNow");
    const ariaLabel = isEnrolled
        ? t("courses.continueCourse", { title })
        : t("courses.enrollInCourse", { title });

    return (
        <Link
            to={`/courses/${slug}`}
            aria-label={ariaLabel}
            className={[
                "mt-4 flex w-full items-center justify-center gap-2",
                "rounded-full px-6 py-2.5",
                "text-sm font-bold shadow-brand",
                isEnrolled
                    ? "bg-brand-accent text-white hover:bg-brand-accent/90"
                    : "bg-brand-gradient text-white hover:brightness-110 hover:shadow-brand-lg",
                /* Interactions */
                "transition-all duration-200",
                "active:scale-95",
                /* Keyboard focus ring visible in high-contrast / keyboard nav */
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
            ].join(" ")}
        >
            {label}
        </Link>
    );
}