// src/features/courses/pages/CoursesPage.tsx
// ─────────────────────────────────────────────────────────────
// Courses Listing Page — Pure Layout Component
// All data/logic extracted to hooks.
// UI only: rendering, layout, composition.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    useCourseList,
    useUserEnrollments,
    useEnrollCourse,
} from '../hooks/useCourseData';
import { useCourseBrowser } from '../hooks/useCourseBrowser';
import { CoursesGrid } from '../components/CoursesGrid';
import { SearchBox } from '../components/SearchBox';
import { FilterButtons } from '../components/FilterButtons';
import { CoursePagination } from '../components/CoursePagination';
import { CoursesGridSkeleton } from '../components/CoursesSkeleton';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import type { Enrollment } from '../types';

// Simple debounce utility
const debounce = <T extends unknown[]>(
    func: (...args: T) => void,
    delay: number
): ((...args: T) => void) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: T) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

// Extract enrollment map for quick lookup
function mapEnrollments(enrollments: Enrollment[]) {
    const enrolledCourseIds = enrollments.map((e) => e.course_id);
    const progressMap = enrollments.reduce((acc, e) => {
        acc[e.course_id] = e.progress_percent || 0;
        return acc;
    }, {} as Record<string, number>);
    return { enrolledCourseIds, progressMap };
}

export function CoursesPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // Browser state management
    const browser = useCourseBrowser();

    // Data fetching hooks
    const { data: coursesData, isLoading: isCoursesLoading } = useCourseList(
        browser.pagination.page,
        browser.filters.search
    );
    const { data: enrollments = [] } = useUserEnrollments();
    const enrollCourse = useEnrollCourse();

    const { enrolledCourseIds, progressMap } = mapEnrollments(enrollments);

    const { setSearchQuery: setBrowserSearchQuery, setTotalCount } = browser;

    // Debounced search handler
    const debouncedSearch = useCallback(
        debounce((query: string) => setBrowserSearchQuery(query), 500),
        [setBrowserSearchQuery]
    );

    // Update total count when data loads
    useEffect(() => {
        if (coursesData?.count) {
            setTotalCount(coursesData.count);
        }
    }, [coursesData?.count, setTotalCount]);

    // ── Event Handlers ────────────────────────────────────────

    const handleEnroll = async (courseId: string) => {
        try {
            await enrollCourse.mutateAsync({ course_id: courseId });
            // Refresh data after enrollment
        } catch (error) {
            console.error('Enrollment failed:', error);
        }
    };

    const handleViewDetails = (courseId: string) => {
        navigate(`/courses/${courseId}`);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        debouncedSearch(value);
    };

    return (
        <main className="container max-w-7xl mx-auto px-4 py-8 min-h-screen">
            {/* Page Header */}
            <div className="mb-8 animate-fade-in-up">
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground font-display mb-2">
                    {t("courses.availableCourses")}
                </h1>
                <p className="text-muted-foreground">
                    {t("courses.availableCoursesSubtitle")}
                </p>
            </div>

            {/* Search & Filters Section */}
            <div className="mb-8 space-y-4 animate-fade-in-up animation-delay-100">
                {/* Search Box */}
                <SearchBox
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={t("courses.searchPlaceholder")}
                />

                {/* Sort & Reset Filters */}
                <FilterButtons
                    activeSort={browser.filters.sortBy}
                    onSortChange={(sort) => {
                        browser.setSortBy(sort as typeof browser.filters.sortBy);
                    }}
                    onResetFilters={browser.resetFilters}
                    hasActiveFilters={Boolean(browser.hasFiltersApplied)}
                />
            </div>

            {/* Results Info */}
            {coursesData && (
                <div className="mb-4 text-sm text-muted-foreground animate-fade-in-up animation-delay-200">
                    {coursesData.count === 0 ? (
                        <p>{t("courses.noCoursesMatch")}</p>
                    ) : (
                        <p>
                            {t("courses.showingResults", {
                                from: (browser.pagination.page - 1) * browser.pagination.pageSize + 1,
                                to: Math.min(browser.pagination.page * browser.pagination.pageSize, coursesData.count),
                                total: coursesData.count
                            })}
                        </p>
                    )}
                </div>
            )}

            {/* Loading State */}
            {isCoursesLoading ? (
                <CoursesGridSkeleton count={12} />
            ) : coursesData?.results?.length === 0 ? (
                // Empty State
                <div className="py-16 text-center">
                    <BookOpen className="size-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                        {t("courses.noCoursesAvailable")}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        {browser.hasFiltersApplied
                            ? t("courses.tryDifferentSearch")
                            : t("courses.moreCoursesComingSoon")}
                    </p>
                    {browser.hasFiltersApplied && (
                        <Button onClick={browser.resetFilters} variant="outline">
                            {t("courses.resetFilters")}
                        </Button>
                    )}
                </div>
            ) : (
                // Courses Grid
                <>
                    <div className="animate-fade-in-up animation-delay-200">
                        <CoursesGrid
                            courses={coursesData?.results || []}
                            enrolledCourseIds={enrolledCourseIds}
                            progressMap={progressMap}
                            onEnroll={handleEnroll}
                            onViewDetails={handleViewDetails}
                            isLoading={enrollCourse.isPending}
                            emptyMessage={t("courses.noCoursesCurrently")}
                        />
                    </div>

                    {/* Pagination */}
                    {browser.maxPage > 1 && (
                        <div className="animate-fade-in-up animation-delay-300">
                            <CoursePagination
                                currentPage={browser.pagination.page}
                                maxPage={browser.maxPage}
                                onPageChange={browser.goToPage}
                                isFirstPage={browser.isFirstPage}
                                isLastPage={browser.isLastPage}
                            />
                        </div>
                    )}
                </>
            )}
        </main>
    );
}

