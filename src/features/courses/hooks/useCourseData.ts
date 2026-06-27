// src/features/courses/hooks/useCourseData.ts
// ─────────────────────────────────────────────────────────────
// Server-State Synchronizer — TanStack Query v5
// Manages cache lifetimes and mutations for course data.
// ─────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/useAuthStore';
import {
    fetchCourses,
    fetchCourseDetail,
    fetchCourseBySlug,
    fetchCourseProgress,
    enrollInCourse,
    fetchUserEnrollments,
    checkEnrollmentStatus,
    reportCourseCompletion,
    getErrorMessage,
} from '../services/coursesApi';
import type {
    Course,
    CourseDetail,
    CourseProgress,
    Enrollment,
    EnrollmentPayload,
    CourseCompletionPayload,
    PaginatedResponse,
} from '../types';

// ── Query Keys Factory ─────────────────────────────────────────
// Standardized query key structure for cache management

export const courseKeys = {
    all: ['courses'] as const,
    lists: () => [...courseKeys.all, 'list'] as const,
    list: (page: number, search: string) =>
        [...courseKeys.lists(), { page, search }] as const,
    details: () => [...courseKeys.all, 'detail'] as const,
    detail: (id: string) => [...courseKeys.details(), id] as const,
    bySlug: (slug: string) => [...courseKeys.all, 'slug', slug] as const,
    progress: (courseId: string) => [...courseKeys.all, 'progress', courseId] as const,
    enrollments: () => [...courseKeys.all, 'enrollments'] as const,
    enrollmentStatus: (courseId: string) => [...courseKeys.all, 'status', courseId] as const,
};

// ─────────────────────────────────────────────────────────────
// Course Listing Query
// ─────────────────────────────────────────────────────────────

/**
 * Fetch paginated list of courses with search/filter support.
 * Implements optimized caching for course discovery pages.
 */
export function useCourseList(page: number = 1, search: string = '') {
    return useQuery<PaginatedResponse<Course>, Error>({
        queryKey: courseKeys.list(page, search),
        queryFn: () => fetchCourses(page, search),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    });
}

// ─────────────────────────────────────────────────────────────
// Course Detail Query (by ID)
// ─────────────────────────────────────────────────────────────

/**
 * Fetch detailed course information with full hierarchy.
 * Used when user navigates to a specific course.
 */
export function useCourseDetail(courseId: string | null) {
    return useQuery<CourseDetail, Error>({
        queryKey: courseKeys.detail(courseId || ''),
        queryFn: () => {
            if (!courseId) throw new Error('Course ID is required');
            return fetchCourseDetail(courseId);
        },
        enabled: !!courseId,
        staleTime: 3 * 60 * 1000, // 3 minutes
        gcTime: 10 * 60 * 1000,
        retry: 1,
    });
}

// ─────────────────────────────────────────────────────────────
// Course Detail Query (by Slug)
// ─────────────────────────────────────────────────────────────

/**
 * Fetch course details using human-readable slug.
 * Used for SEO-friendly URLs like /courses/python-basics
 */
export function useCourseBySlug(slug: string | null) {
    return useQuery<CourseDetail, Error>({
        queryKey: courseKeys.bySlug(slug || ''),
        queryFn: () => {
            if (!slug) throw new Error('Course slug is required');
            return fetchCourseBySlug(slug);
        },
        enabled: !!slug,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
    });
}

// ─────────────────────────────────────────────────────────────
// Course Progress Query
// ─────────────────────────────────────────────────────────────

/**
 * Get user's progress in a specific course.
 * Real-time data showing completion stats and module progress.
 */
export function useCourseProgress(courseId: string | null) {
    const { user } = useAuthStore();
    return useQuery<CourseProgress, Error>({
        queryKey: [...courseKeys.progress(courseId || ''), user?.id] as const,
        queryFn: () => {
            if (!courseId) throw new Error('Course ID is required');
            return fetchCourseProgress(courseId);
        },
        enabled: !!courseId && !!user,
        staleTime: 0,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: true, // Refresh when user returns to window
    });
}

// ─────────────────────────────────────────────────────────────
// User Enrollments Query
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all courses user is enrolled in.
 * Used for "My Courses" or "Continue Learning" sections.
 */
export function useUserEnrollments() {
    const { user } = useAuthStore();
    return useQuery<Enrollment[], Error>({
        queryKey: [...courseKeys.enrollments(), user?.id] as const,
        queryFn: fetchUserEnrollments,
        enabled: !!user,
        staleTime: 0,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: true,
    });
}

// ─────────────────────────────────────────────────────────────
// Enrollment Status Query
// ─────────────────────────────────────────────────────────────

/**
 * Check if user is enrolled in a specific course.
 * Used to conditionally show enroll/access buttons.
 */
