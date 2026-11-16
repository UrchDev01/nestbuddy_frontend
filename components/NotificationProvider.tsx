"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AppNotification,
  getNotificationUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notificationWebSocketUrl,
} from "@/utils/notifications";
import { getCurrentUser } from "@/utils/auth";

type ConnectionState = "connecting" | "connected" | "reconnecting" | "offline";

interface NotificationContextValue {
  notifications: AppNotification[];
  lastEvent:
    | { event: string; data: AppNotification | { read_at?: string } }
    | null;
  unreadCount: number;
  connection: ConnectionState;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markRead: (notificationId: number) => Promise<AppNotification>;
  markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [lastEvent, setLastEvent] = useState<NotificationContextValue["lastEvent"]>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connection, setConnection] = useState<ConnectionState>("offline");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const refreshRef = useRef<() => Promise<void>>(async () => undefined);
  const knownIds = useRef<Set<number>>(new Set());
  const currentToken = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    const token = accessToken;
    if (!token) return;
    setLoading(true);
    try {
      const [page, count] = await Promise.all([
        listNotifications(token, { page: 1, pageSize: 20 }),
        getNotificationUnreadCount(token),
      ]);
      if (!currentToken.current) return;
      page.results.forEach((item) => knownIds.current.add(item.id));
      setNotifications((current) => {
        const responseIds = new Set(page.results.map((item) => item.id));
        const newer = current.filter((item) => !responseIds.has(item.id));
        return [...newer, ...page.results].slice(0, 20);
      });
      setUnreadCount(count.unread_count);
      setError(null);
    } catch {
      setError("Unable to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);
  refreshRef.current = refresh;

  useEffect(() => {
    const readToken = async () => {
      const nextToken = await getCurrentUser().then((user) => user ? "session" : null).catch(() => null);
      if (currentToken.current !== nextToken) {
        currentToken.current = nextToken;
        knownIds.current.clear();
        setNotifications([]);
        setLastEvent(null);
        setUnreadCount(0);
        setError(null);
      }
      setAccessToken((current) => (current === nextToken ? current : nextToken));
      if (!nextToken) {
        setConnection("offline");
      }
    };
    void readToken();
    const onFocus = () => readToken();
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    if (!accessToken) {
      socket.current?.close();
      socket.current = null;
      setConnection("offline");
      return;
    }

    let closed = false;
    let retries = 0;
    let retryTimer: number | undefined;
    const url = notificationWebSocketUrl();
    void refresh();
    if (!url) {
      setConnection("offline");
      return;
    }

    const connect = () => {
      if (closed || retries >= 8) {
        setConnection("offline");
        return;
      }
      setConnection(retries === 0 ? "connecting" : "reconnecting");
      const ws = new WebSocket(url);
      socket.current = ws;
      ws.onopen = () => {
        retries = 0;
        setConnection("connected");
        ws.send(JSON.stringify({ event: "notifications.sync" }));
        void refreshRef.current();
      };
      ws.onmessage = ({ data }) => {
        let event: {
          event?: string;
          data?: AppNotification | { unread_count?: number; read_at?: string };
        };
        try {
          event = JSON.parse(data) as typeof event;
        } catch {
          return;
        }
        if (!event.event || !event.data) return;
        if (event.event === "notification.created") {
          const incoming = event.data as AppNotification;
          setLastEvent({ event: event.event, data: incoming });
          if (!knownIds.current.has(incoming.id)) {
            knownIds.current.add(incoming.id);
            setNotifications((current) => [incoming, ...current].slice(0, 20));
            if (!incoming.is_read) setUnreadCount((count) => count + 1);
          }
        } else if (event.event === "notification.updated") {
          const updated = event.data as AppNotification;
          setLastEvent({ event: event.event, data: updated });
          setNotifications((current) =>
            current.map((item) => (item.id === updated.id ? updated : item)),
          );
        } else if (event.event === "notification.all_read") {
          setLastEvent({
            event: event.event,
            data: event.data as { read_at?: string },
          });
          const readAt = (event.data as { read_at?: string }).read_at ?? null;
          setNotifications((current) =>
            current.map((item) => ({
              ...item,
              is_read: true,
              read_at: item.read_at ?? readAt,
            })),
          );
          setUnreadCount(0);
        } else if (event.event === "notification.unread_count_updated") {
          const count = (event.data as { unread_count?: number }).unread_count;
          if (typeof count === "number") setUnreadCount(count);
        }
      };
      ws.onerror = () => ws.close();
      ws.onclose = () => {
        if (socket.current === ws) socket.current = null;
        if (!closed && retries < 8) {
          retries += 1;
          setConnection("reconnecting");
          retryTimer = window.setTimeout(
            connect,
            Math.min(1000 * 2 ** (retries - 1), 15000),
          );
        } else if (!closed) {
          setConnection("offline");
        }
      };
    };

    const reconcile = () => {
      if (document.visibilityState === "visible") {
        void refreshRef.current();
        if (
          socket.current?.readyState !== WebSocket.OPEN &&
          socket.current?.readyState !== WebSocket.CONNECTING
        ) {
          retries = 0;
          connect();
        }
      }
    };
    const onOnline = () => {
      retries = 0;
      if (
        socket.current?.readyState !== WebSocket.OPEN &&
        socket.current?.readyState !== WebSocket.CONNECTING
      )
        connect();
    };
    connect();
    document.addEventListener("visibilitychange", reconcile);
    window.addEventListener("online", onOnline);
    return () => {
      closed = true;
      window.clearTimeout(retryTimer);
      document.removeEventListener("visibilitychange", reconcile);
      window.removeEventListener("online", onOnline);
      socket.current?.close();
      socket.current = null;
    };
  }, [accessToken, refresh]);

  const markRead = useCallback(
    async (notificationId: number) => {
      if (!accessToken) throw new Error("Please sign in to view notifications.");
      try {
        const updated = await markNotificationRead(accessToken, notificationId);
        setNotifications((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
        const count = await getNotificationUnreadCount(accessToken);
        setUnreadCount(count.unread_count);
        return updated;
      } catch (cause) {
        await refresh();
        throw cause;
      }
    },
    [accessToken, refresh],
  );

  const markAllRead = useCallback(async () => {
    if (!accessToken) throw new Error("Please sign in to view notifications.");
    try {
      const result = await markAllNotificationsRead(accessToken);
      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          is_read: true,
          read_at: item.read_at ?? new Date().toISOString(),
        })),
      );
      setUnreadCount(result.unread_count);
    } catch (cause) {
      await refresh();
      throw cause;
    }
  }, [accessToken, refresh]);

  const value = useMemo(
    () => ({
      notifications,
      lastEvent,
      unreadCount,
      connection,
      loading,
      error,
      refresh,
      markRead,
      markAllRead,
    }),
    [notifications, lastEvent, unreadCount, connection, loading, error, refresh, markRead, markAllRead],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const value = useContext(NotificationContext);
  if (!value) {
    throw new Error("useNotifications must be used within NotificationProvider.");
  }
  return value;
}
