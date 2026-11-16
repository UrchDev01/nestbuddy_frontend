import type { Metadata } from "next";
import "./globals.css";
import SessionFetchBridge from "@/components/SessionFetchBridge";

export const metadata: Metadata = {
  title: "NestBuddy",
  description: "Find your perfect room and roommate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        <SessionFetchBridge />
        {children}
      </body>
    </html>
  );
}
