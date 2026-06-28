/**
 * src/services/api.ts
 *
 * Central Axios instance — the single network gateway for all API calls.
 *
 * Two interceptors are attached:
 *
 *  1. REQUEST interceptor
 *     Reads the current accessToken from Zustand and injects it into every
 *     outgoing request as an Authorization: Bearer <token> header.
 *     This means no component ever touches the token directly.
 *
 *  2. RESPONSE interceptor
 *     Catches 401 Unauthorized responses (expired access token).
 *     Automatically calls POST /auth/token/refresh/ once using the stored
 *     refreshToken. On success, updates the Zustand store with the new
 *     token pair and retries the original failed request transparently.
 *     On failure (refresh token also expired), clears auth state and
 *     redirects the user to the login page.
 *
 *  3. STREAM API (Secure Video Subsystem)
 *     Separate Axios instance for binary blob video streaming.
 *     Attaches X-Playback-Token header for session-based video access.
 */

import axios, { AxiosError, type AxiosInstance } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/useAuthStore";

// ── Base Configuration ────────────────────────────────────────────────────

export const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api` || "http://localhost:8000/api";

// ── Main API Instance ─────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // 10-second timeout for regular API calls
  timeout: 10_000,
});

// ── 1. Request Interceptor — JWT Injection ─────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Pull the current access token directly from the Zustand store closure
    const { accessToken } = useAuthStore.getState();

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── 2. Response Interceptor — Auto Refresh on 401 ─────────────────────────

/**
 * Flag to prevent multiple concurrent refresh attempts.
 * If two requests fail simultaneously, only one refresh call is made.
 */
let isRefreshing = false;

/**
 * Queue of callbacks waiting for the new access token.
 * Each callback resolves the original failed request once the token arrives.
 */
type RefreshCallback = (newToken: string) => void;
let refreshQueue: RefreshCallback[] = [];

/** Resolve all queued requests with the new token */
const drainQueue = (newToken: string) => {
  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];
};

api.interceptors.response.use(
  // Pass through successful responses unchanged
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh for 401 errors on requests that haven't been retried yet
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Exclude login and register requests from auto-refresh/redirect
    if (
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register")
    ) {
      return Promise.reject(error);
    }

    // Mark this request so we don't retry it a second time
    originalRequest._retry = true;

    const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();

    if (!refreshToken) {
      // No refresh token available — session is completely expired
      clearAuth();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // If a refresh is already in flight, queue this request until it finishes
    if (isRefreshing) {
      return new Promise<string>((resolve) => {
        refreshQueue.push(resolve);
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      // Call the refresh endpoint — no auth header needed, token is in the body
      const { data } = await axios.post(
        `${BASE_URL}/auth/token/refresh/`,
        { refresh: refreshToken }
      );

      const newAccessToken: string = data.access;
      const newRefreshToken: string = data.refresh;

      // Persist the new token pair in Zustand
      setTokens(newAccessToken, newRefreshToken);

      // Inject the new token into the original failed request and retry it
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      // Unblock all queued requests that were waiting for the new token
      drainQueue(newAccessToken);

      return api(originalRequest);
    } catch (refreshError) {
      // Refresh token is also expired — force the user to log in again
      clearAuth();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ── Stream API Instance (Secure Video Subsystem) ──────────────────────────

/**
 * Separate Axios instance for secure video streaming.
 * Uses blob responseType and attaches X-Playback-Token header.
 * Inherits the same base URL but handles binary data differently.
 */
const streamApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60_000, // Longer timeout for video streams
  responseType: "blob",
});

// Request interceptor — attach JWT and fallback X-Playback-Token
streamApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // JWT auth token from Zustand (same as main API)
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Only set X-Playback-Token from sessionStorage as a fallback —
    // if the caller already set it explicitly, don't overwrite.
    if (config.headers && !config.headers["X-Playback-Token"]) {
      const playbackToken = sessionStorage.getItem("playback_session_token");
      if (playbackToken) {
        config.headers["X-Playback-Token"] = playbackToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors for streams
streamApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // For stream errors, we don't attempt token refresh automatically
    // because the X-Playback-Token is the primary auth mechanism
    // and JWT 401s should be handled by the main API flow first
    if (error.response?.status === 403) {
      // Session expired — clear token and let component handle retry
      sessionStorage.removeItem("playback_session_token");
    }
    return Promise.reject(error);
  }
);

// ── Types (Secure Video Subsystem) ────────────────────────────────────────

export interface VideoMetadata {
  id: string;
  title: string;
  thumbnail: string | null;
  duration_seconds: number;
  is_free_preview: boolean;
  has_video: boolean;
}

export interface LessonDetail {
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
  session_token: string | null;
  progress: {
    last_watched_second: number;
    is_completed: boolean;
    updated_at: string;
  } | null;
}

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
  progress: {
    last_watched_second: number;
    is_completed: boolean;
  };
  course: {
    id: string;
    title: string;
    slug: string;
  };
}

// ── Course & Lesson APIs ─────────────────────────────────────────────────

export const fetchLessonDetail = async (
  courseSlug: string,
  lessonId: string
): Promise<LessonDetail> => {
  const { data } = await api.get<LessonDetail>(
    `/courses/${courseSlug}/lessons/${lessonId}/`
  );

  // Store session token for subsequent stream requests
  if (data.session_token) {
    sessionStorage.setItem("playback_session_token", data.session_token);
  }

  return data;
};

export const reportProgress = async (
  report: ProgressReport
): Promise<ProgressResponse> => {
  const { data } = await api.post<ProgressResponse>(
    "/courses/progress/",
    report
  );
  return data;
};

export const fetchContinueLearning = async (): Promise<ContinueLearningResponse> => {
  const { data } = await api.get<ContinueLearningResponse>("/courses/continue/");
  return data;
};

// ── Secure Video Subsystem APIs ──────────────────────────────────────────

export const fetchVideoMeta = async (videoId: string): Promise<VideoMetadata> => {
  const { data } = await api.get<VideoMetadata>(`/courses/videos/${videoId}/meta/`);
  return data;
};

export const fetchSecureVideoStream = async (
  videoId: string,
  sessionToken?: string | null
): Promise<string> => {
  try {
    // Use the explicit token if provided, otherwise fall back to sessionStorage
    const token = sessionToken || sessionStorage.getItem("playback_session_token");

    const response = await streamApi.get(`/courses/videos/${videoId}/stream/`, {
      responseType: "blob",
      headers: token ? { "X-Playback-Token": token } : {},
      onDownloadProgress: (progressEvent) => {
        // Optional: track download progress for large files
        const percent = progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;
        console.debug(`Stream download: ${percent}%`);
      },
    });

    // Create blob URL — transient, memory-only, not cacheable
    return URL.createObjectURL(response.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 403) {
      throw new Error("Session expired or invalid. Please reload the lesson.");
    }
    if (axiosError.response?.status === 401) {
      throw new Error("Authentication required. Please log in again.");
    }
    throw new Error("Failed to load video stream. Please try again.");
  }
};

export const revokeSession = async (token?: string): Promise<void> => {
  const payload = token ? { token } : {};
  await api.post("/courses/sessions/revoke/", payload);
  sessionStorage.removeItem("playback_session_token");
};

// ── Cleanup Utilities ────────────────────────────────────────────────────

export const cleanupVideoBlob = (blobUrl: string | null): void => {
  if (blobUrl && blobUrl.startsWith("blob:")) {
    URL.revokeObjectURL(blobUrl);
  }
};

// ── Default Export ───────────────────────────────────────────────────────

export default api;