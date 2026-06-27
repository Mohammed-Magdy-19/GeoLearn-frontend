/**
 * src/features/auth/components/LoginForm.tsx
 *
 * Login form using:
 *   - react-hook-form for controlled form state
 *   - Zod schema (loginSchema) for client-side validation
 *   - useLoginMutation for the network call + side-effects
 *   - shadcn/ui components (Input, Label, Button) for consistent UI
 *
 * Displays field-level errors inline below each input.
 * The submit button shows a loading state while the request is in flight.
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loginSchema, type LoginFormValues } from "../authValidators";
import { useLoginMutation } from "../hooks/useAuthMutations";
import { Hand, CircleCheck, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginForm() {
  const { t } = useTranslation();
  const location = useLocation();
  /** Message forwarded from the register-success redirect. */
  const successMessage = (location.state as { message?: string })?.message;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLoginMutation();

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full">

      {/* ── Page heading ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-foreground">
          {t("auth.welcomeBack")} <Hand className="size-6 inline" />
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("auth.loginSubtitle")}
        </p>
      </div>

      {/* ── Success banner (forwarded from register page) ───────────────── */}
      {successMessage && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-brand-accent/30 bg-brand-accent/10 px-4 py-3 text-sm text-brand-accent dark:text-brand-accent">
          <CircleCheck className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ── Server error banner ───────────────────────────────────────────── */}
      {loginMutation.isError && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{t("auth.invalidCredentials")}</span>
        </div>
      )}

      {/* ── Form ─────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

        {/* Username */}
        <div>
          <Label
            htmlFor="username"
            className="mb-1.5"
          >
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
            aria-describedby={errors.username ? "username-error" : undefined}
          />
          {errors.username && (
            <p id="username-error" className="mt-1.5 text-xs text-destructive">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label
              htmlFor="password"
            >
              {t("auth.password")}
            </Label>
            <Button
              type="button"
              variant="link"
              disabled
              aria-label={t("auth.forgotPasswordAriaLabel")}
              title={t("auth.forgotPasswordSoon")}
              className="text-xs text-muted-foreground/50 cursor-not-allowed select-none h-auto p-0"
            >
              {t("auth.forgotPassword")}
            </Button>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder={t("auth.passwordPlaceholder")}
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

        {/* ── Submit button ─────────────────────────────────────────────── */}
        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full rounded-full bg-brand-gradient text-white py-3 px-6 text-sm font-bold shadow-brand transition-all duration-300 hover:brightness-105 hover:shadow-brand-lg hover:scale-[1.02] active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:brightness-100"
          size="lg"
        >
          {loginMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {t("auth.loggingIn")}
            </span>
          ) : (
            t("auth.loginButton")
          )}
        </Button>
      </form>

      {/* ── Footer link ──────────────────────────────────────────────────── */}
      <p className="mt-7 text-center text-sm text-muted-foreground">
        {t("auth.noAccount")}{" "}
        <Link
          to="/register"
          className="font-bold text-brand-primary hover:underline underline-offset-2"
        >
          {t("auth.createNewAccount")}
        </Link>
      </p>
    </div>
  );
}