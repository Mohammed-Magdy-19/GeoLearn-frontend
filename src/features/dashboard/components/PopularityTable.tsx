import React from "react";
import { useTranslation } from "react-i18next";

export type CourseRow = {
  courseId: string;
  courseTitle: string;
  enrolledCount: number;
  avgProgress: number;
};

export const PopularityTable: React.FC<{ courses: CourseRow[] }> = ({
  courses,
}) => {
  const { t } = useTranslation();
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="text-start py-3 px-4 font-medium">{t("dashboard.courseLabel")}</th>
            <th className="text-center py-3 px-4 font-medium">{t("dashboard.enrolledLabel")}</th>
            <th className="text-center py-3 px-4 font-medium">{t("dashboard.averageProgress")}</th>
            <th className="text-end py-3 px-4 font-medium">{t("dashboard.statusLabel")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {courses.map((course) => (
            <tr key={course.courseId} className="hover:bg-muted/30 transition-colors">
              <td className="py-3 px-4 font-medium text-foreground">{course.courseTitle}</td>
              <td className="py-3 px-4 text-center text-muted-foreground">{course.enrolledCount.toLocaleString()}</td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-gradient rounded-full transition-all"
                      style={{ width: `${course.avgProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-10">{Math.round(course.avgProgress)}%</span>
                </div>
              </td>
              <td className="py-3 px-4 text-end">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    course.avgProgress >= 75
                      ? "bg-brand-accent/10 text-brand-accent"
                      : course.avgProgress >= 50
                      ? "bg-brand-primary/10 text-brand-primary"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {course.avgProgress >= 75 ? t("dashboard.excellent") : course.avgProgress >= 50 ? t("dashboard.good") : t("dashboard.needsAttention")}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PopularityTable;
