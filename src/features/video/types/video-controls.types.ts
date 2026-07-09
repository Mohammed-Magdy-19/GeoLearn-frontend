import React from 'react';

export interface MinimalPlyr {
    speed: number;
    quality: string | number;
}

export interface VideoControlsProps {
    video: HTMLVideoElement | null;
    plyr: MinimalPlyr | null | undefined;
    sources?: { src: string; quality: string }[];
    onQualityChange?: (quality: string) => void;
}

export interface ImperativeRefs {
    playedBarRef: React.RefObject<HTMLDivElement | null>;
    bufferedBarRef: React.RefObject<HTMLDivElement | null>;
    thumbRef: React.RefObject<HTMLDivElement | null>;
    hoverTooltipRef: React.RefObject<HTMLDivElement | null>;
    currentTimeTextRef: React.RefObject<HTMLDivElement | null>;
    currentTimeTextMobileRef: React.RefObject<HTMLDivElement | null>;
    durationTextRef: React.RefObject<HTMLDivElement | null>;
    durationTextMobileRef: React.RefObject<HTMLDivElement | null>;
}
