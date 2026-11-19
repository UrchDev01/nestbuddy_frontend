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
  const isMessagesPage =
    pathname === "/messages" || pathname.startsWith("/messages/");

  return (
    <NotificationProvider>
      <div
        className={`relative flex flex-col ${
          isMessagesPage ? "h-[100dvh] overflow-hidden" : "min-h-screen"
        }`}
      >
        {!isAuthPage && <Navbar />}
        <main
          className={`w-full flex-1 ${
            isMessagesPage
              ? "mt-16 h-[calc(100dvh-4rem)] min-h-0 overflow-hidden lg:mt-[72px] lg:h-[calc(100dvh-72px)]"
              : isAuthPage
                ? ""
                : "mt-[3rem] lg:mt-[3.4rem] lg:pt-4"
          }`}
        >
          {children}
        </main>
        {!isAuthPage && !isMessagesPage && (
          <div className="mt-0 w-full bg-white-1 p-0">
            <Footer />
          </div>
        )}
      </div>
    </NotificationProvider>
  );
}
