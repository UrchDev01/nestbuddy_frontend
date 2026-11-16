"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { AuthInput, AuthLayout, AuthMessage, AuthSubmitButton } from "@/components/auth/AuthLayout";
import { clearAuthNotice, forgotPassword, type AuthResult } from "@/utils/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuthResult | null>(null);

  const submit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (loading) return;
    setResult(null);

    // Client-side validation
    if (!email.trim()) {
      setEmailError("Enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError(undefined);

    setLoading(true);
    const response = await forgotPassword(email.trim());
    setLoading(false);

    // Always show the generic success message regardless of whether the
    // email exists — this prevents user enumeration.
    if (response.status === "success" || !response.retryable) {
      setResult({
        status: "success",
        message:
          "If an account exists for this email, you'll receive password reset instructions shortly. Check your inbox (and spam folder).",
      });
    } else {
      setResult(response);
    }
  };

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Forgot your password?"
      description="Enter your email address and we'll send you a link to reset your password."
    >
      <form className="space-y-5" onSubmit={submit} noValidate>
        {result && (
          <AuthMessage
            message={result.message}
            kind={result.status === "success" ? "success" : "error"}
            onRetry={result.status === "error" && result.retryable ? () => void submit() : undefined}
            autoDismissMs={result.status === "success" ? undefined : undefined}
            onDismiss={() => {
              setResult(null);
              clearAuthNotice();
            }}
          />
        )}

        {/* Hide the form after a successful submission so the user just sees the message */}
        {result?.status !== "success" && (
          <>
            <AuthInput
              id="email"
              label="Email address"
              type="email"
              value={email}
              onChange={(value) => {
                setEmail(value);
                setResult(null);
                setEmailError(undefined);
              }}
              autoComplete="email"
              placeholder="you@example.com"
              disabled={loading}
              error={emailError}
            />

            <AuthSubmitButton loading={loading} loadingLabel="Sending reset link…">
              Send reset link
            </AuthSubmitButton>
          </>
        )}

        {result?.status === "success" && (
          <Link
            href="/sign-in"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[#c9dbef] bg-white px-5 text-sm font-bold text-[#22558e] transition hover:border-[#2879ef] hover:bg-[#f5f9ff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
          >
            Back to log in
          </Link>
        )}

        {result?.status !== "success" && (
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
