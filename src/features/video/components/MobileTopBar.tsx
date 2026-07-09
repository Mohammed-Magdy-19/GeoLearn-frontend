import React from 'react';
import { Minimize, Maximize } from 'lucide-react';
import { VolumeControl } from './VolumeControl';
import { SettingsMenu } from './SettingsMenu';
import type { VideoControlsProps } from '../types/video-controls.types';

interface MobileTopBarProps extends VideoControlsProps {
    isFullscreen: boolean;
    handleFullscreenToggle: () => void;
    setVideoVolume: (val: number) => void;
    setVideoMuted: (muted: boolean) => void;
}

export const MobileTopBar = React.memo(function MobileTopBar({
    video,
    plyr,
    sources,
    onQualityChange,
    isFullscreen,
    handleFullscreenToggle,
    setVideoVolume,
    setVideoMuted,
}: MobileTopBarProps) {
    return (
        <div className="flex items-center justify-between w-full pointer-events-auto sm:hidden" dir="ltr">
            {/* Speaker icon top-left */}
            <VolumeControl
                video={video}
                setVideoVolume={setVideoVolume}
                setVideoMuted={setVideoMuted}
            />

            {/* Settings & Fullscreen top-right */}
            <div className="flex items-center gap-2">
                <SettingsMenu
                    video={video}
                    plyr={plyr}
                    sources={sources}
                    onQualityChange={onQualityChange}
                />
                <button
                    type="button"
                    onClick={handleFullscreenToggle}
                    className="p-2 text-white hover:bg-white/10 rounded-xl transition-all"
                    aria-label="Toggle Fullscreen"
                >
                    {isFullscreen ? <Minimize className="size-6" /> : <Maximize className="size-6" />}
                </button>
            </div>
        </div>
    );
});
