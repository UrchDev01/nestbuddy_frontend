"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchIdentityVerificationStatus } from "@/utils/api";
import LoadingOne from "./LoadingOne";

export default function VerificationGuard({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState(false); const router = useRouter(); const pathname = usePathname();
  useEffect(() => { fetchIdentityVerificationStatus().then((state) => {
    if (state.access_allowed) setAllowed(true);
    else router.replace(`/identity-verification?next=${encodeURIComponent(pathname)}`);
  }).catch(() => router.replace(`/identity-verification?next=${encodeURIComponent(pathname)}`)); }, [pathname, router]);
  return allowed ? <>{children}</> : <div className="flex min-h-screen items-center justify-center"><LoadingOne /></div>;
}
