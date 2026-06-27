import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../../store/useAuthStore";
import { useUpdateProfile } from "./useProfileMutations";
import { toast } from "sonner";

interface ProfileFormState {
  fullName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  avatarPreview: string | null;
  avatarFile: File | null;
}

/**
 * Custom hook encapsulating all profile editing state and handlers (SRP).
 * Keeps the page component focused on layout/composition only.
 */
export const useProfileForm = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const updateProfile = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<ProfileFormState>({
    fullName: user?.full_name || "",
    email: user?.email || "",
    phoneNumber: user?.phone_number || "",
    bio: user?.bio || "",
    avatarPreview: user?.avatar || null,
    avatarFile: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = useCallback(
    <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
      setFormState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error(t('profile.invalidImageFile'));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('profile.imageSizeLimit'));
        return;
      }

      setFormState((prev) => ({
        ...prev,
        avatarFile: file,
        avatarPreview: URL.createObjectURL(file),
      }));
    },
    []
  );

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formState.fullName.trim()) {
        toast.error(t('profile.fullNameRequired'));
        return;
      }

      const formData = new FormData();
      formData.append("full_name", formState.fullName);
      formData.append("email", formState.email);
      formData.append("phone_number", formState.phoneNumber);
      formData.append("bio", formState.bio);
      if (formState.avatarFile) {
        formData.append("avatar", formState.avatarFile);
      }

      try {
        await updateProfile.mutateAsync(formData);
        toast.success(t('profile.updateSuccess'));
        setIsEditing(false);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.detail || t('profile.updateError')
        );
      }
    },
    [formState, updateProfile]
  );

  const handleCancel = useCallback(() => {
    if (!user) return;
    setFormState({
      fullName: user.full_name || "",
      email: user.email || "",
      phoneNumber: user.phone_number || "",
      bio: user.bio || "",
      avatarPreview: user.avatar || null,
      avatarFile: null,
    });
    setIsEditing(false);
  }, [user]);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    user,
    isEditing,
    setIsEditing,
    formState,
    updateField,
    fileInputRef,
    handleAvatarChange,
    handleSave,
    handleCancel,
    openFilePicker,
    isSaving: updateProfile.isPending,
  };
};

export default useProfileForm;
