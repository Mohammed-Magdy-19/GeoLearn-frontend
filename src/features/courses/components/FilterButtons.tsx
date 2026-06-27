// src/features/courses/components/FilterButtons.tsx
// ─────────────────────────────────────────────────────────────
// Filter Buttons Component — Category and sort controls for course list
// Uses shadcn Button for consistent interactive elements
// ─────────────────────────────────────────────────────────────

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface FilterButtonsProps {
    activeSort: string;
    onSortChange: (sort: string) => void;
    onResetFilters: () => void;
    hasActiveFilters: boolean;
}

export function FilterButtons({
    activeSort,
    onSortChange,
    onResetFilters,
    hasActiveFilters,
}: FilterButtonsProps) {
    const { t } = useTranslation();
    const sortOptions = [
        { value: 'newest', label: t('courses.sortNewest') },
        { value: 'popular', label: t('courses.sortPopular') },
        { value: 'price_asc', label: t('courses.sortPriceLow') },
        { value: 'price_desc', label: t('courses.sortPriceHigh') },
    ];

    return (
        <div className="flex items-center justify-between flex-wrap gap-3 p-4 bg-muted/30 rounded-lg mb-6">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground">{t('courses.sortBy')}:</span>
                <div className="flex gap-2 flex-wrap">
                    {sortOptions.map((option) => (
                        <Button
                            key={option.value}
                            variant={activeSort === option.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => onSortChange(option.value)}
                            className="rounded-full"
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
            </div>

            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onResetFilters}
                    className="text-destructive hover:text-destructive/80 gap-1"
                >
                    {t('courses.resetFilters')} <X className="size-3.5" />
                </Button>
            )}
        </div>
    );
}
