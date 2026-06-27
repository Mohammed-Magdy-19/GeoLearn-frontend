// src/features/video/hooks/useSecureVideoPlayer.ts
// ─────────────────────────────────────────────────────────────
// Secure Stream Lifecycle Hook (SRP)
//
// Sole responsibility: fetch a secure blob URL from the backend,
// manage its lifecycle (create / revoke), and provide a retry
// mechanism. Does NOT touch the <video> element at all — Vidstack
// owns the element. DOM-level security (src obfuscation, PiP
// enforcement) is applied separately via `useMediaElSecurity`.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchSecureVideoStream, cleanupVideoBlob } from '../../../services/api';

// ── Return type ─────────────────────────────────────────────

interface UseSecureVideoPlayerReturn {
    /** Blob URL ready to be passed to Vidstack `src` */
    secureSrc: string | null;
    /** True while the stream is being fetched */
    isSecureLoading: boolean;
    /** Human-readable error message if the stream failed */
    streamError: string | null;
    /** Re-attempt the stream fetch */
    retry: () => void;
}

// ── Hook ────────────────────────────────────────────────────

export function useSecureVideoPlayer(
    videoId: string | null,
    sessionToken?: string | null,
): UseSecureVideoPlayerReturn {
    const [secureSrc, setSecureSrc] = useState<string | null>(null);
    const [isSecureLoading, setIsSecureLoading] = useState(false);
    const [streamError, setStreamError] = useState<string | null>(null);

    // Track current blob for cleanup
    const currentBlobRef = useRef<string | null>(null);

    // ── Fetch Secure Stream ──────────────────────────────────

    const loadStream = useCallback(async () => {
        if (!videoId) return;

        setIsSecureLoading(true);
        setStreamError(null);

        try {
            const blobUrl = await fetchSecureVideoStream(videoId, sessionToken);

            // Revoke previous blob before assigning a new one
            if (currentBlobRef.current) {
                cleanupVideoBlob(currentBlobRef.current);
            }

            currentBlobRef.current = blobUrl;
            setSecureSrc(blobUrl);
        } catch (err) {
            const message = err instanceof Error
                ? err.message
                : 'Failed to load video';
            setStreamError(message);
        } finally {
            setIsSecureLoading(false);
        }
    }, [videoId, sessionToken]);

    // ── Initial Load & Cleanup ───────────────────────────────

    useEffect(() => {
        if (!videoId) {
            // No video — clean up any existing blob
            if (currentBlobRef.current) {
                cleanupVideoBlob(currentBlobRef.current);
                currentBlobRef.current = null;
            }
            setSecureSrc(null);
            return;
        }

        loadStream();

        return () => {
            if (currentBlobRef.current) {
                cleanupVideoBlob(currentBlobRef.current);
                currentBlobRef.current = null;
            }
            setSecureSrc(null);
        };
    }, [videoId, loadStream]);

    // ── Retry ────────────────────────────────────────────────

    const retry = useCallback(() => {
        if (currentBlobRef.current) {
            cleanupVideoBlob(currentBlobRef.current);
            currentBlobRef.current = null;
        }
        setSecureSrc(null);
        setStreamError(null);
        loadStream();
    }, [loadStream]);

    return { secureSrc, isSecureLoading, streamError, retry };
}