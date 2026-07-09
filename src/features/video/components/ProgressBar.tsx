// src/features/video/components/ProgressBar.tsx
// ─────────────────────────────────────────────────────────────
// ProgressBar Component — Memoized Subcomponent (Performance #3)
// Handles touch and mouse scrubbing and hover time tooltips.
// ─────────────────────────────────────────────────────────────

import React, { useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
    video: HTMLVideoElement | null;
    playedBarRef: React.RefObject<HTMLDivElement | null>;
    bufferedBarRef: React.RefObject<HTMLDivElement | null>;
    thumbRef: React.RefObject<HTMLDivElement | null>;
    hoverTooltipRef: React.RefObject<HTMLDivElement | null>;
    onScrub: () => void;
}

export const ProgressBar = React.memo(function ProgressBar({
    video,
    playedBarRef,
    bufferedBarRef,
    thumbRef,
    hoverTooltipRef,
    onScrub,
}: ProgressBarProps) {
    const isDraggingRef = useRef(false);

    // Helpers to format time
    const formatTime = (seconds: number): string => {
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
    };

    // Calculate percentage from coordinate
    const getPercentFromEvent = useCallback((e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent, element: HTMLDivElement): number => {
        const rect = element.getBoundingClientRect();
        const clientX = 'touches' in e 
            ? (e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX ?? 0)
            : e.clientX;
        const offsetX = clientX - rect.left;
        return Math.max(0, Math.min(1, offsetX / rect.width));
    }, []);

    // Scrub helper
    const handleScrubAction = useCallback((e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent, element: HTMLDivElement) => {
        if (!video || !video.duration) return;
        const percent = getPercentFromEvent(e, element);
        video.currentTime = percent * video.duration;
        onScrub();

        // Perform fast local updates to track widths to make scrubbing feel instant
        const pct = percent * 100;
        if (playedBarRef.current) playedBarRef.current.style.width = `${pct}%`;
        if (thumbRef.current) thumbRef.current.style.left = `calc(${pct}% - 7px)`;
    }, [video, getPercentFromEvent, onScrub, playedBarRef, thumbRef]);

    // Mouse/Touch Hover Tooltip positioning
    const updateTooltip = useCallback((clientX: number, target: HTMLDivElement) => {
        if (!video || !video.duration || !hoverTooltipRef.current) return;
        const rect = target.getBoundingClientRect();
        const offsetX = clientX - rect.left;
        const percent = Math.max(0, Math.min(1, offsetX / rect.width));
        const time = percent * video.duration;

        requestAnimationFrame(() => {
            if (hoverTooltipRef.current) {
                hoverTooltipRef.current.textContent = formatTime(time);
                hoverTooltipRef.current.style.left = `${Math.min(rect.width - 20, Math.max(20, offsetX))}px`;
                hoverTooltipRef.current.style.opacity = '1';
            }
        });
    }, [video, hoverTooltipRef]);

    const hideTooltip = useCallback(() => {
        if (hoverTooltipRef.current) {
            hoverTooltipRef.current.style.opacity = '0';
        }
    }, [hoverTooltipRef]);

    // Mouse Interaction Handlers
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        updateTooltip(e.clientX, e.currentTarget);
        if (isDraggingRef.current) {
            handleScrubAction(e, e.currentTarget);
        }
    }, [updateTooltip, handleScrubAction]);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        isDraggingRef.current = true;
        handleScrubAction(e, e.currentTarget);

        const handleMouseUp = () => {
            isDraggingRef.current = false;
            window.removeEventListener('mouseup', handleMouseUp);
        };
        window.addEventListener('mouseup', handleMouseUp);
    }, [handleScrubAction]);

    // Touch Interaction Handlers (Bugs #4)
    const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        isDraggingRef.current = true;
        const touch = e.touches[0];
        if (touch) {
            updateTooltip(touch.clientX, e.currentTarget);
            handleScrubAction(e, e.currentTarget);
        }
    }, [updateTooltip, handleScrubAction]);

    const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        const touch = e.touches[0];
        if (touch) {
            updateTooltip(touch.clientX, e.currentTarget);
            if (isDraggingRef.current) {
                handleScrubAction(e, e.currentTarget);
            }
        }
    }, [updateTooltip, handleScrubAction]);

    const handleTouchEnd = useCallback(() => {
        isDraggingRef.current = false;
        hideTooltip();
    }, [hideTooltip]);

    return (
        <div className="relative group/progress py-1.5" dir="ltr">
            {/* Imperative Tooltip */}
            <div
                ref={hoverTooltipRef}
                className="absolute -top-7 bg-black/90 border border-neutral-800 text-white text-xs px-2 py-1 rounded shadow-md pointer-events-none font-mono z-50 whitespace-nowrap opacity-0 transition-opacity duration-150 -translate-x-1/2"
                style={{ left: '0px' }}
            >
                00:00
            </div>

            {/* Interactive Track Area */}
            <div
                className="relative w-full h-1.5 bg-white/20 hover:h-2 rounded-full cursor-pointer transition-all flex items-center"
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseLeave={hideTooltip}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Buffered Progress Segment */}
                <div
                    ref={bufferedBarRef}
                    className="absolute top-0 bottom-0 left-0 bg-white/20 rounded-full transition-all duration-150"
                    style={{ width: '0%' }}
                />

                {/* Played Progress Segment */}
                <div
                    ref={playedBarRef}
                    className="absolute top-0 bottom-0 left-0 rounded-full bg-brand-primary"
                    style={{ width: '0%' }}
                />

                {/* Scrubbing Thumb/Handle */}
                <div
                    ref={thumbRef}
                    className={cn(
                        "absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full shadow-lg scale-0 group-hover/progress:scale-100 transition-transform pointer-events-none bg-white border-2 border-brand-primary",
                        "max-sm:scale-100"
                    )}
                    style={{ left: 'calc(0% - 7px)' }}
                />
            </div>
        </div>
    );
});
