/**
 * src/features/dashboard/hooks/useCourseMutations.ts
 *
 * TanStack Query mutation hooks for course content management.
 * Handles CRUD for courses, modules, and lessons with proper cache invalidation.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
  deleteVideo,
} from "../api/coursesApi";
import { dashboardKeys } from "./useDashboardQueries";
import type {
  CoursePayload,
  ModulePayload,
  LessonPayload,
} from "../types/dashboardTypes";

// Query key prefixes — dashboard
const coursesListKey = ["dashboard", "courses"] as const;
const modulesListKey = ["dashboard", "modules"] as const;
const lessonsListKey = ["dashboard", "lessons"] as const;

// Query key prefixes — public-facing pages
// These must be invalidated alongside dashboard keys so that
// navigating to other pages reflects admin changes instantly.
const publicCourseKeys = {
  all: ["courses"] as const,       // courses feature (useCourseData)
  publicList: ["public-courses"] as const, // home page CoursesSection
  watchPage: ["course"] as const,  // watch page useWatchPage
  lesson: ["lesson"] as const,     // watch page lesson detail
};

/**
 * Invalidate every public-facing course cache + notification caches.
 * Called after any dashboard mutation that changes course/module/lesson data.
 * Also refreshes the notification bell since backend creates system notifications.
 */
const invalidatePublicCaches = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: publicCourseKeys.all });
  queryClient.invalidateQueries({ queryKey: publicCourseKeys.publicList });
  queryClient.invalidateQueries({ queryKey: publicCourseKeys.watchPage });
  queryClient.invalidateQueries({ queryKey: publicCourseKeys.lesson });
  // Refresh notification bell — backend auto-creates system notifications on CRUD
  queryClient.invalidateQueries({ queryKey: ["notifications"] });
};

// ─────────────────────────────────────────────────────────────
// Course Mutations
// ─────────────────────────────────────────────────────────────

/**
 * Create a new course.
 */
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CoursePayload) => createCourse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coursesListKey });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
      invalidatePublicCaches(queryClient);
      toast.success(i18n.t("toasts.courseCreated"));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t("toasts.courseCreateFailed"));
    },
  });
};

/**
 * Update an existing course.
 */
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      payload,
    }: {
      courseId: string;
      payload: Partial<CoursePayload>;
    }) => updateCourse(courseId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: coursesListKey });
      queryClient.invalidateQueries({
        queryKey: [...coursesListKey, variables.courseId],
      });
      invalidatePublicCaches(queryClient);
      toast.success(i18n.t("toasts.courseUpdated"));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t("toasts.courseUpdateFailed"));
    },
  });
};

/**
 * Delete a course.
 */
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coursesListKey });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
      invalidatePublicCaches(queryClient);
      toast.success(i18n.t("toasts.courseDeleted"));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t("toasts.courseDeleteFailed"));
    },
  });
};

// ─────────────────────────────────────────────────────────────
// Module Mutations
// ─────────────────────────────────────────────────────────────

/**
 * Create a new module.
 */
export const useCreateModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ModulePayload) => createModule(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: modulesListKey });
      queryClient.invalidateQueries({
        queryKey: [...coursesListKey, variables.course],
      });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
      invalidatePublicCaches(queryClient);
      toast.success(i18n.t("toasts.moduleCreated"));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t("toasts.moduleCreateFailed"));
    },
  });
};

/**
 * Update a module.
 */
export const useUpdateModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      moduleId,
      payload,
    }: {
      moduleId: string;
      payload: Partial<ModulePayload>;
    }) => updateModule(moduleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modulesListKey });
      queryClient.invalidateQueries({ queryKey: coursesListKey });
      invalidatePublicCaches(queryClient);
      toast.success(i18n.t("toasts.moduleUpdated"));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t("toasts.moduleUpdateFailed"));
    },
  });
};

/**
 * Delete a module.
 */
export const useDeleteModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) => deleteModule(moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modulesListKey });
      queryClient.invalidateQueries({ queryKey: coursesListKey });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
      invalidatePublicCaches(queryClient);
      toast.success(i18n.t("toasts.moduleDeleted"));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t("toasts.moduleDeleteFailed"));
    },
  });
};

// ─────────────────────────────────────────────────────────────
// Lesson Mutations
// ─────────────────────────────────────────────────────────────

/**
 * Create a new lesson.
 */
export const useCreateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LessonPayload) => createLesson(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonsListKey });
      queryClient.invalidateQueries({ queryKey: modulesListKey });
      queryClient.invalidateQueries({ queryKey: coursesListKey });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
      invalidatePublicCaches(queryClient);
      toast.success(i18n.t("toasts.lessonCreated"));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t("toasts.lessonCreateFailed"));
    },
  });
};

/**
 * Update a lesson.
 */
export const useUpdateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      payload,
    }: {
      lessonId: string;
      payload: Partial<LessonPayload>;
    }) => updateLesson(lessonId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonsListKey });
      queryClient.invalidateQueries({ queryKey: modulesListKey });
      queryClient.invalidateQueries({ queryKey: coursesListKey });
      invalidatePublicCaches(queryClient);
      toast.success(i18n.t("toasts.lessonUpdated"));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t("toasts.lessonUpdateFailed"));
    },
  });
};

/**
 * Delete a lesson.
 */
export const useDeleteLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => deleteLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonsListKey });
      queryClient.invalidateQueries({ queryKey: modulesListKey });
      queryClient.invalidateQueries({ queryKey: coursesListKey });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
      invalidatePublicCaches(queryClient);
      toast.success(i18n.t("toasts.lessonDeleted"));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t("toasts.lessonDeleteFailed"));
    },
  });
};

// ─────────────────────────────────────────────────────────────
// Video Management
// ─────────────────────────────────────────────────────────────

/**
 * Delete a secure video from a lesson.
 */
export const useDeleteVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (secureVideoId: string) => deleteVideo(secureVideoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonsListKey });
      queryClient.invalidateQueries({ queryKey: coursesListKey });
      invalidatePublicCaches(queryClient);
      toast.success(i18n.t("toasts.videoDeleted"));
    },
    onError: (error: Error) => {
      toast.error(error.message || i18n.t("toasts.videoDeleteFailed"));
    },
  });
};
