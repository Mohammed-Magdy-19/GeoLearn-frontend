/**
 * src/features/auth/components/RegisterForm.tsx
 *
 * Registration form using:
 *   - react-hook-form for controlled form state
 *   - Zod schema (registerSchema) for client-side validation including
 *     the cross-field password match check
 *   - useRegisterMutation for the network call + redirect
 *   - shadcn/ui components (Input, Label, Button) for consistent UI
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { registerSchema, type RegisterFormValues } from "../authValidators";
import { useRegisterMutation } from "../hooks/useAuthMutations";
import { GraduationCap, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterForm() {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useRegisterMutation();

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="w-full">

      {/* ── Page heading ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-foreground">
          {t("auth.createAccountTitle")} <GraduationCap className="size-6 inline text-brand-warm" />
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("auth.createAccountSubtitle")}
        </p>
      </div>

      {/* ── Server error banner ───────────────────────────────────────────── */}
      {registerMutation.isError && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            {(registerMutation.error as Error | undefined)?.message ??
              t("auth.registrationFailed")}
          </span>
        </div>
      )}

      {/* ── Form ─────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

        {/* Username */}
        <div>
          <Label htmlFor="username" className="mb-1.5">
            {t("auth.username")}
          </Label>
          <Input
            id="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            placeholder={t("auth.usernamePlaceholder")}
            {...register("username")}
            className="rounded-xl px-4 py-2.5 focus-visible:ring-brand-primary/50 focus-visible:border-brand-primary/60"
            aria-invalid={!!errors.username}
            aria-describedby="username-hint username-error"
          />
          <p id="username-hint" className="mt-1.5 text-xs text-muted-foreground">
            {t("auth.usernameHint")}
          </p>
          {errors.username && (
            <p id="username-error" className="mt-1 text-xs text-destructive">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <Label htmlFor="full_name" className="mb-1.5">
            {t("auth.fullName")}
          </Label>
          <Input
            id="full_name"
            type="text"
            autoComplete="name"
            placeholder={t("auth.fullNamePlaceholder")}
            {...register("full_name")}
            className="rounded-xl px-4 py-2.5 focus-visible:ring-brand-primary/50 focus-visible:border-brand-primary/60"
            aria-invalid={!!errors.full_name}
            aria-describedby={errors.full_name ? "full-name-error" : undefined}
          />
          {errors.full_name && (
            <p id="full-name-error" className="mt-1.5 text-xs text-destructive">
              {errors.full_name.message}
            </p>
          )}
        </div>

        {/* Email (optional) */}
        <div>
          <Label htmlFor="email" className="mb-1.5">
            {t("auth.email")}{" "}
            <span className="text-muted-foreground font-normal text-xs">{t("auth.emailOptional")}</span>
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="ahmed@example.com"
            {...register("email")}
            className="rounded-xl px-4 py-2.5 focus-visible:ring-brand-primary/50 focus-visible:border-brand-primary/60"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1.5 text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="password" className="mb-1.5">
            {t("auth.password")}
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder={t("auth.passwordMinLength")}
            {...register("password")}
            className="rounded-xl px-4 py-2.5 focus-visible:ring-brand-primary/50 focus-visible:border-brand-primary/60"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password && (
            <p id="password-error" className="mt-1.5 text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <Label htmlFor="password_confirm" className="mb-1.5">
            {t("auth.confirmPassword")}
          </Label>
          <Input
            id="password_confirm"
            type="password"
            autoComplete="new-password"
            placeholder={t("auth.confirmPasswordPlaceholder")}
            {...register("password_confirm")}
            className="rounded-xl px-4 py-2.5 focus-visible:ring-brand-primary/50 focus-visible:border-brand-primary/60"
            aria-invalid={!!errors.password_confirm}
            aria-describedby={errors.password_confirm ? "confirm-error" : undefined}
          />
          {errors.password_confirm && (
            <p id="confirm-error" className="mt-1.5 text-xs text-destructive">
              {errors.password_confirm.message}
            </p>
          )}
        </div>

        {/* ── Submit button ─────────────────────────────────────────────── */}
        <Button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full rounded-full bg-brand-gradient text-white py-3 px-6 text-sm font-bold shadow-brand transition-all duration-300 hover:brightness-105 hover:shadow-brand-lg hover:scale-[1.02] active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:brightness-100"
          size="lg"
        >
          {registerMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {t("auth.creatingAccount")}
            </span>
          ) : (
            t("auth.createAccountButton")
          )}
        </Button>
      </form>

      {/* ── Footer link ──────────────────────────────────────────────────── */}
      <p className="mt-7 text-center text-sm text-muted-foreground">
        {t("auth.alreadyHaveAccount")}{" "}
        <Link
          to="/login"
          className="font-bold text-brand-primary hover:underline underline-offset-2"
        >
          {t("auth.loginLink")}
        </Link>
      </p>
    </div>
  );
}