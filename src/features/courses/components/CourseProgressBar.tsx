// src/features/courses/components/CourseProgressBar.tsx
// ─────────────────────────────────────────────────────────────
// Course Progress Visualization — Reusable UI Component
// Displays progress with percentage and visual bar.
// ─────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface CourseProgressBarProps {
    /** Progress percentage (0-100) */
    percent: number;
    /** Display size: small, medium, or large */
    size?: 'sm' | 'md' | 'lg';
    /** Show percentage text */
    showLabel?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Custom color for progress bar */
    color?: 'primary' | 'success' | 'warning' | 'destructive';
}

/**
 * Reusable progress bar component.
 * Displays course completion percentage with visual indicator.
 */
export function CourseProgressBar({
    percent,
    size = 'md',
    showLabel = true,
    className = '',
    color = 'primary',
}: CourseProgressBarProps) {
    const { t } = useTranslation();
    // Clamp percentage between 0-100
    const clampedPercent = useMemo(() => Math.min(100, Math.max(0, percent)), [percent]);

    // Height classes by size
    const heightClasses = {
        sm: 'h-1.5',
        md: 'h-2',
        lg: 'h-3',
    };

    // Color classes
    const colorClasses = {
        primary: 'bg-primary',
        success: 'bg-brand-accent',
        warning: 'bg-brand-primary',
        destructive: 'bg-destructive',
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Label row */}
            {showLabel && (
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{t('courses.progressLabel')}</span>
                    <span className="text-xs font-semibold text-foreground">
                        {Math.round(clampedPercent)}%
                    </span>
                </div>
            )}

            {/* Progress bar */}
            <div className={`w-full bg-muted rounded-full overflow-hidden ${heightClasses[size]}`}>
                <div
                    className={`h-full ${colorClasses[color]} rounded-full transition-all duration-300 ease-out`}
                    style={{ width: `${clampedPercent}%` }}
                    role="progressbar"
                    aria-valuenow={Math.round(clampedPercent)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Course progress: ${Math.round(clampedPercent)}%`}
                />
            </div>
        </div>
    );
}

/**
 * Detailed progress breakdown with module-level info.
 * Shows completion by module with individual progress bars.
 */
interface ModuleProgressProps {
    module: {
        id: string;
        title: string;
        completed_lessons: number;
        total_lessons: number;
        progress_percent: number;
    };
}

export function ModuleProgressItem({ module }: ModuleProgressProps) {
    const { t } = useTranslation();
    const percent = module.progress_percent || 0;

    return (
        <div className="space-y-2 py-3 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            {/* Module header */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">{module.title}</h4>
                <span className="text-xs font-semibold text-muted-foreground">
                    {module.completed_lessons}/{module.total_lessons}
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                />
            </div>

            {/* Percentage */}
            <p className="text-xs text-muted-foreground">{Math.round(percent)}% {t('courses.completed')}</p>
        </div>
    );
}

/**
 * Summary card showing overall course progress with modules breakdown.
 */
interface ProgressSummaryProps {
    totalLessons: number;
    completedLessons: number;
    progressPercent: number;
    modulesProgress?: Array<{
        id: string;
        title: string;
        completed_lessons: number;
        total_lessons: number;
        progress_percent: number;
    }>;
}

export function ProgressSummary({
    totalLessons,
    completedLessons,
    progressPercent,
    modulesProgress = [],
}: ProgressSummaryProps) {
    const { t } = useTranslation();
    return (
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
            {/* Overall progress */}
            <div>
                <h3 className="font-semibold text-foreground mb-3">{t('courses.progressSummary')}</h3>
                <CourseProgressBar percent={progressPercent} showLabel size="md" />
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-2 rounded-lg bg-muted/30 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{t('courses.completedLessons')}</p>
                    <p className="text-lg font-bold text-foreground">
                        {completedLessons}/{totalLessons}
                    </p>
                </div>
                <div className="p-2 rounded-lg bg-muted/30 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{t('courses.percentage')}</p>
                    <p className="text-lg font-bold text-foreground">
                        {Math.round(progressPercent)}%
                    </p>
                </div>
            </div>

            {/* Modules breakdown */}
            {modulesProgress.length > 0 && (
                <div className="space-y-2 border-t border-border pt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">{t('courses.modules')}</p>
                    <div className="space-y-2">
                        {modulesProgress.map((module) => (
                            <ModuleProgressItem key={module.id} module={module} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
