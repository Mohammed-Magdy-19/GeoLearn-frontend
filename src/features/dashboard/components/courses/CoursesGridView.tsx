import React from "react";
import { Plus, Search, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AdminCourse, PaginatedResponse } from "../../types/dashboardTypes";
import CourseCard from "./CourseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CoursesGridViewProps {
  coursesData: PaginatedResponse<AdminCourse> | undefined;
  coursesLoading: boolean;
  courseSearch: string;
  onSearchChange: (search: string) => void;
  coursesPage: number;
  onPageChange: (page: number) => void;
  onEditCourse: (course: AdminCourse) => void;
  onDeleteCourse: (course: AdminCourse) => void;
  onCreateCourseClick: () => void;
  onSelectCourse: (courseId: string) => void;
}

/**
 * Presentational component displaying the grid of all admin courses (SRP).
 */
export const CoursesGridView: React.FC<CoursesGridViewProps> = ({
  coursesData,
  coursesLoading,
  courseSearch,
  onSearchChange,
  coursesPage,
  onPageChange,
  onEditCourse,
  onDeleteCourse,
  onCreateCourseClick,
  onSelectCourse,
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">
            {t('dashboard.coursesMgmtTitle')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('dashboard.coursesMgmtDesc')}
          </p>
        </div>
        <Button
          onClick={onCreateCourseClick}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium shadow-brand gap-2"
        >
          <Plus className="size-4" />
          {t('dashboard.addCourse')}
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
        <Input
          type="text"
          placeholder={t('dashboard.searchCourses')}
          value={courseSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-10 pl-4 rounded-xl"
        />
      </div>

      {/* Course List Grid */}
      <div>
        {coursesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 bg-muted/50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : coursesData && coursesData.results.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coursesData.results.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isSelected={false}
                  onSelect={() => onSelectCourse(course.id)}
                  onEdit={onEditCourse}
                  onDelete={onDeleteCourse}
                />
              ))}
            </div>

            {/* Pagination */}
            {coursesData.count > 20 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(Math.max(1, coursesPage - 1))}
                  disabled={coursesPage === 1}
                >
                  {t('common.previous')}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {t('courses.pageOf', { current: coursesPage, total: Math.ceil(coursesData.count / 20) })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(coursesPage + 1)}
                  disabled={!coursesData.next}
                >
                  {t('common.next')}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center border border-dashed border-border rounded-xl">
            <BookOpen className="mx-auto size-12 text-muted-foreground/50 mb-3" strokeWidth={1.5} />
            <p className="text-muted-foreground font-medium">
              {t('dashboard.noCoursesYet')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesGridView;
