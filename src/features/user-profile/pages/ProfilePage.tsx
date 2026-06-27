/**
 * src/features/user-profile/pages/ProfilePage.tsx
 *
 * Student Profile page — thin orchestrator (SRP).
 * Delegates form state to useProfileForm hook and rendering
 * to focused sub-components. All UI text in Arabic / RTL.
 */

import { Edit2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useLogoutMutation } from "../../auth/hooks/useAuthMutations";
import useProfileForm from "../hooks/useProfileForm";

import ProfileSidebarCard from "../components/ProfileSidebarCard";
import ProfileInfoView from "../components/ProfileInfoView";
import ProfileEditForm from "../components/ProfileEditForm";

// ── Helpers ──────────────────────────────────────────────────

const getInitials = (name: string): string => {
  if (!name) return "U";
  return name
    .trim()
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const formatJoinedDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const getAccountType = (t: (key: string) => string, isSuperuser?: boolean, isStaff?: boolean): string => {
  if (isSuperuser) return t("profile.platformAdmin");
  if (isStaff) return t("profile.instructor");
  return t("profile.student");
};

// ── Page Component ───────────────────────────────────────────

export default function ProfilePage() {
  const { t } = useTranslation();
  const {
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
    isSaving,
  } = useProfileForm();

  const logout = useLogoutMutation();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="container max-w-4xl mx-auto px-4 py-12 min-h-screen">
      {/* Page Heading */}
      <div className="mb-10 animate-fade-in-up">
        <h1 className="text-3xl font-black text-foreground font-display mb-2">
          {t("profile.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("profile.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up animation-delay-100">
        {/* Left Card: Avatar & Stats */}
        <ProfileSidebarCard
          fullName={user.full_name}
          username={user.username}
          avatarUrl={formState.avatarPreview}
          initials={getInitials(formState.fullName || user.full_name)}
          dateJoined={formatJoinedDate(user.date_joined)}
          accountType={getAccountType(t, user.is_superuser, user.is_staff)}
          isEditing={isEditing}
          onPickFile={openFilePicker}
          onLogout={() => logout.mutate()}
          isLoggingOut={logout.isPending}
        />

        {/* Hidden file input for avatar (shared ref) */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          accept="image/*"
          className="hidden"
        />

        {/* Right Card: Fields and forms */}
        <div className="md:col-span-2 p-6 md:p-8 bg-card border border-border/50 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-foreground">
              {isEditing ? t("profile.editProfileDetails") : t("profile.personalInfo")}
            </h3>

            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 border-brand-primary/30 text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-300"
              >
                <Edit2 className="w-4 h-4" />
                {t("common.edit")}
              </Button>
            )}
          </div>

          {isEditing ? (
            <ProfileEditForm
              fullName={formState.fullName}
              email={formState.email}
              phoneNumber={formState.phoneNumber}
              bio={formState.bio}
              isSaving={isSaving}
              onFullNameChange={(v) => updateField("fullName", v)}
              onEmailChange={(v) => updateField("email", v)}
              onPhoneNumberChange={(v) => updateField("phoneNumber", v)}
              onBioChange={(v) => updateField("bio", v)}
              onSubmit={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <ProfileInfoView
              username={user.username}
              fullName={user.full_name}
              email={user.email}
              phoneNumber={user.phone_number}
              bio={user.bio}
            />
          )}
        </div>
      </div>
    </main>
  );
}
