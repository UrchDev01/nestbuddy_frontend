"use client";

import { Suspense, type FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AuthLayout,
  AuthMessage,
  AuthPasswordInput,
  AuthSubmitButton,
  PasswordRequirements,
} from "@/components/auth/AuthLayout";
import { clearAuthNotice, resetPassword, type AuthResult } from "@/utils/auth";

// ─── Inner component (uses useSearchParams — must be inside Suspense) ───────

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuthResult | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  // If there is no token in the URL, show an error immediately.
  const missingToken = !token;

  useEffect(() => {
    if (missingToken) {
      setResult({
        status: "error",
        message:
          "This password reset link is invalid or has expired. Please request a new reset link.",
      });
    }
  }, [missingToken]);

  const submit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (loading || missingToken || succeeded) return;
    setResult(null);

    // Client-side validation
    const errors: typeof fieldErrors = {};
    if (!password) {
      errors.password = "Enter a new password.";
    }
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your new password.";
    } else if (password && password !== confirmPassword) {
      errors.confirmPassword = "Passwords don't match.";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setLoading(true);
    const response = await resetPassword(token, password, confirmPassword);
    setLoading(false);

    if (response.status === "success") {
      setSucceeded(true);
      setResult({
        status: "success",
        message: "Your password has been reset successfully. You can now log in with your new password.",
      });
    } else {
      setResult(response);
      setFieldErrors((response.fieldErrors as typeof fieldErrors) ?? {});
    }
  };

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Reset your password"
      description="Choose a new password for your NestBuddy account."
    >
      <form className="space-y-5" onSubmit={submit} noValidate>
        {result && (
          <AuthMessage
            message={result.message}
            kind={result.status === "success" ? "success" : "error"}
            onRetry={
              result.status === "error" && result.retryable && !missingToken
                ? () => void submit()
                : undefined
            }
            onDismiss={
              result.status !== "success"
                ? () => {
                    setResult(null);
                    clearAuthNotice();
                  }
                : undefined
            }
          />
        )}

        {/* Show the form only while the reset has not yet succeeded and the token exists */}
        {!succeeded && !missingToken && (
          <>
            <AuthPasswordInput
              id="password"
              label="New password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                setResult(null);
                setFieldErrors((current) => ({ ...current, password: undefined }));
              }}
              autoComplete="new-password"
              placeholder="Create a strong password"
              disabled={loading}
              error={fieldErrors.password}
            />

            <PasswordRequirements password={password} />

            <AuthPasswordInput
              id="confirm_password"
              label="Confirm new password"
              value={confirmPassword}
              onChange={(value) => {
                setConfirmPassword(value);
                setResult(null);
                setFieldErrors((current) => ({ ...current, confirmPassword: undefined }));
              }}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              disabled={loading}
              error={fieldErrors.confirmPassword}
            />

            <AuthSubmitButton loading={loading} loadingLabel="Resetting password…">
              Reset password
            </AuthSubmitButton>
          </>
        )}

        {/* After success, show a Log In button */}
        {succeeded && (
          <Link
            href="/sign-in"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#2879ef] px-5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(40,121,239,0.22)] transition hover:bg-[#1769df] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
          >
            Log in
          </Link>
        )}

        {/* If the token is missing / expired, offer to request a new link */}
        {missingToken && (
          <Link
            href="/forgot-password"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#2879ef] px-5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(40,121,239,0.22)] transition hover:bg-[#1769df] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
          >
            Request a new reset link
          </Link>
        )}

        {!succeeded && (
          <div className="text-center">
            <Link
              href="/sign-in"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-[#647d99] transition hover:text-[#2879ef] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
            >
              ← Back to log in
            </Link>
          </div>
        )}
      </form>
    </AuthLayout>
  );
}

// ─── Exported page: wraps the inner component in Suspense ───────────────────
// Required by Next.js 15 because useSearchParams() opts the component out of
// static rendering.

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout
          eyebrow="Account recovery"
          title="Reset your password"
          description="Choose a new password for your NestBuddy account."
        >
          <div className="flex min-h-[180px] items-center justify-center">
            <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-[#d9e5f1] border-t-[#2879ef]" aria-label="Loading…" />
          </div>
        </AuthLayout>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
