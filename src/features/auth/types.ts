/**
 * src/features/auth/types.ts
 *
 * Types for email verification requests, responses, and errors.
 * Section 1.6 contract matching:
 *   - code_expired
 *   - code_invalid
 */

export interface VerifyEmailRequest {
  code: string;
}

export interface VerifyEmailResponse {
  detail: string;
}

export interface ResendVerificationResponse {
  detail: string;
}

export interface ApiErrorResponse {
  detail: string;
  code?: string;
}
