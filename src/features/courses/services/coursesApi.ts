// src/features/courses/services/coursesApi.ts
// ─────────────────────────────────────────────────────────────
// API Service Layer — Courses Subsystem
// Pure HTTP request functions with Axios.
// No React hooks, no side effects — just API calls.
// ─────────────────────────────────────────────────────────────

import { AxiosError } from 'axios';
import api from '../../../services/api';
import type {
    Course,
    CourseDetail,
    Enrollment,
    CourseProgress,
    CoursePayload,
    EnrollmentPayload,
    CourseCompletionPayload,
    PaginatedResponse,
    ApiSuccessResponse,
} from '../types';

// ─────────────────────────────────────────────────────────────
// Public Endpoints — Student View
// ─────────────────────────────────────────────────────────────

/**
 * Fetch paginated list of published courses (public API).
 * GET /api/courses/
 *
 * @param page - Page number for pagination
 * @param search - Optional search query
 * @returns Paginated course list
 */
export const fetchCourses = async (
    page: number = 1,
    search: string = ''
): Promise<PaginatedResponse<Course>> => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    if (search.trim()) params.set('search', search.trim());

    const { data } = await api.get<PaginatedResponse<Course>>(
        `/courses/?${params.toString()}`
    );
    return data;
};

/**
 * Fetch single course details with nested modules & lessons.
 * GET /api/courses/<id>/
 *
 * @param courseId - Course UUID
 * @returns Course with full hierarchy
 */
export const fetchCourseDetail = async (courseId: string): Promise<CourseDetail> => {
    const { data } = await api.get<CourseDetail>(`/courses/${courseId}/`);
    return data;
};

/**
 * Fetch course by slug (human-readable URL).
 * GET /api/courses/by-slug/<slug>/
 *
 * @param slug - Course slug
 * @returns Course detail
 */
export const fetchCourseBySlug = async (slug: string): Promise<CourseDetail> => {
    const { data } = await api.get<CourseDetail>(`/courses/by-slug/${slug}/`);
    return data;
};

/**
 * Get user's progress in a specific course.
 * GET /api/courses/<id>/progress/
 *
 * @param courseId - Course UUID
 * @returns Course progress data
 */
export const fetchCourseProgress = async (courseId: string): Promise<CourseProgress> => {
    const { data } = await api.get<CourseProgress>(`/courses/${courseId}/progress/`);
    return data;
};

// ─────────────────────────────────────────────────────────────
// Enrollment Endpoints
// ─────────────────────────────────────────────────────────────

/**
 * Enroll current user in a course.
 * POST /api/enrollments/
 *
 * @param payload - Enrollment data
 * @returns Enrollment record
 */
export const enrollInCourse = async (payload: EnrollmentPayload): Promise<Enrollment> => {
    const { data } = await api.post<Enrollment>('/courses/enroll/', payload);
    return data;
};

export const fetchUserEnrollments = async (): Promise<Enrollment[]> => {
    const { data } = await api.get<Enrollment[]>('/courses/my-enrollments/');
    return data;
};

/**
 * Check if user is enrolled in a course.
 * GET /api/enrollments/<courseId>/status/
 *
 * @param courseId - Course UUID
 * @returns Enrollment status
 */
export const checkEnrollmentStatus = async (
    courseId: string
): Promise<{ is_enrolled: boolean; enrollment?: Enrollment }> => {
    try {
        const enrollments = await fetchUserEnrollments();
        const enrollment = enrollments.find(e => e.course_id === courseId);
        return {
            is_enrolled: !!enrollment,
            enrollment,
        };
    } catch {
        return { is_enrolled: false };
    }
};

// ─────────────────────────────────────────────────────────────
// Completion Endpoints
// ─────────────────────────────────────────────────────────────

/**
 * Report course completion.
 * POST /api/completions/
 *
 * @param payload - Completion data
 * @returns API success response
 */
export const reportCourseCompletion = async (
    payload: CourseCompletionPayload
): Promise<ApiSuccessResponse> => {
    const { data } = await api.post<ApiSuccessResponse>('/completions/', payload);
    return data;
};

// ─────────────────────────────────────────────────────────────
// Admin Endpoints — Course Management
// ─────────────────────────────────────────────────────────────

/**
 * Fetch paginated list of all courses (admin view includes unpublished).
 * GET /api/admin/courses/
 *
 * @param page - Page number
 * @param search - Optional search query
 * @returns Paginated course list
 */
export const fetchAdminCourses = async (
    page: number = 1,
    search: string = ''
): Promise<PaginatedResponse<Course>> => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    if (search.trim()) params.set('search', search.trim());

    const { data } = await api.get<PaginatedResponse<Course>>(
        `/admin/courses/?${params.toString()}`
    );
    return data;
};

/**
 * Create a new course.
 * POST /api/admin/courses/
 *
 * @param payload - Course data with optional files
 * @returns Created course
 */
export const createCourse = async (payload: CoursePayload): Promise<Course> => {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('slug', payload.slug);
    formData.append('description', payload.description);
    formData.append('price_egp', String(payload.price_egp));
    formData.append('is_published', String(payload.is_published));
    if (payload.thumbnail) formData.append('thumbnail', payload.thumbnail);
    if (payload.cover_image) formData.append('cover_image', payload.cover_image);

    const { data } = await api.post<Course>('/admin/courses/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

/**
 * Update an existing course.
 * PATCH /api/admin/courses/<id>/
 *
 * @param courseId - Course UUID
 * @param payload - Partial course data
 * @returns Updated course
 */
export const updateCourse = async (
    courseId: string,
    payload: Partial<CoursePayload>
): Promise<Course> => {
    const formData = new FormData();
    if (payload.title !== undefined) formData.append('title', payload.title);
    if (payload.slug !== undefined) formData.append('slug', payload.slug);
    if (payload.description !== undefined) formData.append('description', payload.description);
    if (payload.price_egp !== undefined) formData.append('price_egp', String(payload.price_egp));
    if (payload.is_published !== undefined) formData.append('is_published', String(payload.is_published));
    if (payload.thumbnail) formData.append('thumbnail', payload.thumbnail);
    if (payload.cover_image) formData.append('cover_image', payload.cover_image);

    const { data } = await api.patch<Course>(
        `/admin/courses/${courseId}/`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
};

/**
 * Delete a course and all its content.
 * DELETE /api/admin/courses/<id>/
 *
 * @param courseId - Course UUID
 * @returns API success response
 */
export const deleteCourse = async (courseId: string): Promise<ApiSuccessResponse> => {
    const { data } = await api.delete<ApiSuccessResponse>(`/admin/courses/${courseId}/`);
    return data;
};

// ─────────────────────────────────────────────────────────────
// Error Handling Helper
// ─────────────────────────────────────────────────────────────

/**
 * Extract meaningful error message from API response.
 * Used in error callbacks to display user-friendly messages.
 *
 * @param error - Axios error object
 * @returns Error message string
 */
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
        if (error.response?.data?.detail) {
            return error.response.data.detail;
        }
        if (error.response?.status === 404) {
            return 'Course not found';
        }
        if (error.response?.status === 403) {
            return 'You do not have access to this course';
        }
        if (error.response?.status === 429) {
            return 'Too many requests. Please try again later';
        }
    }
    return error instanceof Error ? error.message : 'An error occurred';
};
