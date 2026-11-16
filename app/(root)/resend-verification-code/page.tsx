"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AuthInput,
  AuthLayout,
  AuthMessage,
  AuthSubmitButton,
} from "@/components/auth/AuthLayout";
import {
  isAuthenticated,
  resendVerificationCode,
  type AuthResult,
} from "@/utils/auth";

export default function ResendVerificationCodePage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuthResult | null>(null);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    void isAuthenticated().then((authenticated) => {
      if (active && authenticated) router.replace("/");
    });
    return () => {
      active = false;
    };
  }, [router]);

  const submit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (loading) return;
    setResult(null);

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setEmailError("Enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setEmailError(undefined);
    setLoading(true);
    const response = await resendVerificationCode(normalizedEmail);
    setLoading(false);

    if (response.status === "success" || !response.retryable) {
      setResult({
        status: "success",
        message:
          "If an unverified account exists for this email, a verification code will be sent. Check your inbox and spam folder.",
      });
    } else {
      setResult(response);
    }
  };

  return (
    <AuthLayout
      eyebrow="Email verification"
      title="Resend your verification code"
      description="Enter the email address you used to sign up. If an unverified account exists, we’ll send a fresh code."
    >
      <form className="space-y-5" onSubmit={submit} noValidate>
        {result && (
          <AuthMessage
            message={result.message}
            kind={result.status === "success" ? "success" : "error"}
            onRetry={result.status === "error" && result.retryable ? () => void submit() : undefined}
            onDismiss={() => setResult(null)}
          />
        )}

        {result?.status !== "success" && (
          <>
            <AuthInput
              id="email"
              label="Email address"
              type="email"
              value={email}
              onChange={(value) => {
                setEmail(value);
                setEmailError(undefined);
                setResult(null);
              }}
              autoComplete="email"
              placeholder="you@example.com"
              disabled={loading}
              error={emailError}
            />
            <AuthSubmitButton loading={loading} loadingLabel="Sending verification code…">
              Resend verification code
            </AuthSubmitButton>
          </>
        )}

        {result?.status === "success" ? (
          <Link
            href="/verify-account"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#2879ef] px-5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(40,121,239,0.22)] transition hover:bg-[#1769df] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
          >
            Enter verification code
          </Link>
        ) : (
          <div className="text-center">
            <Link
              href="/verify-account"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-[#647d99] transition hover:text-[#2879ef] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
            >
              Already have a code? Verify your email
            </Link>
          </div>
        )}
      </form>
    </AuthLayout>
  );
}
