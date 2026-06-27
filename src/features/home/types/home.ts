/**
 * Home Page Domain Types
 *
 * Single-responsibility type definitions for the GeoLearn Academy
 * home page feature module.
 */

import type { ReactNode } from "react";

/** Represents a single course offering on the platform */
export interface Course {
  /** Unique URL-friendly identifier */
  slug: string;
  /** Display title in Arabic */
  title: string;
  /** Optional promotional badge text */
  badge: string | null;
  /** Duration in hours (display string, e.g. "20 ساعة") */
  hours: string;
  /** Difficulty level description */
  level: string;
  /** Short description paragraph */
  description: string;
  /** Price in EGP (formatted string without commas) */
  price: string;
  /** Optional brand logo image URL */
  logoImage: string | null;
  /** Hero cover image URL for the course card */
  coverImage: string;
}

/** Represents an "About" info card item */
export interface AboutItem {
  /** Lucide icon element */
  icon: ReactNode;
  /** Card heading (or i18n key) */
  title: string;
  /** Optional i18n key for the title */
  titleKey?: string;
  /** Card body text (or i18n key) */
  body: string;
  /** Optional i18n key for the body */
  bodyKey?: string;
}

/** Represents a hero statistics counter item */
export interface StatItem {
  /** Numeric value display string (e.g. "+500") */
  value: string;
  /** Label text (or i18n key) */
  label: string;
  /** Optional i18n key for the label */
  labelKey?: string;
}

/** Represents a navigation level dropdown item */
export interface LevelItem {
  /** URL slug for the level */
  slug: string;
  /** Display label (or i18n key) */
  label: string;
  /** Optional i18n key for the label */
  labelKey?: string;
}

/** Represents a quick footer or nav link */
export interface QuickLink {
  /** Display label (or i18n key) */
  label: string;
  /** Optional i18n key for the label */
  labelKey?: string;
  /** href target */
  href: string;
}

/** Represents a contact info item */
export interface ContactInfo {
  /** Lucide icon element */
  icon: ReactNode;
  /** Display text (or i18n key) */
  text: string;
  /** Optional i18n key for the text */
  textKey?: string;
  /** Optional href for clickable items (tel:, mailto:) */
  href?: string;
  /** Whether to apply LTR direction override */
  isLtr?: boolean;
}
