"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthInput, AuthLayout, AuthMessage, AuthSubmitButton } from "@/components/auth/AuthLayout";
import { verifyUser, type AuthResult } from "@/utils/auth";

function VerifyAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuthResult | null>(null);
  const [codeError, setCodeError] = useState<string>();

  useEffect(() => {
    if (result?.status !== "success") return;
    const next = searchParams.get("next");
    const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/sign-in";
    const timeout = window.setTimeout(() => router.replace(destination === "/sign-in" ? destination : `/sign-in?next=${encodeURIComponent(destination)}`), 2500);
    return () => window.clearTimeout(timeout);
  }, [result?.status, router, searchParams]);

  const submit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (loading) return;
    setResult(null);
    if (!code.trim()) {
      setCodeError("Enter the verification code from your email.");
      return;
    }
    setCodeError(undefined);
    setLoading(true);
    const response = await verifyUser(code.trim());
    setLoading(false);
    setResult(response);
  };

  return (
    <AuthLayout
      eyebrow="One last step"
      title="Verify your email"
      description="Enter the verification code sent to your email to finish creating your account."
    >
      <form className="space-y-5" onSubmit={submit} noValidate>
        {result?.status === "success" && (
          <AuthMessage
            message="Your email has been verified. You can now log in to NestBuddy."
            kind="success"
            autoDismissMs={2500}
          />
        )}
        {result?.status === "error" && (
          <AuthMessage
            message={result.message}
            onRetry={result.retryable ? () => void submit() : undefined}
            onDismiss={() => setResult(null)}
          />
        )}
        {result?.status !== "success" && (
          <>
            <AuthInput
              id="code"
              label="Verification code"
              value={code}
              onChange={(value) => {
                setCode(value);
                setCodeError(undefined);
                setResult(null);
              }}
              autoComplete="one-time-code"
              placeholder="Paste your verification code"
              disabled={loading}
              error={codeError}
            />
            <AuthSubmitButton loading={loading} loadingLabel="Verifying email...">
              Verify email
            </AuthSubmitButton>
          </>
        )}
        <p className="text-center text-sm text-[#647d99]">
          <Link href="/sign-in" className="font-bold text-[#2879ef] hover:underline">Back to log in</Link>
        </p>
        {result?.status !== "success" && (
          <p className="text-center text-sm text-[#647d99]">
            Didn&apos;t receive a code?{" "}
            <Link href="/resend-verification-code" className="font-bold text-[#2879ef] hover:underline">
              Resend verification code
            </Link>
          </p>
        )}
      </form>
    </AuthLayout>
  );
}

export default function VerifyAccountPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout
          eyebrow="One last step"
          title="Verify your email"
          description="Enter the verification code sent to your email to finish creating your account."
        >
          <div className="flex min-h-[180px] items-center justify-center">
            <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-[#d9e5f1] border-t-[#2879ef]" aria-label="Loading..." />
          </div>
        </AuthLayout>
      }
    >
      <VerifyAccountContent />
    </Suspense>
  );
}
