// src/features/video/types.ts
// ─────────────────────────────────────────────────────────────
// Centralized Type Definitions — Secure Video Subsystem
// All shared interfaces, enums, and type aliases live here.
// ─────────────────────────────────────────────────────────────

// ── Video & Lesson Types ──────────────────────────────────

export interface VideoMetadata {
    id: string;
    title: string;
    thumbnail: string | null;
    duration_seconds: number;
    is_free_preview: boolean;
    has_video: boolean;
}

export interface Lesson {
    id: string;
    title: string;
    description: string;
    order_index: number;
    duration_seconds: number;
    duration_display: string;
    is_free_preview: boolean;
    has_video: boolean;
    secure_video_id: string | null;
    lesson_file_url: string | null;
    video_metadata: VideoMetadata | null;
    progress: LessonProgress | null;
    is_completed?: boolean;
    last_watched_second?: number;
}

export interface LessonDetail extends Lesson {
    session_token: string | null;
}

export interface LessonProgress {
    last_watched_second: number;
    is_completed: boolean;
    updated_at?: string;
}

// ── Module & Course Types ─────────────────────────────────

export interface Module {
    id: string;
    title: string;
    order_index: number;
    lessons: Lesson[];
}

export interface CourseDetail {
    id: string;
    title: string;
    slug: string;
    description: string;
    modules: Module[];
}

// ── Progress & Session Types ──────────────────────────────

export interface ProgressReport {
    lesson_id: string;
    last_watched_second: number;
}

export interface ProgressResponse {
    id: string;
    lesson_id: string;
    lesson_title: string;
    last_watched_second: number;
    is_completed: boolean;
    updated_at: string;
}

export interface ContinueLearningResponse {
    lesson: LessonDetail;
    progress: Pick<LessonProgress, 'last_watched_second' | 'is_completed'>;
    course: {
        id: string;
        title: string;
        slug: string;
    };
}

// ── Player Settings (Zustand-persisted, cross-page) ───────

/**
 * Settings that persist across page navigations via Zustand + localStorage.
 * Vidstack owns transient playback state (isPlaying, currentTime, etc).
 */
export interface PlayerSettings {
    volume: number;
    isMuted: boolean;
    playbackRate: number;
}

// ── Security Options ──────────────────────────────────────

/**
 * Configuration for the usePlayerSecurity hook.
 * Each flag independently enables/disables a specific security vector.
 */
export interface SecurityOptions {
    /** Block Ctrl/Cmd+S (save). Default: true */
    blockSave?: boolean;
    /** Block PrintScreen key. Default: true */
    blockPrintScreen?: boolean;
    /** Block Ctrl+P (print). Default: true */
    blockPrint?: boolean;
    /** Block Ctrl+U (view source). Default: true */
    blockViewSource?: boolean;
    /** Block Ctrl+Shift+I / F12 (DevTools). Default: true */
    blockDevTools?: boolean;
    /** Block right-click context menu. Default: true */
    blockContextMenu?: boolean;
    /** Prevent drag of the player container. Default: true */
    blockDrag?: boolean;
    /** Prevent text/element selection inside the player. Default: true */
    blockSelection?: boolean;
    /** Pause/obscure when tab loses visibility. Default: true */
    blockVisibilityLeak?: boolean;
    /** Pause/blur on window blur/focus (OBS, screenshot tools). Default: true */
    blockWindowBlur?: boolean;
    /** Block Mac screenshot combos (Cmd+Shift+3/4/5). Default: true */
    blockScreenCapture?: boolean;
    /** Callback fired when a suspicious event is intercepted */
    onSecurityEvent?: (type: string) => void;
}

// ── Watermark Types ───────────────────────────────────────

export interface WatermarkPosition {
    top: string;
    left: string;
}

// ── Course Progress (derived) ─────────────────────────────

export interface CourseProgress {
    totalLessons: number;
    completedLessons: number;
    progressPercent: number;
}

// ── Sidebar Types ─────────────────────────────────────────

export interface LessonAccessConfig {
    isPurchased: boolean;
    isStaff: boolean;
}

export interface SidebarLesson extends Lesson {
    isActive: boolean;
    isAccessible: boolean;
    progressPercent: number;
}

// ── Screenshot Warning State ──────────────────────────────

/**
 * Tracks the screenshot/recording warning overlay visibility.
 * When a screenshot key combo is detected, `isVisible` is set to true
 * and auto-clears after `durationMs`.
 */
export interface ScreenshotWarningState {
    isVisible: boolean;
    durationMs: number;
}