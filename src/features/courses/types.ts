// src/features/courses/types.ts
// ─────────────────────────────────────────────────────────────
// Centralized Type Definitions — Courses Subsystem
// All shared interfaces, enums, and type aliases live here.
// Mirrors the video feature pattern for consistency.
// ─────────────────────────────────────────────────────────────

// ── Course Types ──────────────────────────────────────────────

/** Core course information */
export interface Course {
    id: string;
    title: string;
    slug: string;
    description: string;
    price_egp: number;
    thumbnail_url: string | null;
    cover_image_url: string | null;
    is_published: boolean;
    module_count: number;
    lesson_count: number;
    created_at: string;
    updated_at: string;
}

/** Detailed course with nested content hierarchy */
export interface CourseDetail extends Course {
    modules: CourseModule[];
}

/** Module within a course */
export interface CourseModule {
    id: string;
    title: string;
    description: string;
    order_index: number;
    lesson_count: number;
    lessons: CourseLesson[];
}

/** Lesson within a module */
export interface CourseLesson {
    id: string;
    title: string;
    description: string;
    order_index: number;
    duration_seconds: number;
    duration_display: string;
    is_free_preview: boolean;
    has_video: boolean;
    secure_video_id: string | null;
    lesson_file_url: string | null;
    progress?: LessonProgress;
    is_completed?: boolean;
}

// ── Enrollment & Access Types ────────────────────────────────

/** User's enrollment in a course */
export interface Enrollment {
    id: string;
    course_id: string;
    course_title?: string;
    course_slug?: string;
    course_thumbnail_url?: string | null;
    progress_percent?: number;
    enrolled_at: string;
}

/** Access configuration for a course */
export interface CourseAccessConfig {
    isEnrolled: boolean;
    isStaff: boolean;
    isPaid: boolean;
}

// ── Progress Types ───────────────────────────────────────────

/** Progress of a single lesson */
export interface LessonProgress {
    lesson_id: string;
    last_watched_second: number;
    is_completed: boolean;
    completed_at: string | null;
}

/** Overall progress in a course */
export interface CourseProgress {
    course_id: string;
    total_lessons: number;
    completed_lessons: number;
    progress_percent: number;
    modules_progress: ModuleProgress[];
}

/** Progress for a single module */
export interface ModuleProgress {
    id: string;
    title: string;
    total_lessons: number;
    completed_lessons: number;
    progress_percent: number;
}

// ── API Request/Response Types ────────────────────────────────

/** Payload for creating/updating a course */
export interface CoursePayload {
    title: string;
    slug: string;
    description: string;
    price_egp: number;
    is_published: boolean;
    thumbnail?: File | null;
    cover_image?: File | null;
}

/** Enrollment request payload */
export interface EnrollmentPayload {
    course_id: string;
}

/** Completion report payload */
export interface CourseCompletionPayload {
    course_id: string;
}

/** API response wrapper for paginated results */
export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

/** Generic success response */
export interface ApiSuccessResponse {
    detail: string;
}

// ── Browser/UI State Types ────────────────────────────────────

/** Filtering options for course browser */
export interface CourseFilters {
    search: string;
    minPrice: number;
    maxPrice: number;
    isPublished: boolean | 'all';
    sortBy: 'newest' | 'popular' | 'price_asc' | 'price_desc';
}

/** Course card display props */
export interface CourseCardProps {
    course: Course;
    progress?: number;
    isEnrolled?: boolean;
    onSelect?: (courseId: string) => void;
}

/** Pagination state */
export interface PaginationState {
    page: number;
    pageSize: number;
    totalCount: number;
}
