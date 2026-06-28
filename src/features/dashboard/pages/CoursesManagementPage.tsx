import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDashboardStore } from "../../../store/useDashboardStore";
import { useAdminCourses, useAdminCourseDetail } from "../hooks/useCoursesQuery";
import useCoursesHandlers from "../hooks/useCoursesHandlers";

import CoursesGridView from "../components/courses/CoursesGridView";
import CourseWorkspaceView from "../components/courses/CourseWorkspaceView";
import CourseFormModal from "../components/courses/CourseFormModal";
import ModuleFormModal from "../components/courses/ModuleFormModal";
import LessonFormModal from "../components/courses/LessonFormModal";

/**
 * Course content management page (SRP orchestrator).
 * Uses child subviews and custom hooks for presentation and business logic.
 *
 * Video upload is now handled inside the LessonFormModal — no separate
 * VideoUploadModal is needed.
 */
export const CoursesManagementPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const {
    courseSearch,
    setCourseSearch,
    coursesPage,
    setCoursesPage,
    selectedCourseId,
    setSelectedCourseId,
    selectedModuleId,
    setSelectedModuleId,
    isCourseFormOpen,
    setCourseFormOpen,
    isModuleFormOpen,
    setModuleFormOpen,
    isLessonFormOpen,
    setLessonFormOpen,
  } = useDashboardStore();

  useEffect(() => {
    const activeCourseId = courseId || null;
    if (activeCourseId !== selectedCourseId) {
      setSelectedCourseId(activeCourseId);
    }
  }, [courseId, selectedCourseId, setSelectedCourseId]);

  const { data: coursesData, isLoading: coursesLoading } = useAdminCourses(
    coursesPage,
    courseSearch
  );

  const { data: courseDetail } = useAdminCourseDetail(
    selectedCourseId ?? ""
  );

  const {
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
    isMutating,
  } = useCoursesHandlers();

  return (
    <div className="space-y-6">
      {courseId ? (
        <CourseWorkspaceView
          courseDetail={courseDetail}
          onEditCourse={(c) => {
            setEditingCourse(c);
            setCourseFormOpen(true);
          }}
          onAddModuleClick={() => {
            setModuleFormOpen(true);
          }}
          onAddLesson={(modId) => {
            setSelectedModuleId(modId);
            setLessonFormOpen(true);
          }}
          onEditModule={(mod) => {
            setEditingModule(mod);
            setModuleFormOpen(true);
          }}
          onDeleteModule={handleDeleteModule}
          onEditLesson={(les) => {
            setEditingLesson(les);
            setLessonFormOpen(true);
          }}
          onDeleteLesson={handleDeleteLesson}
          onDeleteVideo={handleDeleteVideo}
          onBackToList={() => navigate("/dashboard/courses")}
        />
      ) : (
        <CoursesGridView
          coursesData={coursesData}
          coursesLoading={coursesLoading}
          courseSearch={courseSearch}
          onSearchChange={setCourseSearch}
          coursesPage={coursesPage}
          onPageChange={setCoursesPage}
          onEditCourse={(c) => {
            setEditingCourse(c);
            setCourseFormOpen(true);
          }}
          onDeleteCourse={handleDeleteCourse}
          onCreateCourseClick={() => {
            setEditingCourse(null);
            setCourseFormOpen(true);
          }}
          onSelectCourse={(id) => navigate(`/dashboard/courses/${id}`)}
        />
      )}

      {/* Course Form Modal */}
      <CourseFormModal
        isOpen={isCourseFormOpen}
        onClose={() => {
          setCourseFormOpen(false);
          setEditingCourse(null);
        }}
        onSubmit={handleCreateCourse}
        initialData={editingCourse}
        isSubmitting={isMutating}
      />

      {/* Module Form Modal */}
      <ModuleFormModal
        isOpen={isModuleFormOpen}
        courseId={selectedCourseId ?? ""}
        onClose={() => {
          setModuleFormOpen(false);
          setEditingModule(null);
        }}
        onSubmit={handleSaveModule}
        initialData={editingModule}
        isSubmitting={isMutating}
      />

      {/* Lesson Form Modal (includes video upload + auto-duration sync) */}
      <LessonFormModal
        isOpen={isLessonFormOpen}
        moduleId={selectedModuleId ?? editingLesson?.module ?? ""}
        onClose={() => {
          setLessonFormOpen(false);
          setSelectedModuleId(null);
          setEditingLesson(null);
        }}
        onSubmit={handleSaveLesson}
        initialData={editingLesson}
        isSubmitting={isMutating}
      />
    </div>
  );
};

export default CoursesManagementPage;
