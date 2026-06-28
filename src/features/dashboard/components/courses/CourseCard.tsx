import React from "react";
import { useTranslation } from "react-i18next";
import type { AdminCourse } from "../../types/dashboardTypes";

const CourseCard: React.FC<{
  course: AdminCourse;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (course: AdminCourse) => void;
  onDelete: (course: AdminCourse) => void;
}> = ({ course, isSelected, onSelect, onEdit, onDelete }) => {
  const { t } = useTranslation();
  return (
    <div
      onClick={onSelect}
      className={`
        group relative p-4 rounded-xl border cursor-pointer transition-all duration-200
        ${isSelected
          ? "border-brand-primary bg-brand-primary/5 shadow-brand"
          : "border-border bg-card hover:border-muted-foreground/25 hover:shadow-card"
        }
      `}
    >
      <div className="aspect-video rounded-lg bg-muted overflow-hidden mb-3 relative">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} loading="eager" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          </div>
        )}
        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium ${course.is_published ? "bg-brand-accent/90 text-white" : "bg-muted-foreground/70 text-white"}`}>
          {course.is_published ? t("courses.published") : t("courses.draft")}
        </span>
      </div>

      <h3 className="font-bold text-foreground text-sm mb-1 line-clamp-1">{course.title}</h3>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{course.description || t("dashboard.noDescription")}</p>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{course.module_count} {t('courses.modules')}</span>
        <span>{t('common.lessons_other', { count: course.lesson_count })}</span>
        <span className="text-brand-primary font-medium">{course.price_egp === 0 ? t('common.free') : `${course.price_egp.toLocaleString()} ${t('common.egp')}`}</span>
      </div>

      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); onEdit(course); }} className="flex-1 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-md transition-colors">{t('common.edit')}</button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(course); }} className="flex-1 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors">{t('common.delete')}</button>
      </div>
    </div>
  );
};

export default CourseCard;
