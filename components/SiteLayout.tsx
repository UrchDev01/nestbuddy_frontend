"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";
import { NotificationProvider } from "@/components/NotificationProvider";

const authPaths = new Set([
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-account",
  "/resend-verification-code",
]);

export default function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = authPaths.has(pathname);

  return (
    <NotificationProvider>
      <div className="relative flex min-h-screen flex-col">
        {!isAuthPage && <Navbar />}
        <main className={`w-full flex-1 ${isAuthPage ? "" : "mt-[3rem] lg:mt-[3.4rem] lg:pt-4"}`}>
          {children}
        </main>
        {!isAuthPage && (
          <div className="mt-0 w-full bg-white-1 p-0">
            <Footer />
          </div>
        )}
      </div>
    </NotificationProvider>
  );
}
