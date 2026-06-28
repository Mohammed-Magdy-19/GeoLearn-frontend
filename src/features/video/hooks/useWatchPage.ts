// src/features/video/hooks/useWatchPage.ts
// ─────────────────────────────────────────────────────────────
// Watch Page Controller Hook (SRP)
//
// Single responsibility: orchestrate data fetching, navigation,
// and derived state for the WatchPage layout component.
//
// Also provides next-lesson navigation and access control.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useVideoStore } from './useVideoStore';
import { useEnrollmentStatus } from '@/features/courses/hooks/useCourseData';
import { useAuthStore } from '@/store/useAuthStore';
import api, { fetchLessonDetail } from '@/services/api';
import type { CourseDetail, LessonDetail, LessonAccessConfig } from '../types';
import { useProgressReport } from './useVideoData';

export function useWatchPage() {
    const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(lessonId || null);

    const resetPlayback = useVideoStore((state) => state.resetPlayback);
    const setVideo = useVideoStore((state) => state.setVideo);

    const { mutate: reportProgress } = useProgressReport(slug!);

    // ── Data Fetching ──────────────────────────────────────

    const {
        data: course,
        isLoading: isCourseLoading,
        error: courseError,
    } = useQuery<CourseDetail>({
        queryKey: ['course', slug],
        queryFn: async () => {
            const { data } = await api.get(`/courses/${slug}/`);
            return data;
        },
        enabled: !!slug,
        retry: 2,
    });

    const {
        data: lessonDetail,
        isLoading: isLessonLoading,
    } = useQuery<LessonDetail, Error>({
        queryKey: ['lesson', slug, selectedLessonId],
        queryFn: async (): Promise<LessonDetail> => {
            return await fetchLessonDetail(slug!, selectedLessonId!);
        },
        enabled: !!slug && !!selectedLessonId,
        retry: 1,
    });

    // ── Access Control (moved from WatchPage for SRP) ──────

    const { user } = useAuthStore();
    const { data: enrollmentStatus } = useEnrollmentStatus(course?.id || null);

    const accessConfig: LessonAccessConfig = {
        isPurchased: enrollmentStatus?.is_enrolled ?? false,
        isStaff: user?.is_staff ?? user?.is_superuser ?? false,
    };

    // ── Side Effects ───────────────────────────────────────

    // Set video in store when lesson detail loads
    useEffect(() => {
        if (lessonDetail?.video_metadata?.id) {
            setVideo(lessonDetail.video_metadata.id, lessonDetail.id);
        }
    }, [lessonDetail, setVideo]);

    // Cleanup on unmount
    useEffect(() => {
        return () => resetPlayback();
    }, [resetPlayback]);

    // Sync URL param with local state
    useEffect(() => {
        if (lessonId && lessonId !== selectedLessonId) {
            setSelectedLessonId(lessonId);
        }
    }, [lessonId, selectedLessonId]);

    // ── Navigation ─────────────────────────────────────────

    const handleLessonSelect = useCallback(
        (id: string) => {
            setSelectedLessonId(id);
            navigate(`/courses/${slug}/watch/${id}`, { replace: true });
        },
        [slug, navigate]
    );

    const handleBackToCourse = useCallback(() => {
        navigate(`/courses/${slug}`);
    }, [slug, navigate]);

    const handleBackToCourses = useCallback(() => {
        navigate('/courses');
    }, [navigate]);

    /** DIP — wrapped setVideo for LessonSidebar injection */
    const handleVideoSet = useCallback(
        (videoId: string, lessonVideoId: string) => {
            setVideo(videoId, lessonVideoId);
        },
        [setVideo]
    );

    // ── Derived State ──────────────────────────────────────────

    const currentModule = course?.modules.find((m) =>
        m.lessons.some((l) => l.id === selectedLessonId)
    );

    const currentLesson = lessonDetail;

    const isLoading = isCourseLoading || isLessonLoading;

    const hasError = !!courseError || !course;

    // ── Next Lesson Navigation ─────────────────────────────────

    /** Flat ordered list of all lessons across all modules */
    const allLessons = useMemo(() => {
        if (!course?.modules) return [];
        return course.modules
            .slice()
            .sort((a, b) => a.order_index - b.order_index)
            .flatMap((m) =>
                m.lessons
                    .slice()
                    .sort((a, b) => a.order_index - b.order_index)
            );
    }, [course?.modules]);

    /** The next lesson that has a video, or null if at the end */
    const nextLesson = useMemo(() => {
        if (!selectedLessonId || allLessons.length === 0) return null;
        const currentIdx = allLessons.findIndex((l) => l.id === selectedLessonId);
        if (currentIdx === -1) return null;
        // Find the next lesson with a video after the current one
        for (let i = currentIdx + 1; i < allLessons.length; i++) {
            if (allLessons[i].has_video) return allLessons[i];
        }
        return null;
    }, [selectedLessonId, allLessons]);

    const handleNextLesson = useCallback(() => {
        if (currentLesson && !currentLesson.progress?.is_completed) {
            const duration = currentLesson.duration_seconds || 1;

            // 1. Optimistically update ['course', slug] query cache
            const courseQueryKey = ['course', slug];
            const previousCourse = queryClient.getQueryData<CourseDetail>(courseQueryKey);
            if (previousCourse) {
                const updatedModules = previousCourse.modules.map((m) => {
                    const updatedLessons = m.lessons.map((l) => {
                        if (l.id === currentLesson.id) {
                            return {
                                ...l,
                                is_completed: true,
                                last_watched_second: duration,
                                progress: {
                                    last_watched_second: duration,
                                    is_completed: true,
                                },
                            };
                        }
                        return l;
                    });
                    return { ...m, lessons: updatedLessons };
                });
                queryClient.setQueryData<CourseDetail>(courseQueryKey, {
                    ...previousCourse,
                    modules: updatedModules,
                });
            }

            // 2. Report progress to server
            reportProgress({
                lesson_id: currentLesson.id,
                last_watched_second: duration,
            });
        }

        // 3. Navigate/load the next lesson
        if (nextLesson) {
            handleLessonSelect(nextLesson.id);
        }
    }, [slug, currentLesson, nextLesson, handleLessonSelect, reportProgress, queryClient]);

    return {
        // Data
        course,
        currentModule,
        currentLesson,
        selectedLessonId,
        nextLesson,

        // Access Control
        accessConfig,

        // Loading & Error
        isLoading,
        hasError,

        // Actions
        handleLessonSelect,
        handleNextLesson,
        handleBackToCourse,
        handleBackToCourses,
        handleVideoSet,
    };
}