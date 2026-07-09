// src/features/video/components/SettingsMenu.tsx
// ─────────────────────────────────────────────────────────────
// SettingsMenu Component — Memoized Subcomponent (Performance #3)
// Handles nested menu states, focus trapping, and quality/speed toggles.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import { Settings, Check, ChevronRight } from 'lucide-react';
import { useVideoControlsStore } from '../hooks/useVideoControlsStore';

export const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
export const QUALITY_OPTIONS = ['Auto', '1080p', '720p', '480p'] as const;

export interface MinimalPlyr {
    speed: number;
    quality: string | number;
}

interface SettingsMenuProps {
    video: HTMLVideoElement | null;
    plyr: MinimalPlyr | null | undefined;
    sources?: { src: string; quality: string }[];
    onQualityChange?: (quality: string) => void;
}

export const SettingsMenu = React.memo(function SettingsMenu({
    video,
    plyr,
    sources,
    onQualityChange,
}: SettingsMenuProps) {
    const isSettingsOpen = useVideoControlsStore((s) => s.isSettingsOpen);
    const settingsMenu = useVideoControlsStore((s) => s.settingsMenu);
    const playbackRate = useVideoControlsStore((s) => s.playbackRate);
    const activeTrackIndex = useVideoControlsStore((s) => s.activeTrackIndex);
    const activeQuality = useVideoControlsStore((s) => s.activeQuality);
    const tracks = useVideoControlsStore((s) => s.tracks);

    const setSettingsOpen = useVideoControlsStore((s) => s.setSettingsOpen);
    const setSettingsMenu = useVideoControlsStore((s) => s.setSettingsMenu);
    const setPlaybackRate = useVideoControlsStore((s) => s.setPlaybackRate);
    const setActiveTrackIndex = useVideoControlsStore((s) => s.setActiveTrackIndex);
    const setActiveQuality = useVideoControlsStore((s) => s.setActiveQuality);

    const settingsRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    // Trap focus inside settings menu (Accessibility #3)
    useEffect(() => {
        if (!isSettingsOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSettingsOpen(false);
                triggerRef.current?.focus();
                return;
            }

            if (e.key === 'Tab' && settingsRef.current) {
                const focusableElements = settingsRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0] as HTMLElement;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isSettingsOpen, setSettingsOpen]);

    // Handle outside clicks to close the settings panel
    useEffect(() => {
        if (!isSettingsOpen) return;
        const handleOutsideClick = (e: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
                setSettingsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isSettingsOpen, setSettingsOpen]);

    // Return focus to the trigger button when closed (Accessibility #3)
    const prevOpenRef = useRef(isSettingsOpen);
    useEffect(() => {
        if (prevOpenRef.current && !isSettingsOpen) {
            triggerRef.current?.focus();
        }
        prevOpenRef.current = isSettingsOpen;
    }, [isSettingsOpen]);

    // Speed adjustment
    const selectSpeed = (rate: number) => {
        if (!video) return;
        video.playbackRate = rate;
        if (plyr) plyr.speed = rate;
        setPlaybackRate(rate);
        setSettingsOpen(false);
    };

    // Subtitle track selection
    const selectTrack = (index: number) => {
        if (!video) return;
        const textTrackList = Array.from(video.textTracks || []);
        textTrackList.forEach((track, idx) => {
            track.mode = idx === index ? 'showing' : 'disabled';
        });
        setActiveTrackIndex(index);
        setSettingsOpen(false);
    };

    // Quality selection with source swap (Bugs #1)
    const selectQuality = (quality: string) => {
        if (!video) return;
        setActiveQuality(quality);

        if (plyr) {
            try {
                plyr.quality = quality;
            } catch (err) {
                console.warn('Failed to set plyr quality natively:', err);
            }
        }

        // If custom source array is provided, let parent handle source swap
        if (sources && onQualityChange) {
            const currentTime = video.currentTime;
            const wasPlaying = !video.paused;
            
            onQualityChange(quality);

            // Re-sync time and play state after load
            const reSync = () => {
                video.currentTime = currentTime;
                if (wasPlaying) {
                    video.play().catch(() => {});
                }
                video.removeEventListener('loadedmetadata', reSync);
            };
            video.addEventListener('loadedmetadata', reSync);
        }

        setSettingsOpen(false);
    };

    return (
        <div className="relative" ref={settingsRef} dir="ltr">
            <button
                ref={triggerRef}
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setSettingsOpen(!isSettingsOpen);
                }}
                className="p-1.5 text-white hover:bg-white/10 rounded-xl transition-all"
                aria-label="Settings"
                aria-haspopup="true"
                aria-expanded={isSettingsOpen}
            >
                <Settings className="size-[22px]" />
            </button>

            {isSettingsOpen && (
                <div
                    className="absolute right-0 bottom-auto sm:bottom-12 top-12 sm:top-auto w-56 max-h-72 overflow-y-auto bg-neutral-950/95 border border-neutral-800 rounded-2xl p-1 z-[70] shadow-2xl pointer-events-auto backdrop-blur-md animate-in fade-in-0 slide-in-from-bottom-2 duration-150 scrollbar-hide text-white"
                    role="menu"
                >
                    {/* Main Settings Menu */}
                    {settingsMenu === 'main' && (
                        <div>
                            <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider px-3 py-2 border-b border-neutral-800/50">
                                Settings
                            </div>

                            {/* Playback Speed Menu trigger */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSettingsMenu('speed');
                                }}
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors text-left"
                                role="menuitem"
                            >
                                <span>Playback Speed</span>
                                <span className="text-xs text-neutral-400 flex items-center gap-1">
                                    {playbackRate === 1 ? 'Normal' : `${playbackRate}x`} <ChevronRight className="size-4 text-neutral-600" />
                                </span>
                            </button>

                            {/* Subtitles Menu trigger */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSettingsMenu('subtitles');
                                }}
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors text-left"
                                role="menuitem"
                            >
                                <span>Subtitles</span>
                                <span className="text-xs text-neutral-400 flex items-center gap-1">
                                    {activeTrackIndex === -1 ? 'Off' : (tracks[activeTrackIndex]?.label || tracks[activeTrackIndex]?.language || 'On')} <ChevronRight className="size-4 text-neutral-600" />
                                </span>
                            </button>

                            {/* Optional Quality Menu Trigger */}
                            {sources && sources.length > 0 && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSettingsMenu('quality');
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors text-left"
                                    role="menuitem"
                                >
                                    <span>Quality</span>
                                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                                        {activeQuality} <ChevronRight className="size-4 text-neutral-600" />
                                    </span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Speed Submenu */}
                    {settingsMenu === 'speed' && (
                        <div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSettingsMenu('main');
                                }}
                                className="w-full text-left text-xs text-neutral-500 font-bold px-3 py-2 border-b border-neutral-800/50 hover:text-white transition-colors"
                                aria-label="Back to main settings"
                            >
                                &lt; Back
                            </button>
                            {SPEED_OPTIONS.map((rate) => (
                                <button
                                    key={rate}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        selectSpeed(rate);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors text-left"
                                    role="menuitemradio"
                                    aria-checked={playbackRate === rate}
                                >
                                    <span>{rate === 1 ? 'Normal' : `${rate}x`}</span>
                                    {playbackRate === rate && <Check className="size-4 text-brand-primary" />}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Subtitles Submenu */}
                    {settingsMenu === 'subtitles' && (
                        <div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSettingsMenu('main');
                                }}
                                className="w-full text-left text-xs text-neutral-500 font-bold px-3 py-2 border-b border-neutral-800/50 hover:text-white transition-colors"
                                aria-label="Back to main settings"
                            >
                                &lt; Back
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    selectTrack(-1);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors text-left"
                                role="menuitemradio"
                                aria-checked={activeTrackIndex === -1}
                            >
                                <span>Off</span>
                                {activeTrackIndex === -1 && <Check className="size-4 text-brand-primary" />}
                            </button>
                            {tracks.map((track, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        selectTrack(idx);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors text-left"
                                    role="menuitemradio"
                                    aria-checked={activeTrackIndex === idx}
                                >
                                    <span>{track.label || track.language || `Track ${idx + 1}`}</span>
                                    {activeTrackIndex === idx && <Check className="size-4 text-brand-primary" />}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Quality Submenu */}
                    {settingsMenu === 'quality' && sources && (
                        <div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSettingsMenu('main');
                                }}
                                className="w-full text-left text-xs text-neutral-500 font-bold px-3 py-2 border-b border-neutral-800/50 hover:text-white transition-colors"
                                aria-label="Back to main settings"
                            >
                                &lt; Back
                            </button>
                            {QUALITY_OPTIONS.map((q) => (
                                <button
                                    key={q}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        selectQuality(q);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors text-left"
                                    role="menuitemradio"
                                    aria-checked={activeQuality === q}
                                >
                                    <span>{q}</span>
                                    {activeQuality === q && <Check className="size-4 text-brand-primary" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});
