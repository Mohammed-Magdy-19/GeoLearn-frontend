// src/features/courses/components/CourseListItem.tsx
// ─────────────────────────────────────────────────────────────
// Course List Item — Horizontal course presentation item
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { BookOpen, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { Course } from '../types';

interface CourseListItemProps {
    course: Course;
    progress?: number;
    isEnrolled?: boolean;
    onEnroll?: (courseId: string) => void;
    onViewDetails?: (courseId: string) => void;
    isLoading?: boolean;
    showEnrollCount?: boolean;
}

export function CourseListItem({
    course,
    progress = 0,
    isEnrolled = false,
    onEnroll,
    onViewDetails,
    isLoading = false,
    showEnrollCount = false,
}: CourseListItemProps) {
    const { t } = useTranslation();
    const [imageError, setImageError] = useState(false);
    const isPaid = course.price_egp > 0;

    return (
        <div className="flex gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
            {/* Thumbnail */}
            <div className="shrink-0 w-32 h-24 rounded-lg bg-muted overflow-hidden">
                {course.thumbnail_url && !imageError ? (
                    <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                        loading="eager"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <BookOpen className="size-6 text-primary/60" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between">
                {/* Header */}
                <div>
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                        {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.description}
                    </p>
                </div>

                {/* Meta and progress */}
                <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground space-x-2">
                        <span className="flex items-center gap-1"><BookOpen className="size-3" /> {t('common.lessons_other', { count: course.lesson_count })}</span>
                        <span>•</span>
                        <span>{course.module_count} {t('courses.modules')}</span>
                        {showEnrollCount && (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Users className="size-3" /> {t('courses.manyEnrolled')}</span>
                            </>
                        )}
                    </div>

                    {isEnrolled && progress > 0 && (
                        <p className="text-xs font-semibold text-primary">
                            {Math.round(progress)}%
                        </p>
                    )}
                </div>
            </div>

            {/* Right sidebar: Price + Actions */}
            <div className="shrink-0 flex flex-col items-end justify-between min-w-[120px]">
                {/* Price */}
                <div className="text-start">
                    {isPaid ? (
                        <p className="font-semibold text-primary">
                            {course.price_egp.toLocaleString()} {t('common.egp')}
                        </p>
                    ) : (
                        <p className="font-semibold text-brand-accent">{t('common.free')}</p>
                    )}
                </div>

                {/* Button */}
                {isEnrolled ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDetails?.(course.slug)}
                        disabled={isLoading}
                    >
                        {t('courses.continue')}
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        onClick={() => onEnroll?.(course.id)}
                        disabled={isLoading}
                    >
                        {t('courses.enrollNow')}
                    </Button>
                )}
            </div>
        </div>
    );
}
