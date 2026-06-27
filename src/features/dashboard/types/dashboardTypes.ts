/**
 * src/features/dashboard/types/dashboardTypes.ts
 *
 * TypeScript interfaces and types for the admin dashboard.
 * Includes user management, course content, KPI stats, and API payloads.
 */

// ─────────────────────────────────────────────────────────────
// User & Role Management
// ─────────────────────────────────────────────────────────────

/** Supported user roles in the platform */
export type UserRole = "student" | "instructor" | "admin";

/** Platform user as returned by the admin users API */
export interface PlatformUser {
  id: string;
  phone_number: string;
  full_name: string;
  username: string;
  email?: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
  /** Computed role for UI display */
  role: UserRole;
}

/** Payload for updating a user's role */
export interface UpdateRolePayload {
  is_staff: boolean;
  is_superuser: boolean;
}

/** User filters for the management table */
export interface UserFilters {
  search: string;
  role: UserRole | "all";
  isActive: boolean | "all";
}

// ─────────────────────────────────────────────────────────────
// KPI & Analytics
// ─────────────────────────────────────────────────────────────

/** Dashboard KPI statistics returned by /api/admin/stats/ */
export interface DashboardStats {
  /** Total registered users */
  totalUsers: number;
  /** New users this month */
  newUsersThisMonth: number;
  /** Total published courses */
  totalCourses: number;
  /** Total lessons across all courses */
  totalLessons: number;
  /** Total video sessions (active + expired) */
  totalVideoSessions: number;
  /** Currently active video sessions */
  activeSessions: number;
  /** Lessons completed across all users */
  totalCompletions: number;
  /** Average course progress percentage */
  avgProgressPercent: number;
  /** Revenue in EGP (if payments enabled) */
  totalRevenueEgp: number;
}

/** Chart data point for time-series charts */
export interface ChartDataPoint {
  label: string;
  value: number;
}

/** Enrollment trend data for the analytics chart */
export interface EnrollmentTrend {
  month: string;
  enrollments: number;
  completions: number;
}

/** Course popularity ranking */
export interface CoursePopularity {
  courseId: string;
  courseTitle: string;
  enrolledCount: number;
  avgProgress: number;
}

// ─────────────────────────────────────────────────────────────
// Course Content Management
// ─────────────────────────────────────────────────────────────

/** Course creation/update payload */
export interface CoursePayload {
  title: string;
  slug: string;
  description: string;
  price_egp: number;
  is_published: boolean;
  thumbnail?: File | null;
  cover_image?: File | null;
}

/** Module creation payload */
export interface ModulePayload {
  course: string; // course UUID
  title: string;
  description: string;
  order_index: number;
}

/** Lesson creation payload */
export interface LessonPayload {
  module: string; // module UUID
  title: string;
  description: string;
  order_index: number;
  duration_seconds: number;
  is_free_preview: boolean;
  /** Secure video file to upload */
  video_file?: File | null;
  /** Supplemental materials file (e.g. PDF) */
  lesson_file?: File | null;
}

/** Admin course list item (extended from CourseListSerializer) */
export interface AdminCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  price_egp: number;
  is_published: boolean;
  module_count: number;
  lesson_count: number;
  created_at: string;
  updated_at: string;
}

/** Admin module with nested lessons */
export interface AdminModule {
  id: string;
  course: string;
  title: string;
  description: string;
  order_index: number;
  lesson_count: number;
  lessons: AdminLesson[];
  created_at: string;
}

/** Admin lesson with video info */
export interface AdminLesson {
  id: string;
  module: string;
  title: string;
  description: string;
  order_index: number;
  duration_seconds: number;
  duration_display: string;
  is_free_preview: boolean;
  has_video: boolean;
  secure_video_id: string | null;
  lesson_file_url?: string | null;
  created_at: string;
}

/** Course detail with full hierarchy for admin editing */
export interface AdminCourseDetail extends AdminCourse {
  modules: AdminModule[];
}

// ─────────────────────────────────────────────────────────────
// API Response Wrappers
// ─────────────────────────────────────────────────────────────

/** Paginated API response wrapper */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Generic API success response */
export interface ApiSuccessResponse {
  detail: string;
}

/** API error response shape */
export interface ApiErrorResponse {
  detail?: string;
  [field: string]: string[] | string | undefined;
}

// ─────────────────────────────────────────────────────────────
// UI State
// ─────────────────────────────────────────────────────────────

/** Sort configuration for data tables */
export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

/** Pagination state for client-side pagination */
export interface PaginationState {
  page: number;
  pageSize: number;
}

/** Confirm dialog state */
export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: (() => void) | null;
  variant: "danger" | "warning" | "info";
}
