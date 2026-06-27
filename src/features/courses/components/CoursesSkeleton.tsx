// src/features/courses/components/CoursesSkeleton.tsx
// ─────────────────────────────────────────────────────────────
// Skeleton Loading States — Pure UI Component
// Shows loading placeholder while courses data is fetching.
// ─────────────────────────────────────────────────────────────

/**
 * Individual course card skeleton.
 * Mimics the shape and size of CourseCard component.
 */
export function CourseCardSkeleton() {
    return (
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden animate-pulse">
            {/* Thumbnail */}
            <div className="w-full h-40 bg-muted" />

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <div className="h-5 bg-muted rounded w-3/4" />

                {/* Description */}
                <div className="space-y-1.5">
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-5/6" />
                </div>

                {/* Progress bar */}
                <div className="pt-2">
                    <div className="h-2 bg-muted rounded-full w-full" />
                </div>

                {/* Footer with price and button */}
                <div className="flex items-center justify-between pt-2">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-8 bg-muted rounded w-20" />
                </div>
            </div>
        </div>
    );
}

/**
 * Grid of course card skeletons.
 * Renders loading state while fetching course list.
 *
 * @param count - Number of skeleton cards to display
 */
export function CoursesGridSkeleton({ count = 12 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <CourseCardSkeleton key={i} />
            ))}
        </div>
    );
}

/**
 * Course detail page skeleton.
 * Mimics the full detail view layout.
 */
export function CourseDetailSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Header */}
            <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Video/content area */}
                <div className="lg:col-span-2">
                    <div className="w-full h-80 bg-muted rounded-lg" />
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="h-12 bg-muted rounded-lg" />
                    <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-10 bg-muted rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Modules section */}
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2 p-4 border border-border rounded-lg">
                        <div className="h-5 bg-muted rounded w-1/3" />
                        <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, j) => (
                                <div key={j} className="h-4 bg-muted rounded w-full" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
