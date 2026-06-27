// src/features/video/components/WatchPageHeader.tsx
// ─────────────────────────────────────────────────────────────
// Watch Page Top Bar — Pure Presentational (SRP)
// ISP: only receives primitive values it renders.
// ─────────────────────────────────────────────────────────────

import { Button } from '@/components/ui/button';
import { ArrowLeft, Award } from 'lucide-react';

interface WatchPageHeaderProps {
    courseTitle: string;
    moduleTitle?: string;
    lessonTitle?: string;
    completedLessons: number;
    totalLessons: number;
    progressPercent: number;
    onBack: () => void;
}

export function WatchPageHeader({
    courseTitle,
    moduleTitle,
    lessonTitle,
    completedLessons,
    totalLessons,
    progressPercent,
    onBack,
}: WatchPageHeaderProps) {
    return (
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="hover:bg-muted" onClick={onBack}>
                        <ArrowLeft className="size-5" />
                    </Button>
                    <div>
                        <h1 className="font-display font-bold text-foreground text-lg leading-tight">
                            {courseTitle}
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            {moduleTitle} • {lessonTitle}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                        <Award className="size-4 text-brand-primary" />
                        <span>{completedLessons}/{totalLessons} completed</span>
                    </div>
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand-primary rounded-full transition-all"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
