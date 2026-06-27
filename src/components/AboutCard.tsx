/**
 * AboutCard
 *
 * Single feature card used in the "من نحن" (About Us) section.
 * Displays an emoji icon inside a brand gradient circle, a bold title,
 * and a short body text.
 *
 * Animation: each card fades up with a per-index stagger so the four
 * cards appear in sequence as the section scrolls into view.
 *
 * Props:
 *   item  — { icon, title, body }  from ABOUT_ITEMS
 *   index — 0-based position used to compute the stagger delay
 */

import { useTranslation } from "react-i18next";
import type { AboutItem } from "../features/home/types/home";

interface AboutCardProps {
  item: AboutItem;
  /** 0-based card index — drives the per-card stagger animation delay */
  index: number;
}

export default function AboutCard({ item, index }: AboutCardProps) {
  const { t } = useTranslation();
  return (
    /*
     * Lift + ring highlight on hover give tactile feedback without moving
     * the layout.  The ring color transitions from border → brand-primary so the
     * card appears to "glow" when focused.
     *
     * Stagger: 100 ms per card so the last card in a row of 4 delays 300 ms.
     * We use inline style (not a constructed class string) so Tailwind
     * doesn't need to statically detect the class.
     */
    <div
      className="animate-fade-in-up rounded-2xl bg-card p-8 text-center shadow-card ring-1 ring-border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-brand hover:ring-brand-primary"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* ── Icon container ──────────────────────────────────── */}
      {/*
       * Brand-gradient square with rounded corners and a matching brand
       * box-shadow so the icon appears to float above the card surface.
       */}
      <div
        className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient text-3xl shadow-brand"
        aria-hidden="true"
      >
        {item.icon}
      </div>

      {/* ── Title ───────────────────────────────────────────── */}
      <h3 className="mt-5 font-display text-xl font-bold">
        {item.titleKey ? t(item.titleKey) : item.title}
      </h3>

      {/* ── Body text ───────────────────────────────────────── */}
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {item.bodyKey ? t(item.bodyKey) : item.body}
      </p>
    </div>
  );
}