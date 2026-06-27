// src/features/video/hooks/usePlayerSecurity.ts
// ─────────────────────────────────────────────────────────────
// Player Security Hook (SRP)
//
// Handles document/window-level security measures:
//   • Keyboard interception (save, print, devtools, view source)
//   • Screenshot combo interception (PrintScreen, Cmd+Shift+3/4/5)
//   • Right-click context menu blocking
//   • Drag/selection prevention
//   • Tab visibility change detection (screenshot mitigation)
//   • Window blur/focus detection (OBS/recording tool mitigation)
//
// This hook is player-agnostic — it works at the document level
// and doesn't depend on Vidstack or any specific player implementation.
// ─────────────────────────────────────────────────────────────

import { useEffect, useCallback, useRef, useState } from 'react';
import type { SecurityOptions } from '../types';

// ── DOM-level security for Vidstack's internal <video> element ──

/**
 * Obfuscates the video source from DevTools inspection and
 * third-party scripts without breaking Vidstack's internal
 * source management.
 *
 * IMPORTANT: We do NOT override `video.src` — Vidstack reads it
 * internally to detect source changes. Overriding it to return ''
 * causes Vidstack to think there's no source → black screen.
 *
 * Instead, we obfuscate `currentSrc` (read-only, used by DevTools)
 * and `getAttribute('src')` (used by DOM inspection).
 */
export function obfuscateVideoSrc(video: HTMLVideoElement): void {
    try {
        // Obfuscate currentSrc — used in DevTools "Elements" panel
        Object.defineProperty(video, 'currentSrc', {
            configurable: true,
            enumerable: false,
            get: () => '',
        });

        // Obfuscate getAttribute('src') — used by DOM inspectors
        const originalGetAttribute = video.getAttribute.bind(video);
        video.getAttribute = (name: string) => {
            if (name === 'src') return '';
            return originalGetAttribute(name);
        };
    } catch {
        // Graceful degradation — security layer is best-effort
    }
}

/**
 * Prevents common DOM-inspection vectors on the video element:
 * - Removes from the accessibility tree
 * - Blocks cloneNode to prevent copy-to-canvas attacks
 * Returns a cleanup function.
 */
export function lockVideoElement(video: HTMLVideoElement): () => void {
    video.setAttribute('aria-hidden', 'true');

    const originalClone = video.cloneNode.bind(video);
    (video as unknown as Record<string, unknown>).cloneNode = () => {
        return document.createElement('video');
    };

    return () => {
        (video as unknown as Record<string, unknown>).cloneNode = originalClone;
        video.removeAttribute('aria-hidden');
    };
}

/**
 * Enforces Picture-in-Picture prohibition through the JS API.
 * Returns a cleanup function.
 */
export function enforcePiPBlock(video: HTMLVideoElement): () => void {
    const handleEnteredPiP = () => {
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture().catch(() => {
                // Nothing more we can do
            });
        }
    };

    video.addEventListener('enterpictureinpicture', handleEnteredPiP);
    return () => video.removeEventListener('enterpictureinpicture', handleEnteredPiP);
}

// ── Visibility event dispatcher ─────────────────────────────

function dispatchVisibility(hidden: boolean): void {
    document.dispatchEvent(
        new CustomEvent('player:visibility', { detail: { hidden } })
    );
}

// ── Hook ────────────────────────────────────────────────────

