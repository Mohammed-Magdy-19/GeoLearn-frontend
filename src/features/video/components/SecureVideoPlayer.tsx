// src/features/video/components/SecureVideoPlayer.tsx
// ─────────────────────────────────────────────────────────────
// Secure Video Player — Pure Presentation Layer (SRP)
//
// This component ONLY handles rendering. All state management,
// bidirectional sync, security wiring, and progress tracking
// live in useSecurePlayer (DIP — depends on the abstraction).
//
// Security layers (inside → outside):
//   1. <MediaProvider>         — plays the blob URL
//   2. <MediaElSecurity>       — DOM-level video element hardening
//   3. <CanvasShield>          — invisible forensic canvas overlay
//   4. <DynamicWatermark>      — visible moving watermark
//   5. <VideoControls>         — custom player controls
//   6. <ScreenshotWarning>     — temporary warning overlay
//   7. Container blur filter   — harsh blur(60px) when hidden
//
// OCP: accepts `overlaySlot` + `children` for extension.
// ISP: only consumes what it renders.
// ─────────────────────────────────────────────────────────────

import type { ReactNode } from 'react';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSecurePlayer } from '../hooks/useSecurePlayer';
import { DynamicWatermark } from './DynamicWatermark';
import { VideoControls } from './VideoControls';
import { MediaElSecurity } from './MediaElSecurity';
import { CanvasShield } from './CanvasShield';
import { PlayerLoadingState } from './PlayerLoadingState';
import { PlayerErrorState } from './PlayerErrorState';
import { PlayerEmptyState } from './PlayerEmptyState';

// ── Props (ISP — only primitives the caller has) ─────────────

interface SecureVideoPlayerProps {
    /** Secure video ID from lesson metadata */
    videoId: string | null;
    /** Current lesson ID for progress tracking */
    lessonId?: string | null;
    /** Course slug for API calls */
    courseSlug?: string;
    /** Session token from lesson detail response */
    sessionToken?: string | null;
    /** Display title */
    title?: string;
    /** OCP — extensible overlay slot */
    overlaySlot?: ReactNode;
    /** OCP — children rendered inside the player container */
    children?: ReactNode;
}

export function SecureVideoPlayer({
    videoId,
    lessonId = null,
    courseSlug = '',
    sessionToken,
    title,
    overlaySlot,
    children,
}: SecureVideoPlayerProps) {
    // Single orchestration hook — all logic abstracted away (DIP)
    const {
        playerRef,
        secureSrc,
        meta,
        isSecureLoading,
        streamError,
        retry,
        isTabHidden,
        screenshotWarning,
        volume,
        isMuted,
        playbackRate,
        securityHandlers,
        handleCanPlay,
        handleVolumeChange,
        handleRateChange,
        handlePlay,
        handlePause,
        handleEnd,
        username,
        userEmail,
    } = useSecurePlayer({ videoId, lessonId, courseSlug, sessionToken });

    const displayTitle = meta?.title || title || 'Secure Media Stream';

    // ── Render: loading ─────────────────────────────────────────

    if (isSecureLoading) return <PlayerLoadingState />;

    // ── Render: error ───────────────────────────────────────────

    if (streamError) {
        return <PlayerErrorState message={streamError} onRetry={retry} />;
    }

    // ── Render: no source ───────────────────────────────────────

    if (!secureSrc) {
        return <PlayerEmptyState title={title} />;
    }

    // ── Render: Vidstack player ─────────────────────────────────

    return (
        <MediaPlayer
            ref={playerRef}
            src={{ src: secureSrc, type: 'video/mp4' }}
            title={displayTitle}
            playsInline
            onCanPlay={handleCanPlay}
            onVolumeChange={(event) => {
                // Vidstack MediaVolumeChange exposes volume/muted directly
                const vol = (event as unknown as Record<string, unknown>)?.volume ?? volume;
                const mut = (event as unknown as Record<string, unknown>)?.muted ?? isMuted;
                handleVolumeChange({ volume: vol as number, muted: mut as boolean });
            }}
            onRateChange={(event) => {
                // Vidstack may pass the rate directly or nested
                const raw = event as unknown;
                const rate = typeof raw === 'number' ? raw : ((raw as Record<string, unknown>)?.rate ?? playbackRate);
                handleRateChange({ rate: typeof rate === 'number' ? rate : playbackRate });
            }}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnd={handleEnd}
            className={[
                'relative aspect-video w-full overflow-hidden rounded-2xl',
                'bg-black select-none group border border-neutral-800 shadow-card',
            ].join(' ')}
            style={isTabHidden ? {
                filter: 'blur(60px) brightness(0)',
                transition: 'filter 0.1s ease',
            } : {
                filter: 'none',
                transition: 'filter 0.3s ease',
            }}
            onContextMenu={securityHandlers.onContextMenu}
            onDragStart={securityHandlers.onDragStart}
            draggable={false}
        >
            <MediaProvider />

            {/* DOM-level security on the internal <video> element */}
            <MediaElSecurity />

            {/* Canvas anti-screenshot shield — near-invisible forensic overlay */}
            <CanvasShield
                username={username}
                email={userEmail}
                isHidden={isTabHidden}
            />

            {/* Moving forensic watermark with email */}
            <DynamicWatermark username={username} email={userEmail} />

            {/* Custom controls */}
            <VideoControls />

            {/* Screenshot warning overlay — auto-fades after 3s */}
            {screenshotWarning && <ScreenshotWarning />}

            {/* Tab-hidden pause overlay */}
            {isTabHidden && <TabHiddenOverlay />}

            {/* OCP — extensible overlay slot */}
            {overlaySlot}

            {/* OCP — children slot */}
            {children}

            {/* Title badge — hover-visible */}
            <TitleBadge title={displayTitle} />
        </MediaPlayer>
    );
}

// ── Pure helper components (LSP — interchangeable, no side effects) ──

/** Screenshot warning overlay — centered Arabic text */
function ScreenshotWarning() {
    const { t } = useTranslation();
    return (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-200 pointer-events-none">
            <div className="flex flex-col items-center gap-3 text-center">
                <ShieldAlert className="size-10 text-red-500" />
                <p className="text-red-400 text-lg font-bold font-mono select-none">
                    {t('video.screenRecordingNotAllowed')}
                </p>
                <p className="text-neutral-500 text-xs font-mono select-none">
                    Screen capture is not allowed
                </p>
            </div>
        </div>
    );
}

/** Tab-hidden / window-blurred pause overlay */
function TabHiddenOverlay() {
    const { t } = useTranslation();
    return (
        <div className="absolute inset-0 z-[55] flex items-center justify-center bg-black/90 pointer-events-none">
            <p className="text-neutral-400 text-sm font-mono select-none animate-pulse">
                {t('video.playbackPaused')}
            </p>
        </div>
    );
}

/** Hover-visible title badge in the top-left corner */
function TitleBadge({ title }: { title: string }) {
    return (
        <div className="absolute top-4 left-4 z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span className="text-xs text-neutral-300 font-medium font-mono select-none truncate bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                {title}
            </span>
        </div>
    );
}