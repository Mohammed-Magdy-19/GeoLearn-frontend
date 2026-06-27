// src/features/video/index.ts
// ─────────────────────────────────────────────────────────────
// Barrel Export — Secure Video Subsystem Public API
// Clean entry point for consuming the video feature.
// ─────────────────────────────────────────────────────────────

// Components
export { SecureVideoPlayer } from './components/SecureVideoPlayer';
export { DynamicWatermark } from './components/DynamicWatermark';
export { VideoControls } from './components/VideoControls';
export { LessonSidebar } from './components/LessonSidebar';
export { VideoPlayerSkeleton } from './components/VideoPlayerSkeleton';
export { PlayerLoadingState } from './components/PlayerLoadingState';
export { PlayerErrorState } from './components/PlayerErrorState';
export { PlayerEmptyState } from './components/PlayerEmptyState';
export { WatchPageHeader } from './components/WatchPageHeader';
export { LessonInfoCard } from './components/LessonInfoCard';
export { CanvasShield } from './components/CanvasShield';

// Hooks
export { useVideoStore } from './hooks/useVideoStore';
export { useVideoData } from './hooks/useVideoData';
export { useSecureVideoPlayer } from './hooks/useSecureVideoPlayer';
export { useSecurePlayer } from './hooks/useSecurePlayer';
export { useProgressTracker } from './hooks/useProgressTracker';

// Query keys for cache management
export { videoKeys } from './hooks/useVideoData';

// Types
export type {
    VideoMetadata,
    Lesson,
    LessonDetail,
    LessonProgress,
    Module,
    CourseDetail,
    ProgressReport,
    ProgressResponse,
    ContinueLearningResponse,
    PlayerSettings,
    SecurityOptions,
    ScreenshotWarningState,
    WatermarkPosition,
    CourseProgress,
    LessonAccessConfig,
    SidebarLesson,
} from './types';