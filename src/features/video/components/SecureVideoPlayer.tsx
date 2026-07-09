// src/features/video/components/SecureVideoPlayer.tsx
// ─────────────────────────────────────────────────────────────
// Secure Video Player — Pure Presentation Layer (SRP)
//
// This component ONLY handles rendering. All state management,
// bidirectional sync, security wiring, and progress tracking
// live in useSecurePlayer (DIP — depends on the abstraction).
// ─────────────────────────────────────────────────────────────

import { type ReactNode, useMemo } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSecurePlayer } from '../hooks/useSecurePlayer';
import { DynamicWatermark } from './DynamicWatermark';
import { MediaElSecurity } from './MediaElSecurity';
import { CanvasShield } from './CanvasShield';
import { PlayerLoadingState } from './PlayerLoadingState';
import { PlayerErrorState } from './PlayerErrorState';
import { PlayerEmptyState } from './PlayerEmptyState';
import { VideoControls } from './VideoControls';
import { Plyr } from 'plyr-react';
import '../plyr-theme.css';

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
        securityHandlers,
        videoEl,
        username,
        userEmail,
    } = useSecurePlayer({ videoId, lessonId, courseSlug, sessionToken });

    const displayTitle = meta?.title || title || 'Secure Media Stream';

    // Memoize options to make Plyr headless so we can render our custom controls overlay
    const plyrOptions = useMemo(() => ({
        controls: [], // Completely hide native controls
        settings: [], // Hide native settings
        keyboard: { global: false, focused: false }, // Let custom React overlay handle controls
        tooltips: { controls: false, seek: false },
        clickToPlay: false, // Let React double-tap/single-tap handle clicks
    }), []);

    // Memoize video source object to prevent unnecessary player re-renders
    const plyrSource = useMemo(() => {
        if (!secureSrc) return null;
        return {
            type: 'video' as const,
            title: displayTitle,
            sources: [
                {
                    src: secureSrc,
                    type: 'video/mp4',
                },
            ],
        };
    }, [secureSrc, displayTitle]);

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

    // ── Render: Plyr player with Custom Event-driven Controls ──

    return (
        <div
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
            {plyrSource && (
                <Plyr
                    ref={playerRef}
                    source={plyrSource}
                    options={plyrOptions}
                />
            )}

            {/* Custom responsive controller overlay */}
            <VideoControls video={videoEl} plyr={playerRef.current?.plyr} />

            {/* DOM-level security on the internal <video> element */}
            <MediaElSecurity video={videoEl} />

            {/* Canvas anti-screenshot shield — near-invisible forensic overlay */}
            <CanvasShield
                username={username}
                email={userEmail}
                isHidden={isTabHidden}
            />

            {/* Moving forensic watermark with email */}
            <DynamicWatermark username={username} email={userEmail} video={videoEl} />

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
        </div>
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