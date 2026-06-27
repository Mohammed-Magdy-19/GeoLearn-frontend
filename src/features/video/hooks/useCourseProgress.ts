// src/features/video/hooks/useCourseProgress.ts
// ─────────────────────────────────────────────────────────────
// Course Progress Calculation Hook
// Calculates overall course completion statistics.
// Extracted from WatchPage for single responsibility.
// ─────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import type { Module, CourseProgress } from '../types';

export function useCourseProgress(modules: Module[] | undefined): CourseProgress {
    return useMemo(() => {
        if (!modules || modules.length === 0) {
            return { totalLessons: 0, completedLessons: 0, progressPercent: 0 };
        }

        const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);

        const completedLessons = modules.reduce(
            (acc, m) => acc + m.lessons.filter((l) => l.progress?.is_completed).length,
            0
        );

        const progressPercent = totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        return {
            totalLessons,
            completedLessons,
            progressPercent,
        };
    }, [modules]);
}