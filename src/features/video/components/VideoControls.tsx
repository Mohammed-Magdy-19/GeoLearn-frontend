// src/features/video/components/VideoControls.tsx
// ─────────────────────────────────────────────────────────────
// Custom Stateful Responsive Video Controls (Option B)
//
// Changelog:
//   • 0. Zustand Store integration to manage low/medium-frequency state.
//   • 1. Added functional custom quality switching support.
//   • 2. Implemented resilient vendor-prefixed Safari / iOS Webkit fullscreen fallbacks.
//   • 3. Changed double-tap click labels to single-click play/pause wrapper mapping.
//   • 4. Added full touch scrubbing and slider drag interactions to ProgressBar.
//   • 5. Added listener to HTML5 video "progress" event to keep buffered size fresh.
//   • 6. Added Mobile volume control omission note (Mobile OS native slider policy).
//   • 7. Extracted child elements (ProgressBar, VolumeControl, SettingsMenu) and consolidated timer resets.
//   • 8. Handled keyboard listener shortcuts globally with input ignore checks.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useCallback } from 'react';
import {
    Play,
    Pause,
    RotateCcw,
    RotateCw,
    Maximize,
    Minimize,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVideoControlsStore } from '../hooks/useVideoControlsStore';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { SettingsMenu, type MinimalPlyr } from './SettingsMenu';

interface VideoControlsProps {
    video: HTMLVideoElement | null;
    plyr: MinimalPlyr | null | undefined;
    sources?: { src: string; quality: string }[];
    onQualityChange?: (quality: string) => void;
}

