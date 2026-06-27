import React from "react";
import { useTranslation } from "react-i18next";
import {
  User,
  Mail,
  Phone,
  FileText,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProfileEditFormProps {
  fullName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  isSaving: boolean;
  onFullNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

/**
 * Profile edit form with individual field callbacks (SRP — form rendering only, ISP — narrow props).
 * Uses shadcn Input, Label, Textarea, and Button for consistent UI.
 */
export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  fullName,
  email,
  phoneNumber,
  bio,
  isSaving,
  onFullNameChange,
  onEmailChange,
  onPhoneNumberChange,
  onBioChange,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Full Name */}
      <div>
        <Label htmlFor="profile-fullname" className="mb-1.5">
          {t("profile.fullName")}
        </Label>
        <div className="relative">
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
            <User className="w-5 h-5" />
          </span>
          <Input
            id="profile-fullname"
            type="text"
            required
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            className="rounded-xl pr-10 pl-4 py-2.5 focus-visible:ring-brand-primary/50 focus-visible:border-brand-primary/60"
            placeholder={t("profile.fullNamePlaceholder")}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="profile-email" className="mb-1.5">
          {t("profile.email")}
        </Label>
        <div className="relative">
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
            <Mail className="w-5 h-5" />
          </span>
          <Input
            id="profile-email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="rounded-xl pr-10 pl-4 py-2.5 focus-visible:ring-brand-primary/50 focus-visible:border-brand-primary/60"
            dir="ltr"
            placeholder="name@example.com"
          />
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <Label htmlFor="profile-phone" className="mb-1.5">
          {t("profile.phoneNumber")}
        </Label>
        <div className="relative">
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
            <Phone className="w-5 h-5" />
          </span>
          <Input
            id="profile-phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            className="rounded-xl pr-10 pl-4 py-2.5 focus-visible:ring-brand-primary/50 focus-visible:border-brand-primary/60"
            dir="ltr"
            placeholder={t("profile.phoneNumberPlaceholder")}
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <Label htmlFor="profile-bio" className="mb-1.5">
          {t("profile.bio")}
        </Label>
        <div className="relative">
          <span className="absolute top-3 right-3 pointer-events-none text-muted-foreground">
            <FileText className="w-5 h-5" />
          </span>
          <Textarea
            id="profile-bio"
            rows={4}
            value={bio}
            onChange={(e) => onBioChange(e.target.value)}
            className="rounded-xl pr-10 pl-4 py-2.5 resize-none focus-visible:ring-brand-primary/50 focus-visible:border-brand-primary/60"
            placeholder={t("profile.bioPlaceholder")}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 justify-end">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="rounded-xl"
        >
          <X className="w-4 h-4 ml-1.5" />
          {t("common.cancel")}
        </Button>

        <Button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-bold"
        >
          {isSaving ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-bg-dark ml-1.5"></span>
              {t("profile.saving")}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 ml-1.5" />
              {t("profile.saveChanges")}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProfileEditForm;
