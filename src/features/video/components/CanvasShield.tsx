// src/features/video/components/CanvasShield.tsx
import i18n from '@/i18n';
// ─────────────────────────────────────────────────────────────
// Canvas Anti-Screenshot Shield (SRP)
//
// A transparent <canvas> overlay that paints near-invisible
// forensic text (username + email + timestamp) at random
// positions. The text is imperceptible during playback but
// becomes visible when a screenshot's contrast is adjusted.
//
// When the tab is hidden (recording detected), the canvas
// paints an opaque black rectangle with a warning message.
//
// Must be rendered INSIDE <MediaPlayer> as a sibling of
// <MediaProvider>, positioned above the video but below controls.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useCallback } from 'react';

interface CanvasShieldProps {
    /** Username for forensic fingerprint */
    username: string;
    /** Email for forensic fingerprint */
    email: string;
    /** Whether the tab/window is currently hidden */
    isHidden: boolean;
}

export function CanvasShield({ username, email, isHidden }: CanvasShieldProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);
    const posRef = useRef({ x: 0.2, y: 0.3 });
    const lastMoveRef = useRef(Date.now());

    // Randomize position every ~3 seconds
    const maybeUpdatePosition = useCallback(() => {
        const now = Date.now();
        if (now - lastMoveRef.current > 3000) {
            posRef.current = {
                x: 0.05 + Math.random() * 0.7,
                y: 0.05 + Math.random() * 0.7,
            };
            lastMoveRef.current = now;
        }
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: false });
        if (!ctx) return;

        function render() {
            if (!canvas || !ctx) return;

            // Sync canvas resolution with display size
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            const w = rect.width * dpr;
            const h = rect.height * dpr;

            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                ctx.scale(dpr, dpr);
            }

            ctx.clearRect(0, 0, rect.width, rect.height);

            if (isHidden) {
                // ── Hidden mode: opaque black with warning ──
                ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
                ctx.fillRect(0, 0, rect.width, rect.height);

                ctx.fillStyle = 'rgba(255, 80, 80, 0.9)';
                ctx.font = `bold ${Math.max(14, rect.width * 0.025)}px monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(
                    i18n.t('video.playbackPaused'),
                    rect.width / 2,
                    rect.height / 2
                );
            } else {
                // ── Normal mode: near-invisible forensic text ──
                maybeUpdatePosition();

                const x = posRef.current.x * rect.width;
                const y = posRef.current.y * rect.height;
                const timestamp = new Date().toISOString().slice(11, 19);
                const fingerprint = `${username} | ${email} | ${timestamp}`;

                // Opacity so low it's invisible to the naked eye
                // but recoverable by adjusting contrast in post
                ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
                ctx.font = `${Math.max(10, rect.width * 0.015)}px monospace`;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText(fingerprint, x, y);

                // Second copy at a different location for redundancy
                const x2 = ((posRef.current.x + 0.4) % 0.85) * rect.width;
                const y2 = ((posRef.current.y + 0.35) % 0.85) * rect.height;
                ctx.fillText(fingerprint, x2, y2);
            }

            rafRef.current = requestAnimationFrame(render);
        }

        rafRef.current = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(rafRef.current);
        };
    }, [username, email, isHidden, maybeUpdatePosition]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-40 pointer-events-none select-none"
            style={{ width: '100%', height: '100%' }}
            aria-hidden="true"
        />
    );
}
