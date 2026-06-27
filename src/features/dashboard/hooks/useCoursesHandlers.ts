import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDashboardStore } from "../../../store/useDashboardStore";
import {
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
  useDeleteVideo,
} from "./useCourseMutations";
import { useAdminCourseDetail } from "./useCoursesQuery";
import type {
  AdminCourse,
  AdminModule,
  AdminLesson,
  CoursePayload,
  ModulePayload,
  LessonPayload,
} from "../types/dashboardTypes";

/**
 * Encapsulates CRUD handlers and modal editing state for courses management (SRP, DIP).
 * Calls mutations internally and accesses store/query layers.
 *
 * Video upload is now handled inside the lesson form (create/update), so
 * there is no separate handleUploadVideo or VideoUploadModal state here.
 */
export const useCoursesHandlers = () => {
  const { t } = useTranslation();
  const {
    selectedCourseId,
    setSelectedModuleId,
    setCourseFormOpen,
    setModuleFormOpen,
    setLessonFormOpen,
    openConfirmDialog,
  } = useDashboardStore();

  const { data: courseDetail } = useAdminCourseDetail(selectedCourseId ?? "");

  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const createModule = useCreateModule();
  const updateModule = useUpdateModule();
  const deleteModule = useDeleteModule();
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();
  const deleteVideoMutation = useDeleteVideo();

  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);
  const [editingModule, setEditingModule] = useState<AdminModule | null>(null);
  const [editingLesson, setEditingLesson] = useState<AdminLesson | null>(null);

  const handleCreateCourse = useCallback((payload: CoursePayload) => {
    if (editingCourse) {
      updateCourse.mutate({ courseId: editingCourse.id, payload }, {
        onSuccess: () => {
          setEditingCourse(null);
          setCourseFormOpen(false);
        }
      });
    } else {
      createCourse.mutate(payload, {
        onSuccess: () => {
          setEditingCourse(null);
          setCourseFormOpen(false);
        }
      });
    }
  }, [editingCourse, createCourse, updateCourse, setCourseFormOpen]);

  const handleSaveModule = useCallback((payload: ModulePayload) => {
    if (editingModule) {
      updateModule.mutate({ moduleId: editingModule.id, payload }, {
        onSuccess: () => {
          setEditingModule(null);
          setModuleFormOpen(false);
        }
      });
    } else {
      const existingOrderIndices = courseDetail?.modules?.map((m) => m.order_index) ?? [];
      const maxOrder = existingOrderIndices.length > 0 ? Math.max(...existingOrderIndices) : -1;
      createModule.mutate({ ...payload, order_index: maxOrder + 1 }, {
        onSuccess: () => {
          setEditingModule(null);
          setModuleFormOpen(false);
        }
      });
    }
  }, [editingModule, createModule, updateModule, courseDetail, setModuleFormOpen]);

  const handleSaveLesson = useCallback((payload: LessonPayload) => {
    if (editingLesson) {
      updateLesson.mutate({ lessonId: editingLesson.id, payload }, {
        onSuccess: () => {
          setEditingLesson(null);
          setLessonFormOpen(false);
          setSelectedModuleId(null);
        }
      });
    } else {
      const targetModuleId = payload.module;
      const targetModule = courseDetail?.modules?.find((m) => m.id === targetModuleId);
      const existingOrderIndices = targetModule?.lessons?.map((l) => l.order_index) ?? [];
      const maxOrder = existingOrderIndices.length > 0 ? Math.max(...existingOrderIndices) : -1;
      createLesson.mutate({ ...payload, order_index: maxOrder + 1 }, {
        onSuccess: () => {
          setEditingLesson(null);
          setLessonFormOpen(false);
          setSelectedModuleId(null);
        }
      });
    }
  }, [editingLesson, createLesson, updateLesson, courseDetail, setLessonFormOpen, setSelectedModuleId]);

  const handleDeleteCourse = useCallback((course: AdminCourse) => {
    openConfirmDialog(
      t('dashboard.deleteCourseTitle'),
      t('dashboard.deleteCourseMsg', { title: course.title }),
      () => deleteCourse.mutate(course.id),
      "danger"
    );
  }, [openConfirmDialog, deleteCourse]);

  const handleDeleteModule = useCallback((moduleId: string) => {
    openConfirmDialog(
      t('dashboard.deleteModuleTitle'),
      t('dashboard.deleteModuleMsg'),
      () => deleteModule.mutate(moduleId),
      "danger"
    );
  }, [openConfirmDialog, deleteModule]);

  const handleDeleteLesson = useCallback((lessonId: string) => {
    openConfirmDialog(
      t('dashboard.deleteLessonTitle'),
      t('dashboard.deleteLessonMsg'),
      () => deleteLesson.mutate(lessonId),
      "danger"
    );
  }, [openConfirmDialog, deleteLesson]);

  const handleDeleteVideo = useCallback((secureVideoId: string) => {
    openConfirmDialog(
      t('dashboard.deleteVideoTitle'),
      t('dashboard.deleteVideoMsg'),
      () => deleteVideoMutation.mutate(secureVideoId),
      "danger"
    );
  }, [openConfirmDialog, deleteVideoMutation]);

  return {
    editingCourse,
    setEditingCourse,
    editingModule,
    setEditingModule,
    editingLesson,
    setEditingLesson,
    handleCreateCourse,
    handleSaveModule,
    handleSaveLesson,
    handleDeleteCourse,
    handleDeleteModule,
    handleDeleteLesson,
    handleDeleteVideo,
    isMutating:
      createCourse.isPending ||
      updateCourse.isPending ||
      deleteCourse.isPending ||
      createModule.isPending ||
      updateModule.isPending ||
      deleteModule.isPending ||
      createLesson.isPending ||
      updateLesson.isPending ||
      deleteLesson.isPending ||
      deleteVideoMutation.isPending,
  };
};

export default useCoursesHandlers;
