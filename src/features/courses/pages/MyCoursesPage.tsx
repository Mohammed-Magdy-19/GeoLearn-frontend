/**
 * src/features/courses/pages/MyCoursesPage.tsx
 *
 * Page displaying the student's enrolled courses.
 */

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUserEnrollments } from "../hooks/useCourseData";
import { EnrolledCourseCard } from "../components/EnrolledCourseCard";
import { Button } from "@/components/ui/button";
import { AlertTriangle, BookOpen } from "lucide-react";

export default function MyCoursesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: enrollments = [], isLoading, isError } = useUserEnrollments();

  const handleViewDetails = (courseSlug: string) => {
    navigate(`/courses/${courseSlug}`);
  };

  const handleBrowseCourses = () => {
    navigate("/courses");
  };

  return (
    <main className="container max-w-7xl mx-auto px-4 py-12 min-h-screen">
      {/* Page Header */}
      <div className="mb-10 animate-fade-in-up">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground font-display mb-2">
          {t("courses.myCoursesTitle")}
        </h1>
        <p className="text-muted-foreground">
          {t("courses.myCoursesSubtitle")}
        </p>
      </div>

      {isLoading ? (
        /* Loading Skeleton Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="rounded-xl border border-border bg-card shadow-sm h-72 animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        /* Error State */
        <div className="py-16 text-center border border-destructive/20 bg-destructive/10 rounded-2xl max-w-lg mx-auto">
          <AlertTriangle className="size-10 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-bold text-destructive mb-2">
            {t("courses.failedToLoadCourses")}
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            {t("courses.errorFetchingCourses")}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            {t("common.retry")}
          </Button>
        </div>
      ) : enrollments.length === 0 ? (
        /* Empty State */
        <div className="py-20 text-center max-w-md mx-auto border border-border/40 bg-card/40 backdrop-blur rounded-2xl shadow-md p-8">
          <BookOpen className="size-16 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t("courses.notEnrolledYet")}
          </h2>
          <p className="text-muted-foreground mb-8 text-sm">
            {t("courses.startLearningNow")}
          </p>
          <Button
            onClick={handleBrowseCourses}
            className="bg-brand-primary hover:bg-brand-primary-dark text-white font-bold px-8 py-2.5 rounded-full"
          >
            {t("courses.browseAvailableCourses")}
          </Button>
        </div>
      ) : (
        /* Enrolled Courses Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in-up animation-delay-200">
          {enrollments.map((enrollment) => (
            <EnrolledCourseCard
              key={enrollment.id}
              title={enrollment.course_title || ""}
              slug={enrollment.course_slug || ""}
              thumbnailUrl={enrollment.course_thumbnail_url}
              progress={enrollment.progress_percent || 0}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </main>
  );
}
