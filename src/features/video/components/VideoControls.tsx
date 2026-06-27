// src/features/video/components/VideoControls.tsx
// ─────────────────────────────────────────────────────────────
// Custom Video Controls — Vidstack Primitives + Tailwind
//
// ISP: Each sub-component (PlayBtn, VolumeControl, etc.) only
//      receives the exact primitives it needs via Vidstack context.
// LSP: All custom wrappers forward Vidstack's original attributes.
// OCP: Controls accept `extraControls` slot for injection.
//
// NOTES:
//   • SpeedMenu uses a locally-positioned popup (NOT a portal)
//     so it remains visible in fullscreen mode.
//   • Skip buttons use useMediaRemote().seek() for ±10 sec jumps.
// ─────────────────────────────────────────────────────────────

import { type ReactNode, useCallback, useState, useRef, useEffect } from 'react';
import {
    Controls,
    PlayButton,
    MuteButton,
    FullscreenButton,
    TimeSlider,
    VolumeSlider,
    Time,
    useMediaState,
    useMediaRemote,
    Gesture,
} from '@vidstack/react';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Volume1,
    Maximize,
    Minimize,
    Loader2,
    Check,
    RotateCcw,
    RotateCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Playback rate options ───────────────────────────────────

const RATE_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0] as const;

// ── Shared control button styles ────────────────────────────

const CONTROL_BTN_CLASS = cn(
    'inline-flex items-center justify-center',
    'text-white hover:bg-white/15 rounded-xl h-9 w-9',
    'transition-all duration-200 active:scale-90',
    'outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50'
);

// ── Sub-components (ISP — each takes only what it needs) ────

/**
 * Play/Pause button using Vidstack's PlayButton primitive.
 * Reads waiting state for loading spinner.
 */
function PlayBtn() {
    const isPaused = useMediaState('paused');
    const isWaiting = useMediaState('waiting');

    return (
        <PlayButton
            className={CONTROL_BTN_CLASS}
            aria-label={isPaused ? 'Play' : 'Pause'}
        >
            {isWaiting ? (
                <Loader2 className="size-5 animate-spin text-brand-primary" />
            ) : isPaused ? (
                <Play className="size-5 fill-white ml-0.5" />
            ) : (
                <Pause className="size-5 fill-white" />
            )}
        </PlayButton>
    );
}

/**
 * Skip backward 10 seconds.
 */
function SkipBackward() {
    const remote = useMediaRemote();
    const currentTime = useMediaState('currentTime');

    const handleClick = useCallback(() => {
        remote.seek(Math.max(0, currentTime - 10));
    }, [remote, currentTime]);

    return (
        <button
            type="button"
            className={CONTROL_BTN_CLASS}
            aria-label="Skip backward 10 seconds"
            onClick={handleClick}
        >
            <RotateCcw className="size-[18px]" />
        </button>
    );
}

/**
 * Skip forward 10 seconds.
 */
function SkipForward() {
    const remote = useMediaRemote();
    const currentTime = useMediaState('currentTime');
    const duration = useMediaState('duration');

    const handleClick = useCallback(() => {
        remote.seek(Math.min(duration, currentTime + 10));
    }, [remote, currentTime, duration]);

    return (
        <button
            type="button"
            className={CONTROL_BTN_CLASS}
            aria-label="Skip forward 10 seconds"
            onClick={handleClick}
        >
            <RotateCw className="size-[18px]" />
        </button>
    );
}

/**
 * Volume control with mute toggle and slider.
 * ISP: only reads volume/muted state from Vidstack context.
 *
 * Uses pure Tailwind for layout. Vidstack sets --slider-fill (0%-100%)
 * on the slider root — we use it for the track fill width and thumb position.
 */
