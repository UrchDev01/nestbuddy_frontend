"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthInput, AuthLayout, AuthMessage, AuthPasswordInput, AuthSubmitButton } from "@/components/auth/AuthLayout";
import { clearAuthNotice, isAuthenticated, loginUser, type AuthResult } from "@/utils/auth";

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuthResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const destination = () => {
    const next = new URLSearchParams(window.location.search).get("next");
    return next?.startsWith("/") && !next.startsWith("//") ? next : "/";
  };

  useEffect(() => {
    try {
      const storedNotice = sessionStorage.getItem("auth_notice");
      if (storedNotice) {
        const notice = JSON.parse(storedNotice) as { message?: string; kind?: string; createdAt?: number };
        const isRecent = notice.createdAt !== undefined && Date.now() - notice.createdAt < 30_000;
        if (notice.message && isRecent) {
          setResult({
            status: "success",
            message: notice.message,
            ...(notice.kind === "info" ? { warning: notice.message } : {}),
          });
        }
        clearAuthNotice();
      }
    } catch {}

    let active = true;
    void isAuthenticated().then((authenticated) => {
      if (active && authenticated) router.replace(destination());
    });
    return () => {
      active = false;
    };
  }, [router]);

  const submit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (loading) return;
    setResult(null);
    sessionStorage.removeItem("auth_notice");
    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Please enter a valid email address.";
    if (!password) errors.password = "Enter your password.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setLoading(true);
    const response = await loginUser({ email: email.trim(), password });
    setLoading(false);
    setResult(response.status === "success"
      ? { ...response, message: "Welcome back! Redirecting you...", code: "login-success" }
      : response);
    setFieldErrors((response.fieldErrors ?? {}) as FieldErrors);
    if (response.status === "success") {
      window.setTimeout(() => router.replace(destination()), 1000);
    } else if (response.code === "email-not-verified") {
      window.setTimeout(() => router.push("/verify-account"), 2500);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to NestBuddy"
      description="Find your perfect roommate or a place to call home."
    >
      <form className="space-y-5" onSubmit={submit} noValidate>
        {result && (
          <AuthMessage
            message={result.message}
            kind={result.status === "success" ? (result.warning ? "info" : "success") : "error"}
            onRetry={result.status === "error" && result.retryable ? () => void submit() : undefined}
            autoDismissMs={result.status === "success" ? 8000 : undefined}
            onDismiss={() => {
              setResult(null);
              clearAuthNotice();
            }}
          />
        )}
        <AuthInput
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={(value) => {
            setEmail(value);
            setResult(null);
            clearAuthNotice();
            setFieldErrors((current) => ({ ...current, email: undefined }));
          }}
          autoComplete="email"
          placeholder="you@example.com"
          disabled={loading}
          error={fieldErrors.email}
        />
        <div className="space-y-2">
          <AuthPasswordInput
            id="password"
            label="Password"
            value={password}
            onChange={(value) => {
              setPassword(value);
              setResult(null);
              clearAuthNotice();
              setFieldErrors((current) => ({ ...current, password: undefined }));
            }}
            autoComplete="current-password"
            placeholder="Enter your password"
            disabled={loading}
            error={fieldErrors.password}
          />
          <div className="flex justify-end">
            <Link href="/forgot-password" className="min-h-11 inline-flex items-center text-sm font-semibold text-[#2879ef] hover:text-[#145fc5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200">
              Forgot password?
            </Link>
          </div>
        </div>
        <AuthSubmitButton loading={loading} loadingLabel="Signing in...">
          Log in
        </AuthSubmitButton>
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <span className="w-full border-t border-[#e8eef5]" />
          </div>
          <p className="relative mx-auto w-fit bg-white px-3 text-xs text-[#8194aa]">New to NestBuddy?</p>
        </div>
        <Link href="/sign-up" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[#c9dbef] bg-white px-5 text-sm font-bold text-[#22558e] transition hover:border-[#2879ef] hover:bg-[#f5f9ff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200">
          Create an account
        </Link>
      </form>
    </AuthLayout>
  );
}
