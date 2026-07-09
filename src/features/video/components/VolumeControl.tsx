// src/features/video/components/VolumeControl.tsx
// ─────────────────────────────────────────────────────────────
// VolumeControl Component — Memoized Subcomponent (Performance #3)
// Subscribes only to Zustand volume/mute slices to prevent global renders.
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { useVideoControlsStore } from '../hooks/useVideoControlsStore';

interface VolumeControlProps {
    video: HTMLVideoElement | null;
}

export const VolumeControl = React.memo(function VolumeControl({ video }: VolumeControlProps) {
    const volume = useVideoControlsStore((s) => s.volume);
    const isMuted = useVideoControlsStore((s) => s.isMuted);
    const setVolume = useVideoControlsStore((s) => s.setVolume);
    const setMuted = useVideoControlsStore((s) => s.setMuted);

    const [isVolumeHovered, setIsVolumeHovered] = useState(false);

    const handleVolumeToggle = () => {
        if (!video) return;
        const newMuteState = !isMuted;
        video.muted = newMuteState;
        setMuted(newMuteState);
    };

    const handleVolumeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!video) return;
        const val = parseFloat(e.target.value);
        video.volume = val;
        video.muted = val === 0;
        setVolume(val);
        setMuted(val === 0);
    };

    const VolumeIcon = isMuted || volume === 0
        ? VolumeX
        : volume < 0.5
            ? Volume1
            : Volume2;

    const volumePercent = isMuted ? 0 : volume * 100;

    return (
        <div
            dir="ltr"
            className="flex items-center"
            onMouseEnter={() => setIsVolumeHovered(true)}
            onMouseLeave={() => setIsVolumeHovered(false)}
        >
            <button
                type="button"
                onClick={handleVolumeToggle}
                className="p-1.5 text-white hover:bg-white/10 rounded-xl transition-all"
                aria-label="Toggle Mute"
            >
                <VolumeIcon className="size-[22px]" />
            </button>
            <div
                style={{
                    maxWidth: isVolumeHovered ? '5rem' : '0px',
                    opacity: isVolumeHovered ? 1 : 0,
                    marginLeft: isVolumeHovered ? '0.5rem' : '0px',
                    transition: 'max-width 300ms ease, opacity 300ms ease, margin-left 300ms ease',
                    overflow: 'hidden',
                }}
            >
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeSliderChange}
                    className="w-20 h-1 rounded-lg appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
                    style={{
                        background: `linear-gradient(to right, #D45B34 ${volumePercent}%, rgba(255,255,255,0.2) ${volumePercent}%)`,
                    }}
                    aria-label="Volume Slider"
                />
            </div>
        </div>
    );
});
