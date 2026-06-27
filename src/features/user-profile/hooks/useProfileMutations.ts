/**
 * src/features/user-profile/hooks/useProfileMutations.ts
 *
 * TanStack Query mutations for user profile actions.
 */

import { useMutation } from "@tanstack/react-query";
import api from "../../../services/api";
import { useAuthStore, type AuthUser } from "../../../store/useAuthStore";

export const useUpdateProfile = () => {
  const { setUser } = useAuthStore();

  return useMutation<AuthUser, Error, FormData>({
    mutationFn: async (formData) => {
      const { data } = await api.patch<AuthUser>("/auth/me/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: (data) => {
      // Update the Zustand global store with the updated user data
      setUser(data);
    },
  });
};
