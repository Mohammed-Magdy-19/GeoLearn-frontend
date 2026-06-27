// src/features/courses/components/CourseStatsGrid.tsx
// ─────────────────────────────────────────────────────────────
// Course Stats Grid Component — Visual stats card list
// ─────────────────────────────────────────────────────────────

import { formatDuration } from '../hooks/useCourseProgress';
import { useTranslation } from 'react-i18next';

interface CourseStatsGridProps {
    moduleCount: number;
    lessonCount: number;
    totalDuration: number;
    progressPercent: number;
}

export function CourseStatsGrid({
    moduleCount,
    lessonCount,
    totalDuration,
    progressPercent,
}: CourseStatsGridProps) {
    const { t } = useTranslation();
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                    {moduleCount}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t('courses.modules')}</p>
            </div>
            <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                    {lessonCount}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t('courses.lessonsLabel')}</p>
            </div>
            <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                    {formatDuration(totalDuration)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t('courses.durationLabel')}</p>
            </div>
            <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                    {Math.round(progressPercent)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t('courses.progressLabel')}</p>
            </div>
        </div>
    );
}
