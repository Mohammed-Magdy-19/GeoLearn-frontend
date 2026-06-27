// src/features/video/hooks/useVideoData.ts
// ─────────────────────────────────────────────────────────────
// Server-State Synchronizer — TanStack Query v5
// Manages cache lifetimes for video metadata and lesson details.
// ─────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchVideoMeta,
    fetchLessonDetail,
    reportProgress,
    fetchContinueLearning,
    type VideoMetadata,
    type LessonDetail,
    type ProgressReport,
    type ProgressResponse,
    type ContinueLearningResponse,
} from '@/services/api';

// ── Query Keys ────────────────────────────────────────────

export const videoKeys = {
    all: ['video'] as const,
    meta: (videoId: string | null) => [...videoKeys.all, 'meta', videoId] as const,
    lesson: (courseSlug: string, lessonId: string | null) =>
        [...videoKeys.all, 'lesson', courseSlug, lessonId] as const,
    progress: (lessonId: string | null) => [...videoKeys.all, 'progress', lessonId] as const,
    continue: () => [...videoKeys.all, 'continue'] as const,
};

// ── Video Metadata Query ──────────────────────────────────

export function useVideoData(videoId: string | null) {
    return useQuery<VideoMetadata, Error>({
        queryKey: videoKeys.meta(videoId),
        queryFn: () => {
            if (!videoId) throw new Error('Video ID is required');
            return fetchVideoMeta(videoId);
        },
        enabled: !!videoId,
        staleTime: 5 * 60 * 1000, // 5 minutes — metadata rarely changes
        gcTime: 10 * 60 * 1000,   // 10 minutes garbage collection
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    });
}

// ── Lesson Detail Query ───────────────────────────────────

export function useLessonDetail(courseSlug: string, lessonId: string | null) {
    return useQuery<LessonDetail, Error>({
        queryKey: videoKeys.lesson(courseSlug, lessonId),
        queryFn: () => {
            if (!lessonId) throw new Error('Lesson ID is required');
            return fetchLessonDetail(courseSlug, lessonId);
        },
        enabled: !!lessonId && !!courseSlug,
        staleTime: 2 * 60 * 1000, // 2 minutes — session tokens expire
        gcTime: 5 * 60 * 1000,
        retry: 1,
    });
}

// ── Progress Reporting Mutation ───────────────────────────

export function useProgressReport(courseSlug: string) {
    const queryClient = useQueryClient();

    return useMutation<ProgressResponse, Error, ProgressReport>({
        mutationFn: reportProgress,
        onSuccess: (data) => {
            // ── Video feature caches ──────────────────────────
            queryClient.invalidateQueries({
                queryKey: videoKeys.progress(data.lesson_id),
            });
            queryClient.invalidateQueries({
                queryKey: videoKeys.continue(),
            });
            queryClient.invalidateQueries({
                queryKey: videoKeys.lesson(courseSlug, data.lesson_id),
            });

            // ── Course feature caches ─────────────────────────
            // Course detail page (progress bar, lesson completion badges)
            queryClient.invalidateQueries({
                queryKey: ['course', courseSlug],
            });
            queryClient.invalidateQueries({
                queryKey: ['courses'],
            });
            // Enrollment list — drives My Courses progress bars
            queryClient.invalidateQueries({
                queryKey: ['courses', 'enrollments'],
            });
            // Enrollment status — drives enrolled/not-enrolled state
            queryClient.invalidateQueries({
                queryKey: ['courses', 'status'],
            });
            // Course progress queries (CourseDetailPage sidebar)
            queryClient.invalidateQueries({
                queryKey: ['courses', 'progress'],
            });

            // ── Home page caches ──────────────────────────────
            queryClient.invalidateQueries({
                queryKey: ['public-courses'],
            });
        },
        onError: (error) => {
            console.error('Progress report failed:', error.message);
        },
    });
}

// ── Continue Learning Query ───────────────────────────────

export function useContinueLearning() {
    return useQuery<ContinueLearningResponse, Error>({
        queryKey: videoKeys.continue(),
        queryFn: fetchContinueLearning,
        staleTime: 30 * 1000, // 30 seconds — frequently updated
        gcTime: 2 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: true,
    });
}

// ── Prefetch Utilities ────────────────────────────────────

export function usePrefetchLesson() {
    const queryClient = useQueryClient();

    return (courseSlug: string, lessonId: string) => {
        queryClient.prefetchQuery({
            queryKey: videoKeys.lesson(courseSlug, lessonId),
            queryFn: () => fetchLessonDetail(courseSlug, lessonId),
            staleTime: 2 * 60 * 1000,
        });
    };
}