export function useEnrollmentStatus(courseId: string | null) {
    const { user } = useAuthStore();
    return useQuery<{ is_enrolled: boolean; enrollment?: Enrollment }, Error>({
        queryKey: [...courseKeys.enrollmentStatus(courseId || ''), user?.id] as const,
        queryFn: () => {
            if (!courseId) throw new Error('Course ID is required');
            return checkEnrollmentStatus(courseId);
        },
        enabled: !!courseId && !!user,
        staleTime: 0,
        gcTime: 10 * 60 * 1000,
        retry: 1,
    });
}

// ─────────────────────────────────────────────────────────────
// Enrollment Mutation
// ─────────────────────────────────────────────────────────────

/**
 * Enroll user in a course.
 * Handles enrollment request and updates related queries.
 */
export function useEnrollCourse() {
    const queryClient = useQueryClient();

    return useMutation<Enrollment, Error, EnrollmentPayload>({
        mutationFn: enrollInCourse,
        onSuccess: (enrollment) => {
            // ── Enrollment caches ─────────────────────────────
            // Update enrollments list (My Courses page)
            queryClient.invalidateQueries({
                queryKey: courseKeys.enrollments(),
            });
            // Update enrollment status for this specific course
            queryClient.invalidateQueries({
                queryKey: courseKeys.enrollmentStatus(enrollment.course_id),
            });

            // ── Course caches ─────────────────────────────────
            // Course list (enrollment count may have changed)
            queryClient.invalidateQueries({
                queryKey: courseKeys.lists(),
            });
            // Course detail (enrolled state changes UI)
            queryClient.invalidateQueries({
                queryKey: courseKeys.details(),
            });
            // Course progress (now trackable after enrollment)
            queryClient.invalidateQueries({
                queryKey: courseKeys.progress(enrollment.course_id),
            });

            // ── Home page cache ───────────────────────────────
            queryClient.invalidateQueries({
                queryKey: ['public-courses'],
            });

            // ── Video feature caches ──────────────────────────
            // Continue-learning widget on home/dashboard
            queryClient.invalidateQueries({
                queryKey: ['video', 'continue'],
            });
        },
        onError: (error) => {
            console.error('Enrollment failed:', getErrorMessage(error));
        },
    });
}

// ─────────────────────────────────────────────────────────────
// Course Completion Mutation
// ─────────────────────────────────────────────────────────────

/**
 * Report course completion.
 * Updates progress and completion status.
 */
export function useReportCourseCompletion() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, CourseCompletionPayload>({
        mutationFn: async (payload) => {
            await reportCourseCompletion(payload);
        },
        onSuccess: (_data, variables) => {
            // ── Course progress & enrollment caches ───────────
            // Progress for this course (CourseDetailPage sidebar)
            queryClient.invalidateQueries({
                queryKey: courseKeys.progress(variables.course_id),
            });
            // Enrollments list (My Courses completion status)
            queryClient.invalidateQueries({
                queryKey: courseKeys.enrollments(),
            });
            // Enrollment status for this course
            queryClient.invalidateQueries({
                queryKey: courseKeys.enrollmentStatus(variables.course_id),
            });

            // ── Course listing caches ─────────────────────────
            // Course lists (completion badges)
            queryClient.invalidateQueries({
                queryKey: courseKeys.lists(),
            });
            // Course detail (lesson completed badges)
            queryClient.invalidateQueries({
                queryKey: courseKeys.details(),
            });

            // ── Home page cache ───────────────────────────────
            queryClient.invalidateQueries({
                queryKey: ['public-courses'],
            });

            // ── Video feature caches ──────────────────────────
            // Continue-learning widget
            queryClient.invalidateQueries({
                queryKey: ['video', 'continue'],
            });
        },
        onError: (error) => {
            console.error('Completion report failed:', getErrorMessage(error));
        },
    });
}

// ─────────────────────────────────────────────────────────────
// Prefetch Utilities
// ─────────────────────────────────────────────────────────────

/**
 * Prefetch course detail to improve perceived performance.
 * Call on course card hover to load data before user clicks.
 */
export function usePrefetchCourseDetail() {
    const queryClient = useQueryClient();

    return (courseId: string) => {
        queryClient.prefetchQuery({
            queryKey: courseKeys.detail(courseId),
            queryFn: () => fetchCourseDetail(courseId),
            staleTime: 3 * 60 * 1000,
        });
    };
}

/**
 * Prefetch course progress data.
 * Useful for preloading when navigating to course.
 */
export function usePrefetchCourseProgress() {
    const queryClient = useQueryClient();

    return (courseId: string) => {
        queryClient.prefetchQuery({
            queryKey: courseKeys.progress(courseId),
            queryFn: () => fetchCourseProgress(courseId),
            staleTime: 1 * 60 * 1000,
        });
    };
}
