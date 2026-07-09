// src/features/video/components/MediaElSecurity.tsx
// ─────────────────────────────────────────────────────────────
// DOM-Level Video Element Security (SRP)
//
// Hardens the raw HTMLVideoElement (src obfuscation, clone block,
// PiP enforcement, download prevention).
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import {
    obfuscateVideoSrc,
    lockVideoElement,
    enforcePiPBlock,
} from '../hooks/usePlayerSecurity';

interface MediaElSecurityProps {
    video: HTMLVideoElement | null;
}

/**
 * Invisible component that applies DOM-level security to the internal <video> element.
 * Renders nothing — side-effect only.
 */
export function MediaElSecurity({ video }: MediaElSecurityProps) {
    const cleanupDomLockRef = useRef<(() => void) | null>(null);
    const cleanupPiPRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        // Clean up previous
        cleanupDomLockRef.current?.();
        cleanupPiPRef.current?.();

        if (!video) return;

        // Apply all DOM-level security measures
        obfuscateVideoSrc(video);
        cleanupDomLockRef.current = lockVideoElement(video);
        cleanupPiPRef.current = enforcePiPBlock(video);

        // Additional hardening attributes
        video.setAttribute('controlsList', 'nodownload nofullscreen noremoteplayback');
        video.setAttribute('disablePictureInPicture', '');
        video.setAttribute('disableRemotePlayback', '');

        return () => {
            cleanupDomLockRef.current?.();
            cleanupPiPRef.current?.();
            cleanupDomLockRef.current = null;
            cleanupPiPRef.current = null;
        };
    }, [video]);

    // Renders nothing — this is a side-effect-only component
    return null;
}

