/**
 * src/features/auth/components/VerifyEmailForm.tsx
 *
 * 6-digit OTP Email Verification form.
 * Consumes:
 *   - InputOTP, InputOTPGroup, InputOTPSlot from @/components/ui/input-otp
 *   - useVerifyEmailMutation and useResendVerificationMutation hooks
 *   - sonner toast for feedback notifications
 */

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { MailCheck, AlertTriangle, RefreshCw, CheckCircle2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { useVerifyEmailMutation, useResendVerificationMutation } from "../hooks/useAuthMutations";
import { useAuthStore } from "@/store/useAuthStore";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../types";

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailForm() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [code, setCode] = useState("");
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Resend cooldown timer state
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const verifyMutation = useVerifyEmailMutation();
  const resendMutation = useResendVerificationMutation();

  // Start 60s cooldown timer
  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start cooldown on mount
  useEffect(() => {
    startCooldown();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle OTP Form Submit
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (code.length !== 6 || verifyMutation.isPending) return;

    setErrorCode(null);
    setErrorMessage(null);

    verifyMutation.mutate(
      { code },
      {
        onSuccess: (data) => {
          toast.success(
            data.detail || t("auth.verifyEmailSuccessToast", "Email verified successfully!")
          );
        },
        onError: (err) => {
          const axiosErr = err as AxiosError<ApiErrorResponse>;
          const backendError = axiosErr.response?.data;

          if (backendError?.code === "code_expired") {
            setErrorCode("code_expired");
            setErrorMessage(
              backendError.detail ||
              t("auth.verifyEmailCodeExpired", "Verification code has expired.")
            );
          } else if (backendError?.code === "code_invalid") {
            setErrorCode("code_invalid");
            setErrorMessage(
              backendError.detail ||
              t("auth.verifyEmailCodeInvalid", "Invalid verification code.")
            );
            setCode(""); // Clear input on invalid code per section 2.5
          } else {
            const fallbackMsg =
              backendError?.detail ||
              t("auth.verifyEmailFallbackError", "Verification failed. Please try again.");
            setErrorCode("other");
            setErrorMessage(fallbackMsg);
            toast.error(fallbackMsg);
          }
        },
      }
    );
  };

  // Handle Resend Request
  const handleResend = () => {
    if (cooldown > 0 || resendMutation.isPending) return;

    resendMutation.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(
          data.detail ||
          t(
            "auth.verifyEmailResendSuccessToast",
            "A new verification code has been sent to your email."
          )
        );
        setCode("");
        setErrorCode(null);
        setErrorMessage(null);
        startCooldown();
      },
      onError: (err) => {
        const axiosErr = err as AxiosError<ApiErrorResponse>;
        const msg =
          axiosErr.response?.data?.detail ||
          t("auth.verifyEmailResendFallbackError", "Failed to resend verification code.");
        toast.error(msg);
      },
    });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 text-center sm:text-start">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary mb-4">
          <MailCheck className="size-6" aria-hidden="true" />
        </div>
        <h1 className="font-display text-3xl font-black text-foreground">
          {t("auth.verifyEmailTitle", "Verify Your Email")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {t(
            "auth.verifyEmailSubtitle",
            "We have sent a 6-digit verification code to"
          )}{" "}
          <span className="font-bold text-foreground dir-ltr inline-block">
            {user?.email || t("auth.verifyEmailDefaultEmail", "your registered email")}
          </span>
          {t("auth.verifyEmailSubtitleSuffix", ". Please enter it below.")}
        </p>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div
          role="alert"
          className={`mb-6 flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm transition-all ${errorCode === "code_expired"
              ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}
        >
          <AlertTriangle className="size-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-semibold">{errorMessage}</p>
            {errorCode === "code_expired" && (
              <p className="mt-1 text-xs opacity-90">
                {t(
                  "auth.verifyEmailCodeExpiredHelp",
                  "Please click below to request a fresh code."
                )}
              </p>
            )}
          </div>
        </div>
      )}

      {/* OTP Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="otp-input" className="sr-only">
            {t("auth.verifyEmailInputLabel", "6-digit Verification Code")}
          </label>
          <div className="flex justify-center py-2 dir-ltr">
            <InputOTP
              id="otp-input"
              maxLength={6}
              value={code}
              onChange={(val) => {
                setCode(val);
                if (errorCode) {
                  setErrorCode(null);
                  setErrorMessage(null);
                }
              }}
              pattern={REGEXP_ONLY_DIGITS}
              autoFocus
              aria-describedby={errorMessage ? "otp-error" : "otp-hint"}
              aria-invalid={!!errorMessage}
            >
              <InputOTPGroup className="gap-2 sm:gap-3">
                <InputOTPSlot index={0} className="h-12 w-11 text-lg rounded-xl border-border bg-card shadow-sm" />
                <InputOTPSlot index={1} className="h-12 w-11 text-lg rounded-xl border-border bg-card shadow-sm" />
                <InputOTPSlot index={2} className="h-12 w-11 text-lg rounded-xl border-border bg-card shadow-sm" />
                <InputOTPSlot index={3} className="h-12 w-11 text-lg rounded-xl border-border bg-card shadow-sm" />
                <InputOTPSlot index={4} className="h-12 w-11 text-lg rounded-xl border-border bg-card shadow-sm" />
                <InputOTPSlot index={5} className="h-12 w-11 text-lg rounded-xl border-border bg-card shadow-sm" />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <p id="otp-hint" className="mt-2 text-center text-xs text-muted-foreground">
            {t("auth.verifyEmailInputHint", "Enter the 6 numbers sent to your inbox.")}
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={code.length !== 6 || verifyMutation.isPending}
          className="w-full rounded-full bg-brand-gradient text-white py-3 px-6 text-sm font-bold shadow-brand transition-all duration-300 hover:brightness-105 hover:shadow-brand-lg hover:scale-[1.02] active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:brightness-100"
          size="lg"
        >
          {verifyMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {t("auth.verifyEmailVerifying", "Verifying...")}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 className="size-4" />
              {t("auth.verifyEmailButton", "Verify Email")}
            </span>
          )}
        </Button>
      </form>

      {/* Resend Action */}
      <div className="mt-8 text-center pt-6 border-t border-border/60 space-y-2">
        <p className="text-xs text-muted-foreground">
          {t("auth.verifyEmailNoCode", "Didn't receive the email code?")}
        </p>
        <div>
          <Button
            type="button"
            variant="ghost"
            onClick={handleResend}
            disabled={cooldown > 0 || resendMutation.isPending}
            className="text-xs font-bold text-brand-primary hover:text-brand-primary/80 hover:bg-brand-primary/10 rounded-full px-4"
          >
            {resendMutation.isPending ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="size-3.5 animate-spin" />
                {t("auth.verifyEmailResending", "Resending...")}
              </span>
            ) : cooldown > 0 ? (
              <span aria-live="polite">
                {t("auth.verifyEmailResendIn", "Resend in {{seconds}}s", { seconds: cooldown })}
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <RefreshCw className="size-3.5" />
                {t("auth.verifyEmailResendButton", "Resend Code")}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
