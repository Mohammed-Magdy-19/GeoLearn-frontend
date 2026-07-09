import { useEffect } from 'react';
import { useVideoControlsStore } from './useVideoControlsStore';

export interface KeyboardShortcutsConfig {
    togglePlay: () => void;
    skipBackward: () => void;
    skipForward: () => void;
    volumeUp: () => void;
    volumeDown: () => void;
    toggleMute: () => void;
    toggleFullscreen: () => void;
}

export function useVideoKeyboardShortcuts(
    config: KeyboardShortcutsConfig
) {
    const isSettingsOpen = useVideoControlsStore((s) => s.isSettingsOpen);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeEl = document.activeElement;

            // Ignore global keys when focusing inputs, buttons, sliders, or selection dropdowns
            if (
                activeEl &&
                (activeEl.tagName === 'INPUT' ||
                    activeEl.tagName === 'TEXTAREA' ||
                    activeEl.tagName === 'BUTTON' ||
                    activeEl.tagName === 'SELECT' ||
                    activeEl.hasAttribute('contenteditable'))
            ) {
                return;
            }

            // Ignore global hotkeys if settings menu is open to prevent interface conflicts
            if (isSettingsOpen) {
                return;
            }

            switch (e.key) {
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    config.togglePlay();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    config.skipBackward();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    config.skipForward();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    config.volumeUp();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    config.volumeDown();
                    break;
                case 'm':
                case 'M':
                    e.preventDefault();
                    config.toggleMute();
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    config.toggleFullscreen();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [config, isSettingsOpen]);
}