function VolumeControl() {
    const volumeVal = useMediaState('volume');
    const isMuted = useMediaState('muted');

    const VolumeIcon = isMuted || volumeVal === 0
        ? VolumeX
        : volumeVal < 0.5
            ? Volume1
            : Volume2;

    return (
        <div className="flex items-center gap-1.5 px-1 py-1 rounded-xl">
            <MuteButton
                className={cn(
                    'inline-flex items-center justify-center',
                    'text-white hover:bg-white/10 rounded-lg h-7 w-7',
                    'transition-all duration-200 active:scale-90',
                    'outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50'
                )}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
                <VolumeIcon className="size-5" />
            </MuteButton>

            {/* Volume slider — pure Tailwind layout, Vidstack handles --slider-fill */}
            <VolumeSlider.Root className="relative flex items-center w-24 h-8 cursor-pointer touch-none select-none">
                <VolumeSlider.Track className="relative w-full h-[5px] rounded-full bg-white/20">
                    <VolumeSlider.TrackFill
                        className="absolute h-full rounded-full"
                        style={{ width: 'var(--slider-fill, 0%)', backgroundColor: '#f5a623' }}
                    />
                </VolumeSlider.Track>
                <VolumeSlider.Thumb
                    className="absolute block h-4 w-4 rounded-full bg-white shadow-md -translate-x-1/2 -translate-y-1/2 top-1/2"
                    style={{ left: 'var(--slider-fill, 0%)', border: '2px solid #f5a623' }}
                />
            </VolumeSlider.Root>
        </div>
    );
}

/**
 * Time progress slider with hover preview tooltip.
 * Uses Vidstack's TimeSlider primitives with pure Tailwind layout.
 * Vidstack sets --slider-fill on the root — we bind it to track fill width + thumb position.
 */
function ProgressBar() {
    return (
        <TimeSlider.Root className="group/timeline relative flex items-center w-full h-9 cursor-pointer touch-none select-none">
            <TimeSlider.Track className="relative w-full h-1 rounded-full bg-white/20 group-hover/timeline:h-1.5 transition-all duration-150">
                <TimeSlider.TrackFill
                    className="absolute h-full rounded-full transition-all duration-100"
                    style={{ width: 'var(--slider-fill, 0%)', backgroundColor: '#f5a623' }}
                />
                <TimeSlider.Progress
                    className="absolute h-full rounded-full"
                    style={{ width: 'var(--slider-progress, 0%)', backgroundColor: 'rgb(255 255 255 / 0.3)' }}
                />
            </TimeSlider.Track>

            <TimeSlider.Thumb
                className="absolute block h-3 w-3 rounded-full shadow-lg -translate-x-1/2 -translate-y-1/2 top-1/2 scale-0 group-hover/timeline:scale-100 transition-transform duration-150"
                style={{ left: 'var(--slider-fill, 0%)', backgroundColor: '#f5a623' }}
            />

            {/* Hover preview tooltip */}
            <TimeSlider.Preview className="absolute -top-10 flex flex-col items-center pointer-events-none opacity-0 group-hover/timeline:opacity-100 transition-opacity"
                style={{ left: 'var(--slider-pointer, 0%)' }}
            >
                <TimeSlider.Value className="bg-neutral-900/95 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded-lg shadow-xl font-mono font-semibold backdrop-blur-md" />
            </TimeSlider.Preview>
        </TimeSlider.Root>
    );
}

/**
 * Current time / duration display.
 */
function TimeDisplay() {
    return (
        <span className="text-xs text-neutral-300 font-mono font-medium select-none tabular-nums flex items-center gap-1">
            <Time type="current" className="tabular-nums" />
            <span className="text-neutral-500">/</span>
            <Time type="duration" className="tabular-nums" />
        </span>
    );
}

/**
 * Playback speed menu — uses a locally-positioned popup (NOT a portal).
 *
 * The shadcn/ui DropdownMenu uses a portal (renders to document.body),
 * which is invisible when the MediaPlayer is in fullscreen mode because
 * the fullscreen API only shows content inside the fullscreen element.
 *
 * This custom implementation uses a simple positioned popup that
 * stays inside the player's DOM subtree, so it works in all modes.
 */
