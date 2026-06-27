// src/features/courses/components/CourseInfoSidebar.tsx
// ─────────────────────────────────────────────────────────────
// Course Info Sidebar Component — Reusable sidebar with meta info and enrollment actions
// ─────────────────────────────────────────────────────────────

import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface CourseInfoSidebarProps {
    isPublished: boolean;
    moduleCount: number;
    lessonCount: number;
    priceEgp: number;
    isEnrolled: boolean;
    onEnroll: () => void;
    isEnrolling: boolean;
}

export function CourseInfoSidebar({
    isPublished,
    moduleCount,
    lessonCount,
    priceEgp,
    isEnrolled,
    onEnroll,
    isEnrolling,
}: CourseInfoSidebarProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            {/* Course Stats Card */}
            <div className="p-4 rounded-lg border border-border bg-card space-y-3">
                <h3 className="font-semibold text-foreground mb-4">{t("courses.courseInfo", "Course Info")}</h3>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("courses.status", "Status")}:</span>
                        <span className="font-medium text-foreground">
                            {isPublished ? <><Check className="size-3.5 inline text-brand-accent" /> {t("common.published")}</> : t("courses.underReview", "Under Review")}
                        </span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("courses.modules", "Modules")}:</span>
                        <span className="font-medium text-foreground">
                            {moduleCount}
                        </span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("courses.lessonsLabel", "Lessons")}:</span>
                        <span className="font-medium text-foreground">
                            {lessonCount}
                        </span>
                    </div>

                    <div className="flex justify-between text-sm pt-2 border-t border-border/50">
                        <span className="text-muted-foreground">{t("courses.price", "Price")}:</span>
                        <span className="font-semibold text-primary">
                            {priceEgp > 0
                                ? `${priceEgp.toLocaleString()} ${t("common.egp")}`
                                : t("common.free")}
                        </span>
                    </div>
                </div>
            </div>

            {/* Enrollment Status */}
            {!isEnrolled && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-3">
                    <p className="text-sm text-foreground">
                        {priceEgp > 0
                            ? t("courses.readyToStart", "Ready to start?")
                            : t("courses.startFreeNow", "Start learning for free now!")}
                    </p>
                    <Button
                        onClick={onEnroll}
                        disabled={isEnrolling}
                        className="w-full"
                        size="lg"
                    >
                        {isEnrolling ? t("courses.enrolling", "Enrolling...") : t("courses.enrollNow")}
                    </Button>
                </div>
            )}

            {isEnrolled && (
                <div className="p-4 rounded-lg bg-brand-accent/10 border border-brand-accent/20">
                    <p className="text-sm text-brand-accent font-medium flex items-center gap-1">
                        <Check className="size-4" /> {t("courses.alreadyEnrolled", "You are enrolled in this course")}
                    </p>
                </div>
            )}
        </div>
    );
}
