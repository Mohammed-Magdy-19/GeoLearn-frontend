/**
 * src/App.tsx
 *
 * Application root.
 *
 * Responsibilities:
 *   1. Mount the global TanStack QueryClient provider
 *   2. Mount the BrowserRouter
 *   3. On first render, attempt to hydrate the auth state by calling GET /api/auth/me/
 *      If the user has a valid session (tokens in memory from a previous interaction
 *      in the same tab), this populates Zustand with the user profile.
 *      If not, isHydrating is set to false and ProtectedRoute redirects to /login.
 */

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLanguageDirection } from "./hooks/useLanguageDirection";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { AppRoutes } from "./routes/AppRoutes";
import { useAuthStore } from "./store/useAuthStore";
import api from "./services/api";
import type { AuthUser } from "./store/useAuthStore";

// ── QueryClient Configuration ──────────────────────────────────────────────

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5-minute stale window — data is considered fresh and won't be re-fetched
      // until 5 minutes have passed since the last successful fetch
      staleTime: 1000 * 60 * 5,

      // Prevents a re-fetch from firing every time the user switches browser
      // tabs back to the app — critical for avoiding video player interruptions
      refetchOnWindowFocus: false,

      // Retry failed requests once before showing an error state
      retry: 1,
    },
  },
});

// ── Root Component ─────────────────────────────────────────────────────────

const AuthHydrator = () => {
  const { accessToken, setUser, setHydrating } = useAuthStore();

  useEffect(() => {
    /**
     * Attempt to restore the user session on app boot.
     * If an access token exists in memory (same tab, not a hard refresh),
     * fetch the user profile from /me/ and populate Zustand.
     *
     * On hard page refresh, accessToken is null (memory cleared).
     * The Axios interceptor will attempt a token refresh automatically
     * if a refreshToken is also available. If both are missing, we simply
     * set isHydrating = false, letting ProtectedRoute redirect to /login.
     */
    const hydrate = async () => {
      if (!accessToken) {
        // No token in memory — nothing to hydrate
        setHydrating(false);
        return;
      }
      try {
        const { data } = await api.get<AuthUser>("/auth/me/");
        setUser(data);
      } catch {
        // Token was invalid or expired — clearAuth is handled by the 401 interceptor
      } finally {
        setHydrating(false);
      }
    };

    hydrate();
  }, []); // Run once on mount only

  return null; // This component renders nothing — it's a side-effect runner
};

// ── App ────────────────────────────────────────────────────────────────────

const App = () => {
  const { i18n } = useTranslation();

  // Sync document dir/lang with the active language
  useLanguageDirection();

  // Sync theme with localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const isDark = storedTheme === "dark" || (!storedTheme && true);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const isRtl = i18n.language === "ar";

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Hydrate auth state before routes are evaluated */}
        <AuthHydrator />
        <AppRoutes />
      </BrowserRouter>

      {/* ── Global Toast Notifications ── */}
      <Toaster
        position={isRtl ? "bottom-left" : "bottom-right"}
        dir={isRtl ? "rtl" : "ltr"}
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          style: {
            fontFamily: '"Tajawal", ui-sans-serif, system-ui, sans-serif',
          },
        }}
      />
    </QueryClientProvider>
  );
};

export default App;
