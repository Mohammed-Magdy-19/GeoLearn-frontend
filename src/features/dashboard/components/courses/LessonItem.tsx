import React from "react";
import { useTranslation } from "react-i18next";
import type { AdminLesson } from "../../types/dashboardTypes";

interface LessonItemProps {
  lesson: AdminLesson;
  onEdit: (lesson: AdminLesson) => void;
  onDelete: (lessonId: string) => void;
  onDeleteVideo?: (secureVideoId: string) => void;
}

/**
 * Lesson item row in the course workspace.
 * Shows lesson info, video status, and CRUD actions.
 *
 * Video upload/replace is now handled inside the lesson form modal.
 * Only delete-video remains as a standalone action here.
 */
const LessonItem: React.FC<LessonItemProps> = ({
  lesson,
  onEdit,
  onDelete,
  onDeleteVideo,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between p-3 hover:bg-muted/20 transition-colors">
      <div className="flex items-center gap-3">
        {/* Video status indicator */}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            lesson.has_video
              ? "bg-brand-accent/10 text-brand-accent"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {lesson.has_video ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{lesson.title}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{lesson.duration_display}</span>
            {lesson.is_free_preview && <span className="text-brand-primary">{t('courses.freePreview')}</span>}
            {lesson.has_video && (
              <span className="text-brand-accent">● {t('dashboard.videoAttached')}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {/* Edit lesson (video upload/replace is inside the form) */}
        <button
          onClick={() => onEdit(lesson)}
          className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors"
          title={t('dashboard.editLesson')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>

        {/* Delete video (only if lesson has a video) */}
        {onDeleteVideo && lesson.has_video && lesson.secure_video_id && (
          <button
            onClick={() => onDeleteVideo(lesson.secure_video_id!)}
            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
            title={t('dashboard.deleteVideo')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/><line x1="7" x2="11" y1="10" y2="14"/><line x1="11" x2="7" y1="10" y2="14"/></svg>
          </button>
        )}

        {/* Delete lesson */}
        <button
          onClick={() => onDelete(lesson.id)}
          className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          title={t('dashboard.deleteLesson')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
  );
};

export default LessonItem;
