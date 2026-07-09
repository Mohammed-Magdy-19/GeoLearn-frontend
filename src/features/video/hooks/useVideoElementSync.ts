import { useEffect } from 'react';
import { useVideoControlsStore } from './useVideoControlsStore';
import type { ImperativeRefs } from '../types/video-controls.types';
import { formatTime } from '../utils/formatTime';

export function useVideoElementSync(
    video: HTMLVideoElement | null,
    refs: ImperativeRefs
) {
    const setPlaying = useVideoControlsStore((s) => s.setPlaying);
    const setVolume = useVideoControlsStore((s) => s.setVolume);
    const setMuted = useVideoControlsStore((s) => s.setMuted);
    const setPlaybackRate = useVideoControlsStore((s) => s.setPlaybackRate);
    const setTracks = useVideoControlsStore((s) => s.setTracks);
    const setActiveTrackIndex = useVideoControlsStore((s) => s.setActiveTrackIndex);

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
                if (refs.playedBarRef.current) refs.playedBarRef.current.style.width = `${playedPct}%`;
                if (refs.thumbRef.current) refs.thumbRef.current.style.left = `calc(${playedPct}% - 7px)`;
                if (refs.bufferedBarRef.current) refs.bufferedBarRef.current.style.width = `${bufferedPct}%`;
                if (refs.currentTimeTextRef.current) refs.currentTimeTextRef.current.textContent = formatTime(time);
                if (refs.currentTimeTextMobileRef.current) refs.currentTimeTextMobileRef.current.textContent = formatTime(time);
                if (refs.durationTextRef.current) refs.durationTextRef.current.textContent = formatTime(dur);
                if (refs.durationTextMobileRef.current) refs.durationTextMobileRef.current.textContent = formatTime(dur);
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
        video.addEventListener('progress', onTimeUpdate); // refresh buffers when downloading
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
    }, [video, refs, setPlaying, setVolume, setMuted, setPlaybackRate, setTracks, setActiveTrackIndex]);
}
