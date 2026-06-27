// src/features/courses/components/CoursesGrid.tsx
// ─────────────────────────────────────────────────────────────
// Courses Grid Layout — Reusable Layout Component
// Responsive grid for displaying multiple course cards.
// ─────────────────────────────────────────────────────────────

import { BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CourseCard } from './CourseCard';
import type { Course } from '../types';

interface CoursesGridProps {
    courses: Course[];
    enrolledCourseIds?: string[];
    progressMap?: Record<string, number>;
    onEnroll?: (courseId: string) => void;
    onViewDetails?: (courseId: string) => void;
    isLoading?: boolean;
    emptyMessage?: string;
}

/**
 * Responsive grid layout for displaying courses.
 * Automatically adapts columns based on screen size:
 * - Mobile: 1 column
 * - Tablet: 2 columns
 * - Desktop: 3 columns
 * - Large screens: 4 columns
 */
export function CoursesGrid({
    courses,
    enrolledCourseIds = [],
    progressMap = {},
    onEnroll,
    onViewDetails,
    isLoading = false,
    emptyMessage,
}: CoursesGridProps) {
    const { t } = useTranslation();
    const resolvedEmptyMessage = emptyMessage || t('courses.noCoursesCurrently');
    if (courses.length === 0) {
        return (
            <div className="py-12 text-center">
                <BookOpen className="size-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{resolvedEmptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
                <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={enrolledCourseIds.includes(course.id)}
                    progress={progressMap[course.id] || 0}
                    onEnroll={onEnroll}
                    onViewDetails={onViewDetails}
                    isLoading={isLoading}
                />
            ))}
        </div>
    );
}

