// src/features/video/components/MediaElSecurity.tsx
// ─────────────────────────────────────────────────────────────
// DOM-Level Video Element Security (SRP)
//
// Must be rendered INSIDE <MediaPlayer> to access Vidstack context.
// Uses useMediaProvider() to get the internal <video> element
// and applies anti-piracy hardening (src obfuscation, clone block,
// PiP enforcement, download prevention).
//
// Vidstack v1.x does NOT expose `onMediaEl` on <MediaPlayer>.
// This component is the correct pattern for element-level access.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { useMediaProvider, isVideoProvider } from '@vidstack/react';
import {
    obfuscateVideoSrc,
    lockVideoElement,
    enforcePiPBlock,
} from '../hooks/usePlayerSecurity';

/**
 * Invisible component that applies DOM-level security to Vidstack's
 * internal <video> element. Renders nothing — side-effect only.
 *
 * Uses isVideoProvider() type guard to narrow the provider type
 * before accessing the .video element.
 */
export function MediaElSecurity() {
    const provider = useMediaProvider();

    const cleanupDomLockRef = useRef<(() => void) | null>(null);
    const cleanupPiPRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        // Clean up previous
        cleanupDomLockRef.current?.();
        cleanupPiPRef.current?.();

        // Type guard: only proceed if this is a video provider
        if (!provider || !isVideoProvider(provider)) return;

        const video = provider.video;

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
    }, [provider]);

    // Renders nothing — this is a side-effect-only component
    return null;
}
