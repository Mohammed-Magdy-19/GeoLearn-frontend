/**
 * src/features/auth/components/VerifyEmailPage.tsx
 *
 * Route-level page for email verification (/verify-email).
 *
 * Routing & access rules:
 *   - Requires valid identity context (authenticated user with JWT)
 *   - Already-verified users redirect away to home "/"
 *   - Unauthenticated visitors redirect away to "/login"
 */

import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import VerifyEmailForm from "./VerifyEmailForm";

export default function VerifyEmailPage() {
  const { user, accessToken, isHydrating } = useAuthStore();

  // 1. Session Hydration loading guard
  if (isHydrating) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // 2. Redirect to login if user is not authenticated
  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Redirect to home if user is already verified
  if (user.is_email_verified) {
    return <Navigate to="/" replace />;
  }

  return <VerifyEmailForm />;
}
