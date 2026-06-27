// src/features/video/hooks/useWatermark.ts
// ─────────────────────────────────────────────────────────────
// Dynamic Watermark Hook
// Handles position generation, visibility flashing, and time formatting.
// Extracted from DynamicWatermark for single responsibility.
//
// Uses a randomized setTimeout chain (NOT fixed setInterval) so
// each teleport delay is unpredictable — defeats pattern-based
// watermark removal in post-processing.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';
import type { WatermarkPosition } from '../types';

interface UseWatermarkOptions {
    /** Minimum interval between position changes in ms (default: 3000) */
    minIntervalMs?: number;
    /** Maximum interval between position changes in ms (default: 4000) */
    maxIntervalMs?: number;
    /** Flash duration in ms (default: 200) */
    flashDurationMs?: number;
}

/** Returns a random integer in [min, max] */
function randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function useWatermark(options: UseWatermarkOptions = {}) {
    const {
        minIntervalMs = 3000,
        maxIntervalMs = 4000,
        flashDurationMs = 200,
    } = options;

    const [position, setPosition] = useState<WatermarkPosition>({
        top: '20%',
        left: '20%',
    });
    const [isVisible, setIsVisible] = useState(true);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Random position within safe bounds (5%-75%)
    const generatePosition = useCallback((): WatermarkPosition => {
        const top = randomBetween(5, 75);
        const left = randomBetween(5, 75);
        return { top: `${top}%`, left: `${left}%` };
    }, []);

    // Flash effect: brief hide/show to defeat video editing
    const flash = useCallback(() => {
        setIsVisible(false);
        flashTimeoutRef.current = setTimeout(() => setIsVisible(true), flashDurationMs);
    }, [flashDurationMs]);

    // Randomized setTimeout chain — each tick picks a new random delay
    useEffect(() => {
        function scheduleTick() {
            const delay = randomBetween(minIntervalMs, maxIntervalMs);
            timeoutRef.current = setTimeout(() => {
                setPosition(generatePosition());
                flash();
                scheduleTick(); // Chain with a new random delay
            }, delay);
        }

        scheduleTick();

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
        };
    }, [minIntervalMs, maxIntervalMs, generatePosition, flash]);

    // Format seconds to HH:MM:SS
    const formatTime = useCallback((seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return [
            hrs.toString().padStart(2, '0'),
            mins.toString().padStart(2, '0'),
            secs.toString().padStart(2, '0'),
        ].join(':');
    }, []);

    return {
        position,
        isVisible,
        generatePosition,
        formatTime,
    };
}