export function usePlayerSecurity(options: SecurityOptions = {}) {
    const {
        blockSave = true,
        blockPrintScreen = true,
        blockPrint = true,
        blockViewSource = true,
        blockDevTools = true,
        blockContextMenu = true,
        blockDrag = true,
        blockSelection = true,
        blockVisibilityLeak = true,
        blockWindowBlur = true,
        blockScreenCapture = true,
        onSecurityEvent,
    } = options;

    // Stable ref so event callbacks never capture stale options
    const optsRef = useRef(options);
    optsRef.current = options;

    // ── Screenshot warning state ──────────────────────────
    const [screenshotWarning, setScreenshotWarning] = useState(false);
    const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /**
     * Attempts to wipe image data from the clipboard.
     * Called after screenshot keys are detected to destroy the captured image.
     */
    const wipeClipboard = useCallback(async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText('');
            }
        } catch {
            // Clipboard API may not be available or may require user gesture
        }
    }, []);

    /**
     * SCREENSHOT path: shows "تسجيل الشاشة غير مسموح" for 2 seconds.
     * Also pauses + blurs the video and wipes the clipboard.
     */
    const triggerScreenshotWarning = useCallback(() => {
        // Dispatch pause + blur
        dispatchVisibility(true);

        // Attempt to destroy the screenshot in clipboard
        wipeClipboard();

        // Show the warning overlay for 2 seconds
        setScreenshotWarning(true);
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        warningTimerRef.current = setTimeout(() => {
            setScreenshotWarning(false);
            dispatchVisibility(false);
        }, 2000);
    }, [wipeClipboard]);

    /**
     * WINDOW BLUR path: just blur for 1 second, then auto-recover.
     * No warning text, no pause — just a brief visual blur.
     */
    const triggerBlurOnly = useCallback(() => {
        dispatchVisibility(true);

        // Auto-recover after 1 second
        if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
        blurTimerRef.current = setTimeout(() => {
            dispatchVisibility(false);
        }, 1000);
    }, []);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
            if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
        };
    }, []);

    // ── Keyboard Interception ──────────────────────────────

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            const ctrl = e.ctrlKey || e.metaKey;
            const shift = e.shiftKey;
            const isMac = navigator.platform.toUpperCase().includes('MAC')
                || navigator.userAgent.toUpperCase().includes('MAC');

            // ── Save (Ctrl/Cmd+S) ─────────────────────────
            if (blockSave && ctrl && e.key === 's') {
                e.preventDefault();
                onSecurityEvent?.('block:save');
                return;
            }

            // ── PrintScreen ───────────────────────────────
            if (blockPrintScreen && e.key === 'PrintScreen') {
                e.preventDefault();
                triggerScreenshotWarning();
                onSecurityEvent?.('block:printscreen');
                return;
            }

            // ── Mac Screenshot Combos ─────────────────────
            // Cmd+Shift+3 (fullscreen screenshot)
            // Cmd+Shift+4 (region screenshot)
            // Cmd+Shift+5 (screen recording panel)
            if (blockScreenCapture && isMac && e.metaKey && shift) {
                if (e.key === '3' || e.key === '4' || e.key === '5') {
                    e.preventDefault();
                    triggerScreenshotWarning();
                    onSecurityEvent?.(`block:mac-screenshot-${e.key}`);
                    return;
                }
            }

            // ── Windows Snipping Tool (Win+Shift+S) ───────
            if (blockScreenCapture && shift && e.key === 'S' && e.getModifierState?.('Meta')) {
                e.preventDefault();
                triggerScreenshotWarning();
                onSecurityEvent?.('block:win-snip');
                return;
            }

            // ── Print (Ctrl/Cmd+P) ────────────────────────
            if (blockPrint && ctrl && e.key === 'p') {
                e.preventDefault();
                onSecurityEvent?.('block:print');
                return;
            }

            // ── View Source (Ctrl/Cmd+U) ──────────────────
            if (blockViewSource && ctrl && e.key === 'u') {
                e.preventDefault();
                onSecurityEvent?.('block:viewsource');
                return;
            }

            // ── DevTools (Ctrl/Cmd+Shift+I/J/C, F12) ─────
            if (blockDevTools && ctrl && shift && e.key === 'i') {
                e.preventDefault();
                onSecurityEvent?.('block:devtools-csi');
                return;
            }

            if (blockDevTools && ctrl && shift && e.key === 'j') {
                e.preventDefault();
                onSecurityEvent?.('block:devtools-csj');
                return;
            }

            if (blockDevTools && ctrl && shift && e.key === 'c') {
                e.preventDefault();
                onSecurityEvent?.('block:devtools-picker');
                return;
            }

            if (blockDevTools && e.key === 'F12') {
                e.preventDefault();
                onSecurityEvent?.('block:devtools-f12');
                return;
            }
        },
        [
            blockSave, blockPrintScreen, blockPrint, blockViewSource,
            blockDevTools, blockScreenCapture, onSecurityEvent,
            triggerScreenshotWarning,
        ]
    );

    // ── KeyUp Handler (PrintScreen fires on keyup, NOT keydown) ──
    //
    // Browsers do NOT fire `keydown` for PrintScreen reliably.
    // Chrome/Edge fire it on `keyup` only. We must listen to both.
    // Some browsers report key as 'PrintScreen', others as 'Snapshot'.

    const handleKeyUp = useCallback(
        (e: KeyboardEvent) => {
            if (!blockPrintScreen) return;

            const isPrintScreen =
                e.key === 'PrintScreen' ||
                e.key === 'Snapshot' ||
                e.code === 'PrintScreen' ||
                e.code === 'Snapshot';

            if (isPrintScreen) {
                e.preventDefault();
                triggerScreenshotWarning();
                onSecurityEvent?.('block:printscreen-keyup');
            }
        },
        [blockPrintScreen, triggerScreenshotWarning, onSecurityEvent]
    );

    // ── Context Menu ───────────────────────────────────────

    const handleContextMenu = useCallback((e: MouseEvent) => {
        e.preventDefault();
    }, []);

    // ── Drag Prevention ────────────────────────────────────

    const handleDragStart = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    // ── Selection Prevention ───────────────────────────────

    const handleSelectStart = useCallback((e: Event) => {
        e.preventDefault();
    }, []);

    // ── Tab Visibility (screenshot mitigation) ─────────────

    const handleVisibilityChange = useCallback(() => {
        if (!blockVisibilityLeak) return;
        dispatchVisibility(document.hidden);
    }, [blockVisibilityLeak]);

    // ── Window Blur/Focus (general focus loss) ───────────────
    //
    // When the user clicks outside the browser or alt-tabs,
    // we apply a brief 1-second blur overlay. No warning text,
    // no pause — just a visual deterrent that auto-clears.
    //
    // Screenshot tools (PrintScreen, beforeprint) use the
    // separate triggerScreenshotWarning path instead.

    const handleWindowBlur = useCallback(() => {
        if (!blockWindowBlur) return;
        triggerBlurOnly();
        onSecurityEvent?.('block:window-blur');
    }, [blockWindowBlur, onSecurityEvent, triggerBlurOnly]);

    const handleWindowFocus = useCallback(() => {
        if (!blockWindowBlur) return;
        // Clear blur immediately on focus return
        if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
        dispatchVisibility(false);
    }, [blockWindowBlur]);

    // ── Effect: global listeners ───────────────────────────

    // Keydown — catches Ctrl combos, F12, Mac shortcuts
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown, { capture: true });
        return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
    }, [handleKeyDown]);

    // Keyup — catches PrintScreen (browsers fire it on keyup, not keydown)
    useEffect(() => {
        window.addEventListener('keyup', handleKeyUp, { capture: true });
        return () => window.removeEventListener('keyup', handleKeyUp, { capture: true });
    }, [handleKeyUp]);

    // Clipboard monitoring — detect screenshot image data and wipe it
    useEffect(() => {
        if (!blockScreenCapture) return;

        const handleCopy = () => {
            // When any copy event fires while player is active, wipe clipboard
            wipeClipboard();
        };

        document.addEventListener('copy', handleCopy, { capture: true });
        return () => document.removeEventListener('copy', handleCopy, { capture: true });
    }, [blockScreenCapture, wipeClipboard]);

    useEffect(() => {
        if (!blockContextMenu) return;
        document.addEventListener('contextmenu', handleContextMenu, { capture: true });
        return () => document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    }, [blockContextMenu, handleContextMenu]);

    useEffect(() => {
        if (!blockDrag) return;
        document.addEventListener('dragstart', handleDragStart, { capture: true });
        return () => document.removeEventListener('dragstart', handleDragStart, { capture: true });
    }, [blockDrag, handleDragStart]);

    useEffect(() => {
        if (!blockSelection) return;
        document.addEventListener('selectstart', handleSelectStart, { capture: true });
        return () => document.removeEventListener('selectstart', handleSelectStart, { capture: true });
    }, [blockSelection, handleSelectStart]);

    useEffect(() => {
        if (!blockVisibilityLeak) return;
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [blockVisibilityLeak, handleVisibilityChange]);

    // Window blur/focus — catches OBS, Snipping Tool, etc.
    useEffect(() => {
        if (!blockWindowBlur) return;
        window.addEventListener('blur', handleWindowBlur);
        window.addEventListener('focus', handleWindowFocus);
        return () => {
            window.removeEventListener('blur', handleWindowBlur);
            window.removeEventListener('focus', handleWindowFocus);
        };
    }, [blockWindowBlur, handleWindowBlur, handleWindowFocus]);

    // beforeprint — some browsers fire this on PrintScreen / Ctrl+P
    useEffect(() => {
        if (!blockScreenCapture) return;

        const handleBeforePrint = () => {
            triggerScreenshotWarning();
            onSecurityEvent?.('block:beforeprint');
        };

        window.addEventListener('beforeprint', handleBeforePrint);
        return () => window.removeEventListener('beforeprint', handleBeforePrint);
    }, [blockScreenCapture, triggerScreenshotWarning, onSecurityEvent]);

    // ── Public API ─────────────────────────────────────────

    return {
        /** React handler for container's onContextMenu */
        onContextMenu: blockContextMenu
            ? (e: React.MouseEvent) => e.preventDefault()
            : undefined,

        /** React handler for container's onDragStart */
        onDragStart: blockDrag
            ? (e: React.DragEvent) => e.preventDefault()
            : undefined,

        /** True when screenshot warning overlay should be shown (auto-clears after 3s) */
        screenshotWarning,
    };
}