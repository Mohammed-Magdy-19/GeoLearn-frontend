import React from "react";

/**
 * Generic skeleton row/block helpers for custom layouts.
 */
export const SkeletonBlock: React.FC<{ className?: string }> = ({ className = "h-4 bg-muted rounded" }) => (
  <div className={`${className} animate-pulse`} />
);

/**
 * Skeleton for standard dashboard/public item cards (summaries, metadata, etc.).
 * Mimics a card with title, description, badge, list row, and action buttons.
 */
export const CardSkeleton: React.FC = () => (
  <div className="bg-card border border-border rounded-xl p-5 space-y-4 animate-pulse">
    {/* Header line with badge */}
    <div className="flex items-center justify-between gap-4">
      <div className="h-5 bg-muted rounded w-2/3" />
      <div className="h-5 bg-muted rounded-full w-16" />
    </div>

    {/* Description paragraph lines */}
    <div className="space-y-2">
      <div className="h-3 bg-muted rounded w-full" />
      <div className="h-3 bg-muted rounded w-5/6" />
    </div>

    {/* Metadata rows (source, file info) */}
    <div className="space-y-2 pt-2">
      <div className="h-8 bg-muted/60 rounded-lg w-full" />
      <div className="h-8 bg-muted/60 rounded-lg w-full" />
    </div>

    {/* Bottom row stats & action links */}
    <div className="flex items-center justify-between pt-2">
      <div className="h-3 bg-muted rounded w-1/3" />
      <div className="h-6 bg-muted rounded w-1/4" />
    </div>
  </div>
);

/**
 * Grid of general card skeletons.
 */
export const CardGridSkeleton: React.FC<{ count?: number; columnsClass?: string }> = ({
  count = 6,
  columnsClass = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
}) => (
  <div className={columnsClass}>
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

/**
 * Skeleton for Dashboard Course Card (matching CourseCard.tsx).
 */
export const DashboardCourseCardSkeleton: React.FC = () => (
  <div className="border border-border bg-card rounded-xl p-4 space-y-3 animate-pulse">
    {/* Thumbnail aspect-video */}
    <div className="aspect-video rounded-lg bg-muted relative" />

    {/* Title */}
    <div className="h-5 bg-muted rounded w-3/4" />

    {/* Description */}
    <div className="space-y-2">
      <div className="h-3 bg-muted rounded w-full" />
      <div className="h-3 bg-muted rounded w-5/6" />
    </div>

    {/* Stats row */}
    <div className="flex items-center justify-between pt-2">
      <div className="h-3 bg-muted rounded w-1/5" />
      <div className="h-3 bg-muted rounded w-1/5" />
      <div className="h-3 bg-muted rounded w-1/4" />
    </div>

    {/* Divider and edit/delete hover controls skeleton */}
    <div className="h-px bg-border pt-1" />
    <div className="flex gap-2 pt-1">
      <div className="h-7 bg-muted rounded flex-1" />
      <div className="h-7 bg-muted rounded flex-1" />
    </div>
  </div>
);

/**
 * Grid of dashboard course card skeletons.
 */
export const DashboardCourseGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <DashboardCourseCardSkeleton key={i} />
    ))}
  </div>
);

/**
 * Detailed Course Workspace / Details View loading skeleton.
 * Mimics the left-column details card + right-column modules/lessons list.
 */
export const CourseWorkspaceSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header section with back button, titles, action buttons */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
      <div className="flex items-center gap-3">
        <div className="size-10 bg-muted rounded-lg" />
        <div className="space-y-2">
          <div className="h-7 bg-muted rounded w-48" />
          <div className="h-4 bg-muted rounded w-64" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-10 bg-muted rounded w-28" />
        <div className="h-10 bg-muted rounded w-28" />
      </div>
    </div>

    {/* Left/Right grid content */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Course Details column (left 1/3) */}
      <div className="lg:col-span-1 border border-border bg-card rounded-xl p-6 space-y-5">
        <div className="aspect-video bg-muted rounded-lg" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-5/6" />
        </div>
        <div className="space-y-3 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-border/50">
              <div className="h-3 bg-muted rounded w-1/4" />
              <div className="h-3 bg-muted rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>

      {/* Modules/Lessons column (right 2/3) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="border border-border bg-card p-6 rounded-xl space-y-4">
          <div className="h-6 bg-muted rounded w-1/3 mb-4" />
          {/* Mock modules items */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-border/80 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-5 bg-muted rounded w-1/2" />
                <div className="flex gap-2">
                  <div className="size-7 bg-muted rounded" />
                  <div className="size-7 bg-muted rounded" />
                </div>
              </div>
              <div className="h-3 bg-muted rounded w-3/4" />
              {/* Mock lessons */}
              <div className="space-y-2 pt-2 pl-4 border-l-2 border-muted">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="h-10 bg-muted/40 rounded-lg w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Map layout loading skeleton (matching SpatialDataPage.tsx).
 * Shows top header, large map container skeleton on left, and list panel on right.
 */
export const MapPageSkeleton: React.FC = () => (
  <div className="min-h-screen flex flex-col animate-pulse">
    {/* Map Header */}
    <div className="bg-background border-b border-border px-4 py-6 text-center space-y-3">
      <div className="w-14 h-14 bg-muted rounded-2xl mx-auto" />
      <div className="h-7 bg-muted rounded w-48 mx-auto" />
      <div className="h-4 bg-muted rounded w-80 mx-auto" />
    </div>

    {/* Map and Sidebar Grid */}
    <div className="flex-1 flex flex-col lg:flex-row">
      {/* Large Map container */}
      <div className="flex-1 min-h-[400px] lg:min-h-0 bg-muted/40 relative border-r border-border" />

      {/* Map Sidebar */}
      <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-s border-border bg-card space-y-3 p-4">
        <div className="h-4 bg-muted rounded w-1/2 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-3 border border-border/50 rounded-lg space-y-2 bg-muted/10">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
