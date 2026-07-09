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
//   • 9. SOLID refactoring: extracted logic into 5 custom hooks and 3 subcomponents.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useVideoControlsStore } from '../hooks/useVideoControlsStore';
import { ProgressBar } from './ProgressBar';
import { MobileTopBar } from './MobileTopBar';
import { DesktopControlsBar } from './DesktopControlsBar';
import { MobileControlsBar } from './MobileControlsBar';
import { useVideoActions } from '../hooks/useVideoActions';
import { useFullscreen } from '../hooks/useFullscreen';
import { useControlsAutoHide } from '../hooks/useControlsAutoHide';
import { useVideoKeyboardShortcuts } from '../hooks/useVideoKeyboardShortcuts';
import { useVideoElementSync } from '../hooks/useVideoElementSync';
import type { VideoControlsProps, ImperativeRefs } from '../types/video-controls.types';

export function VideoControls({ video, plyr, sources, onQualityChange }: VideoControlsProps) {
    const isPlaying = useVideoControlsStore((s) => s.isPlaying);
    const controlsVisible = useVideoControlsStore((s) => s.controlsVisible);

    const [isMobileLayout, setIsMobileLayout] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isSmall = window.innerWidth < 1024 && isTouch;
            setIsMobileLayout(isSmall || window.innerWidth < 640);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Refs for high-frequency DOM nodes to prevent React re-renders (Performance #1 & #3)
    const playedBarRef = useRef<HTMLDivElement>(null);
    const bufferedBarRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const hoverTooltipRef = useRef<HTMLDivElement>(null);
    const currentTimeTextRef = useRef<HTMLDivElement>(null);
    const currentTimeTextMobileRef = useRef<HTMLDivElement>(null);
    const durationTextRef = useRef<HTMLDivElement>(null);
    const durationTextMobileRef = useRef<HTMLDivElement>(null);

    // Package refs into a stable bundle
    const refs: ImperativeRefs = useMemo(() => ({
        playedBarRef,
        bufferedBarRef,
        thumbRef,
        hoverTooltipRef,
        currentTimeTextRef,
        currentTimeTextMobileRef,
        durationTextRef,
        durationTextMobileRef,
    }), []);

    // Custom Hooks
    const { togglePlay, skipTime, setVideoVolume, setVideoMuted } = useVideoActions();
    const { isFullscreen, handleFullscreenToggle } = useFullscreen(video);
    const { resetHideTimeout } = useControlsAutoHide(video);

    useVideoElementSync(video, refs);

    // Keyboard navigation shortcuts configurations
    const shortcutsConfig = useMemo(() => ({
        togglePlay: () => togglePlay(video),
        skipBackward: () => skipTime(video, -10),
        skipForward: () => skipTime(video, 10),
        volumeUp: () => {
            if (video) {
                const nextVal = Math.min(1, video.volume + 0.05);
                setVideoVolume(video, nextVal);
            }
        },
        volumeDown: () => {
            if (video) {
                const nextVal = Math.max(0, video.volume - 0.05);
                setVideoVolume(video, nextVal);
            }
        },
        toggleMute: () => {
            if (video) {
                setVideoMuted(video, !video.muted);
            }
        },
        toggleFullscreen: handleFullscreenToggle,
    }), [video, togglePlay, skipTime, setVideoVolume, setVideoMuted, handleFullscreenToggle]);

    useVideoKeyboardShortcuts(shortcutsConfig);

    // Reset controls state store on unmount
    useEffect(() => {
        return () => {
            useVideoControlsStore.getState().resetStore();
        };
    }, []);

    // Handle single tap inside center overlay to toggle play (Bugs #3)
    const handleCenterOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            togglePlay(video);
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
            {isMobileLayout ? (
                <MobileTopBar
                    video={video}
                    plyr={plyr}
                    sources={sources}
                    onQualityChange={onQualityChange}
                    isFullscreen={isFullscreen}
                    handleFullscreenToggle={handleFullscreenToggle}
                    setVideoVolume={(val) => setVideoVolume(video, val)}
                    setVideoMuted={(muted) => setVideoMuted(video, muted)}
                />
            ) : (
                <div className="sm:hidden w-full">
                    <MobileTopBar
                        video={video}
                        plyr={plyr}
                        sources={sources}
                        onQualityChange={onQualityChange}
                        isFullscreen={isFullscreen}
                        handleFullscreenToggle={handleFullscreenToggle}
                        setVideoVolume={(val) => setVideoVolume(video, val)}
                        setVideoMuted={(muted) => setVideoMuted(video, muted)}
                    />
                </div>
            )}

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
                {isMobileLayout ? null : (
                    <div className="hidden sm:block w-full">
                        <DesktopControlsBar
                            video={video}
                            plyr={plyr}
                            sources={sources}
                            onQualityChange={onQualityChange}
                            isPlaying={isPlaying}
                            isFullscreen={isFullscreen}
                            togglePlay={() => togglePlay(video)}
                            skipTime={(amount) => skipTime(video, amount)}
                            handleFullscreenToggle={handleFullscreenToggle}
                            setVideoVolume={(val) => setVideoVolume(video, val)}
                            setVideoMuted={(muted) => setVideoMuted(video, muted)}
                            currentTimeTextRef={currentTimeTextRef}
                            durationTextRef={durationTextRef}
                        />
                    </div>
                )}

                {/* Mobile & Tablet Controls Layout */}
                {isMobileLayout ? (
                    <MobileControlsBar
                        isPlaying={isPlaying}
                        togglePlay={() => togglePlay(video)}
                        skipTime={(amount) => skipTime(video, amount)}
                        currentTimeTextMobileRef={currentTimeTextMobileRef}
                        durationTextMobileRef={durationTextMobileRef}
                    />
                ) : (
                    <div className="sm:hidden w-full">
                        <MobileControlsBar
                            isPlaying={isPlaying}
                            togglePlay={() => togglePlay(video)}
                            skipTime={(amount) => skipTime(video, amount)}
                            currentTimeTextMobileRef={currentTimeTextMobileRef}
                            durationTextMobileRef={durationTextMobileRef}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}