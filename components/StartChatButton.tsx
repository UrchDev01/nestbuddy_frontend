"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiMessageCircle } from "react-icons/fi";
import { createConversation } from "@/utils/messages";

export default function StartChatButton({
  userId,
  label = "Message",
  redirectPath,
  profileSlug,
}: {
  userId: number;
  label?: string;
  redirectPath?: string;
  profileSlug: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const start = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const conversation = await createConversation(userId);
      router.push(`/messages/${conversation.id}`);
    } catch (cause) {
      if (cause instanceof Error && cause.message === "Please sign in to use messages.") {
        router.push(
          `/sign-in?next=${encodeURIComponent(redirectPath ?? `/roommates/${profileSlug}`)}`,
        );
      } else {
        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to open chat. Please try again.",
        );
      }
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="grid gap-1">
      <button
        type="button"
        onClick={() => void start()}
        disabled={busy}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#2879ef] px-4 py-2 text-sm font-bold text-white-1 shadow-sm transition hover:bg-[#1f6fdd] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef] focus-visible:ring-offset-2"
      >
        <FiMessageCircle aria-hidden="true" />
        {busy ? "Opening…" : label}
      </button>
      {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}
    </div>
  );
}
