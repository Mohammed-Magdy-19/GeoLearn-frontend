/**
 * src/pages/dashboard/DashboardPage.tsx
 *
 * Main admin dashboard page displaying KPIs, analytics charts,
 * enrollment trends, and course popularity rankings.
 * All UI text is in Arabic with RTL layout.
 */

import { useDashboardStats, useEnrollmentTrends, useCoursePopularity } from "../hooks/useDashboardQueries";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useTranslation } from "react-i18next";
import { Hand, BookOpen, CircleCheck, TrendingUp, Clapperboard, Sparkles, Check, MapPin } from "lucide-react";
import { KpiCard } from "../components/KpiCard";
import { KpiSkeleton } from "../components/KpiSkeleton";
import { TrendsChart } from "../components/TrendsChart";
import { PopularityTable } from "../components/PopularityTable";
import { QuickStatRow } from "../components/QuickStatRow";

// (Components extracted to ../components/* to respect SRP and ISP)

// ─────────────────────────────────────────────────────────────
// Main Dashboard Page
// ─────────────────────────────────────────────────────────────

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useCurrentUser();
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useDashboardStats();
  const { data: trends, isLoading: trendsLoading } = useEnrollmentTrends();
  const { data: popularCourses, isLoading: popularityLoading } =
    useCoursePopularity();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground font-display">
          {t("dashboard.title")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("dashboard.welcome", { name: user?.full_name })} <Hand className="size-5 inline" /> {t("dashboard.overview")}
        </p>
      </div>

      {/* Error State */}
      {statsError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-destructive animate-fade-in">
          <p className="font-medium">{t("dashboard.failedToLoadData")}</p>
          <p className="text-sm mt-1 opacity-80">
            {statsError instanceof Error
              ? statsError.message
              : t("dashboard.pleaseTryAgain")}
          </p>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </>
        ) : stats ? (
          <>
            <KpiCard
              title={t("dashboard.totalUsers")}
              value={stats.totalUsers}
              subtitle={t("dashboard.thisMonth", { count: stats.newUsersThisMonth })}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              }
              trend="up"
              trendValue={t("dashboard.newUser", { count: stats.newUsersThisMonth })}
              accentColor="primary"
              delay={100}
            />
            <KpiCard
              title={t("dashboard.totalCourses")}
              value={stats.totalCourses}
              subtitle={t("dashboard.lesson", { count: stats.totalLessons })}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              }
              accentColor="brand-warm"
              delay={200}
            />
            <KpiCard
              title={t("dashboard.activeSessions")}
              value={stats.activeSessions}
              subtitle={t("dashboard.outOfSessions", { total: stats.totalVideoSessions })}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
              }
              trend={stats.activeSessions > 0 ? "up" : "neutral"}
              accentColor="success"
              delay={300}
            />
            <KpiCard
              title={t("dashboard.totalRevenue")}
              value={`${stats.totalRevenueEgp.toLocaleString()} ${t("common.egp")}`}
              subtitle={t("dashboard.completedLessons", { count: stats.totalCompletions })}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
              }
              accentColor="brand-warm"
              delay={400}
            />
          </>
        ) : null}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrollment Trends */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-card p-5 animate-fade-in-up animation-delay-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-foreground font-display">
                {t("dashboard.enrollmentTrends")}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t("dashboard.monthlyEnrollments")}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-brand-primary" />
                {t("dashboard.enrollments")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-brand-secondary" />
                {t("dashboard.completions")}
              </span>
            </div>
          </div>
          {trendsLoading ? (
            <div className="h-[180px] bg-muted/50 rounded-lg animate-pulse" />
          ) : trends && trends.length > 0 ? (
            <TrendsChart data={trends} />
          ) : (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">{t("dashboard.insufficientData")}</div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="rounded-xl border border-border bg-card shadow-card p-5 animate-fade-in-up animation-delay-300">
          <h2 className="text-lg font-bold text-foreground font-display mb-4">
            {t("dashboard.quickStats")}
          </h2>
          <div className="space-y-4">
            {stats ? (
              <>
                <QuickStatRow label={t("dashboard.totalLessons")} value={stats.totalLessons} icon={<BookOpen className="size-5 text-primary" />} />
                <QuickStatRow label={t("dashboard.completedLessonsLabel")} value={stats.totalCompletions} icon={<CircleCheck className="size-5 text-brand-accent" />} />
                <QuickStatRow label={t("dashboard.averageProgress")} value={`${Math.round(stats.avgProgressPercent)}%`} icon={<TrendingUp className="size-5 text-brand-primary" />} />
                <QuickStatRow label={t("dashboard.totalSessions")} value={stats.totalVideoSessions} icon={<Clapperboard className="size-5 text-muted-foreground" />} />
              </>
            ) : (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-muted/50 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Popularity */}
      <div className="rounded-xl border border-border bg-card shadow-card p-5 animate-fade-in-up animation-delay-400">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground font-display">
              {t("dashboard.coursePopularity")}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t("dashboard.mostEnrolledCourses")}
            </p>
          </div>
        </div>
        {popularityLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-muted/50 rounded-lg animate-pulse" />
          ))}</div>
        ) : popularCourses && popularCourses.length > 0 ? (
          <PopularityTable courses={popularCourses} />
        ) : (
          <div className="py-12 text-center text-muted-foreground text-sm">{t("dashboard.noCoursesRegistered")}</div>
        )}
      </div>

      {/* Courses Feature Section */}
      <div className="rounded-xl border border-border bg-card shadow-card p-5 animate-fade-in-up animation-delay-500">
        <div>
          <h2 className="text-lg font-bold text-foreground font-display mb-1">
            <Sparkles className="size-5 inline text-brand-primary" /> {t("dashboard.newCoursesFeature")}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {t("dashboard.newCoursesFeatureDesc")}
          </p>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-semibold text-primary mb-1"><Check className="size-4 inline" /> {t("dashboard.cleanStructure")}</p>
            <p className="text-muted-foreground text-xs">
              {t("dashboard.cleanStructureDesc")}
            </p>
          </div>

          <div className="p-3 bg-success/5 rounded-lg border border-brand-accent/20">
            <p className="font-semibold text-brand-accent mb-1"><Check className="size-4 inline" /> {t("dashboard.optimizedPerformance")}</p>
            <p className="text-muted-foreground text-xs">
              {t("dashboard.optimizedPerformanceDesc")}
            </p>
          </div>

          <div className="p-3 bg-brand-primary/5 rounded-lg border border-brand-primary/20">
            <p className="font-semibold text-brand-primary mb-1"><Check className="size-4 inline" /> {t("dashboard.advancedExperience")}</p>
            <p className="text-muted-foreground text-xs">
              {t("dashboard.advancedExperienceDesc")}
            </p>
          </div>

          <div className="p-3 bg-secondary/5 rounded-lg border border-border">
            <p className="font-semibold text-secondary-foreground mb-1"><Check className="size-4 inline" /> {t("dashboard.availableComponents")}</p>
            <div className="text-muted-foreground text-xs grid grid-cols-2 gap-2 mt-2">
              <span>• {t("dashboard.courseCard")}</span>
              <span>• {t("dashboard.coursesGrid")}</span>
              <span>• {t("dashboard.courseDetailCard")}</span>
              <span>• {t("dashboard.progressBar")}</span>
              <span>• {t("dashboard.courseBrowser")}</span>
              <span>• {t("dashboard.courseData")}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <MapPin className="size-3.5 inline" /> {t("dashboard.accessCourses")} <code className="bg-background px-2 py-1 rounded text-primary">src/features/courses/</code>
          </p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Quick Stat Row (helper component)
// ─────────────────────────────────────────────────────────────

// QuickStatRow moved to ../components/QuickStatRow to adhere to SRP
