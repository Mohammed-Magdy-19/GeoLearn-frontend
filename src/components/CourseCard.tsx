/**
 * CourseCard
 *
 * Renders a single course in the catalog grid.
 *
 * Visual structure:
 *   ┌─────────────────────────────┐
 *   │  cover image (h-48)         │  ← optional badge (top-right)
 *   │         [optional logo]     │  ← optional logo (bottom-left)
 *   ├─────────────────────────────┤
 *   │  title                      │
 *   │  ⏱ hours  📶 level          │
 *   │  description (flexible)     │
 *   ├─────────────────────────────┤
 *   │  EGP price  / instalment ✅  │
 *   │  [EnrollButton]             │
 *   └─────────────────────────────┘
 *
 * Animation: each card fades up with a per-index stagger so the grid
 * populates in sequence on first load.
 *
 * Props:
 *   course — CoursePreview object from COURSES (homeData.ts)
 *   index  — 0-based grid position used for the stagger delay
 */

import { Clock, Signal, CircleCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Course } from "../features/home/types/home";
import EnrollButton from "./EnrollButton";

interface CourseCardProps {
  /** Course data to display */
  course: Course;
  /** Animation delay index for staggered entrance */
  index: number;
  /** Whether the current user is enrolled in this course */
  isEnrolled?: boolean;
}

export default function CourseCard({ course, index, isEnrolled = false }: CourseCardProps) {
  const { t } = useTranslation();
  // Normalization layer to support both static data and backend data
  const title = course.title;
  const slug = course.slug;
  const description = course.description;
  const badge = (course as any).badge || null;
  const logoImage = (course as any).logoImage || null;
  
  const coverImage = (course as any).coverImage || 
                     (course as any).thumbnail_url || 
                     (course as any).cover_image_url || 
                     "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80";
  
  const hours = (course as any).hours || `${(course as any).lesson_count || 10} ${t("common.lessons_other", { count: (course as any).lesson_count || 10 }).split(' ').pop()}`;
  const level = (course as any).level || t("common.allLevels");
  
  const rawPrice = (course as any).price !== undefined ? (course as any).price : (course as any).price_egp;
  const isFree = rawPrice === 0 || rawPrice === "0" || rawPrice === 0.0;
  const priceDisplay = isFree ? t("common.free") : `${rawPrice}`;

  return (
    /*
     * `group` enables child elements to react to the card's hover state
     * (e.g. the cover image zooms via `group-hover:scale-105`).
     *
     * Stagger: 150 ms per card → card 0 at 0 ms, card 1 at 150 ms, card 2 at 300 ms.
     * Inline style is used because Tailwind can't detect dynamically constructed
     * class strings at build time.
     */
    <article
      className={[
        "group flex flex-col overflow-hidden rounded-2xl",
        "bg-card shadow-card ring-1 ring-border",
        "animate-fade-in-up",
        "transition-all duration-300",
        "hover:-translate-y-1.5 hover:shadow-brand hover:ring-brand-primary/40",
      ].join(" ")}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* ── Cover image area ──────────────────────────────────── */}
      <div className="relative h-48 overflow-hidden bg-brand-secondary">
        <img
          src={coverImage}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badge (e.g. "الأكثر مبيعاً" / "جديد") */}
        {badge && (
          <span className="absolute right-4 top-4 rounded-full bg-brand-primary px-3 py-1 text-xs font-bold text-white shadow-brand">
            {badge}
          </span>
        )}

        {/*
         * Optional software logo (e.g. ArcGIS Pro icon).
         * Displayed in a white pill at bottom-left so it contrasts against
         * the dark cover image.
         */}
        {logoImage && (
          <div className="absolute bottom-4 left-4 grid h-14 w-14 place-items-center rounded-xl bg-white p-2 shadow-card">
            <img
              src={logoImage}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}
      </div>

      {/* ── Card body ─────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-6">
        {/* Course title */}
        <h3 className="font-display text-xl font-bold leading-snug">
          {title}
        </h3>

        {/* Quick-glance metadata row */}
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground justify-start">
          <span className="flex items-center gap-1.5" aria-label={t("common.duration", { value: hours })}>
            <Clock className="size-4" aria-hidden="true" />
            {hours}
          </span>
          <span className="flex items-center gap-1.5" aria-label={t("common.level", { value: level })}>
            <Signal className="size-4" aria-hidden="true" />
            {level}
          </span>
        </div>

        {/* Description — flex-1 pushes the price block to the bottom */}
        <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        {/* ── Price & CTA ─────────────────────────────────────── */}
        <div className="mt-6 border-t pt-5">
          {/* Price row */}
          <div className="flex items-baseline gap-1.5 justify-start">
            <span className="font-display text-3xl font-black text-card-foreground">
              {priceDisplay}
            </span>
            {!isFree && (
              <span className="text-sm text-muted-foreground">{t("common.egp")}</span>
            )}
          </div>

          {/* Instalment availability indicator */}
          {!isFree && (
            <p className="mt-1 flex items-center gap-1 text-xs text-brand-accent dark:text-brand-accent">
              <CircleCheck className="size-3.5" /> {t("common.installmentAvailable")}
            </p>
          )}

          {/* Enroll CTA — handled by EnrollButton (Phase 2: payment flow) */}
          <EnrollButton slug={slug} title={title} isEnrolled={isEnrolled} />
        </div>
      </div>
    </article>
  );
}