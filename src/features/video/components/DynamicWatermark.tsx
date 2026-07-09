// src/features/video/components/DynamicWatermark.tsx
// ─────────────────────────────────────────────────────────────
// Moving Anti-Piracy Watermark — Pure Presentational (SRP + DIP)
//
// Deters screen recording by displaying real-time session parameters.
// All position/timing logic extracted to useWatermark hook.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWatermark } from '../hooks/useWatermark';

interface DynamicWatermarkProps {
    /** Username to display. Defaults to 'ANONYMOUS'. */
    username?: string;
    /** User email — will be partially masked for privacy. */
    email?: string;
    /** Raw HTMLVideoElement to read currentTime from */
    video: HTMLVideoElement | null;
}

/**
 * Partially masks an email: "user@example.com" → "u***@example.com"
 * Shows first char + *** + domain.
 */
function maskEmail(email: string): string {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***';
    return `${local[0]}***@${domain}`;
}

export function DynamicWatermark({ username = 'ANONYMOUS', email = '', video }: DynamicWatermarkProps) {
    const { t } = useTranslation();
    const { position, isVisible, formatTime } = useWatermark();
    const [currentTime, setCurrentTime] = useState(0);

    // Sync current time from the raw HTMLVideoElement event listener
    useEffect(() => {
        if (!video) return;

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [video]);

    const maskedEmail = maskEmail(email);

    return (
        <>
            {/* Moving watermark — teleports randomly every 3-4 seconds */}
            <div
                style={{
                    top: position.top,
                    left: position.left,
                    opacity: isVisible ? 0.15 : 0,
                    transition: 'all 0.7s ease-in-out, opacity 0.2s ease',
                }}
                className="absolute pointer-events-none select-none z-50 font-mono text-[10px] text-white bg-black/40 px-2 py-1 rounded tracking-widest backdrop-blur-sm"
            >
                <div className="flex flex-col gap-0.5">
                    <span className="font-semibold">{username}</span>
                    {maskedEmail && (
                        <span className="text-[8px] opacity-90">{maskedEmail}</span>
                    )}
                    <span className="text-[8px] opacity-80">
                        {formatTime(currentTime)}
                    </span>
                </div>
            </div>

            {/* Fixed center watermark — always visible, captured by any recording */}
            <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-[45]"
            >
                <p
                    className="text-white/[0.07] text-2xl sm:text-3xl font-bold font-mono tracking-wider select-none rotate-[-25deg]"
                >
                    {t('video.screenRecordingNotAllowed')}
                </p>
            </div>
        </>
    );
}