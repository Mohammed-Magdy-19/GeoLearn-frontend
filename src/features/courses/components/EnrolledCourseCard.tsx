// src/features/courses/components/EnrolledCourseCard.tsx
// ─────────────────────────────────────────────────────────────
// Enrolled Course Card Component — Lightweight card for My Courses page
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { CourseProgressBar } from './CourseProgressBar';

interface EnrolledCourseCardProps {
    title: string;
    slug: string;
    thumbnailUrl?: string | null;
    progress: number;
    onViewDetails?: (slug: string) => void;
    isLoading?: boolean;
}

export function EnrolledCourseCard({
    title,
    slug,
    thumbnailUrl,
    progress = 0,
    onViewDetails,
    isLoading = false,
}: EnrolledCourseCardProps) {
    const { t } = useTranslation();
    const [imageError, setImageError] = useState(false);

    const progressPercent = Math.min(100, Math.max(0, progress || 0));

    return (
        <div className="group rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            {/* Thumbnail Container */}
            <div className="relative w-full h-40 bg-muted overflow-hidden">
                {thumbnailUrl && !imageError ? (
                    <img
                        src={thumbnailUrl}
                        alt={title}
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
                <div className="absolute top-2 right-2">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-brand-accent text-white">
                        {t('courses.enrolled')}
                    </span>
                </div>

                {/* Progress overlay */}
                {progressPercent > 0 && (
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
                        {title}
                    </h3>
                </div>

                {/* Progress bar */}
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

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div />
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDetails?.(slug)}
                        disabled={isLoading}
                        className="text-xs"
                    >
                        {t('courses.continue')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
