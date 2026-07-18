/**
 * src/components/seo/SEOHead.tsx
 *
 * Enterprise-grade dynamic meta injection engine using React Helmet Async.
 *
 * Dynamically injects page-level <title>, <meta>, <link rel="canonical">,
 * Open Graph, and Twitter Card tags into the document <head> on every
 * client-side navigation without memory leaks or race conditions.
 *
 * Usage:
 *   <SEOHead
 *     title="Courses"
 *     description="Browse all available GeoLearn courses."
 *     canonical="/courses"
 *   />
 */

import { Helmet } from "react-helmet-async";

// ── Constants ──────────────────────────────────────────────────────────────

const SITE_NAME = "GeoLearn";
const BASE_URL = "https://geo-learn-frontend.vercel.app";
const DEFAULT_TITLE = "GeoLearn - Interactive Geography & Spatial Data Learning";
const DEFAULT_DESCRIPTION =
  "GeoLearn - An interactive, modern platform for learning geography, spatial data science, and GIS mapping.";

// ── Types ──────────────────────────────────────────────────────────────────

export interface SEOMetadata {
  /** Page title — appended with " | GeoLearn" suffix automatically. */
  title?: string;
  /** Meta description for search engine snippets (max ~160 chars). */
  description?: string;
  /** Comma-separated keywords for legacy search engine support. */
  keywords?: string;
  /** Canonical URL path (e.g., "/courses"). Resolved to full absolute URL. */
  canonical?: string;
  /** Robots directive. Defaults to "index, follow". */
  robots?: string;
  /** Open Graph image URL (absolute path). */
  ogImage?: string;
  /** Open Graph content type. Defaults to "website". */
  ogType?: "website" | "article" | "profile";
  /** Twitter card type. Defaults to "summary_large_image". */
  twitterCard?: "summary" | "summary_large_image";
  /** Override the full title without the " | GeoLearn" suffix. */
  rawTitle?: boolean;
}

// ── Component ──────────────────────────────────────────────────────────────

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  canonical,
  robots = "index, follow",
  ogImage,
  ogType = "website",
  twitterCard = "summary_large_image",
  rawTitle = false,
}: SEOMetadata) {
  const resolvedTitle = title
    ? rawTitle
      ? title
      : `${title} | ${SITE_NAME}`
    : DEFAULT_TITLE;

  const resolvedCanonical = canonical
    ? `${BASE_URL}${canonical}`
    : BASE_URL;

  return (
    <Helmet>
      {/* ── Core ── */}
      <title>{resolvedTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={resolvedCanonical} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* ── Open Graph ── */}
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* ── Twitter Card ── */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
}

export default SEOHead;
