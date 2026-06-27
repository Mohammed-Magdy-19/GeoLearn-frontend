/**
 * CoursesSection
 *
 * Displays the available course catalog in a responsive grid.
 * Fetches published courses from GET /api/courses/ (public endpoint).
 * Falls back to static COURSES data when the API request fails or returns empty.
 *
 * If the user is logged in, also fetches their enrollments to show
 * "متابعة" (Continue) instead of "سجل" (Enroll) on enrolled courses.
 */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import api from "../../../services/api";
import CourseCard from "../../../components/CourseCard";
import SectionHeader from "../../../components/SectionHeader";
import { COURSES } from "../data/homeData";
import { useUserEnrollments } from "@/features/courses/hooks/useCourseData";

// ── Types ────────────────────────────────────────────────────────

interface BackendCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  price_egp: number;
  is_published: boolean;
  module_count: number;
  lesson_count: number;
  created_at: string;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BackendCourse[];
}

// ── API Fetch ────────────────────────────────────────────────────

const fetchPublicCourses = async (): Promise<BackendCourse[]> => {
  const { data } = await api.get<PaginatedResponse | BackendCourse[]>(
    "/courses/"
  );

  // Handle both paginated and non-paginated responses
  if (Array.isArray(data)) return data;
  return data.results;
};

// ── Skeleton Loader ──────────────────────────────────────────────

function CourseSkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-border animate-pulse">
      {/* Image placeholder */}
      <div className="h-48 bg-muted" />
      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        <div className="h-6 w-3/4 rounded bg-muted mb-3" />
        <div className="flex gap-4 mb-4">
          <div className="h-4 w-20 rounded bg-muted" />
          <div className="h-4 w-20 rounded bg-muted" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-5/6 rounded bg-muted" />
        </div>
        <div className="mt-6 border-t pt-5">
          <div className="h-8 w-24 rounded bg-muted mb-3" />
          <div className="h-10 w-full rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────

export default function CoursesSection() {
  const { t } = useTranslation();
  const {
    data: backendCourses,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["public-courses"],
    queryFn: fetchPublicCourses,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  // Fetch user enrollments (returns empty if not logged in)
  const { data: enrollments } = useUserEnrollments();

  // Build a Set of enrolled course IDs for O(1) lookup
  const enrolledIds = useMemo(() => {
    if (!enrollments) return new Set<string>();
    return new Set(enrollments.map((e) => e.course_id));
  }, [enrollments]);

  // Determine which data source to render
  const hasBackendData = !isError && backendCourses && backendCourses.length > 0;

  return (
    <section id="courses" className="bg-background py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          primaryText={t("home.coursesPrimary")}
          highlightText={t("home.coursesHighlight")}
          subtitle={t("home.coursesSubtitle")}
          subtitleMaxWidth="xl"
        />

        {/* Loading skeleton */}
        {isLoading && (
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <CourseSkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Backend courses grid */}
        {!isLoading && hasBackendData && (
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {backendCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course as any}
                index={index}
                isEnrolled={enrolledIds.has(course.id)}
              />
            ))}
          </div>
        )}

        {/* Fallback to static data when API returns empty or fails */}
        {!isLoading && !hasBackendData && (
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {COURSES.map((course, index) => (
              <CourseCard key={course.slug} course={course} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

