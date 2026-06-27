// src/features/video/components/PlayerLoadingState.tsx
// ─────────────────────────────────────────────────────────────
// Player Loading State — Pure Presentational (SRP)
// Re-exports VideoPlayerSkeleton with a semantic name.
// LSP: can be swapped with any component matching this interface.
// ─────────────────────────────────────────────────────────────

import { VideoPlayerSkeleton } from './VideoPlayerSkeleton';

interface PlayerLoadingStateProps {
    className?: string;
}

export function PlayerLoadingState({ className }: PlayerLoadingStateProps) {
    return <VideoPlayerSkeleton className={className} />;
}
