"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { FiBell, FiCheck, FiMessageCircle } from "react-icons/fi";
import { useNotifications } from "@/components/NotificationProvider";
import {
  AppNotification,
  isSafeNotificationPath,
  listNotifications,
} from "@/utils/notifications";
import { getCurrentUser } from "@/utils/auth";

type Filter = "all" | "unread";

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications: liveNotifications,
    lastEvent,
    unreadCount,
    markRead,
    markAllRead,
  } = useNotifications();
  const [filter, setFilter] = useState<Filter>("all");
  const [items, setItems] = useState<AppNotification[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadPage = useCallback(
    async (nextPage: number, append: boolean) => {
      const user = await getCurrentUser().catch(() => null);
      if (!user) {
        setError("Please sign in to view your notifications.");
        setLoading(false);
        setLoadingMore(false);
        return;
      }
      try {
        const result = await listNotifications("session", {
          page: nextPage,
          pageSize: 20,
          read: filter === "unread" ? false : undefined,
        });
        setItems((current) => {
          if (!append) return result.results;
          const ids = new Set(current.map((notification) => notification.id));
          return [
            ...current,
            ...result.results.filter((notification) => !ids.has(notification.id)),
          ];
        });
        setPage(nextPage);
        setHasMore(Boolean(result.next));
        setError(null);
      } catch {
        setError("Unable to load notifications. Please try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filter],
  );

  useEffect(() => {
    setLoading(true);
    setItems([]);
    void loadPage(1, false);
  }, [filter, loadPage]);

  useEffect(() => {
    if (liveNotifications.length === 0) return;
    setItems((current) => {
      const incoming = liveNotifications.filter(
        (notification) => filter === "all" || !notification.is_read,
      );
      const existingIds = new Set(current.map((notification) => notification.id));
      const newItems = incoming.filter((notification) => !existingIds.has(notification.id));
      const merged = [...newItems, ...current];
      const updated = new Map(incoming.map((notification) => [notification.id, notification]));
      return merged.map((notification) => updated.get(notification.id) ?? notification);
    });
  }, [liveNotifications, filter]);

  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.event === "notification.created") {
      const notification = lastEvent.data as AppNotification;
      if (filter === "unread" && notification.is_read) return;
      setItems((current) =>
        current.some((item) => item.id === notification.id)
          ? current
          : [notification, ...current],
      );
    } else if (lastEvent.event === "notification.updated") {
      const notification = lastEvent.data as AppNotification;
      setItems((current) =>
        filter === "unread" && notification.is_read
          ? current.filter((item) => item.id !== notification.id)
          : current.map((item) =>
              item.id === notification.id ? notification : item,
            ),
      );
    } else if (lastEvent.event === "notification.all_read") {
      if (filter === "unread") setItems([]);
      else {
        const readAt =
          (lastEvent.data as { read_at?: string }).read_at ??
          new Date().toISOString();
        setItems((current) =>
          current.map((item) => ({
            ...item,
            is_read: true,
            read_at: item.read_at ?? readAt,
          })),
        );
      }
    }
  }, [lastEvent, filter]);

  const openNotification = async (notification: AppNotification) => {
    if (!isSafeNotificationPath(notification.target_url)) {
      setActionError("This notification destination is unavailable.");
      return;
    }
    if (!notification.is_read) {
      try {
        await markRead(notification.id);
      } catch {
        setActionError("Unable to update this notification. Please try again.");
        return;
      }
    }
    router.push(notification.target_url);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      if (filter === "unread") setItems([]);
      else
        setItems((current) =>
          current.map((notification) => ({
            ...notification,
            is_read: true,
            read_at: notification.read_at ?? new Date().toISOString(),
          })),
        );
      setActionError(null);
    } catch {
      setActionError("Unable to mark notifications as read. Please try again.");
    }
  };

  return (
    <main className="min-h-[calc(100vh-7rem)] bg-[#f4f8ff] px-3 py-8 sm:px-5">
      <section className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-[#dfeeff] bg-white shadow-[0_16px_45px_rgba(24,84,180,0.09)]">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-8">
          <div>
            <h1 className="text-2xl font-extrabold text-[#102b50]">Notifications</h1>
            <p className="mt-1 text-sm text-slate-500">
              {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void handleMarkAllRead()}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#cfe1f7] px-3 py-2 text-sm font-semibold text-[#2879ef] transition hover:bg-[#f3f8ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2879ef]"
            >
              <FiCheck aria-hidden="true" /> Mark all as read
            </button>
          )}
        </header>

        <div className="flex gap-2 border-b border-slate-100 px-5 py-3 sm:px-8">
          {(["all", "unread"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={`min-h-10 rounded-full px-4 text-sm font-semibold capitalize focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2879ef] ${
                filter === value
                  ? "bg-[#eaf3ff] text-[#2879ef]"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        {error ? (
          <div role="alert" className="px-6 py-12 text-center">
            <p className="font-semibold text-slate-700">{error}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void loadPage(1, false);
              }}
              className="mt-3 rounded-lg px-3 py-2 font-semibold text-[#2879ef] underline"
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-3 p-5 sm:p-8" aria-label="Loading notifications">
            {[0, 1, 2, 3].map((key) => (
              <div key={key} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <FiBell className="mx-auto mb-3 text-3xl text-[#9bb0c8]" aria-hidden="true" />
            <h2 className="font-bold text-[#102b50]">
              {filter === "unread" ? "No unread notifications" : "You’re all caught up"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              New activity from your chats, matches, and properties will show up here.
            </p>
          </div>
        ) : (
          <ul>
            {items.map((notification) => (
              <li key={notification.id} className="border-b border-slate-100 last:border-0">
                <button
                  type="button"
                  onClick={() => void openNotification(notification)}
                  className={`flex w-full items-start gap-4 px-5 py-5 text-left transition-colors hover:bg-[#f8fbff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#2879ef] sm:px-8 ${
                    notification.is_read ? "bg-white" : "bg-[#f5f9ff]"
                  }`}
                >
                  <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eaf3ff] text-lg text-[#2879ef]">
                    {notification.type.startsWith("chat.") ? (
                      <FiMessageCircle aria-hidden="true" />
                    ) : (
                      <FiBell aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <strong className="break-words text-[#183858]">
                        {notification.title}
                      </strong>
                      {!notification.is_read && (
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#2879ef]" aria-label="Unread" />
                      )}
                    </span>
                    <span className="mt-1 block break-words text-sm leading-6 text-slate-600">
                      {notification.message}
                    </span>
                    <time className="mt-2 block text-xs text-slate-400">
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

        {actionError && (
          <p role="alert" className="border-t border-rose-100 px-5 py-3 text-sm text-rose-700 sm:px-8">
            {actionError}
          </p>
        )}
        {hasMore && !loading && (
          <div className="border-t border-slate-100 p-4 text-center">
            <button
              type="button"
              disabled={loadingMore}
              onClick={() => {
                setLoadingMore(true);
                void loadPage(page + 1, true);
              }}
              className="min-h-10 rounded-xl px-4 py-2 text-sm font-bold text-[#2879ef] hover:bg-[#f2f7ff] disabled:opacity-50"
            >
              {loadingMore ? "Loading…" : "Load older notifications"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
