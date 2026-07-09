// src/features/video/hooks/useSecurePlayer.ts
// ─────────────────────────────────────────────────────────────
// Secure Player Orchestration Hook (SRP)
//
// Single responsibility: wire all sub-hooks and bidirectional
// Plyr ↔ Zustand state sync into a clean return interface
// that SecureVideoPlayer can consume without knowing internals.
// ─────────────────────────────────────────────────────────────

import { useRef, useState, useEffect, useCallback } from 'react';
import type { APITypes } from 'plyr-react';
import { useVideoStore } from './useVideoStore';
import { useVideoData } from './useVideoData';
import { useSecureVideoPlayer } from './useSecureVideoPlayer';
import { useProgressTracker } from './useProgressTracker';
import { useAuthStore } from '@/store/useAuthStore';
import { usePlayerSecurity } from './usePlayerSecurity';

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
    /** Ref to attach to <Plyr> */
    playerRef: React.RefObject<APITypes | null>;
    /** Blob URL for Plyr src */
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
    /** Raw HTMLVideoElement from Plyr */
    videoEl: HTMLVideoElement | null;
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
    const playerRef = useRef<APITypes>(null);

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

    useEffect(() => {
        if (screenshotWarning) {
            try {
                playerRef.current?.plyr?.pause();
            } catch {
                // Player may be disposed during unmount
            }
        }
    }, [screenshotWarning]);

    // ── Play state for progress tracking ──────────────────────

    const [isPlaying, setIsPlaying] = useState(false);

    const getCurrentTime = useCallback(
        () => {
            try {
                return playerRef.current?.plyr?.currentTime ?? 0;
            } catch {
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

    // ── Plyr instance tracking and event sync ──────────────────

    const [plyrInstance, setPlyrInstance] = useState<any>(null);
    const hasInitializedRef = useRef(false);

    useEffect(() => {
        hasInitializedRef.current = false;
        setPlyrInstance(null);
    }, [secureSrc]);

    useEffect(() => {
        const checkInstance = () => {
            const plyr = playerRef.current?.plyr;
            if (plyr && typeof plyr.on === 'function' && plyr !== plyrInstance) {
                setPlyrInstance(plyr);
            }
        };

        checkInstance();
        const timer = setInterval(checkInstance, 200);
        return () => clearInterval(timer);
    }, [plyrInstance, secureSrc]);

    useEffect(() => {
        if (!plyrInstance) return;

        // Apply initial volume/muted/playbackRate once on ready
        if (!hasInitializedRef.current) {
            plyrInstance.volume = volume;
            plyrInstance.muted = isMuted;
            plyrInstance.speed = playbackRate;
            hasInitializedRef.current = true;
        }

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => {
            setIsPlaying(false);
            sendFinalProgress();
        };
        const onVolumeChange = () => {
            setVolume(plyrInstance.volume);
            if (plyrInstance.muted !== isMuted) {
                toggleMute();
            }
        };
        const onRateChange = () => {
            setPlaybackRate(plyrInstance.speed);
        };

        // Attach listeners
        plyrInstance.on('play', onPlay);
        plyrInstance.on('pause', onPause);
        plyrInstance.on('ended', onEnded);
        plyrInstance.on('volumechange', onVolumeChange);
        plyrInstance.on('ratechange', onRateChange);

        return () => {
            plyrInstance.off('play', onPlay);
            plyrInstance.off('pause', onPause);
            plyrInstance.off('ended', onEnded);
            plyrInstance.off('volumechange', onVolumeChange);
            plyrInstance.off('ratechange', onRateChange);
        };
    }, [
        plyrInstance,
        isMuted,
        volume,
        playbackRate,
        setVolume,
        toggleMute,
        setPlaybackRate,
        sendFinalProgress
    ]);

    // Expose raw HTMLVideoElement for DOM-level hardening
    const videoEl = plyrInstance?.media ?? null;

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
        videoEl,
        username,
        userEmail,
    };
}
