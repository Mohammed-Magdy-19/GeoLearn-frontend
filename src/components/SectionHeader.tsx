/**
 * SectionHeader
 *
 * Reusable heading block for every landing-page section.
 * Renders a two-part H2 — `primaryText` followed by `highlightText` —
 * where the highlighted word sits on a decorative brand underline bar.
 *
 * Used by: CoursesSection, AboutSection  (and any future sections)
 *
 * Props:
 *   primaryText     — the non-highlighted portion of the heading
 *   highlightText   — the word that receives the brand underline accent
 *   subtitle        — secondary descriptive paragraph beneath the heading
 *   subtitleMaxWidth — Tailwind max-w-* key to control subtitle line length
 *                      default: "xl"
 */

type MaxWidthKey = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

interface SectionHeaderProps {
  primaryText: string;
  highlightText: string;
  subtitle: string;
  subtitleMaxWidth?: MaxWidthKey;
}

/**
 * Static lookup so Tailwind's content scanner can detect every
 * max-width class at build time (dynamic string interpolation is NOT
 * detected by Tailwind and the class won't be included in the bundle).
 */
const MAX_WIDTH_CLASSES: Record<MaxWidthKey, string> = {
  sm:  "max-w-sm",
  md:  "max-w-md",
  lg:  "max-w-lg",
  xl:  "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
};

export default function SectionHeader({
  primaryText,
  highlightText,
  subtitle,
  subtitleMaxWidth = "xl",
}: SectionHeaderProps) {
  const maxWidthClass = MAX_WIDTH_CLASSES[subtitleMaxWidth];

  return (
    <div className="text-center">
      {/* ── Main heading ──────────────────────────────────────── */}
      <h2 className="font-display text-4xl font-black sm:text-5xl">
        {/* Non-highlighted portion — rendered with a trailing space */}
        {primaryText}{" "}

        {/* Highlighted word with animated brand underline bar */}
        <span className="relative inline-block">
          {highlightText}

          {/*
           * Decorative underline — positioned 8px below the baseline so it
           * clears descenders. Uses a rounded full-width brand pill rather
           * than a border to match the brand style.
           */}
          <span
            className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-brand-primary"
            aria-hidden="true"
          />
        </span>
      </h2>

      {/* ── Subtitle paragraph ────────────────────────────────── */}
      <p className={`mx-auto mt-6 ${maxWidthClass} text-muted-foreground`}>
        {subtitle}
      </p>
    </div>
  );
}