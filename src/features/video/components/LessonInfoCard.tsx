// src/features/video/components/LessonInfoCard.tsx
// ─────────────────────────────────────────────────────────────
// Lesson Info Card — Pure Presentational (SRP + ISP)
// Displays the current lesson's title, description, metadata,
// lesson file download link, and next-lesson navigation.
// ─────────────────────────────────────────────────────────────

import { Award, FileDown, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LessonInfoCardProps {
    title: string;
    description: string;
    isFreePreview: boolean;
    durationDisplay: string;
    isCompleted: boolean;
    lessonFileUrl?: string | null;
    nextLessonTitle?: string | null;
    onNextLesson?: () => void;
}

export function LessonInfoCard({
    title,
    description,
    isFreePreview,
    durationDisplay,
    isCompleted,
    lessonFileUrl,
    nextLessonTitle,
    onNextLesson,
}: LessonInfoCardProps) {
    const { t } = useTranslation();
    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card animate-fade-in-up">
            <h2 className="font-display font-bold text-xl text-foreground mb-2">
                {title}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
                {description || 'No description available.'}
            </p>
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Award className="size-3" />
                    {isFreePreview ? 'Free Preview' : 'Premium Content'}
                </span>
                <span>•</span>
                <span>{durationDisplay}</span>
                {isCompleted && (
                    <>
                        <span>•</span>
                        <span className="text-green-500 flex items-center gap-1">
                            <Award className="size-3" /> Completed
                        </span>
                    </>
                )}
            </div>

            {/* Lesson file download + Next lesson */}
            {(lessonFileUrl || nextLessonTitle) && (
                <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-border">
                    {lessonFileUrl && (
                        <button
                            type="button"
                            onClick={async () => {
                                try {
                                    const res = await fetch(lessonFileUrl);
                                    const blob = await res.blob();
                                    const blobUrl = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = blobUrl;
                                    // Extract filename from URL, fallback to generic name
                                    const fileName = lessonFileUrl.split('/').pop() || 'lesson-file';
                                    a.download = decodeURIComponent(fileName);
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(blobUrl);
                                } catch {
                                    // Fallback: open in new tab if fetch fails
                                    window.open(lessonFileUrl, '_blank');
                                }
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                                       text-foreground bg-muted hover:bg-muted/80 border border-border
                                       rounded-lg transition-colors cursor-pointer"
                        >
                            <FileDown className="size-4" />
                            {t('video.downloadLessonFile')}
                        </button>
                    )}

                    {nextLessonTitle && onNextLesson && (
                        <button
                            onClick={onNextLesson}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
                                       text-bg-dark bg-brand-primary hover:bg-brand-primary/90 rounded-lg transition-colors
                                       shadow-brand mr-auto"
                        >
                            {t('video.nextLesson')}: {nextLessonTitle}
                            <ChevronLeft className="size-4" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