function SpeedMenu({ onRateChange }: { onRateChange?: (rate: number) => void }) {
    const currentRate = useMediaState('playbackRate');
    const remote = useMediaRemote();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleRateChange = useCallback(
        (rate: number) => {
            remote.changePlaybackRate(rate);
            onRateChange?.(rate);
            setIsOpen(false);
        },
        [remote, onRateChange]
    );

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        // Use a small delay to avoid the trigger click from immediately closing
        const timer = setTimeout(() => {
            document.addEventListener('click', handleClick, true);
        }, 0);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('click', handleClick, true);
        };
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen]);

    return (
        <div ref={menuRef} className="relative">
            {/* Trigger button */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="text-white hover:bg-white/15 rounded-xl text-xs font-mono px-3 h-9 inline-flex items-center gap-1.5 transition-all duration-200 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
                aria-label="Playback speed"
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                <span>{currentRate === 1 ? 'Normal' : `${currentRate}x`}</span>
            </button>

            {/* Popup — rendered locally (no portal), stays in fullscreen */}
            {isOpen && (
                <div
                    role="menu"
                    className={cn(
                        'absolute bottom-full right-0 mb-3',
                        'min-w-[140px] rounded-2xl',
                        'bg-neutral-950/95 border border-neutral-800/80 backdrop-blur-lg',
                        'shadow-xl p-1',
                        'animate-in fade-in-0 zoom-in-95 duration-150'
                    )}
                >
                    <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider px-3 py-1.5">
                        Playback Speed
                    </div>
                    <div className="h-px bg-neutral-800/65 mx-1 mb-1" />
                    {RATE_OPTIONS.map((rate) => (
                        <button
                            key={rate}
                            type="button"
                            role="menuitem"
                            className={cn(
                                'w-full flex items-center justify-between rounded-xl text-xs font-medium px-3 py-2 cursor-pointer transition-colors',
                                rate === currentRate
                                    ? 'bg-brand-primary/15 text-brand-primary'
                                    : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                            )}
                            onClick={() => handleRateChange(rate)}
                        >
                            <span>{rate === 1.0 ? 'Normal' : `${rate}x`}</span>
                            {rate === currentRate && (
                                <Check className="size-4 text-brand-primary" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Fullscreen toggle using Vidstack's FullscreenButton.
 */
function FullscreenBtn() {
    const isFullscreen = useMediaState('fullscreen');

    return (
        <FullscreenButton
            className={CONTROL_BTN_CLASS}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
            {isFullscreen ? (
                <Minimize className="size-5" />
            ) : (
                <Maximize className="size-5" />
            )}
        </FullscreenButton>
    );
}

// ── Main Controls Component ─────────────────────────────────

interface VideoControlsProps {
    /**
     * OCP — inject additional controls without modifying internals.
     * Rendered after the speed menu and before the fullscreen button.
     */
    extraControls?: ReactNode;
    /**
     * DIP — callback to persist playback rate changes.
     * Injected by the parent (SecureVideoPlayer → useSecurePlayer).
     */
    onRateChange?: (rate: number) => void;
}

export function VideoControls({ extraControls, onRateChange }: VideoControlsProps) {
    return (
        <>
            {/* Gestures — Vidstack gesture handlers */}
            <Gesture
                className="absolute inset-0 z-0"
                event="pointerup"
                action="toggle:paused"
            />
            <Gesture
                className="absolute inset-0 z-0"
                event="dblpointerup"
                action="toggle:fullscreen"
            />

            {/* Controls overlay — fades in/out with Vidstack's built-in logic */}
            <Controls.Root
                className={cn(
                    'absolute inset-0 z-10 flex flex-col justify-end',
                    'opacity-0 transition-opacity duration-300',
                    // Vidstack adds data-visible when controls should be shown
                    'data-[visible]:opacity-100'
                )}
            >
                {/* Bottom gradient + controls */}
                <Controls.Group
                    className="bg-gradient-to-t from-black/95 via-black/75 to-transparent px-4 pb-4 pt-12 flex flex-col gap-3 pointer-events-auto"
                    dir="ltr"
                >
                    {/* Progress bar */}
                    <ProgressBar />

                    {/* Controls row */}
                    <div className="flex items-center justify-between gap-4">
                        {/* Left controls */}
                        <div className="flex items-center gap-1 sm:gap-3">
                            <SkipBackward />
                            <PlayBtn />
                            <SkipForward />
                            <VolumeControl />
                            <TimeDisplay />
                        </div>

                        {/* Right controls */}
                        <div className="flex items-center gap-2">
                            <SpeedMenu onRateChange={onRateChange} />
                            {extraControls}
                            <FullscreenBtn />
                        </div>
                    </div>
                </Controls.Group>
            </Controls.Root>
        </>
    );
}