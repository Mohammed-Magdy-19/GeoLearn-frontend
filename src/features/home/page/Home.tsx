/**
 * Home Page
 *
 * Landing page for GeoLearn Academy. Composes all home sections
 * in order: Hero → Courses.
 *
 * Performance: Only HeroSection loads eagerly (above the fold).
 * Below-the-fold sections are lazy-loaded with Suspense boundaries
 * so they don't block initial page paint.
 */

import { lazy, Suspense } from "react";
import HeroSection from "../components/HeroSection";

const CoursesSection = lazy(() => import("../components/CoursesSection"));
const ContactSection = lazy(() => import("../../../components/ContactSection"));

/** Lightweight shimmer placeholder while sections lazy-load */
function SectionSkeleton() {
  return (
    <div className="py-24">
      <div className="mx-auto max-w-5xl px-6 space-y-6">
        <div className="mx-auto h-10 w-64 rounded-lg bg-muted animate-pulse" />
        <div className="mx-auto h-4 w-96 rounded bg-muted/60 animate-pulse" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<SectionSkeleton />}>
        <CoursesSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <ContactSection />
      </Suspense>
    </>
  );
}
