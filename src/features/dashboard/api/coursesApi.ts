/**
 * src/features/dashboard/api/coursesApi.ts
 *
 * Axios-based API service for course content management.
 * Handles courses, modules, and lessons with multipart support for video uploads.
 */

import api from "../../../services/api";
import type {
  AdminCourse,
  AdminCourseDetail,
  AdminModule,
  AdminLesson,
  CoursePayload,
  ModulePayload,
  LessonPayload,
  PaginatedResponse,
  ApiSuccessResponse,
} from "../types/dashboardTypes";

// ─────────────────────────────────────────────────────────────
// Courses
// ─────────────────────────────────────────────────────────────

/**
 * Fetch paginated list of all courses (admin view includes unpublished).
 * GET /api/admin/courses/
 */
export const fetchAdminCourses = async (
  page: number = 1,
  search: string = ""
): Promise<PaginatedResponse<AdminCourse>> => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (search.trim()) params.set("search", search.trim());

  const { data } = await api.get<PaginatedResponse<AdminCourse>>(
    `/admin/courses/?${params.toString()}`
  );
  return data;
};

/**
 * Fetch single course detail with nested modules & lessons.
 * GET /api/admin/courses/<id>/
 */
export const fetchAdminCourseDetail = async (
  courseId: string
): Promise<AdminCourseDetail> => {
  const { data } = await api.get<AdminCourseDetail>(`/admin/courses/${courseId}/`);
  return data;
};

/**
 * Create a new course.
 * POST /api/admin/courses/
 */
export const createCourse = async (payload: CoursePayload): Promise<AdminCourse> => {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("slug", payload.slug);
  formData.append("description", payload.description);
  formData.append("price_egp", String(payload.price_egp));
  formData.append("is_published", String(payload.is_published));
  if (payload.thumbnail) formData.append("thumbnail", payload.thumbnail);
  if (payload.cover_image) formData.append("cover_image", payload.cover_image);

  const { data } = await api.post<AdminCourse>("/admin/courses/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

/**
 * Update an existing course.
 * PATCH /api/admin/courses/<id>/
 */
export const updateCourse = async (
  courseId: string,
  payload: Partial<CoursePayload>
): Promise<AdminCourse> => {
  const formData = new FormData();
  if (payload.title !== undefined) formData.append("title", payload.title);
  if (payload.slug !== undefined) formData.append("slug", payload.slug);
  if (payload.description !== undefined) formData.append("description", payload.description);
  if (payload.price_egp !== undefined) formData.append("price_egp", String(payload.price_egp));
  if (payload.is_published !== undefined) formData.append("is_published", String(payload.is_published));
  if (payload.thumbnail) formData.append("thumbnail", payload.thumbnail);
  if (payload.cover_image) formData.append("cover_image", payload.cover_image);

  const { data } = await api.patch<AdminCourse>(
    `/admin/courses/${courseId}/`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
};

/**
 * Delete a course and all its content.
 * DELETE /api/admin/courses/<id>/
 */
export const deleteCourse = async (courseId: string): Promise<ApiSuccessResponse> => {
  const { data } = await api.delete<ApiSuccessResponse>(`/admin/courses/${courseId}/`);
  return data;
};

// ─────────────────────────────────────────────────────────────
// Modules
// ─────────────────────────────────────────────────────────────

/**
 * Create a new module within a course.
 * POST /api/admin/modules/
 */
export const createModule = async (payload: ModulePayload): Promise<AdminModule> => {
  const { data } = await api.post<AdminModule>("/admin/modules/", payload);
  return data;
};

/**
 * Update a module.
 * PATCH /api/admin/modules/<id>/
 */
export const updateModule = async (
  moduleId: string,
  payload: Partial<ModulePayload>
): Promise<AdminModule> => {
  const { data } = await api.patch<AdminModule>(`/admin/modules/${moduleId}/`, payload);
  return data;
};

/**
 * Delete a module and all its lessons.
 * DELETE /api/admin/modules/<id>/
 */
export const deleteModule = async (moduleId: string): Promise<ApiSuccessResponse> => {
  const { data } = await api.delete<ApiSuccessResponse>(`/admin/modules/${moduleId}/`);
  return data;
};

// ─────────────────────────────────────────────────────────────
// Lessons
// ─────────────────────────────────────────────────────────────

/**
 * Create a new lesson within a module.
 * POST /api/admin/lessons/
 */
export const createLesson = async (payload: LessonPayload): Promise<AdminLesson> => {
  const formData = new FormData();
  formData.append("module", payload.module);
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("order_index", String(payload.order_index));
  formData.append("duration_seconds", String(payload.duration_seconds));
  formData.append("is_free_preview", String(payload.is_free_preview));
  if (payload.video_file) formData.append("video_file", payload.video_file);
  if (payload.lesson_file) formData.append("lesson_file", payload.lesson_file);

  const { data } = await api.post<AdminLesson>("/admin/lessons/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

/**
 * Update a lesson.
 * PATCH /api/admin/lessons/<id>/
 */
export const updateLesson = async (
  lessonId: string,
  payload: Partial<LessonPayload>
): Promise<AdminLesson> => {
  const formData = new FormData();
  if (payload.module !== undefined) formData.append("module", payload.module);
  if (payload.title !== undefined) formData.append("title", payload.title);
  if (payload.description !== undefined) formData.append("description", payload.description);
  if (payload.order_index !== undefined) formData.append("order_index", String(payload.order_index));
  if (payload.duration_seconds !== undefined)
    formData.append("duration_seconds", String(payload.duration_seconds));
  if (payload.is_free_preview !== undefined)
    formData.append("is_free_preview", String(payload.is_free_preview));
  if (payload.video_file) formData.append("video_file", payload.video_file);
  if (payload.lesson_file) formData.append("lesson_file", payload.lesson_file);

  const { data } = await api.patch<AdminLesson>(
    `/admin/lessons/${lessonId}/`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
};

/**
 * Delete a lesson.
 * DELETE /api/admin/lessons/<id>/
 */
export const deleteLesson = async (lessonId: string): Promise<ApiSuccessResponse> => {
  const { data } = await api.delete<ApiSuccessResponse>(`/admin/lessons/${lessonId}/`);
  return data;
};

/**
 * Upload a secure video file for a lesson.
 * POST /api/admin/videos/upload/
 */
export const uploadVideo = async (
  lessonId: string,
  videoFile: File,
  onProgress?: (percent: number) => void
): Promise<{ secure_video_id: string; duration_seconds: number }> => {
  const formData = new FormData();
  formData.append("lesson_id", lessonId);
  formData.append("video_file", videoFile);

  const { data } = await api.post<{
    secure_video_id: string;
    duration_seconds: number;
  }>("/admin/videos/upload/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
      }
    },
  });
  return data;
};

/**
 * Delete a secure video from a lesson.
 * DELETE /api/admin/videos/<secure_video_id>/
 */
export const deleteVideo = async (
  secureVideoId: string
): Promise<ApiSuccessResponse> => {
  const { data } = await api.delete<ApiSuccessResponse>(
    `/admin/videos/${secureVideoId}/`
  );
  return data;
};
