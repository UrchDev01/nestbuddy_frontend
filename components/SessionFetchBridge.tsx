"use client";

import { sessionFetch } from "@/utils/auth";

declare global {
  interface Window {
    __nestBuddySessionFetchInstalled?: boolean;
  }
}

const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

// This bridge keeps every pre-existing fetch-based page working while API
// functions are migrated to sessionFetch one by one. It only touches requests
// sent to the configured Django API, never third-party requests.
if (typeof window !== "undefined" && apiBase && !window.__nestBuddySessionFetchInstalled) {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (!url.startsWith(apiBase)) return nativeFetch(input, init);
    const headers = new Headers(init.headers);
    headers.delete("Authorization");
    return sessionFetch(input, { ...init, headers });
  };
  window.__nestBuddySessionFetchInstalled = true;
}

export default function SessionFetchBridge() {
  return null;
}
