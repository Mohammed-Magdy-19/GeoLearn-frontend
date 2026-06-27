// src/features/video/hooks/useProgressTracker.ts
// ─────────────────────────────────────────────────────────────
// Progress Tracking Hook (SRP)
//
// Throttled progress reporting to the backend every 10 seconds.
// Reads currentTime from a callback (provided by the player
// component) rather than directly coupling to Zustand or Vidstack.
// This follows DIP — the hook depends on an abstraction (a
// function), not a concrete state library.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useCallback } from 'react';
import { useProgressReport } from './useVideoData';
import { BASE_URL } from '@/services/api';

interface UseProgressTrackerProps {
    /** ID of the current lesson */
    lessonId: string | null;
    /** Slug of the current course */
    courseSlug: string;
    /** Total duration in seconds */
    duration: number;
    /** Whether the video is currently playing */
    isPlaying: boolean;
    /** Function that returns the current playback time in seconds */
    getCurrentTime: () => number;
}

export function useProgressTracker({
    lessonId,
    courseSlug,
    duration,
    isPlaying,
    getCurrentTime,
}: UseProgressTrackerProps) {
    const { mutate: reportProgress } = useProgressReport(courseSlug);

    // Refs for tracking without re-renders
    const lastReportedRef = useRef(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isMountedRef = useRef(true);

    // Track mount status to prevent progress calls on disposed player
    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    // ── Regular progress report (throttled, 5-second threshold) ──

    const sendProgress = useCallback(() => {
        if (!lessonId || duration === 0 || !isMountedRef.current) return;

        const currentSecond = Math.floor(getCurrentTime());

        // Only report if position changed significantly (> 5 seconds)
        if (Math.abs(currentSecond - lastReportedRef.current) < 5) return;

        reportProgress({
            lesson_id: lessonId,
            last_watched_second: currentSecond,
        });

        lastReportedRef.current = currentSecond;
    }, [lessonId, duration, reportProgress, getCurrentTime]);

    // ── Final progress report (forced, no threshold) ──────────
    //    Called when the video ends to guarantee the backend
    //    receives the full duration and marks is_completed = true.

    const sendFinalProgress = useCallback(() => {
        if (!lessonId || duration === 0) return;

        const currentSecond = Math.floor(getCurrentTime());
        // Use whichever is larger — currentTime or the known duration
        const finalSecond = Math.max(currentSecond, Math.floor(duration));

        reportProgress({
            lesson_id: lessonId,
            last_watched_second: finalSecond,
        });

        lastReportedRef.current = finalSecond;
    }, [lessonId, duration, reportProgress, getCurrentTime]);

    // ── Set up throttled reporting interval ───────────────────

    useEffect(() => {
        if (!isPlaying || !lessonId) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Report immediately when starting
        sendProgress();

        // Then every 10 seconds
        intervalRef.current = setInterval(() => {
            sendProgress();
        }, 10000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isPlaying, lessonId, sendProgress]);

    // ── Report on beforeunload ────────────────────────────────

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (lessonId && isMountedRef.current) {
                try {
                    const time = getCurrentTime();
                    if (time > 0) {
                        // Use sendBeacon for reliable delivery on page close
                        const url = `${BASE_URL}/courses/progress/`;
                        const data = JSON.stringify({
                            lesson_id: lessonId,
                            last_watched_second: Math.floor(time),
                        });
                        navigator.sendBeacon?.(url, new Blob([data], { type: 'application/json' }));
                    }
                } catch {
                    // Player may be disposed — skip silently
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            // Don't call sendProgress in cleanup — player may already be disposed.
            // The beforeunload handler and interval-based reporting cover all cases.
        };
    }, [lessonId, getCurrentTime]);

    return { sendProgress, sendFinalProgress };
}