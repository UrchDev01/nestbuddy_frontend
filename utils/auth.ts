"use client";

import { RegisterDataProps, UserDataProps } from "@/types";

export interface AuthResult {
  status: "success" | "error";
  message: string;
  error?: string;
  code?: string;
  data?: Record<string, unknown>;
  fieldErrors?: Record<string, string>;
  retryable?: boolean;
  warning?: string;
}

export interface RoommateOnboarding {
  personal_profile_complete: boolean;
  roommate_preferences_complete: boolean;
  compatibility_quiz_complete: boolean;
  roommate_matching_ready: boolean;
  next_step: "personal_profile" | "roommate_preferences" | "compatibility_quiz" | null;
  quiz?: { answered_questions: number; required_questions: number };
}

const apiBase = () => process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
let csrfTokenValue: string | undefined;
// Capture the browser implementation before legacy modules install their
// compatibility wrapper. This prevents sessionFetch from recursively calling it.
const nativeFetch: typeof fetch = globalThis.fetch.bind(globalThis);

function csrfToken(): string | undefined {
  return csrfTokenValue;
}

export async function ensureCsrfToken(): Promise<void> {
  const base = apiBase();
  if (!base) throw new Error("NestBuddy's server address is not configured.");
  const response = await nativeFetch(`${base}/api/v1/auth/csrf/`, { credentials: "include" });
  if (!response.ok) throw new Error("Unable to establish CSRF protection.");
  const payload = await response.json() as { csrfToken?: unknown };
  if (typeof payload.csrfToken !== "string" || !payload.csrfToken) {
    throw new Error("The server did not provide a CSRF token.");
  }
  // This is not an authentication credential. Keep it in memory so this also
  // works when app.example.com calls an API on api.example.com.
  csrfTokenValue = payload.csrfToken;
}

/** Shared browser API transport for cookie-authenticated requests. */
export async function sessionFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS", "TRACE"].includes(method)) await ensureCsrfToken();
  const headers = new Headers(init.headers);
  const token = csrfToken();
  if (token) headers.set("X-CSRFToken", token);
  return nativeFetch(input, {
    ...init,
    credentials: "include",
    headers,
  });
}

async function requestAuth(path: string, body: object, action: string): Promise<AuthResult> {
  try {
    await ensureCsrfToken();
    const response = await sessionFetch(`${apiBase()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({})) as { status?: string; message?: string; error?: string; data?: Record<string, unknown> };
    if (response.ok && payload.status === "success") return { status: "success", message: payload.message ?? "Your request was completed.", data: payload.data };
    const emailNotVerified = action === "login"
      && (response.status === 400 || response.status === 401)
      && Boolean(payload.error?.toLowerCase().includes("not verified"));
    const message = action === "login" && (response.status === 400 || response.status === 401)
      ? (emailNotVerified ? "Please verify your email address before logging in." : "Incorrect email or password. Please check your details and try again.")
      : payload.error ?? payload.message ?? "We couldn't complete your request. Please try again.";
    return {
      status: "error",
      message,
      error: message,
      ...(emailNotVerified ? { code: "email-not-verified" } : {}),
    };
  } catch {
    return { status: "error", message: "Unable to connect to NestBuddy right now. Please try again.", retryable: true };
  }
}

export const loginUser = (data: UserDataProps) => requestAuth("/auth/login", data, "login");
export const RegisterUser = (data: RegisterDataProps) => requestAuth("/auth/register", data, "signup");
export const forgotPassword = (email: string) => requestAuth("/auth/forgot-password", { email }, "forgot");
export const resetPassword = (token: string, password: string, confirmPassword: string) => requestAuth("/auth/reset-password", { token, password, confirm_password: confirmPassword }, "reset");
export const verifyUser = (code: string) => requestAuth("/auth/verify-user", { code }, "verify");
export const resendVerificationCode = (email: string) => requestAuth("/auth/resend-verification", { email: email.trim().toLowerCase() }, "resend");

export async function logoutUser(): Promise<AuthResult> {
  const result = await requestAuth("/auth/logout", {}, "logout");
  return result.status === "success" ? result : { status: "success", message: "You've been signed out on this device." };
}

export async function getCurrentUser(): Promise<Record<string, unknown> | null> {
  const response = await fetch(`${apiBase()}/api/v1/auth/me/`, { credentials: "include" });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Unable to check your current session.");
  const body = await response.json() as { data?: { user?: Record<string, unknown> } };
  return body.data?.user ?? null;
}

export async function getRoommateOnboarding(): Promise<RoommateOnboarding> {
  const response = await fetch(`${apiBase()}/api/v1/auth/me/`, { credentials: "include" });
  if (!response.ok) throw new Error("Unable to check onboarding status.");
  const body = await response.json() as { data?: { onboarding?: RoommateOnboarding } };
  if (!body.data?.onboarding) throw new Error("The server did not provide onboarding status.");
  return body.data.onboarding;
}

export async function isAuthenticated(): Promise<boolean> { return (await getCurrentUser()) !== null; }
// Compatibility no-ops: auth state now belongs exclusively to the Django session.
export function logOut(): void {}
export function clearAuthNotice(): void {}
