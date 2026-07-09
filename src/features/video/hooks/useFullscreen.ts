import { useEffect, useCallback } from 'react';
import { useVideoControlsStore } from './useVideoControlsStore';

export function useFullscreen(video: HTMLVideoElement | null) {
    const isFullscreen = useVideoControlsStore((s) => s.isFullscreen);
    const setFullscreen = useVideoControlsStore((s) => s.setFullscreen);

    const getFullscreenElement = useCallback((): Element | null => {
        const doc = document as any;
        return (
            doc.fullscreenElement ||
            doc.webkitFullscreenElement ||
            doc.mozFullScreenElement ||
            doc.msFullscreenElement ||
            null
        );
    }, []);

    const handleFullscreenToggle = useCallback(() => {
        const container = video?.closest('[data-video-container]');
        if (!container) return;

        const doc = document as any;
        const currentFs = getFullscreenElement();

        if (!currentFs) {
            if (container.requestFullscreen) {
                container.requestFullscreen().catch(() => {});
            } else if ((container as any).webkitRequestFullscreen) {
                (container as any).webkitRequestFullscreen();
            } else if ((container as any).mozRequestFullScreen) {
                (container as any).mozRequestFullScreen();
            } else if ((container as any).msRequestFullscreen) {
                (container as any).msRequestFullscreen();
            } else if (video && (video as any).webkitEnterFullscreen) {
                (video as any).webkitEnterFullscreen();
            }
        } else {
            if (doc.exitFullscreen) {
                doc.exitFullscreen().catch(() => {});
            } else if (doc.webkitExitFullscreen) {
                doc.webkitExitFullscreen();
            } else if (doc.mozCancelFullScreen) {
                doc.mozCancelFullScreen();
            } else if (doc.msExitFullscreen) {
                doc.msExitFullscreen();
            }
        }
    }, [video, getFullscreenElement]);

    useEffect(() => {
        const onFullscreenChange = () => {
            const activeFs = !!getFullscreenElement();
            setFullscreen(activeFs);

            if (activeFs) {
                // Lock screen orientation to landscape (flip screen horizontally) on mobile when entering fullscreen
                const orientation = window.screen?.orientation as any;
                if (orientation && orientation.lock) {
                    orientation.lock('landscape').catch(() => {
                        // Desktop browsers or unsupported platforms will fail gracefully
                    });
                }
            } else {
                // Unlock screen orientation when exiting fullscreen
                const orientation = window.screen?.orientation as any;
                if (orientation && orientation.unlock) {
                    orientation.unlock();
                }
            }
        };

        document.addEventListener('fullscreenchange', onFullscreenChange);
        document.addEventListener('webkitfullscreenchange', onFullscreenChange);
        document.addEventListener('mozfullscreenchange', onFullscreenChange);
        document.addEventListener('MSFullscreenChange', onFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', onFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
            document.removeEventListener('mozfullscreenchange', onFullscreenChange);
            document.removeEventListener('MSFullscreenChange', onFullscreenChange);
        };
    }, [setFullscreen, getFullscreenElement]);

    return {
        isFullscreen,
        handleFullscreenToggle,
    };
}
