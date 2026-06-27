// src/features/courses/index.ts
// ─────────────────────────────────────────────────────────────
// Barrel Export — Courses Subsystem Public API
// Clean entry point for consuming the courses feature.
// ─────────────────────────────────────────────────────────────

// ── Components ────────────────────────────────────────────────
export { CourseCard } from './components/CourseCard';
export { CourseListItem } from './components/CourseListItem';
export { CourseDetailCard } from './components/CourseDetailCard';
export { CourseStatsGrid } from './components/CourseStatsGrid';
export { CourseModuleAccordion } from './components/CourseModuleAccordion';
export { CourseInfoSidebar } from './components/CourseInfoSidebar';
export { EnrolledCourseCard } from './components/EnrolledCourseCard';
export { CourseProgressBar, ModuleProgressItem, ProgressSummary } from './components/CourseProgressBar';
export { CoursesGrid } from './components/CoursesGrid';
export { FilterButtons } from './components/FilterButtons';
export { CoursePagination, CoursePagination as Pagination } from './components/CoursePagination';
export { SearchBox } from './components/SearchBox';
export { CourseCardSkeleton, CoursesGridSkeleton, CourseDetailSkeleton } from './components/CoursesSkeleton';

// ── Hooks ─────────────────────────────────────────────────────
export {
    useCourseList,
    useCourseDetail,
    useCourseBySlug,
    useCourseProgress,
    useUserEnrollments,
    useEnrollmentStatus,
    useEnrollCourse,
    useReportCourseCompletion,
    usePrefetchCourseDetail,
    usePrefetchCourseProgress,
    courseKeys,
} from './hooks/useCourseData';

export {
    useCourseProgress as useCourseProgressCalcs,
    formatDuration,
    calculateTotalDuration,
    isInProgress,
    isCompleted,
    isNotStarted,
} from './hooks/useCourseProgress';

export {
    useCourseBrowser,
    useFilterQueryString,
} from './hooks/useCourseBrowser';

// ── Services ──────────────────────────────────────────────────
export {
    fetchCourses,
    fetchCourseDetail,
    fetchCourseBySlug,
    fetchCourseProgress,
    enrollInCourse,
    fetchUserEnrollments,
    checkEnrollmentStatus,
    reportCourseCompletion,
    fetchAdminCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getErrorMessage,
} from './services/coursesApi';

// ── Types ─────────────────────────────────────────────────────
export type {
    Course,
    CourseDetail,
    CourseModule,
    CourseLesson,
    Enrollment,
    CourseAccessConfig,
    LessonProgress,
    CourseProgress,
    ModuleProgress,
    CoursePayload,
    EnrollmentPayload,
    CourseCompletionPayload,
    PaginatedResponse,
    ApiSuccessResponse,
    CourseFilters,
    CourseCardProps,
    PaginationState,
} from './types';
