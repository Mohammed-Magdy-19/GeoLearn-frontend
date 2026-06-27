// src/features/video/components/LessonSidebar.tsx
// ─────────────────────────────────────────────────────────────
// Lesson Navigation Sidebar — Pure Presentational (SRP + DIP)
// No direct store access. All callbacks injected via props.
// Access control logic extracted to useLessonAccess hook.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useLessonAccess } from '../hooks/useLessonAccess';
import { Check, Play, Lock, ChevronDown, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Module, Lesson, LessonAccessConfig } from '../types';

interface LessonSidebarProps {
    modules: Module[];
    currentLessonId: string | null;
    courseSlug: string;
    onLessonSelect: (lessonId: string) => void;
    /** DIP — injected callback to set the active video in the store */
    onVideoSet: (videoId: string, lessonId: string) => void;
    accessConfig: LessonAccessConfig;
}

export function LessonSidebar({
    modules,
    currentLessonId,
    onLessonSelect,
    onVideoSet,
    accessConfig,
}: LessonSidebarProps) {
    const [expandedModules, setExpandedModules] = useState<Set<string>>(
        () => new Set(modules.map((m) => m.id))
    );

    const { canAccessLesson, getLessonProgress, getLessonStatus } = useLessonAccess(accessConfig);

    const toggleModule = (moduleId: string) => {
        setExpandedModules((prev) => {
            const next = new Set(prev);
            if (next.has(moduleId)) next.delete(moduleId);
            else next.add(moduleId);
            return next;
        });
    };

    const handleLessonClick = (lesson: Lesson) => {
        if (!canAccessLesson(lesson)) return;
        onLessonSelect(lesson.id);
        if (lesson.has_video) onVideoSet(lesson.id, lesson.id);
    };

    return (
        <div className="w-full max-w-sm bg-card border border-border rounded-2xl overflow-hidden shadow-card">
            <div className="p-4 border-b border-border bg-brand-secondary/5">
                <h3 className="font-display font-bold text-foreground text-lg">Course Content</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons
                </p>
            </div>

            <div className="max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide">
                {modules.map((module) => (
                    <div key={module.id} className="border-b border-border last:border-0">
                        <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-start"
                            onClick={() => toggleModule(module.id)}>
                            <div className="flex items-center gap-2">
                                {expandedModules.has(module.id) ? (
                                    <ChevronDown className="size-4 text-muted-foreground" />
                                ) : (
                                    <ChevronRight className="size-4 text-muted-foreground" />
                                )}
                                <span className="font-medium text-sm text-foreground">{module.title}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{module.lessons.length} lessons</span>
                        </button>

                        {expandedModules.has(module.id) && (
                            <div className="pb-2">
                                {module.lessons.map((lesson) => {
                                    const isActive = lesson.id === currentLessonId;
                                    const status = getLessonStatus(lesson, isActive);
                                    const progress = getLessonProgress(lesson);

                                    return (
                                        <button key={lesson.id}
                                            className={cn(
                                                "w-full flex items-start gap-3 px-4 py-3 text-start transition-all",
                                                isActive ? "bg-brand-primary/10 border-s-2 border-s-brand-primary" : "hover:bg-muted/30 border-s-2 border-s-transparent",
                                                status === 'locked' && "opacity-60 cursor-not-allowed"
                                            )}
                                            onClick={() => handleLessonClick(lesson)}
                                            disabled={status === 'locked'}>
                                            <div className="mt-0.5 shrink-0">
                                                {status === 'completed' && (
                                                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                                        <Check className="size-3 text-green-500" />
                                                    </div>
                                                )}
                                                {status === 'locked' && <Lock className="size-5 text-muted-foreground" />}
                                                {status === 'active' && (
                                                    <div className="w-5 h-5 rounded-full bg-brand-primary/20 flex items-center justify-center">
                                                        <Play className="size-3 text-brand-primary fill-brand-primary" />
                                                    </div>
                                                )}
                                                {status === 'default' && (
                                                    <div className="w-5 h-5 rounded-full border border-muted-foreground/30 flex items-center justify-center">
                                                        <Play className="size-3 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className={cn("text-sm font-medium truncate", isActive ? "text-brand-primary" : "text-foreground")}>
                                                    {lesson.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="size-3" /> {lesson.duration_display}
                                                    </span>
                                                    {lesson.is_free_preview && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary font-medium">Free</span>
                                                    )}
                                                </div>
                                                {progress > 0 && status !== 'completed' && (
                                                    <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                                                        <div className="h-full bg-brand-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}