export function VideoControls({ video, plyr, sources, onQualityChange }: VideoControlsProps) {
    // Zustand selective bindings
    const isPlaying = useVideoControlsStore((s) => s.isPlaying);
    const isFullscreen = useVideoControlsStore((s) => s.isFullscreen);
    const controlsVisible = useVideoControlsStore((s) => s.controlsVisible);
    const isSettingsOpen = useVideoControlsStore((s) => s.isSettingsOpen);
    
    const setPlaying = useVideoControlsStore((s) => s.setPlaying);
    const setVolume = useVideoControlsStore((s) => s.setVolume);
    const setMuted = useVideoControlsStore((s) => s.setMuted);
    const setPlaybackRate = useVideoControlsStore((s) => s.setPlaybackRate);
    const setFullscreen = useVideoControlsStore((s) => s.setFullscreen);
    const setTracks = useVideoControlsStore((s) => s.setTracks);
    const setActiveTrackIndex = useVideoControlsStore((s) => s.setActiveTrackIndex);
    const setControlsVisible = useVideoControlsStore((s) => s.setControlsVisible);
    const setSettingsOpen = useVideoControlsStore((s) => s.setSettingsOpen);

    // Refs for high-frequency DOM nodes to prevent React re-renders (Performance #1 & #3)
    const playedBarRef = useRef<HTMLDivElement>(null);
    const bufferedBarRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const hoverTooltipRef = useRef<HTMLDivElement>(null);
    const currentTimeTextRef = useRef<HTMLDivElement>(null);
    const currentTimeTextMobileRef = useRef<HTMLDivElement>(null);
    const durationTextRef = useRef<HTMLDivElement>(null);
    const durationTextMobileRef = useRef<HTMLDivElement>(null);

    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Format Time utility
    const formatTime = useCallback((seconds: number): string => {
        if (isNaN(seconds) || seconds === Infinity) return '00:00';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hrs > 0) {
            return [
                hrs.toString().padStart(2, '0'),
                mins.toString().padStart(2, '0'),
                secs.toString().padStart(2, '0'),
            ].join(':');
        }
        return [
            mins.toString().padStart(2, '0'),
            secs.toString().padStart(2, '0'),
        ].join(':');
    }, []);

    // Timer toggles controls overlay visibility
    const resetHideTimeout = useCallback(() => {
        setControlsVisible(true);
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        if (!video || video.paused || isSettingsOpen) return;

        hideTimeoutRef.current = setTimeout(() => {
            setControlsVisible(false);
        }, 3000);
    }, [video, isSettingsOpen, setControlsVisible]);

    // Setup HTML5 event listeners (sync to Zustand store and direct DOM nodes)
    useEffect(() => {
        if (!video) return;

        const onPlay = () => setPlaying(true);
        const onPause = () => setPlaying(false);
        const onTimeUpdate = () => {
            const time = video.currentTime;
            const dur = video.duration || 0;
            const playedPct = dur > 0 ? (time / dur) * 100 : 0;

            let bufferedPct = 0;
            if (dur > 0 && video.buffered.length > 0) {
                const end = video.buffered.end(video.buffered.length - 1);
                bufferedPct = (end / dur) * 100;
            }

            // Imperative DOM updates bypassing React (Performance #1 & #3)
            requestAnimationFrame(() => {
                if (playedBarRef.current) playedBarRef.current.style.width = `${playedPct}%`;
                if (thumbRef.current) thumbRef.current.style.left = `calc(${playedPct}% - 7px)`;
                if (bufferedBarRef.current) bufferedBarRef.current.style.width = `${bufferedPct}%`;
                if (currentTimeTextRef.current) currentTimeTextRef.current.textContent = formatTime(time);
                if (currentTimeTextMobileRef.current) currentTimeTextMobileRef.current.textContent = formatTime(time);
                if (durationTextRef.current) durationTextRef.current.textContent = formatTime(dur);
                if (durationTextMobileRef.current) durationTextMobileRef.current.textContent = formatTime(dur);
            });
        };

        const onVolumeChange = () => {
            setVolume(video.volume);
            setMuted(video.muted);
        };

        const onRateChange = () => {
            setPlaybackRate(video.playbackRate);
        };

        const syncTracks = () => {
            const list = Array.from(video.textTracks || []).map((t) => ({
                label: t.label || t.language || 'Track',
                language: t.language || '',
            }));
            setTracks(list);
            const activeIdx = Array.from(video.textTracks || []).findIndex((t) => t.mode === 'showing');
            setActiveTrackIndex(activeIdx);
        };

        // Sync initial values
        setPlaying(!video.paused);
        setVolume(video.volume);
        setMuted(video.muted);
        setPlaybackRate(video.playbackRate);
        syncTracks();

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('progress', onTimeUpdate); // refresh buffers when downloading (Bugs #5)
        video.addEventListener('volumechange', onVolumeChange);
        video.addEventListener('ratechange', onRateChange);
        
        if (video.textTracks) {
            video.textTracks.addEventListener('change', syncTracks);
            video.textTracks.addEventListener('addtrack', syncTracks);
            video.textTracks.addEventListener('removetrack', syncTracks);
        }

        return () => {
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.removeEventListener('progress', onTimeUpdate);
            video.removeEventListener('volumechange', onVolumeChange);
            video.removeEventListener('ratechange', onRateChange);
            
            if (video.textTracks) {
                video.textTracks.removeEventListener('change', syncTracks);
                video.textTracks.removeEventListener('addtrack', syncTracks);
                video.textTracks.removeEventListener('removetrack', syncTracks);
            }
        };
    }, [video, setPlaying, setVolume, setMuted, setPlaybackRate, setTracks, setActiveTrackIndex, formatTime]);

    // Resilient vendor-prefixed Fullscreen management (Bugs #2)
    const getFullscreenElement = (): Element | null => {
        const doc = document as any;
        return (
            doc.fullscreenElement ||
            doc.webkitFullscreenElement ||
            doc.mozFullScreenElement ||
            doc.msFullscreenElement ||
            null
        );
    };

    useEffect(() => {
        const onFullscreenChange = () => {
            setFullscreen(!!getFullscreenElement());
        };

        document.addEventListener('fullscreenchange', onFullscreenChange);
        document.addEventListener('webkitfullscreenchange', onFullscreenChange);
        document.addEventListener('mozfullscreenchange', onFullscreenChange);
        document.addEventListener('MSFullscreenChange', onFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', onFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
            document.removeEventListener('mozfullscreenchange', onFullscreenChange);
            document.removeEventListener('MSFullscreenChange', onFullscreenChange);
        };
    }, [setFullscreen]);

    // Imperative actions
    const togglePlay = useCallback(() => {
        if (!video) return;
        if (video.paused) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }
    }, [video]);

    const skipTime = useCallback((amount: number) => {
        if (!video) return;
        video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + amount));
    }, [video]);

    const handleFullscreenToggle = useCallback(() => {
        const container = video?.closest('.relative.aspect-video');
        if (!container) return;

        const doc = document as any;
        const currentFs = getFullscreenElement();

        if (!currentFs) {
            if (container.requestFullscreen) {
                container.requestFullscreen().catch(() => {});
            } else if ((container as any).webkitRequestFullscreen) {
                (container as any).webkitRequestFullscreen();
            } else if ((container as any).mozRequestFullScreen) {
                (container as any).mozRequestFullScreen();
            } else if ((container as any).msRequestFullscreen) {
                (container as any).msRequestFullscreen();
            } else if (video && (video as any).webkitEnterFullscreen) {
                // iOS / Safari mobile video fallback
                (video as any).webkitEnterFullscreen();
            }
        } else {
            if (doc.exitFullscreen) {
                doc.exitFullscreen().catch(() => {});
            } else if (doc.webkitExitFullscreen) {
                doc.webkitExitFullscreen();
            } else if (doc.mozCancelFullScreen) {
                doc.mozCancelFullScreen();
            } else if (doc.msExitFullscreen) {
                doc.msExitFullscreen();
            }
        }
    }, [video]);

    // Keyboard navigation shortcuts (Accessibility #2)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeEl = document.activeElement;
            if (
                activeEl &&
                (activeEl.tagName === 'INPUT' ||
                    activeEl.tagName === 'TEXTAREA' ||
                    activeEl.hasAttribute('contenteditable'))
            ) {
                return;
            }

            switch (e.key) {
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    skipTime(-10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    skipTime(10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (video) {
                        const nextVolume = Math.min(1, video.volume + 0.05);
                        video.volume = nextVolume;
                        setVolume(nextVolume);
                        setMuted(nextVolume === 0);
                    }
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (video) {
                        const nextVolume = Math.max(0, video.volume - 0.05);
                        video.volume = nextVolume;
                        setVolume(nextVolume);
                        setMuted(nextVolume === 0);
                    }
                    break;
                case 'm':
                case 'M':
                    e.preventDefault();
                    if (video) {
                        const nextMuted = !video.muted;
                        video.muted = nextMuted;
                        setMuted(nextMuted);
                    }
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    handleFullscreenToggle();
                    break;
                case 'Escape':
                    if (isSettingsOpen) {
                        e.preventDefault();
                        setSettingsOpen(false);
                    }
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [video, isSettingsOpen, togglePlay, skipTime, setVolume, setMuted, setSettingsOpen, handleFullscreenToggle]);

    // Reset controls visibility timer
    useEffect(() => {
        resetHideTimeout();
        return () => {
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        };
    }, [resetHideTimeout, isPlaying]);

    // Handle single tap inside center overlay to toggle play (Bugs #3)
    const handleCenterOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            togglePlay();
        }
    };

    return (
        <div
            dir="ltr"
            className={cn(
                "absolute inset-0 z-10 flex flex-col justify-between p-4 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 pointer-events-none select-none",
                controlsVisible ? "opacity-100" : "opacity-0"
            )}
            onMouseMove={resetHideTimeout}
            onClick={resetHideTimeout}
        >
            {/* ── TOP BUTTONS OVERLAY (Mobile Layout Only) ──────────── */}
            <div className="flex items-center justify-between w-full pointer-events-auto sm:hidden" dir="ltr">
                {/* Speaker icon top-left */}
                {/* Note: Mobile OS policy manages volume natively, bottom slider is intentionally omitted on small screens */}
                <VolumeControl video={video} />

                {/* Settings & Fullscreen top-right */}
                <div className="flex items-center gap-2">
                    <SettingsMenu
                        video={video}
                        plyr={plyr}
                        sources={sources}
                        onQualityChange={onQualityChange}
                    />
                    <button
                        type="button"
                        onClick={handleFullscreenToggle}
                        className="p-2 text-white hover:bg-white/10 rounded-xl transition-all"
                        aria-label="Toggle Fullscreen"
                    >
                        {isFullscreen ? <Minimize className="size-6" /> : <Maximize className="size-6" />}
                    </button>
                </div>
            </div>

            {/* Empty space for middle click - Single-click center area to toggle play/pause */}
            <div
                className="flex-1 w-full pointer-events-auto cursor-pointer"
                onClick={handleCenterOverlayClick}
            />

            {/* ── BOTTOM CONTROLS & TIMELINE ───────────────────────── */}
            <div className="w-full flex flex-col gap-3 pointer-events-auto mt-auto" dir="ltr">
                {/* Progress Bar with Touch scrubbing and Imperative DOM refs */}
                <ProgressBar
                    video={video}
                    playedBarRef={playedBarRef}
                    bufferedBarRef={bufferedBarRef}
                    thumbRef={thumbRef}
                    hoverTooltipRef={hoverTooltipRef}
                    onScrub={resetHideTimeout}
                />

                {/* Desktop & Tablet Controls Layout */}
                <div className="hidden sm:flex items-center justify-between gap-4 w-full">
                    {/* Left controls */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => skipTime(-10)}
                            className="p-1.5 text-white hover:bg-white/10 rounded-xl transition-all"
                            aria-label="Skip Back 10 Seconds"
                        >
                            <RotateCcw className="size-[22px]" />
                        </button>

                        <button
                            type="button"
                            onClick={togglePlay}
                            className="p-1.5 text-white hover:bg-white/15 rounded-xl transition-all"
                            aria-label={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? <Pause className="size-6 fill-white" /> : <Play className="size-6 fill-white" />}
                        </button>

                        <button
                            type="button"
                            onClick={() => skipTime(10)}
                            className="p-1.5 text-white hover:bg-white/10 rounded-xl transition-all"
                            aria-label="Skip Forward 10 Seconds"
                        >
                            <RotateCw className="size-[22px]" />
                        </button>

                        <VolumeControl video={video} />

                        {/* Current Time / Duration (Updated imperatively) */}
                        <div className="text-sm font-mono text-neutral-300">
                            <span ref={currentTimeTextRef}>00:00</span>
                            <span className="text-neutral-500 mx-0.5">/</span>
                            <span ref={durationTextRef}>00:00</span>
                        </div>
                    </div>

                    {/* Right controls */}
                    <div className="flex items-center gap-3.5 relative">
                        <SettingsMenu
                            video={video}
                            plyr={plyr}
                            sources={sources}
                            onQualityChange={onQualityChange}
                        />

                        <button
                            type="button"
                            onClick={handleFullscreenToggle}
                            className="p-1.5 text-white hover:bg-white/10 rounded-xl transition-all"
                            aria-label="Toggle Fullscreen"
                        >
                            {isFullscreen ? <Minimize className="size-[22px]" /> : <Maximize className="size-[22px]" />}
                        </button>
                    </div>
                </div>

                {/* Mobile & Tablet Controls Layout */}
                <div className="flex sm:hidden items-center justify-between w-full">
                    {/* Current Time Left */}
                    <span ref={currentTimeTextMobileRef} className="text-xs font-mono text-neutral-300">
                        00:00
                    </span>

                    {/* Navigation buttons center */}
                    <div className="flex items-center gap-6">
                        <button
                            type="button"
                            onClick={() => skipTime(-10)}
                            className="p-2 text-white active:bg-white/10 rounded-full transition-all"
                            aria-label="Skip Back 10 Seconds"
                        >
                            <RotateCcw className="size-[22px]" />
                        </button>
                        <button
                            type="button"
                            onClick={togglePlay}
                            className="p-2.5 text-white active:bg-white/20 rounded-full transition-all bg-white/10"
                            aria-label={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? <Pause className="size-6 fill-white" /> : <Play className="size-6 fill-white" />}
                        </button>
                        <button
                            type="button"
                            onClick={() => skipTime(10)}
                            className="p-2 text-white active:bg-white/10 rounded-full transition-all"
                            aria-label="Skip Forward 10 Seconds"
                        >
                            <RotateCw className="size-[22px]" />
                        </button>
                    </div>

                    {/* Duration Time Right */}
                    <span ref={durationTextMobileRef} className="text-xs font-mono text-neutral-300">
                        00:00
                    </span>
                </div>
            </div>
        </div>
    );
}