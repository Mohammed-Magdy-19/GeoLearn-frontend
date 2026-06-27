// src/features/video/components/PlayerEmptyState.tsx
// ─────────────────────────────────────────────────────────────
// Player Empty State — Pure Presentational (SRP)
// Rendered when no video source is available yet.
// ISP: only accepts an optional `title`.
// ─────────────────────────────────────────────────────────────

import { Play } from 'lucide-react';

interface PlayerEmptyStateProps {
    /** Optional title to display */
    title?: string;
}

export function PlayerEmptyState({ title }: PlayerEmptyStateProps) {
    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-bg-dark border border-neutral-800 flex items-center justify-center">
            <div className="text-center p-12">
                <Play className="size-16 text-neutral-600 mx-auto mb-4" />
                <p className="text-sm text-neutral-400 font-body">
                    {title || 'Select a lesson to start learning'}
                </p>
            </div>
        </div>
    );
}
