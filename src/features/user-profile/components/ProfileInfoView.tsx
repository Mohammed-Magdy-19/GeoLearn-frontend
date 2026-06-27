import React from "react";
import { useTranslation } from "react-i18next";

interface ProfileInfoViewProps {
  username: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null | undefined;
  bio: string | null | undefined;
}

/**
 * Read-only display of profile fields (SRP — display only, no editing logic).
 */
export const ProfileInfoView: React.FC<ProfileInfoViewProps> = ({
  username,
  fullName,
  email,
  phoneNumber,
  bio,
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      {/* Username (Read Only) */}
      <div className="pb-4 border-b border-border/40">
        <h4 className="text-xs text-muted-foreground mb-1.5">{t("profile.username")}</h4>
        <p className="text-sm font-semibold text-foreground">{username}</p>
      </div>

      {/* Full Name */}
      <div className="pb-4 border-b border-border/40">
        <h4 className="text-xs text-muted-foreground mb-1.5">{t("profile.fullName")}</h4>
        <p className="text-sm font-semibold text-foreground">{fullName}</p>
      </div>

      {/* Email */}
      <div className="pb-4 border-b border-border/40">
        <h4 className="text-xs text-muted-foreground mb-1.5">{t("profile.email")}</h4>
        <p className="text-sm font-semibold text-foreground" dir="ltr">
          {email || <span className="text-muted-foreground/60 italic">{t("common.notSpecified")}</span>}
        </p>
      </div>

      {/* Phone Number */}
      <div className="pb-4 border-b border-border/40">
        <h4 className="text-xs text-muted-foreground mb-1.5">{t("profile.phoneNumber")}</h4>
        <p className="text-sm font-semibold text-foreground" dir="ltr">
          {phoneNumber || <span className="text-muted-foreground/60 italic">{t("common.notSpecified")}</span>}
        </p>
      </div>

      {/* Bio */}
      <div>
        <h4 className="text-xs text-muted-foreground mb-1.5">{t("profile.bio")}</h4>
        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
          {bio || (
            <span className="text-muted-foreground/60 italic">
              {t("profile.noBioAdded")}
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default ProfileInfoView;
