// src/features/courses/components/CourseDetailCard.tsx
// ─────────────────────────────────────────────────────────────
// Course Detail Display — Reusable UI Component
// Shows full course information with modules and lessons.
// ─────────────────────────────────────────────────────────────

import { BookOpen, BookOpenText, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { formatDuration } from '../hooks/useCourseProgress';
import { CourseStatsGrid } from './CourseStatsGrid';
import { CourseModuleAccordion } from './CourseModuleAccordion';
import type { CourseDetail } from '../types';

interface CourseDetailCardProps {
    course: CourseDetail;
    progress?: number;
    isEnrolled?: boolean;
    onEnroll?: () => void;
    isLoading?: boolean;
    onLessonClick?: (lessonId: string) => void;
}

/**
 * Displays detailed course information.
 * Shows course metadata, modules, and lessons with full hierarchy.
 */
export function CourseDetailCard({
    course,
    progress = 0,
    isEnrolled = false,
    onEnroll,
    isLoading = false,
    onLessonClick,
}: CourseDetailCardProps) {
    const { t } = useTranslation();
    const totalDuration = course.modules?.reduce((sum, module) => {
        const moduleDuration = module.lessons?.reduce((total, lesson) => {
            return total + (lesson.duration_seconds || 0);
        }, 0) || 0;
        return sum + moduleDuration;
    }, 0) || 0;

    const isPaid = course.price_egp > 0;

    return (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
            {/* Cover Image */}
            {course.cover_image_url && (
                <div className="w-full h-56 bg-muted overflow-hidden">
                    <img
                        src={course.cover_image_url}
                        alt={course.title}
                        loading="eager"
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                                {course.title}
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                {course.description}
                            </p>
                        </div>
                        {!isEnrolled && (
                            <Button
                                size="lg"
                                onClick={onEnroll}
                                disabled={isLoading}
                                className="min-w-max"
                            >
                                {isLoading ? t('courses.enrolling') : t('courses.enrollNow')}
                            </Button>
                        )}
                    </div>

                    {/* Meta badges */}
                    <div className="flex flex-wrap gap-2">
                        {isPaid && (
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium border border-border text-foreground">
                                {course.price_egp.toLocaleString()} {t('common.egp')}
                            </span>
                        )}
                        {!isPaid && (
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
                                {t('common.free')}
                            </span>
                        )}
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium border border-border text-foreground">
                            <BookOpen className="size-3.5 inline" /> {t('common.lessons_other', { count: course.lesson_count })}
                        </span>
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium border border-border text-foreground">
                            <BookOpenText className="size-3.5 inline" /> {course.module_count} {t('courses.modules')}
                        </span>
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium border border-border text-foreground">
                            <Clock className="size-3.5 inline" /> {formatDuration(totalDuration)}
                        </span>
                    </div>
                </div>

                {/* Course Stats */}
                <CourseStatsGrid
                    moduleCount={course.module_count}
                    lessonCount={course.lesson_count}
                    totalDuration={totalDuration}
                    progressPercent={progress}
                />

                {/* Modules and Lessons */}
                <CourseModuleAccordion
                    modules={course.modules}
                    isEnrolled={isEnrolled}
                    onLessonClick={onLessonClick}
                />

                {/* Enrollment CTA */}
                {!isEnrolled && (
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                        <p className="text-sm text-foreground mb-3">
                            {isPaid
                                ? t('courses.coursePrice', { price: course.price_egp.toLocaleString() })
                                : t('courses.courseFree')}
                        </p>
                        <Button
                            onClick={onEnroll}
                            disabled={isLoading}
                            size="lg"
                            className="w-full"
                        >
                            {isLoading ? t('courses.enrolling') : t('courses.startLearningNow')}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

