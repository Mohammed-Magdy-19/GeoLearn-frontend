import React from 'react';
import { Play, Pause, RotateCcw, RotateCw } from 'lucide-react';

interface MobileControlsBarProps {
    isPlaying: boolean;
    togglePlay: () => void;
    skipTime: (amount: number) => void;
    currentTimeTextMobileRef: React.RefObject<HTMLDivElement | null>;
    durationTextMobileRef: React.RefObject<HTMLDivElement | null>;
}

export const MobileControlsBar = React.memo(function MobileControlsBar({
    isPlaying,
    togglePlay,
    skipTime,
    currentTimeTextMobileRef,
    durationTextMobileRef,
}: MobileControlsBarProps) {
    return (
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
    );
});
