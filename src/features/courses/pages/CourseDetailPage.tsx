// src/features/courses/pages/CourseDetailPage.tsx
// ─────────────────────────────────────────────────────────────
// Course Detail Page — Pure Layout Component
// Shows single course details with enrollment and progress.
// All logic extracted to hooks.
// ─────────────────────────────────────────────────────────────

import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    useCourseDetail,
    useCourseProgress,
    useEnrollmentStatus,
    useEnrollCourse,
} from '../hooks/useCourseData';
import { useCourseProgress as useCourseProgressCalcs } from '../hooks/useCourseProgress';
import { CourseDetailCard } from '../components/CourseDetailCard';
import { CourseInfoSidebar } from '../components/CourseInfoSidebar';
import { ProgressSummary } from '../components/CourseProgressBar';
import { CourseDetailSkeleton } from '../components/CoursesSkeleton';

export function CourseDetailPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { courseId } = useParams<{ courseId: string }>();

    if (!courseId) {
        return (
            <main className="container max-w-7xl mx-auto px-4 py-8 min-h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                        {t("courses.courseNotFound")}
                    </h2>
                    <Button onClick={() => navigate('/courses')} variant="outline">
                        <ArrowLeft className="size-4 mr-2" />
                        {t("courses.backToCourses")}
                    </Button>
                </div>
            </main>
        );
    }

    // Data fetching
    const { data: course, isLoading: isCourseLoading, error: courseError } = useCourseDetail(courseId);
    const { data: progressData } = useCourseProgress(course?.id || null);
    const { data: enrollmentStatus } = useEnrollmentStatus(course?.id || null);
    const enrollCourse = useEnrollCourse();

    // Progress calculations
    const progressCalcs = useCourseProgressCalcs(course?.modules);

    const isEnrolled = enrollmentStatus?.is_enrolled ?? false;
    const currentProgress = progressData?.progress_percent ?? 0;

    // ── Event Handlers ────────────────────────────────────────

    const handleEnroll = async () => {
        if (!course?.id) return;
        try {
            await enrollCourse.mutateAsync({ course_id: course.id });
            // Data will refresh automatically due to query invalidation
        } catch (error) {
            console.error('Enrollment failed:', error);
        }
    };

    const handleBack = () => {
        navigate('/courses');
    };

    const handleLessonClick = (lessonId: string) => {
        if (course) {
            navigate(`/courses/${course.slug}/watch/${lessonId}`);
        }
    };

    // ── Loading State ─────────────────────────────────────────

    if (isCourseLoading) {
        return (
            <main className="container max-w-7xl mx-auto px-4 py-8 min-h-screen">
                <CourseDetailSkeleton />
            </main>
        );
    }

    // ── Error State ───────────────────────────────────────────

    if (courseError || !course) {
        return (
            <main className="container max-w-7xl mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <XCircle className="size-16 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                        {t("courses.failedToLoadCourse")}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        {courseError?.message || t("courses.errorLoadingCourse")}
                    </p>
                    <Button onClick={handleBack} variant="outline">
                        <ArrowLeft className="size-4 mr-2" />
                        {t("courses.backToCourses")}
                    </Button>
                </div>
            </main>
        );
    }

    // ── Render Course Detail ──────────────────────────────────

    return (
        <main className="min-h-screen bg-background">
            {/* Top Navigation Bar */}
            <div className="top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
                <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="hover:bg-muted"
                    >
                        <ArrowLeft className="size-5" />
                    </Button>
                    <h2 className="flex-1 text-center font-semibold text-foreground truncate mx-4">
                        {course.title}
                    </h2>
                    <div className="w-10" /> {/* Spacer for alignment */}
                </div>
            </div>

            {/* Main Content */}
            <div className="container max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Course Details (takes 2 columns) */}
                    <div className="lg:col-span-2 animate-fade-in-up">
                        <CourseDetailCard
                            course={course}
                            progress={currentProgress}
                            isEnrolled={isEnrolled}
                            onEnroll={handleEnroll}
                            isLoading={enrollCourse.isPending}
                            onLessonClick={handleLessonClick}
                        />
                    </div>

                    {/* Right: Progress Sidebar */}
                    <div className="space-y-4 animate-fade-in-up animation-delay-100">
                        {isEnrolled && progressData && (
                            <ProgressSummary
                                totalLessons={progressCalcs.totalLessons}
                                completedLessons={progressCalcs.completedLessons}
                                progressPercent={currentProgress}
                                modulesProgress={progressCalcs.modulesProgress}
                            />
                        )}

                        <CourseInfoSidebar
                            isPublished={course.is_published}
                            moduleCount={course.module_count}
                            lessonCount={course.lesson_count}
                            priceEgp={course.price_egp}
                            isEnrolled={isEnrolled}
                            onEnroll={handleEnroll}
                            isEnrolling={enrollCourse.isPending}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
