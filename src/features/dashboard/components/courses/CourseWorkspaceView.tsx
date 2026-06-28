import React from "react";
import { ArrowRight, Pencil, Plus, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AdminCourse, AdminCourseDetail, AdminModule, AdminLesson } from "../../types/dashboardTypes";
import ModuleItem from "./ModuleItem";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CourseWorkspaceSkeleton } from "@/components/ui/Skeletons";

interface CourseWorkspaceViewProps {
  courseDetail: AdminCourseDetail | undefined;
  onEditCourse: (course: AdminCourse) => void;
  onAddModuleClick: () => void;
  onAddLesson: (moduleId: string) => void;
  onEditModule: (module: AdminModule) => void;
  onDeleteModule: (moduleId: string) => void;
  onEditLesson: (lesson: AdminLesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  onDeleteVideo?: (secureVideoId: string) => void;
  onBackToList: () => void;
}

/**
 * Presentational workspace view for a single course details, modules, and lessons (SRP).
 */
export const CourseWorkspaceView: React.FC<CourseWorkspaceViewProps> = ({
  courseDetail,
  onEditCourse,
  onAddModuleClick,
  onAddLesson,
  onEditModule,
  onDeleteModule,
  onEditLesson,
  onDeleteLesson,
  onDeleteVideo,
  onBackToList,
}) => {
  const { t } = useTranslation();

  if (!courseDetail) {
    return <CourseWorkspaceSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Course Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={onBackToList}
            title={t('dashboard.backToCourseList')}
          >
            <ArrowRight className="size-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground font-display">
                {courseDetail.title}
              </h1>
              <Badge
                variant={courseDetail.is_published ? "default" : "secondary"}
                className={
                  courseDetail.is_published
                    ? "bg-brand-accent/10 text-brand-accent border-brand-accent/20"
                    : ""
                }
              >
                {courseDetail.is_published ? t('courses.published') : t('courses.draft')}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {t('dashboard.courseWorkspaceDesc')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => onEditCourse(courseDetail)}
            className="gap-2"
          >
            <Pencil className="size-4" />
            {t('dashboard.editCourse')}
          </Button>
          <Button
            onClick={onAddModuleClick}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium shadow-brand gap-2"
          >
            <Plus className="size-4" />
            {t('dashboard.addModule')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left 1/3 Column: Course Details */}
          <div className="lg:col-span-1 rounded-xl border border-border bg-card shadow-card p-6 space-y-5">
            <div className="aspect-video rounded-lg bg-muted overflow-hidden relative border border-border">
              {courseDetail.thumbnail_url ? (
                <img
                  src={courseDetail.thumbnail_url}
                  alt={courseDetail.title}
                  loading="eager"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <BookOpen className="size-12" strokeWidth={1.5} />
                </div>
              )}
            </div>

            <div>
              <h3 className="font-bold text-foreground mb-1.5 text-sm">{t('dashboard.courseDescription')}</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {courseDetail.description || t('dashboard.noDescriptionYet')}
              </p>
            </div>

            <div className="divide-y divide-border pt-2">
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-muted-foreground">{t('dashboard.courseSlug')}</span>
                <span className="text-sm font-mono text-foreground">{courseDetail.slug}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-muted-foreground">{t('dashboard.currentPrice')}</span>
                <span className="text-sm font-bold text-brand-primary">
                  {courseDetail.price_egp === 0
                    ? t('common.free')
                    : `${courseDetail.price_egp.toLocaleString()} ${t('common.egp')}`}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-muted-foreground">{t('dashboard.moduleCount')}</span>
                <span className="text-sm font-semibold text-foreground">
                  {courseDetail.modules?.length ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-muted-foreground">{t('dashboard.totalLessons')}</span>
                <span className="text-sm font-semibold text-foreground">
                  {courseDetail.modules?.reduce(
                    (acc, m) => acc + (m.lessons?.length ?? 0),
                    0
                  ) ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Right 2/3 Column: Chapters/Modules & Lessons */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h3 className="text-lg font-bold text-foreground font-display mb-4">
                {t('dashboard.courseContentModules')}
              </h3>

              <div className="space-y-4">
                {courseDetail.modules && courseDetail.modules.length > 0 ? (
                  courseDetail.modules.map((module) => (
                    <ModuleItem
                      key={module.id}
                      module={module}
                      onAddLesson={onAddLesson}
                      onEditModule={onEditModule}
                      onDeleteModule={onDeleteModule}
                      onEditLesson={onEditLesson}
                      onDeleteLesson={onDeleteLesson}
                      onDeleteVideo={onDeleteVideo}
                    />
                  ))
                ) : (
                  <div className="text-center py-16 border-2 border-dashed border-border rounded-xl text-muted-foreground">
                    <BookOpen className="mx-auto size-9 mb-2 opacity-50" strokeWidth={1.5} />
                    {t('dashboard.noModulesYet')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default CourseWorkspaceView;
