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

        {/* Empty state when no courses exist or API fails */}
        {!isLoading && !hasBackendData && (
          <div className="mt-16 text-center max-w-md mx-auto py-12 border border-dashed border-border rounded-2xl bg-card/50 backdrop-blur shadow-sm px-6 flex flex-col items-center justify-center">
            {/* Steaming Tea Cup SVG */}
            <div className="relative flex items-center justify-center mb-6">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-20 h-20 text-brand-primary"
                >
                    {/* Cup Body */}
                    <path d="M18 8H4c0 3.3 2.7 6 6 6h4c3.3 0 6-2.7 6-6Z" />
                    {/* Handle */}
                    <path d="M18 5c1.7 0 3 1.3 3 3s-1.3 3-3 3" />
                    {/* Saucer */}
                    <path d="M2 17h20" />
                    
                    {/* Steaming lines */}
                    <path
                        style={{
                            animation: "steam-wave 1.8s infinite ease-in-out",
                            transformOrigin: "bottom",
                        }}
                        d="M7 4c.3-1 .6-1 1 0s.7 1 1 0"
                    />
                    <path
                        style={{
                            animation: "steam-wave 1.8s infinite ease-in-out 0.6s",
                            transformOrigin: "bottom",
                        }}
                        d="M11 4c.3-1 .6-1 1 0s.7 1 1 0"
                    />
                    <path
                        style={{
                            animation: "steam-wave 1.8s infinite ease-in-out 1.2s",
                            transformOrigin: "bottom",
                        }}
                        d="M15 4c.3-1 .6-1 1 0s.7 1 1 0"
                    />
                </svg>
                <style>{`
                    @keyframes steam-wave {
                        0% { transform: translateY(2px) scaleY(0.7); opacity: 0.1; }
                        50% { opacity: 0.8; }
                        100% { transform: translateY(-8px) scaleY(1.3); opacity: 0; }
                    }
                    @keyframes glow-shift {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    .animate-glow-text {
                        background-size: 200% auto;
                        animation: glow-shift 4s ease infinite;
                    }
                `}</style>
            </div>

            <h3 className="text-3xl font-black mb-2 bg-gradient-to-r from-brand-primary via-brand-warm to-brand-primary bg-clip-text text-transparent animate-glow-text animate-pulse">
              {t("courses.noCoursesAvailable")}
            </h3>
          </div>
        )}
      </div>
    </section>
  );
}

