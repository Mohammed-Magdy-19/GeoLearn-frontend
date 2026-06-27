// src/features/courses/hooks/useCourseProgress.ts
// ─────────────────────────────────────────────────────────────
// Progress Calculation — Pure Business Logic
// Computes progress metrics from course module/lesson data.
// ─────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import type { CourseModule, ModuleProgress } from '../types';

/**
 * Calculate progress metrics from course modules.
 * Pure function wrapped in useMemo for performance.
 *
 * @param modules - Array of course modules with lessons
 * @returns Progress metrics: total, completed, percentage
 */
export function useCourseProgress(modules?: CourseModule[]) {
    return useMemo(() => {
        if (!modules || modules.length === 0) {
            return {
                totalLessons: 0,
                completedLessons: 0,
                progressPercent: 0,
                modulesProgress: [] as ModuleProgress[],
            };
        }

        let totalLessons = 0;
        let completedLessons = 0;
        const modulesProgress: ModuleProgress[] = [];

        modules.forEach((module) => {
            const moduleTotal = module.lessons?.length || 0;
            const moduleCompleted = module.lessons?.filter(
                (lesson) => lesson.is_completed
            ).length || 0;

            totalLessons += moduleTotal;
            completedLessons += moduleCompleted;

            modulesProgress.push({
                id: module.id,
                title: module.title,
                total_lessons: moduleTotal,
                completed_lessons: moduleCompleted,
                progress_percent: moduleTotal > 0 ? (moduleCompleted / moduleTotal) * 100 : 0,
            });
        });

        return {
            totalLessons,
            completedLessons,
            progressPercent: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
            modulesProgress,
        };
    }, [modules]);
}

/**
 * Format duration seconds to human-readable string.
 * Example: 3661 seconds → "1h 1m 1s"
 *
 * @param seconds - Total seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
    if (seconds < 0) return '0s';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
}

/**
 * Calculate total course duration from modules.
 *
 * @param modules - Array of course modules
 * @returns Total duration in seconds
 */
export function calculateTotalDuration(modules?: CourseModule[]): number {
    if (!modules) return 0;

    return modules.reduce((total, module) => {
        const moduleDuration = (module.lessons || []).reduce((sum, lesson) => {
            return sum + (lesson.duration_seconds || 0);
        }, 0);
        return total + moduleDuration;
    }, 0);
}

/**
 * Determine if course should be considered "in progress".
 * Course is in progress if at least one lesson is completed but not all.
 *
 * @param progressPercent - Overall progress percentage
 * @returns True if course is partially complete (1-99%)
 */
export function isInProgress(progressPercent: number): boolean {
    return progressPercent > 0 && progressPercent < 100;
}

/**
 * Determine if course should be considered "completed".
 * Course is completed if all lessons are done.
 *
 * @param progressPercent - Overall progress percentage
 * @returns True if progress is 100%
 */
export function isCompleted(progressPercent: number): boolean {
    return progressPercent >= 100;
}

/**
 * Determine if course should be considered "not started".
 * Course is not started if no lessons have been completed.
 *
 * @param progressPercent - Overall progress percentage
 * @returns True if progress is 0%
 */
export function isNotStarted(progressPercent: number): boolean {
    return progressPercent === 0;
}
