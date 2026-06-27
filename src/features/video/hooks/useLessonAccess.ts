// src/features/video/hooks/useLessonAccess.ts
// ─────────────────────────────────────────────────────────────
// Lesson Access Control Hook
// Determines if a user can access a lesson based on purchase/staff status.
// Extracted from LessonSidebar for single responsibility.
// ─────────────────────────────────────────────────────────────

import { useCallback } from 'react';
import type { Lesson, LessonAccessConfig } from '../types';

export function useLessonAccess(config: LessonAccessConfig) {
    const { isPurchased, isStaff } = config;

    /**
     * Check if user can access a specific lesson.
     * Priority: staff > free preview > purchased > denied
     */
    const canAccessLesson = useCallback(
        (lesson: Lesson): boolean => {
            if (isStaff) return true;
            if (lesson.is_free_preview) return true;
            if (isPurchased) return true;
            return false;
        },
        [isPurchased, isStaff]
    );

    /**
     * Calculate lesson progress percentage (0-100).
     */
    const getLessonProgress = useCallback((lesson: Lesson): number => {
        if (!lesson.last_watched_second || !lesson.duration_seconds) return 0;
        return Math.min(100, (lesson.last_watched_second / lesson.duration_seconds) * 100);
    }, []);

    /**
     * Determine lesson status icon type.
     */
    const getLessonStatus = useCallback(
        (lesson: Lesson, isActive: boolean): 'completed' | 'locked' | 'active' | 'default' => {
            if (lesson.is_completed) return 'completed';
            if (!canAccessLesson(lesson)) return 'locked';
            if (isActive) return 'active';
            return 'default';
        },
        [canAccessLesson]
    );

    return {
        canAccessLesson,
        getLessonProgress,
        getLessonStatus,
    };
}