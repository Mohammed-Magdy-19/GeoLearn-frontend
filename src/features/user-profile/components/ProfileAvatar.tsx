import React from "react";
import { Camera } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ProfileAvatarProps {
  avatarUrl: string | null;
  initials: string;
  isEditing: boolean;
  onPickFile: () => void;
}

/**
 * Avatar display with optional camera overlay when editing (ISP — only receives what it needs).
 */
export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  avatarUrl,
  initials,
  isEditing,
  onPickFile,
}) => {
  const { t } = useTranslation();
  return (
    <div className="relative group w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-brand-primary/40 shadow-inner flex items-center justify-center bg-muted transition-all duration-300 hover:border-brand-primary/80">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={t('profile.profilePhoto')}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-3xl font-bold text-muted-foreground font-display">
          {initials}
        </span>
      )}

      {isEditing && (
        <button
          type="button"
          onClick={onPickFile}
          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white cursor-pointer focus:opacity-100 focus:outline-none"
          aria-label={t('profile.changePhoto')}
        >
          <Camera className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default ProfileAvatar;
