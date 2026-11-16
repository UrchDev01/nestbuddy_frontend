"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { FiBell, FiCheck, FiMessageCircle, FiX } from "react-icons/fi";
import { isSafeNotificationPath } from "@/utils/notifications";
import { useNotifications } from "@/components/NotificationProvider";

function NotificationGlyph({ type }: { type: string }) {
  return type.startsWith("chat.") ? (
    <FiMessageCircle aria-hidden="true" />
  ) : (
    <FiBell aria-hidden="true" />
  );
}

export default function NotificationsMenu() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    markAllRead,
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const container = useRef<HTMLDivElement | null>(null);
  const recent = notifications.slice(0, 6);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !container.current?.contains(event.target)
      )
        setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", dismiss);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", dismiss);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const openNotification = async (id: number, targetUrl: string, isRead: boolean) => {
    if (isSafeNotificationPath(targetUrl)) {
      if (!isRead) {
        try {
          await markRead(id);
        } catch {
          setActionError("Unable to update this notification. Please try again.");
          return;
        }
      }
      setOpen(false);
      router.push(targetUrl);
    } else {
      setActionError("This notification link is unavailable.");
    }
  };

  return (
    <div className="relative" ref={container}>
      <button
        type="button"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
          setActionError(null);
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-xl text-[#35506f] transition-colors hover:bg-[#f3f8ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2879ef]"
      >
        <FiBell aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-[#e34e57] px-1 text-center text-[10px] font-bold leading-5 text-white-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section
          role="dialog"
          aria-label="Notifications"
          className="fixed left-3 right-3 top-[68px] z-[70] max-h-[min(75vh,560px)] overflow-hidden rounded-2xl border border-[#dfeaf6] bg-white-1 shadow-[0_18px_48px_rgba(16,43,80,0.2)] sm:left-auto sm:right-4 sm:top-[76px] sm:w-[380px]"
        >
          <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="font-bold text-[#102b50]">Notifications</h2>
              <p className="text-xs text-slate-500">
                {unreadCount} unread
              </p>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    void markAllRead().catch(() =>
                      setActionError("Unable to mark notifications as read."),
                    )
                  }
                  className="rounded-lg px-2 py-2 text-xs font-semibold text-[#2879ef] hover:bg-[#f2f7ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2879ef]"
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                aria-label="Close notifications"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2879ef]"
              >
                <FiX aria-hidden="true" />
              </button>
            </div>
          </header>
          <div className="max-h-[calc(min(75vh,560px)-120px)] overflow-y-auto">
            {loading && recent.length === 0 ? (
              <div className="space-y-3 p-4" aria-label="Loading notifications">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <FiBell className="mx-auto mb-3 text-2xl text-[#9bb0c8]" aria-hidden="true" />
                <p className="font-semibold text-[#102b50]">You’re all caught up</p>
                <p className="mt-1 text-sm text-slate-500">
                  New activity will appear here.
                </p>
              </div>
            ) : (
              <ul>
                {recent.map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() =>
                        void openNotification(
                          notification.id,
                          notification.target_url,
                          notification.is_read,
                        )
                      }
                      className={`flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-[#f6f9fd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#2879ef] ${
                        notification.is_read ? "bg-white" : "bg-[#f3f8ff]"
                      }`}
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eaf3ff] text-[#2879ef]">
                        <NotificationGlyph type={notification.type} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <strong className="text-sm text-[#183858]">
                            {notification.title}
                          </strong>
                          {!notification.is_read && (
                            <span
                              className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#2879ef]"
                              aria-label="Unread"
                            />
                          )}
                        </span>
                        <span className="mt-0.5 block break-words text-sm text-slate-600">
                          {notification.message}
                        </span>
                        <time className="mt-1 block text-xs text-slate-400">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                          })}
                        </time>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {(error || actionError) && (
            <div role="alert" className="border-t border-rose-100 px-4 py-2 text-sm text-rose-700">
              {actionError ?? error}
              <button
                type="button"
                onClick={() => {
                  setActionError(null);
                  void refresh();
                }}
                className="ml-2 font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}
          <footer className="border-t border-slate-100 p-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/notifications");
              }}
              className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-[#2879ef] hover:bg-[#f2f7ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2879ef]"
            >
              <FiCheck aria-hidden="true" />
              View all notifications
            </button>
          </footer>
        </section>
      )}
    </div>
  );
}
