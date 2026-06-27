// src/features/video/components/VideoPlayerSkeleton.tsx
// ─────────────────────────────────────────────────────────────
// Video Player Loading Skeleton
// Shimmer loading state matching the player dimensions.
// Uses Tailwind v4 animate-pulse and gradient shimmer.
// ─────────────────────────────────────────────────────────────

import { cn } from '@/lib/utils';

interface VideoPlayerSkeletonProps {
    className?: string;
}

export function VideoPlayerSkeleton({ className }: VideoPlayerSkeletonProps) {
    return (
        <div
            className={cn(
                "relative aspect-video w-full overflow-hidden rounded-2xl bg-bg-dark border border-neutral-800",
                className
            )}
        >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

            {/* Center loading indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    {/* Spinning ring */}
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-2 border-brand-primary/20" />
                        <div className="absolute inset-0 rounded-full border-2 border-t-brand-primary animate-spin" />
                    </div>

                    {/* Loading text */}
                    <div className="space-y-2 text-center">
                        <p className="text-sm text-neutral-400 font-body animate-pulse">
                            Initializing secure stream...
                        </p>
                        <p className="text-xs text-neutral-600 font-mono">
                            Establishing encrypted session
                        </p>
                    </div>
                </div>
            </div>

            {/* Fake controls bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/10 animate-pulse" />
                        <div className="w-9 h-9 rounded-xl bg-white/10 animate-pulse" />
                    </div>
                    <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-white/5 rounded-full animate-pulse" />
                    </div>
                    <div className="w-20 h-4 bg-white/10 rounded animate-pulse" />
                </div>
            </div>
        </div>
    );
}