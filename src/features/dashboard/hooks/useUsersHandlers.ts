import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useUpdateUserRole, useToggleUserActive, useDeleteUser } from "./useUserMutations";
import { useDashboardStore } from "../../../store/useDashboardStore";
import type { PlatformUser, UserRole } from "../types/dashboardTypes";

/**
 * Hook to manage user administration handlers and pending state (SRP, DIP).
 * Separates user mutations and modal triggers from presentation components.
 */
export const useUsersHandlers = () => {
  const { t } = useTranslation();
  const { openConfirmDialog } = useDashboardStore();

  const updateRole = useUpdateUserRole();
  const toggleActive = useToggleUserActive();
  const deleteUser = useDeleteUser();

  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  const handleRoleChange = useCallback(
    (userId: string, newRole: UserRole) => {
      const payload =
        newRole === "admin"
          ? { is_staff: true, is_superuser: true }
          : newRole === "instructor"
            ? { is_staff: true, is_superuser: false }
            : { is_staff: false, is_superuser: false };

      updateRole.mutate({ userId, payload });
    },
    [updateRole]
  );

  const handleToggleActive = useCallback(
    (userId: string) => {
      setTogglingUserId(userId);
      toggleActive.mutate(userId, {
        onSettled: () => setTogglingUserId(null),
      });
    },
    [toggleActive]
  );

  const handleDelete = useCallback(
    (user: PlatformUser) => {
      openConfirmDialog(
        t('dashboard.deleteUserTitle'),
        t('dashboard.deleteUserMsg', { name: user.full_name }),
        () => {
          setDeletingUserId(user.id);
          deleteUser.mutate(user.id, {
            onSettled: () => setDeletingUserId(null),
          });
        },
        "danger"
      );
    },
    [openConfirmDialog, deleteUser]
  );

  return {
    deletingUserId,
    togglingUserId,
    handleRoleChange,
    handleToggleActive,
    handleDelete,
    isUpdatingRole: updateRole.isPending,
  };
};

export default useUsersHandlers;
