// src/features/video/hooks/useVideoStore.ts
// ─────────────────────────────────────────────────────────────
// Global Client State Layer — Zustand v5
//
// ONLY manages state that needs to persist across navigations:
//   • volume / mute / playback rate (localStorage-persisted)
//   • current video/lesson identity (cross-component awareness)
//   • PiP sync flag (global awareness)
//
// Vidstack owns ALL transient playback state (isPlaying, currentTime,
// duration, buffered, isLoading, error, isFullscreen). We never
// duplicate that here — Zustand is for cross-page settings only.
// ─────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { PlayerSettings } from '../types';

interface VideoStoreState extends PlayerSettings {
    // ── Identity ──────────────────────────────────────────
    /** ID of the currently loaded secure video */
    currentId: string | null;
    /** ID of the lesson the video belongs to */
    currentLessonId: string | null;

    // ── Global UI flags ───────────────────────────────────
    /** Whether the player is currently in Picture-in-Picture mode */
    isPiP: boolean;

    // ── Actions ───────────────────────────────────────────
    setVideo: (videoId: string, lessonId?: string) => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
    setPlaybackRate: (rate: number) => void;
    setPiP: (active: boolean) => void;
    resetPlayback: () => void;
}

export const useVideoStore = create<VideoStoreState>()(
    devtools(
        persist(
            (set) => ({
                // ── Initial State ─────────────────────────────
                currentId: null,
                currentLessonId: null,
                volume: 1.0,
                isMuted: false,
                playbackRate: 1.0,
                isPiP: false,

                // ── Actions ───────────────────────────────────

                /** Set the active video + optional lesson ID */
                setVideo: (id, lessonId) => set({
                    currentId: id,
                    currentLessonId: lessonId ?? null,
                }),

                /** Update volume (0–1). Auto-unmutes if > 0 */
                setVolume: (volume) => set({
                    volume,
                    isMuted: volume === 0,
                }),

                /** Toggle mute on/off */
                toggleMute: () => set((state) => ({
                    isMuted: !state.isMuted,
                })),

                /** Set playback speed multiplier */
                setPlaybackRate: (playbackRate) => set({ playbackRate }),

                /** Sync PiP state across the app */
                setPiP: (isPiP) => set({ isPiP }),

                /** Full reset when leaving the watch page */
                resetPlayback: () => set({
                    currentId: null,
                    currentLessonId: null,
                    isPiP: false,
                }),
            }),
            {
                name: 'video-store',
                version: 2,
                // Only persist user preferences, not transient identity
                partialize: (state) => ({
                    volume: state.volume,
                    isMuted: state.isMuted,
                    playbackRate: state.playbackRate,
                }),
                // Reset stale persisted values from v1
                migrate: (persisted, version) => {
                    if (version < 2) {
                        return {
                            ...(persisted as Record<string, unknown>),
                            volume: 1.0,
                            playbackRate: 1.0,
                            isMuted: false,
                        };
                    }
                    return persisted as VideoStoreState;
                },
            }
        ),
        { name: 'VideoStore' }
    )
);