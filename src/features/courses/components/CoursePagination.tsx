// src/features/courses/components/CoursePagination.tsx
// ─────────────────────────────────────────────────────────────
// Course Pagination Component — shadcn Button-based pagination
// ─────────────────────────────────────────────────────────────

import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface CoursePaginationProps {
    currentPage: number;
    maxPage: number;
    onPageChange: (page: number) => void;
    isFirstPage: boolean;
    isLastPage: boolean;
}

export function CoursePagination({
    currentPage,
    maxPage,
    onPageChange,
    isFirstPage,
    isLastPage,
}: CoursePaginationProps) {
    const { t } = useTranslation();
    if (maxPage <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-8 pt-8 border-t border-border">
            {/* Previous button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={isFirstPage}
            >
                ← {t('common.previous')}
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
                {Array.from({ length: maxPage }).map((_, i) => {
                    const page = i + 1;
                    const isActive = page === currentPage;
                    const isNear = Math.abs(page - currentPage) <= 1;

                    if (!isNear && page !== 1 && page !== maxPage) return null;

                    return (
                        <Button
                            key={page}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPageChange(page)}
                            disabled={isActive}
                            className="px-3 py-1 rounded-lg"
                        >
                            {page}
                        </Button>
                    );
                })}
            </div>

            {/* Next button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={isLastPage}
            >
                {t('common.next')} →
            </Button>

            {/* Info text */}
            <span className="text-xs text-muted-foreground ml-4">
                {t('courses.pageOf', { current: currentPage, total: maxPage })}
            </span>
        </div>
    );
}
