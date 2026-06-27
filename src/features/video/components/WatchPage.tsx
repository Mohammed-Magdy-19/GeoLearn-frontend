// src/features/video/components/WatchPage.tsx
// ─────────────────────────────────────────────────────────────
// Watch Page — Pure Layout Component (SRP)
//
// No direct store or query imports. All data, navigation, and
// access control are provided by the useWatchPage hook (DIP).
// ─────────────────────────────────────────────────────────────

import { useWatchPage } from '@/features/video/hooks/useWatchPage';
import { useCourseProgress } from '@/features/video/hooks/useCourseProgress';
import { SecureVideoPlayer } from '@/features/video/components/SecureVideoPlayer';
import { LessonSidebar } from '@/features/video/components/LessonSidebar';
import { VideoPlayerSkeleton } from '@/features/video/components/VideoPlayerSkeleton';
import { LessonInfoCard } from '@/features/video/components/LessonInfoCard';
import { WatchPageHeader } from '@/features/video/components/WatchPageHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';

export function WatchPage() {
    const {
        course,
        currentModule,
        currentLesson,
        selectedLessonId,
        nextLesson,
        accessConfig,
        isLoading,
        hasError,
        handleLessonSelect,
        handleNextLesson,
        handleBackToCourse,
        handleBackToCourses,
        handleVideoSet,
    } = useWatchPage();

    const { totalLessons, completedLessons, progressPercent } = useCourseProgress(
        course?.modules
    );

    // Loading state
    if (isLoading) {
        return (
            <main className="container max-w-7xl mx-auto min-h-screen py-8 px-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-1/3" />
                    <VideoPlayerSkeleton />
                </div>
            </main>
        );
    }

    // Error state
    if (hasError) {
        return (
            <main className="container max-w-7xl mx-auto min-h-screen py-8 px-4 flex items-center justify-center">
                <div className="text-center">
                    <BookOpen className="size-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-foreground">Course not found</h2>
                    <Button variant="outline" className="mt-4" onClick={handleBackToCourses}>
                        <ArrowLeft className="size-4 mr-2" /> Back to Courses
                    </Button>
                </div>
            </main>
        );
    }

    if (!course) return null;

    return (
        <main className="min-h-screen bg-background">
            {/* Top bar — extracted sub-component (SRP) */}
            <WatchPageHeader
                courseTitle={course.title}
                moduleTitle={currentModule?.title}
                lessonTitle={currentLesson?.title}
                completedLessons={completedLessons}
                totalLessons={totalLessons}
                progressPercent={progressPercent}
                onBack={handleBackToCourse}
            />

            {/* Main content */}
            <div className="container max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 min-w-0 space-y-4">
                        <SecureVideoPlayer
                            videoId={currentLesson?.video_metadata?.id || null}
                            lessonId={selectedLessonId}
                            courseSlug={course.slug}
                            sessionToken={currentLesson?.session_token}
                            title={currentLesson?.title}
                        />

                        {currentLesson && (
                            <LessonInfoCard
                                title={currentLesson.title}
                                description={currentLesson.description}
                                isFreePreview={currentLesson.is_free_preview}
                                durationDisplay={currentLesson.duration_display}
                                isCompleted={currentLesson.progress?.is_completed ?? false}
                                lessonFileUrl={currentLesson.lesson_file_url}
                                nextLessonTitle={nextLesson?.title}
                                onNextLesson={nextLesson ? handleNextLesson : undefined}
                            />
                        )}
                    </div>

                    <div className="lg:w-80 shrink-0">
                        <div className="sticky top-20">
                            <LessonSidebar
                                modules={course.modules}
                                currentLessonId={selectedLessonId}
                                courseSlug={course.slug}
                                onLessonSelect={handleLessonSelect}
                                onVideoSet={handleVideoSet}
                                accessConfig={accessConfig}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}