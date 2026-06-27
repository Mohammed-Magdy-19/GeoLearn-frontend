// src/features/courses/hooks/useCourseBrowser.ts
// ─────────────────────────────────────────────────────────────
// Course Browser State — Filtering, Sorting, Pagination
// Manages UI state for course discovery and filtering.
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import type { CourseFilters, PaginationState } from '../types';

const DEFAULT_PAGE_SIZE = 12; // 3x4 grid on desktop

/**
 * Hook managing course browser state: filters, sorting, and pagination.
 * Separates URL state management from filtering logic.
 *
 * @param initialPage - Starting page number
 * @returns Browser state and handler functions
 */
export function useCourseBrowser(initialPage: number = 1) {
    // Search & filter state
    const [filters, setFilters] = useState<CourseFilters>({
        search: '',
        minPrice: 0,
        maxPrice: 1000,
        isPublished: 'all',
        sortBy: 'newest',
    });

    // Pagination state
    const [pagination, setPagination] = useState<PaginationState>({
        page: initialPage,
        pageSize: DEFAULT_PAGE_SIZE,
        totalCount: 0,
    });

    // ── Search Handler ────────────────────────────────────────

    /**
     * Update search query and reset to page 1.
     * Debouncing should happen at component level for better UX.
     */
    const setSearchQuery = useCallback((query: string) => {
        setFilters((prev) => ({ ...prev, search: query }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    // ── Price Filter ──────────────────────────────────────────

    /**
     * Update price range filter.
     */
    const setPriceRange = useCallback((min: number, max: number) => {
        setFilters((prev) => ({ ...prev, minPrice: min, maxPrice: max }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    // ── Publication Filter ────────────────────────────────────

    /**
     * Toggle publication filter (show all, published only, unpublished only).
     */
    const setPublicationFilter = useCallback((isPublished: boolean | 'all') => {
        setFilters((prev) => ({ ...prev, isPublished }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    // ── Sort Handler ──────────────────────────────────────────

    /**
     * Change sort order.
     */
    const setSortBy = useCallback((sortBy: CourseFilters['sortBy']) => {
        setFilters((prev) => ({ ...prev, sortBy }));
        // Keep current page when sorting
    }, []);

    // ── Pagination ────────────────────────────────────────────

    /**
     * Move to specific page.
     */
    const goToPage = useCallback((page: number) => {
        setPagination((prev) => ({ ...prev, page: Math.max(1, page) }));
    }, []);

    /**
     * Move to next page if available.
     */
    const nextPage = useCallback(() => {
        setPagination((prev) => {
            const maxPage = Math.ceil(prev.totalCount / prev.pageSize);
            return {
                ...prev,
                page: Math.min(prev.page + 1, maxPage),
            };
        });
    }, []);

    /**
     * Move to previous page if available.
     */
    const previousPage = useCallback(() => {
        setPagination((prev) => ({
            ...prev,
            page: Math.max(prev.page - 1, 1),
        }));
    }, []);

    /**
     * Update total count (typically from API response).
     */
    const setTotalCount = useCallback((count: number) => {
        setPagination((prev) => ({ ...prev, totalCount: count }));
    }, []);

    /**
     * Reset all filters and go back to page 1.
     */
    const resetFilters = useCallback(() => {
        setFilters({
            search: '',
            minPrice: 0,
            maxPrice: 1000,
            isPublished: 'all',
            sortBy: 'newest',
        });
        setPagination({
            page: 1,
            pageSize: DEFAULT_PAGE_SIZE,
            totalCount: pagination.totalCount,
        });
    }, [pagination.totalCount]);

    // ── Computed values ───────────────────────────────────────

    const hasFiltersApplied = filters.search || 
        filters.minPrice > 0 || 
        filters.maxPrice < 1000 || 
        filters.isPublished !== 'all' ||
        filters.sortBy !== 'newest';

    const maxPage = Math.ceil(pagination.totalCount / pagination.pageSize);
    const isFirstPage = pagination.page === 1;
    const isLastPage = pagination.page >= maxPage;

    return {
        // Filters & sorting
        filters,
        setSearchQuery,
        setPriceRange,
        setPublicationFilter,
        setSortBy,
        resetFilters,
        hasFiltersApplied,

        // Pagination
        pagination,
        goToPage,
        nextPage,
        previousPage,
        setTotalCount,
        maxPage,
        isFirstPage,
        isLastPage,
    };
}

/**
 * Hook to build query string from current browser state.
 * Useful for syncing state with URL query parameters.
 *
 * @param filters - Current filter state
 * @param page - Current page number
 * @returns Query string (without leading ?)
 */
export function useFilterQueryString(
    filters: CourseFilters,
    page: number
): string {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.minPrice > 0) params.append('min_price', String(filters.minPrice));
    if (filters.maxPrice < 1000) params.append('max_price', String(filters.maxPrice));
    if (filters.isPublished !== 'all') params.append('published', String(filters.isPublished));
    if (filters.sortBy !== 'newest') params.append('sort', filters.sortBy);
    if (page > 1) params.append('page', String(page));

    return params.toString();
}
