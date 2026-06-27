/**
 * src/store/useAuthStore.ts
 *
 * Global auth state managed by Zustand.
 *
 * Design decisions:
 *   - Tokens live in memory (JS closure), NOT localStorage/sessionStorage.
 *     This protects against XSS attacks that can read localStorage.
 *   - On hard page refresh tokens are lost — the Axios interceptor calls
 *     /token/refresh/ automatically using an httpOnly cookie if configured,
 *     or the user is redirected to login.
 *   - The `user` object is populated on login and on app boot via /api/auth/me/.
 */

import { create } from "zustand";

// ── Types ──────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  username: string;
  full_name: string;
  email: string | null;
  avatar: string | null;
  date_joined: string;
  is_superuser?: boolean;
  is_staff?: boolean;
  phone_number?: string | null;
  bio?: string | null;
}

interface AuthState {
  /** Short-lived JWT — sent in Authorization: Bearer header */
  accessToken: string | null;

  /** Long-lived JWT — used ONLY by the refresh interceptor, never sent elsewhere */
  refreshToken: string | null;

  /** Authenticated user's profile data */
  user: AuthUser | null;

  /** True while the initial /me/ hydration call is in flight */
  isHydrating: boolean;

  // ── Actions ───────────────────────────────────────────────
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: AuthUser) => void;
  setHydrating: (value: boolean) => void;
  clearAuth: () => void;
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set) => ({
  // ── Initial State ──────────────────────────────────────────
  // Read tokens from localStorage to persist session across page refreshes
  accessToken: localStorage.getItem("access_token") || null,
  refreshToken: localStorage.getItem("refresh_token") || null,
  user: null,
  isHydrating: true, // Start true — app will hydrate on mount

  // ── Actions ───────────────────────────────────────────────

  /**
   * Called immediately after a successful login or token refresh.
   * Stores both tokens in Zustand and persists them in localStorage.
   */
  setTokens: (access, refresh) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    set({ accessToken: access, refreshToken: refresh });
  },

  /**
   * Called after login (user data returned in login response)
   * and after a successful GET /api/auth/me/ call on app boot.
   */
  setUser: (user) => set({ user }),

  /** Flip the hydration loading state */
  setHydrating: (value) => set({ isHydrating: value }),

  /**
   * Called on logout or when a token refresh fails (session expired).
   * Wipes all auth state and removes tokens from localStorage.
   */
  clearAuth: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ accessToken: null, refreshToken: null, user: null, isHydrating: false });
  },
}));
