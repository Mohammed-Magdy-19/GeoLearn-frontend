/**
 * src/features/auth/authValidators.ts
 *
 * Zod schemas for all authentication forms.
 * Validation runs entirely on the client before any network call is made,
 * giving instant feedback without a round-trip to Django.
 *
 * These schemas are consumed by react-hook-form via @hookform/resolvers/zod.
 */

import { z } from "zod";

// ── Username Rules ─────────────────────────────────────────────────────────
// Mirrors the regex in apps/authentication/serializers.py so errors are
// caught client-side before they even reach the server.
const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters.")
  .max(50, "Username cannot exceed 50 characters.")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Only letters, digits, underscores (_), and hyphens (-) are allowed."
  )
  .transform((val) => val.toLowerCase().trim()); // Normalize before submission

// ── Password Rules ─────────────────────────────────────────────────────────
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password is too long.");

// ── Login Schema ───────────────────────────────────────────────────────────
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required.")
    .transform((val) => val.toLowerCase().trim()),
  password: z.string().min(1, "Password is required."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ── Registration Schema ────────────────────────────────────────────────────
export const registerSchema = z
  .object({
    username: usernameSchema,
    full_name: z
      .string()
      .min(2, "Full name must be at least 2 characters.")
      .max(150, "Full name is too long.")
      .trim(),
    email: z
      .string()
      .email("Enter a valid email address.")
      .optional()
      .or(z.literal("")), // Allow empty string (field is optional)
    password: passwordSchema,
    password_confirm: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.password_confirm, {
    // Cross-field validation — mirrors the server-side check
    message: "Passwords do not match.",
    path: ["password_confirm"], // Attach the error to this specific field
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
