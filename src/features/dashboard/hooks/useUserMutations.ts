/**
 * src/features/dashboard/hooks/useUserMutations.ts
 *
 * TanStack Query mutation hooks for user management operations.
 * Handles role updates, activation toggling, and user deletion with cache invalidation.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import {
  updateUserRole,
  toggleUserActive,
  deleteUser,
} from "../api/usersApi";
import { dashboardKeys } from "./useDashboardQueries";
import type { UpdateRolePayload } from "../types/dashboardTypes";

// Shared query key prefix for users list
const usersListKey = ["dashboard", "users"] as const;

// ─────────────────────────────────────────────────────────────
// Update User Role
// ─────────────────────────────────────────────────────────────

/**
 * Mutation hook to update a user's role (staff / superuser).
 * Invalidates both the users list and dashboard stats on success.
 */
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateRolePayload;
    }) => updateUserRole(userId, payload),

    onSuccess: (_, variables) => {
      // Invalidate users list and specific user
      queryClient.invalidateQueries({ queryKey: usersListKey });
      queryClient.invalidateQueries({
        queryKey: [...usersListKey, variables.userId],
      });
      // Stats may change (e.g., admin count)
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
      toast.success(i18n.t("toasts.userRoleUpdated"));
    },

    onError: (error: Error) => {
      toast.error(error.message || i18n.t("toasts.userRoleUpdateFailed"));
    },
  });
};

// ─────────────────────────────────────────────────────────────
// Toggle User Active Status
// ─────────────────────────────────────────────────────────────

/**
 * Mutation hook to toggle a user's active status.
 * Soft-disables or re-enables the account.
 */
export const useToggleUserActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => toggleUserActive(userId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersListKey });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
      toast.success(i18n.t("toasts.userStatusUpdated"));
    },

    onError: (error: Error) => {
      toast.error(error.message || i18n.t("toasts.userStatusUpdateFailed"));
    },
  });
};

// ─────────────────────────────────────────────────────────────
// Delete User
// ─────────────────────────────────────────────────────────────

/**
 * Mutation hook to permanently delete a user.
 * Shows a confirmation toast and invalidates related caches.
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersListKey });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
      toast.success(i18n.t("toasts.userDeleted"));
    },

    onError: (error: Error) => {
      toast.error(error.message || i18n.t("toasts.userDeleteFailed"));
    },
  });
};
