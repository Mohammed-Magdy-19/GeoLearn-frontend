// src/features/video/hooks/useSecurePlayer.ts
// ─────────────────────────────────────────────────────────────
// Secure Player Orchestration Hook (SRP)
//
// Single responsibility: wire all sub-hooks and bidirectional
// Vidstack ↔ Zustand state sync into a clean return interface
// that SecureVideoPlayer can consume without knowing internals.
//
// This is the ONLY hook that touches useVideoStore, useVideoData,
// useSecureVideoPlayer, usePlayerSecurity, and useProgressTracker.
// The presentation component depends on this abstraction (DIP).
// ─────────────────────────────────────────────────────────────

import { useRef, useState, useEffect, useCallback } from 'react';
import type { MediaPlayerInstance } from '@vidstack/react';
import { useVideoStore } from './useVideoStore';
import { useVideoData } from './useVideoData';
import { useSecureVideoPlayer } from './useSecureVideoPlayer';
import { useProgressTracker } from './useProgressTracker';
import { useAuthStore } from '@/store/useAuthStore';
import {
    usePlayerSecurity,
} from './usePlayerSecurity';

// ── Props (ISP — callers only pass what they have) ───────────

interface UseSecurePlayerProps {
    videoId: string | null;
    lessonId: string | null;
    courseSlug: string;
    /** Session token from the lesson detail response — used for stream auth */
    sessionToken?: string | null;
}

// ── Return type ──────────────────────────────────────────────

export interface SecurePlayerState {
    /** Ref to attach to <MediaPlayer> */
    playerRef: React.RefObject<MediaPlayerInstance | null>;
    /** Blob URL for Vidstack src */
    secureSrc: string | null;
    /** Video metadata (title, duration, etc.) */
    meta: { title?: string; duration_seconds?: number } | undefined;
    /** Stream is loading */
    isSecureLoading: boolean;
    /** Stream error message */
    streamError: string | null;
    /** Retry the stream fetch */
    retry: () => void;
    /** True when tab is backgrounded or window is blurred */
    isTabHidden: boolean;
    /** True when screenshot warning should be displayed (auto-clears 3s) */
    screenshotWarning: boolean;
    /** Persisted volume (0–1) */
    volume: number;
    /** Persisted mute state */
    isMuted: boolean;
    /** Persisted playback rate */
    playbackRate: number;
    /** Security event handlers for the container element */
    securityHandlers: {
        onContextMenu?: (e: React.MouseEvent) => void;
        onDragStart?: (e: React.DragEvent) => void;
    };
    /** Callback for Vidstack's onCanPlay — syncs persisted settings */
    handleCanPlay: () => void;
    /** Callback for Vidstack's onVolumeChange */
    handleVolumeChange: (detail: { volume: number; muted: boolean }) => void;
    /** Callback for Vidstack's onRateChange */
    handleRateChange: (detail: { rate: number }) => void;
    /** Callback for Vidstack's onPlay */
    handlePlay: () => void;
    /** Callback for Vidstack's onPause */
    handlePause: () => void;
    /** Callback for Vidstack's onEnd */
    handleEnd: () => void;
    /** Current user's display name for watermark */
    username: string;
    /** Current user's email (partially masked) for watermark */
    userEmail: string;
}

// ── Hook ─────────────────────────────────────────────────────

export function useSecurePlayer({
    videoId,
    lessonId,
    courseSlug,
    sessionToken,
}: UseSecurePlayerProps): SecurePlayerState {
    const playerRef = useRef<MediaPlayerInstance>(null);

    // ── Tab visibility overlay ────────────────────────────────

    const [isTabHidden, setIsTabHidden] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent<{ hidden: boolean }>).detail;
            setIsTabHidden(detail.hidden);
        };
        document.addEventListener('player:visibility', handler);
        return () => document.removeEventListener('player:visibility', handler);
    }, []);

    // ── Zustand selectors (persisted settings) ────────────────

    const volume = useVideoStore((s) => s.volume);
    const isMuted = useVideoStore((s) => s.isMuted);
    const playbackRate = useVideoStore((s) => s.playbackRate);
    const setVolume = useVideoStore((s) => s.setVolume);
    const toggleMute = useVideoStore((s) => s.toggleMute);
    const setPlaybackRate = useVideoStore((s) => s.setPlaybackRate);
    const currentId = useVideoStore((s) => s.currentId);

    const { user } = useAuthStore();
    const username = user?.username ?? 'ANONYMOUS';
    const userEmail = user?.email ?? '';

    const activeVideoId = videoId || currentId;

    // ── Sub-hooks ─────────────────────────────────────────────

    const { secureSrc, isSecureLoading, streamError, retry } =
        useSecureVideoPlayer(activeVideoId, sessionToken);

    const { data: meta } = useVideoData(activeVideoId);

    const { onContextMenu, onDragStart, screenshotWarning } = usePlayerSecurity({
        blockSave: true,
        blockPrintScreen: true,
        blockPrint: true,
        blockViewSource: true,
        blockDevTools: true,
        blockContextMenu: true,
        blockDrag: true,
        blockSelection: true,
        blockVisibilityLeak: true,
        blockWindowBlur: true,
        blockScreenCapture: true,
    });

    // ── Auto-pause on screenshot detection only ─────────────────
    // Pause the player when a screenshot is actively detected.
    // Window blur (1s) does NOT pause — just visual blur.

    useEffect(() => {
        if (screenshotWarning) {
            try {
                playerRef.current?.pause();
            } catch {
                // Player may be disposed during unmount
            }
        }
    }, [screenshotWarning]);

    // ── Bidirectional Zustand ↔ Vidstack sync ─────────────────

    const handleCanPlay = useCallback(() => {
        const player = playerRef.current;
        if (!player) return;
        player.volume = volume;
        player.muted = isMuted;
        player.playbackRate = playbackRate;
    }, [volume, isMuted, playbackRate]);

    const handleVolumeChange = useCallback(
        (detail: { volume: number; muted: boolean }) => {
            setVolume(detail.volume);
            if (detail.muted !== isMuted) toggleMute();
        },
        [setVolume, isMuted, toggleMute]
    );

    const handleRateChange = useCallback(
        (detail: { rate: number }) => {
            setPlaybackRate(detail.rate);
        },
        [setPlaybackRate]
    );

    // ── Play state for progress tracking ──────────────────────

    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlay = useCallback(() => setIsPlaying(true), []);
    const handlePause = useCallback(() => setIsPlaying(false), []);

    const getCurrentTime = useCallback(
        () => {
            try {
                return playerRef.current?.currentTime ?? 0;
            } catch {
                // Vidstack player may be disposed during unmount/navigation,
                // causing internal getters to throw on null state.
                return 0;
            }
        },
        []
    );

    const { sendFinalProgress } = useProgressTracker({
        lessonId,
        courseSlug,
        duration: meta?.duration_seconds || 0,
        isPlaying,
        getCurrentTime,
    });

    // When the video ends, send a forced final progress report
    // to guarantee the backend marks the lesson as completed.
    const handleEnd = useCallback(() => {
        setIsPlaying(false);
        sendFinalProgress();
    }, [sendFinalProgress]);

    // ── Return ────────────────────────────────────────────────

    return {
        playerRef,
        secureSrc,
        meta,
        isSecureLoading,
        streamError,
        retry,
        isTabHidden,
        screenshotWarning,
        volume,
        isMuted,
        playbackRate,
        securityHandlers: { onContextMenu, onDragStart },
        handleCanPlay,
        handleVolumeChange,
        handleRateChange,
        handlePlay,
        handlePause,
        handleEnd,
        username,
        userEmail,
    };
}
