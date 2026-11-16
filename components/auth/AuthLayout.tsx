import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ArrowUpRight, Check, ShieldCheck, X } from "lucide-react";

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthLayout({ eyebrow, title, description, children }: AuthLayoutProps) {
  return (
    <section className="bg-[radial-gradient(ellipse_at_top_left,_#edf6ff_0%,_#fff_58%)] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/" aria-label="NestBuddy home" className="mb-6 inline-flex rounded-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200">
          <img src="/new ui/NestbuddyLogo.png" alt="NestBuddy" className="h-auto w-[142px]" />
        </Link>

        <div className="overflow-hidden rounded-[2rem] border border-[#e5eef8] bg-white shadow-[0_24px_70px_rgba(16,43,80,0.10)] lg:grid lg:min-h-[620px] lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="relative hidden min-h-full flex-col justify-between overflow-hidden bg-[#102b50] p-10 text-white lg:flex xl:p-14">
            <img
              src="/roommates-bonding.avif"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#102b50]/90 via-[#143e70]/70 to-[#2879ef]/70" />
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50">
                <ShieldCheck size={15} /> A home that feels right
              </span>
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-blue-200">{eyebrow}</p>
              <h1 className="mt-3 max-w-sm text-4xl font-bold leading-[1.12] tracking-tight xl:text-[2.8rem]">
                Find your people. Feel at home.
              </h1>
              <p className="mt-5 max-w-sm text-sm leading-7 text-blue-100/90">
                Good living starts with the right place and the people you share it with.
              </p>
            </div>

            <div className="relative z-10 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm leading-6 text-white/95">A more thoughtful way to find a place and a roommate that fit your life.</p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-blue-100">
                <Check size={15} /> Built around better matches
              </div>
            </div>
          </aside>

          <div className="flex min-w-0 flex-col justify-center px-5 py-8 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
            <div className="mx-auto w-full max-w-[430px]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2879ef]">{eyebrow}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#102b50] sm:text-[2.15rem]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#647d99]">{description}</p>
              <div className="mt-8">{children}</div>
              <Link href="/" className="mt-8 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[#647d99] transition hover:text-[#2879ef] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200">
                Back to NestBuddy <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </div>
        <p className="mt-5 text-center text-xs text-[#8194aa]">© {new Date().getFullYear()} NestBuddy. Better roommates. Brighter futures.</p>
      </div>
    </section>
  );
}

interface AuthInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  onChange: (value: string) => void;
}

const inputClassName =
  "min-h-12 w-full rounded-xl border border-[#d9e5f1] bg-white px-4 text-sm text-[#17355c] outline-none transition placeholder:text-[#9aabc0] hover:border-[#b9cee5] focus:border-[#2879ef] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-[#f5f8fb]";

export function AuthInput({
  id,
  label,
  type = "text",
  value,
  placeholder,
  autoComplete,
  required = true,
  disabled = false,
  error,
  onChange,
}: AuthInputProps) {
  const errorId = `${id}-error`;
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-[#17355c]">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={inputClassName}
      />
      {error && <p id={errorId} className="text-xs font-medium text-[#b42334]">{error}</p>}
    </div>
  );
}

interface AuthPasswordInputProps extends Omit<AuthInputProps, "type"> {}

export function AuthPasswordInput(props: AuthPasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const errorId = `${props.id}-error`;
  return (
    <div className="space-y-2">
      <label htmlFor={props.id} className="block text-sm font-semibold text-[#17355c]">
        {props.label}
      </label>
      <div className="relative">
        <input
          id={props.id}
          name={props.id}
          type={visible ? "text" : "password"}
          value={props.value}
          placeholder={props.placeholder}
          autoComplete={props.autoComplete}
          required={props.required ?? true}
          disabled={props.disabled}
          onChange={(event) => props.onChange(event.target.value)}
          aria-invalid={Boolean(props.error)}
          aria-describedby={props.error ? errorId : undefined}
          className={`${inputClassName} pr-20`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 min-h-10 -translate-y-1/2 rounded-lg px-3 text-xs font-semibold text-[#2879ef] hover:bg-[#f0f6ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {props.error && <p id={errorId} className="text-xs font-medium text-[#b42334]">{props.error}</p>}
    </div>
  );
}

interface AuthMessageProps {
  message: string;
  kind?: "error" | "success" | "info";
  onRetry?: () => void;
  retryLabel?: string;
  onDismiss?: () => void;
  autoDismissMs?: number;
}

export function AuthMessage({ message, kind = "error", onRetry, retryLabel = "Try again", onDismiss, autoDismissMs }: AuthMessageProps) {
  useEffect(() => {
    if (!autoDismissMs || !onDismiss) return;
    const timeout = window.setTimeout(onDismiss, autoDismissMs);
    return () => window.clearTimeout(timeout);
  }, [autoDismissMs, message, onDismiss]);

  const styles = {
    error: "border-[#f5c7cd] bg-[#fff5f6] text-[#9c2432]",
    success: "border-[#bce8d4] bg-[#f1fcf6] text-[#16734c]",
    info: "border-[#c8def6] bg-[#f2f8ff] text-[#245b92]",
  };
  return (
    <div role={kind === "error" ? "alert" : "status"} aria-live={kind === "error" ? "assertive" : "polite"} className={`relative rounded-xl border px-4 py-3 pr-11 text-sm leading-6 ${styles[kind]}`}>
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-1 min-h-9 font-bold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current">
          {retryLabel}
        </button>
      )}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function PasswordRequirements({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "Not only numbers", valid: password.length > 0 && !/^\d+$/.test(password) },
  ];
  return (
    <div className="rounded-xl bg-[#f5f9fe] px-4 py-3">
      <p className="text-xs font-semibold text-[#526c88]">Password requirements</p>
      <ul className="mt-2 space-y-1.5">
        {checks.map((check) => (
          <li key={check.label} className={`flex items-center gap-2 text-xs ${check.valid ? "text-[#168052]" : "text-[#71859c]"}`}>
            <Check size={14} aria-hidden="true" /> {check.label}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] leading-5 text-[#71859c]">Avoid common passwords or details like your name or email. Password strength is verified by NestBuddy.</p>
    </div>
  );
}

export function AuthSubmitButton({
  children,
  loading,
  loadingLabel,
  disabled = false,
}: {
  children: ReactNode;
  loading: boolean;
  loadingLabel: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2879ef] px-5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(40,121,239,0.22)] transition hover:bg-[#1769df] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-65"
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
      {loading ? loadingLabel : children}
    </button>
  );
}
