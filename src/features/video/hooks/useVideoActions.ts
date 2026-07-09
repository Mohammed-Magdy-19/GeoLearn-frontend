import { useCallback } from 'react';
import { useVideoControlsStore } from './useVideoControlsStore';

export function useVideoActions() {
    const setPlaying = useVideoControlsStore((s) => s.setPlaying);
    const setVolume = useVideoControlsStore((s) => s.setVolume);
    const setMuted = useVideoControlsStore((s) => s.setMuted);

    const togglePlay = useCallback((video: HTMLVideoElement | null) => {
        if (!video) return;
        if (video.paused) {
            video.play().catch(() => {});
            setPlaying(true);
        } else {
            video.pause();
            setPlaying(false);
        }
    }, [setPlaying]);

    const skipTime = useCallback((video: HTMLVideoElement | null, amount: number) => {
        if (!video) return;
        video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + amount));
    }, []);

    const setVideoVolume = useCallback((video: HTMLVideoElement | null, val: number) => {
        if (!video) return;
        const normalizedVal = Math.max(0, Math.min(1, val));
        video.volume = normalizedVal;
        const targetMute = normalizedVal === 0;
        video.muted = targetMute;
        setVolume(normalizedVal);
        setMuted(targetMute);
    }, [setVolume, setMuted]);

    const setVideoMuted = useCallback((video: HTMLVideoElement | null, muted: boolean) => {
        if (!video) return;
        video.muted = muted;
        setMuted(muted);
    }, [setMuted]);

    return {
        togglePlay,
        skipTime,
        setVideoVolume,
        setVideoMuted,
    };
}
