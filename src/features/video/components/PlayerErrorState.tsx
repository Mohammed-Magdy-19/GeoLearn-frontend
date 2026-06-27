// src/features/video/components/PlayerErrorState.tsx
// ─────────────────────────────────────────────────────────────
// Player Error State — Pure Presentational (SRP)
// Renders when the secure stream fails to load.
// ISP: only accepts `message` (string) and `onRetry` (callback).
// ─────────────────────────────────────────────────────────────

import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlayerErrorStateProps {
    /** Human-readable error message */
    message: string;
    /** Retry callback */
    onRetry: () => void;
}

export function PlayerErrorState({ message, onRetry }: PlayerErrorStateProps) {
    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-bg-dark border border-red-900/50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 p-8 text-center">
                <AlertCircle className="size-12 text-red-500" />
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white font-display">
                        Stream Error
                    </h3>
                    <p className="text-sm text-neutral-400 max-w-md">{message}</p>
                </div>
                <Button
                    variant="outline"
                    className="border-brand-primary/50 text-brand-primary hover:bg-brand-primary/10"
                    onClick={onRetry}
                >
                    <RotateCcw className="size-4 mr-2" /> Retry
                </Button>
            </div>
        </div>
    );
}
