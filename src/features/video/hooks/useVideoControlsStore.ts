// src/features/video/hooks/useVideoControlsStore.ts
// ─────────────────────────────────────────────────────────────
// Video Controls Local Store — Zustand v5
//
// Documented Split (Zustand vs. useRef):
//   • Zustand manages low/medium-frequency state (isPlaying, volume, mute, Speed, CC, etc.)
//     to support selective rendering in subcomponents (ProgressBar, VolumeControl, SettingsMenu).
//   • useRef is reserved for high-frequency DOM manipulation (currentTime, bufferedPercent, progress bar hover)
//     to bypass React's render cycles and write directly to DOM elements.
// ─────────────────────────────────────────────────────────────

import { create } from 'zustand';

export interface TrackInfo {
    label: string;
    language: string;
}

interface VideoControlsState {
    isPlaying: boolean;
    volume: number;
    isMuted: boolean;
    playbackRate: number;
    isFullscreen: boolean;
    activeTrackIndex: number;
    activeQuality: string;
    tracks: TrackInfo[];
    controlsVisible: boolean;
    isSettingsOpen: boolean;
    settingsMenu: 'main' | 'speed' | 'subtitles' | 'quality';

    // Actions
    setPlaying: (isPlaying: boolean) => void;
    setVolume: (volume: number) => void;
    setMuted: (isMuted: boolean) => void;
    setPlaybackRate: (rate: number) => void;
    setFullscreen: (isFullscreen: boolean) => void;
    setActiveTrackIndex: (index: number) => void;
    setActiveQuality: (quality: string) => void;
    setTracks: (tracks: TrackInfo[]) => void;
    setControlsVisible: (visible: boolean) => void;
    setSettingsOpen: (open: boolean) => void;
    setSettingsMenu: (menu: 'main' | 'speed' | 'subtitles' | 'quality') => void;
    resetStore: () => void;
}

export const useVideoControlsStore = create<VideoControlsState>((set) => ({
    isPlaying: false,
    volume: 1.0,
    isMuted: false,
    playbackRate: 1.0,
    isFullscreen: false,
    activeTrackIndex: -1,
    activeQuality: 'Auto',
    tracks: [],
    controlsVisible: true,
    isSettingsOpen: false,
    settingsMenu: 'main',

    setPlaying: (isPlaying) => set({ isPlaying }),
    setVolume: (volume) => set({ volume }),
    setMuted: (isMuted) => set({ isMuted }),
    setPlaybackRate: (playbackRate) => set({ playbackRate }),
    setFullscreen: (isFullscreen) => set({ isFullscreen }),
    setActiveTrackIndex: (activeTrackIndex) => set({ activeTrackIndex }),
    setActiveQuality: (activeQuality) => set({ activeQuality }),
    setTracks: (tracks) => set({ tracks }),
    setControlsVisible: (controlsVisible) => set({ controlsVisible }),
    setSettingsOpen: (isSettingsOpen) => set(() => {
        if (!isSettingsOpen) {
            return { isSettingsOpen, settingsMenu: 'main' };
        }
        return { isSettingsOpen };
    }),
    setSettingsMenu: (settingsMenu) => set({ settingsMenu }),
    resetStore: () => set({
        isPlaying: false,
        volume: 1.0,
        isMuted: false,
        playbackRate: 1.0,
        isFullscreen: false,
        activeTrackIndex: -1,
        activeQuality: 'Auto',
        tracks: [],
        controlsVisible: true,
        isSettingsOpen: false,
        settingsMenu: 'main',
    }),
}));
