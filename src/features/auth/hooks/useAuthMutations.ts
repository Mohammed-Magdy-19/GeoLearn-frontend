/**
 * src/features/auth/hooks/useAuthMutations.ts
 *
 * TanStack Query mutations for all authentication actions.
 *
 * Why mutations instead of plain async functions?
 *   - Built-in isPending, isError, error states — no manual loading flags
 *   - onSuccess / onError lifecycle hooks keep side-effects co-located
 *   - Automatic query cache invalidation on success
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api"
import { useAuthStore, type AuthUser } from "../../../store/useAuthStore";
import type { LoginFormValues, RegisterFormValues } from "../authValidators";

// ── API Response Types ─────────────────────────────────────────────────────

interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

interface RegisterResponse {
  id: number;
  username: string;
  full_name: string;
  email: string | null;
}

// Returned by the auto-login call that immediately follows registration
interface RegisterLoginResponse extends LoginResponse {}

// ── Login Mutation ─────────────────────────────────────────────────────────

/**
 * useLoginMutation
 *
 * Calls POST /api/auth/login/ with username + password.
 * On success:
 *   1. Stores the access + refresh token pair in Zustand (persisted to localStorage)
 *   2. Stores the user profile in Zustand
 *   3. Navigates to the home page
 */
export const useLoginMutation = () => {
  const { setTokens, setUser } = useAuthStore();
  const navigate = useNavigate();

  return useMutation<LoginResponse, Error, LoginFormValues>({
    mutationFn: async (credentials) => {
      const { data } = await api.post<LoginResponse>("/auth/login/", credentials);
      return data;
    },
    onSuccess: (data) => {
      // Store tokens in localStorage
      setTokens(data.access, data.refresh);
      // Hydrate the user profile from the login response
      // (avoids a separate /me/ call right after login)
      setUser(data.user);
      navigate("/");
    },
  });
};

// ── Registration Mutation ──────────────────────────────────────────────────

/**
 * useRegisterMutation
 *
 * Calls POST /api/auth/register/ with full user details.
 * On success, immediately fires a login request with the same credentials
 * so the user gets a token pair without a manual sign-in step, then
 * stores tokens + user in Zustand (persisted to localStorage) and
 * navigates to the home page.
 */
export const useRegisterMutation = () => {
  const { setTokens, setUser } = useAuthStore();
  const navigate = useNavigate();

  return useMutation<RegisterResponse, Error, RegisterFormValues>({
    mutationFn: async (formData) => {
      // Step 1 — create the account
      const { data } = await api.post<RegisterResponse>("/auth/register/", formData);
      return data;
    },
    onSuccess: async (_data, variables) => {
      // Step 2 — auto-login with the credentials just submitted
      const { data: loginData } = await api.post<RegisterLoginResponse>("/auth/login/", {
        username: variables.username,
        password: variables.password,
      });

      // Step 3 — persist tokens to localStorage via Zustand and hydrate user
      setTokens(loginData.access, loginData.refresh);
      setUser(loginData.user);

      // Step 4 — send the user straight to the app
      navigate("/");
    },
  });
};

// ── Logout Mutation ────────────────────────────────────────────────────────

/**
 * useLogoutMutation
 *
 * Clears all auth state from Zustand and invalidates the entire query cache
 * so stale user-specific data doesn't leak to the next session.
 */
export const useLogoutMutation = () => {
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      // Optional: call a server-side logout endpoint to blacklist the refresh token.
      // For now, clearing the client state is sufficient since access tokens
      // expire in 5 minutes and refresh tokens are rotated on every use.
    },
    onSettled: () => {
      // Always clear auth and cache — even if the server call fails
      clearAuth();
      queryClient.clear();
      navigate("/login");
    },
  });
};