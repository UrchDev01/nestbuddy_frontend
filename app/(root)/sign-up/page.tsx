"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AuthInput,
  AuthLayout,
  AuthMessage,
  AuthPasswordInput,
  AuthSubmitButton,
  PasswordRequirements,
} from "@/components/auth/AuthLayout";
import { isAuthenticated, RegisterUser, type AuthResult } from "@/utils/auth";

interface SignupFields {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  user_type: "student" | "professional" | "none";
  password: string;
}

interface SignupErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const [fields, setFields] = useState<SignupFields>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    user_type: "professional",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuthResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<SignupErrors>({});

  useEffect(() => {
    let active = true;
    void isAuthenticated().then((authenticated) => {
      if (active && authenticated) router.replace("/");
    });
    return () => {
      active = false;
    };
  }, [router]);

  const updateField = <K extends keyof SignupFields>(key: K, value: SignupFields[K]) => {
    setFields((current) => ({ ...current, [key]: value }));
    setResult(null);
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading || result?.status === "success") return;
    setResult(null);
    const errors: SignupErrors = {};
    if (!fields.first_name.trim()) errors.first_name = "Enter your first name.";
    if (!fields.last_name.trim()) errors.last_name = "Enter your last name.";
    if (!fields.email.trim()) errors.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) errors.email = "Please enter a valid email address.";
    if (!fields.password) errors.password = "Choose a password.";
    else if (fields.password.length < 8 || /^\d+$/.test(fields.password)) {
      errors.password = "Your password doesn't meet the required security requirements.";
    }
    if (!confirmPassword) errors.confirm_password = "Confirm your password.";
    else if (fields.password !== confirmPassword) errors.confirm_password = "Passwords don't match.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setLoading(true);
    const response = await RegisterUser({
      email: fields.email.trim(),
      first_name: fields.first_name.trim(),
      last_name: fields.last_name.trim(),
      password: fields.password,
      phone: fields.phone.trim() || undefined,
      user_type: fields.user_type,
    });
    setLoading(false);
    setResult(response);
    setFieldErrors((response.fieldErrors ?? {}) as SignupErrors);
  };

  return (
    <AuthLayout
      eyebrow="Join NestBuddy"
      title="Create your account"
      description="Start finding a place and people that feel like a good fit."
    >
      {result?.status === "success" ? (
        <div className="space-y-5">
          <AuthMessage
            message="Your NestBuddy account has been created successfully. Check your email for a verification code before signing in."
            kind="success"
          />
          <Link href="/verify-account?next=%2Fidentity-verification" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#2879ef] px-5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(40,121,239,0.22)] transition hover:bg-[#1769df] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200">
            Enter verification code
          </Link>
          <p className="text-center text-sm text-[#647d99]">
            Already verified? <Link href="/sign-in" className="font-bold text-[#2879ef] hover:underline">Log in</Link>
          </p>
        </div>
      ) : (
        <form id="signup-form" className="space-y-4" onSubmit={submit} noValidate>
          {result?.status === "error" && (
            <AuthMessage
              message={result.message}
              onDismiss={() => setResult(null)}
              onRetry={result.retryable ? () => {
                const form = document.querySelector<HTMLFormElement>("#signup-form");
                form?.requestSubmit();
              } : undefined}
            />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <AuthInput
              id="first_name"
              label="First name"
              value={fields.first_name}
              onChange={(value) => updateField("first_name", value)}
              autoComplete="given-name"
              placeholder="First name"
              disabled={loading}
              error={fieldErrors.first_name}
            />
            <AuthInput
              id="last_name"
              label="Last name"
              value={fields.last_name}
              onChange={(value) => updateField("last_name", value)}
              autoComplete="family-name"
              placeholder="Last name"
              disabled={loading}
              error={fieldErrors.last_name}
            />
          </div>
          <AuthInput
            id="email"
            label="Email address"
            type="email"
            value={fields.email}
            onChange={(value) => updateField("email", value)}
            autoComplete="email"
            placeholder="you@example.com"
            disabled={loading}
            error={fieldErrors.email}
          />
          <AuthInput
            id="phone"
            label="Phone number"
            value={fields.phone}
            onChange={(value) => updateField("phone", value)}
            autoComplete="tel"
            placeholder="Optional"
            required={false}
            disabled={loading}
          />
          <div className="space-y-2">
            <label htmlFor="user_type" className="block text-sm font-semibold text-[#17355c]">I’m joining as</label>
            <select
              id="user_type"
              name="user_type"
              value={fields.user_type}
              disabled={loading}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "student" || value === "professional" || value === "none") updateField("user_type", value);
              }}
              className="min-h-12 w-full rounded-xl border border-[#d9e5f1] bg-white px-4 text-sm text-[#17355c] outline-none transition focus:border-[#2879ef] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-[#f5f8fb]"
            >
              <option value="professional">Working professional</option>
              <option value="student">Student</option>
              <option value="none">Not specified</option>
            </select>
          </div>
          <AuthPasswordInput
            id="password"
            label="Password"
            value={fields.password}
            onChange={(value) => updateField("password", value)}
            autoComplete="new-password"
            placeholder="Create a password"
            disabled={loading}
            error={fieldErrors.password}
          />
          <PasswordRequirements password={fields.password} />
          <AuthPasswordInput
            id="confirm_password"
            label="Confirm password"
            value={confirmPassword}
            onChange={(value) => {
              setConfirmPassword(value);
              setResult(null);
              setFieldErrors((current) => ({ ...current, confirm_password: undefined }));
            }}
            autoComplete="new-password"
            placeholder="Enter your password again"
            disabled={loading}
            error={fieldErrors.confirm_password}
          />
          <div className="pt-2">
            <p className="mb-4 text-center text-xs leading-5 text-[#647d99]">
              Before creating an account, please review our{" "}
              <Link href="/terms" className="font-bold text-[#2879ef] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef]">
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="font-bold text-[#2879ef] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef]">
                Privacy Policy
              </Link>
              .
            </p>
            <AuthSubmitButton loading={loading} loadingLabel="Creating account...">
              Create account
            </AuthSubmitButton>
          </div>
          <p className="pt-1 text-center text-sm text-[#647d99]">
            Already have an account? <Link href="/sign-in" className="font-bold text-[#2879ef] hover:underline">Log in</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
