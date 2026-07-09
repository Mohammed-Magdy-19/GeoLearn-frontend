import React from 'react';
import { Play, Pause, RotateCcw, RotateCw, Maximize, Minimize } from 'lucide-react';
import { VolumeControl } from './VolumeControl';
import { SettingsMenu } from './SettingsMenu';
import type { VideoControlsProps } from '../types/video-controls.types';

interface DesktopControlsBarProps extends VideoControlsProps {
    isPlaying: boolean;
    isFullscreen: boolean;
    togglePlay: () => void;
    skipTime: (amount: number) => void;
    handleFullscreenToggle: () => void;
    setVideoVolume: (val: number) => void;
    setVideoMuted: (muted: boolean) => void;
    currentTimeTextRef: React.RefObject<HTMLDivElement | null>;
    durationTextRef: React.RefObject<HTMLDivElement | null>;
}

export const DesktopControlsBar = React.memo(function DesktopControlsBar({
    video,
    plyr,
    sources,
    onQualityChange,
    isPlaying,
    isFullscreen,
    togglePlay,
    skipTime,
    handleFullscreenToggle,
    setVideoVolume,
    setVideoMuted,
    currentTimeTextRef,
    durationTextRef,
}: DesktopControlsBarProps) {
    return (
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

                <VolumeControl
                    video={video}
                    setVideoVolume={setVideoVolume}
                    setVideoMuted={setVideoMuted}
                />

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
    );
});
