// src/features/courses/components/CourseModuleAccordion.tsx
// ─────────────────────────────────────────────────────────────
// Course Module Accordion — Uses shadcn Accordion + Badge
// ─────────────────────────────────────────────────────────────

import { Check, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDuration } from '../hooks/useCourseProgress';
import type { CourseModule, CourseLesson } from '../types';
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

interface LessonRowProps {
    lesson: CourseLesson;
    index: number;
    isEnrolled: boolean;
    onLessonClick?: (lessonId: string) => void;
}

function LessonRow({ lesson, index, isEnrolled, onLessonClick }: LessonRowProps) {
    const { t } = useTranslation();
    const isAccessible = isEnrolled || lesson.is_free_preview;

    return (
        <div
            onClick={() => {
                if (isAccessible) {
                    onLessonClick?.(lesson.id);
                }
            }}
            className={`px-4 py-3 flex items-start justify-between transition-colors ${
                isAccessible ? 'cursor-pointer hover:bg-muted/50' : 'opacity-75 select-none'
            }`}
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-muted-foreground text-xs font-medium">
                        {index + 1}.
                    </span>
                    <p className="font-medium text-sm text-foreground truncate">
                        {lesson.title}
                    </p>
                    {lesson.is_free_preview && (
                        <Badge variant="secondary" className="text-xs">
                            {t('courses.freePreview')}
                        </Badge>
                    )}
                    {lesson.is_completed && (
                        <Badge className="bg-brand-accent/10 text-brand-accent border-brand-accent/20 text-xs gap-1">
                            <Check className="size-3" /> {t('courses.completed')}
                        </Badge>
                    )}
                </div>
                {lesson.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                        {lesson.description}
                    </p>
                )}
            </div>
            <div className="shrink-0 ms-2 text-end">
                <p className="text-xs text-muted-foreground">
                    {formatDuration(lesson.duration_seconds)}
                </p>
                {lesson.has_video && (
                    <Video className="size-3.5 text-primary" />
                )}
            </div>
        </div>
    );
}

interface CourseModuleAccordionProps {
    modules?: CourseModule[];
    isEnrolled: boolean;
    onLessonClick?: (lessonId: string) => void;
}

export function CourseModuleAccordion({
    modules = [],
    isEnrolled,
    onLessonClick,
}: CourseModuleAccordionProps) {
    const { t } = useTranslation();
    // Default open the first module
    const defaultOpenValues = modules.slice(0, 1).map((m) => m.id);

    return (
        <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">{t('courses.content')}</h2>
            <Accordion defaultValue={defaultOpenValues}>
                {modules.map((module) => (
                    <AccordionItem
                        key={module.id}
                        value={module.id}
                        className="border border-border rounded-lg overflow-hidden mb-2"
                    >
                        <AccordionTrigger className="px-4 py-3 bg-muted/50 hover:bg-muted hover:no-underline">
                            <div className="flex items-center gap-3 text-start">
                                <div>
                                    <p className="font-semibold text-foreground">
                                        {module.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {t('common.lessons_other', { count: module.lesson_count })}
                                    </p>
                                </div>
                            </div>
                        </AccordionTrigger>

                        <AccordionContent className="p-0">
                            <div className="divide-y divide-border bg-background">
                                {module.lessons?.map((lesson, index) => (
                                    <LessonRow
                                        key={lesson.id}
                                        lesson={lesson}
                                        index={index}
                                        isEnrolled={isEnrolled}
                                        onLessonClick={onLessonClick}
                                    />
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
