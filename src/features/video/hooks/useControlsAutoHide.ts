import { useEffect, useRef, useCallback } from 'react';
import { useVideoControlsStore } from './useVideoControlsStore';

export function useControlsAutoHide(video: HTMLVideoElement | null) {
    const isPlaying = useVideoControlsStore((s) => s.isPlaying);
    const isSettingsOpen = useVideoControlsStore((s) => s.isSettingsOpen);
    const setControlsVisible = useVideoControlsStore((s) => s.setControlsVisible);

    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const resetHideTimeout = useCallback(() => {
        setControlsVisible(true);
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        if (!video || video.paused || isSettingsOpen) return;

        hideTimeoutRef.current = setTimeout(() => {
            setControlsVisible(false);
        }, 3000);
    }, [video, isSettingsOpen, setControlsVisible]);

    useEffect(() => {
        resetHideTimeout();
        return () => {
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        };
    }, [resetHideTimeout, isPlaying]);

    return {
        resetHideTimeout,
    };
}
