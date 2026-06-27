// src/features/courses/components/CourseCard.tsx
// ─────────────────────────────────────────────────────────────
// Course Card — Reusable UI Component
// Displays a single course in grid/list with preview and actions.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { CourseProgressBar } from './CourseProgressBar';
import type { Course } from '../types';

interface CourseCardProps {
    course: Course;
    progress?: number;
    isEnrolled?: boolean;
    onEnroll?: (courseId: string) => void;
    onViewDetails?: (courseId: string) => void;
    isLoading?: boolean;
}

/**
 * Reusable course card component.
 * Displays course preview with thumbnail, title, progress, and action buttons.
 * Optimized for responsive grid layouts.
 */
export function CourseCard({
    course,
    progress = 0,
    isEnrolled = false,
    onEnroll,
    onViewDetails,
    isLoading = false,
}: CourseCardProps) {
    const { t } = useTranslation();
    const [imageError, setImageError] = useState(false);

    const progressPercent = Math.min(100, Math.max(0, progress || 0));
    const isPaid = course.price_egp > 0;

    return (
        <div className="group rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            {/* Thumbnail Container */}
            <div className="relative w-full h-40 bg-muted overflow-hidden">
                {/* Thumbnail Image */}
                {course.thumbnail_url && !imageError ? (
                    <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <BookOpen className="size-8 text-primary/60" />
                    </div>
                )}

                {/* Badges overlay */}
                <div className="absolute top-2 right-2 flex gap-2">
                    {isEnrolled && (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-brand-accent text-white">
                            {t('courses.enrolled')}
                        </span>
                    )}
                    {course.is_published && (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground border border-border">
                            {t('courses.published')}
                        </span>
                    )}
                    {isPaid && (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium border border-border text-muted-foreground">
                            {t('common.paid')}
                        </span>
                    )}
                </div>

                {/* Progress overlay (if enrolled) */}
                {isEnrolled && progressPercent > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/80">
                        <div
                            className="h-full bg-brand-accent transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-4 space-y-3 flex flex-col h-[calc(100%-160px)]">
                {/* Title */}
                <div className="flex-1">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {course.title}
                    </h3>
                </div>

                {/* Description excerpt */}
                {course.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {course.description}
                    </p>
                )}

                {/* Course meta */}
                <div className="text-xs text-muted-foreground space-y-0.5">
                    <p className="flex items-center gap-1"><BookOpen className="size-3.5" /> {t('common.lessons_other', { count: course.lesson_count })} • {course.module_count} {t('courses.modules')}</p>
                </div>

                {/* Progress bar (if enrolled) */}
                {isEnrolled && (
                    <div>
                        <CourseProgressBar 
                            percent={progressPercent} 
                            size="sm" 
                            showLabel={false}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {Math.round(progressPercent)}% {t('courses.completed')}
                        </p>
                    </div>
                )}

                {/* Footer: Price & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    {/* Price */}
                    <div>
                        {isPaid ? (
                            <p className="font-semibold text-primary">
                                {course.price_egp.toLocaleString()} {t('common.egp')}
                            </p>
                        ) : (
                            <p className="font-semibold text-brand-accent">{t('common.free')}</p>
                        )}
                    </div>

                    {/* Action Button */}
                    {isEnrolled ? (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewDetails?.(course.slug)}
                            disabled={isLoading}
                            className="text-xs"
                        >
                            {t('courses.continue')}
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            onClick={() => onEnroll?.(course.id)}
                            disabled={isLoading}
                            className="text-xs"
                        >
                            {t('courses.enrollNow')}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

