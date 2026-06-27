import React from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileAvatar from "./ProfileAvatar";

interface ProfileSidebarCardProps {
  fullName: string;
  username: string;
  avatarUrl: string | null;
  initials: string;
  dateJoined: string;
  accountType: string;
  isEditing: boolean;
  onPickFile: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}

/**
 * Left sidebar card: avatar, metadata, and logout (SRP — display only, no logic).
 */
export const ProfileSidebarCard: React.FC<ProfileSidebarCardProps> = ({
  fullName,
  username,
  avatarUrl,
  initials,
  dateJoined,
  accountType,
  isEditing,
  onPickFile,
  onLogout,
  isLoggingOut,
}) => {
  const { t } = useTranslation();
  return (
    <div className="md:col-span-1 flex flex-col items-center p-6 bg-card border border-border/50 rounded-2xl shadow-lg h-fit text-center">
      <ProfileAvatar
        avatarUrl={avatarUrl}
        initials={initials}
        isEditing={isEditing}
        onPickFile={onPickFile}
      />

      <h2 className="text-xl font-bold text-foreground mb-1">{fullName}</h2>
      <p className="text-sm text-muted-foreground mb-4">{username}</p>

      <div className="w-full border-t border-border/50 my-4"></div>

      {/* Metadata items */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-brand-primary" />
            {t("profile.joinDate")}
          </span>
          <span className="font-medium text-foreground">{dateJoined}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-brand-primary" />
            {t("profile.accountType")}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-primary/10 text-brand-primary">
            {accountType}
          </span>
        </div>
      </div>

      <div className="w-full border-t border-border/50 my-4"></div>

      {/* Logout Button */}
      <Button
        onClick={onLogout}
        disabled={isLoggingOut}
        variant="destructive"
        className="w-full flex items-center justify-center gap-2 rounded-xl text-white font-bold"
      >
        <LogOut className="w-4 h-4" />
        {t("nav.logout")}
      </Button>
    </div>
  );
};

export default ProfileSidebarCard;
