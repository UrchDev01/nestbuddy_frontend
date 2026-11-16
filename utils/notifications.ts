export interface AppNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  target_url: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface NotificationPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: AppNotification[];
  unread_count: number;
}

const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

async function notificationRequest<T>(
  _accessToken: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  if (!apiBase) throw new Error("Notifications are not configured.");
  let response: Response;
  try {
    response = await sessionFetch(`${apiBase}/api/v1/notifications/${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new Error("Unable to connect to notifications.");
  }

  const body = (await response.json().catch(() => ({}))) as {
    data?: T;
  };
  if (!response.ok || body.data === undefined) {
    throw new Error(
      response.status === 401
        ? "Your session has expired. Please sign in again."
        : "Unable to load notifications. Please try again.",
    );
  }
  return body.data;
}

export const listNotifications = (
  accessToken: string,
  options: { page?: number; pageSize?: number; read?: boolean } = {},
) => {
  const params = new URLSearchParams();
  params.set("page", String(options.page ?? 1));
  params.set("page_size", String(options.pageSize ?? 20));
  if (options.read !== undefined) params.set("read", String(options.read));
  return notificationRequest<NotificationPage>(accessToken, `?${params}`);
};

export const getNotificationUnreadCount = (accessToken: string) =>
  notificationRequest<{ unread_count: number }>(accessToken, "unread-count/");

export const markNotificationRead = (
  accessToken: string,
  notificationId: number,
) =>
  notificationRequest<AppNotification>(
    accessToken,
    `${notificationId}/read/`,
    { method: "POST", body: "{}" },
  );

export const markAllNotificationsRead = (accessToken: string) =>
  notificationRequest<{ updated_count: number; unread_count: number }>(
    accessToken,
    "mark-all-read/",
    { method: "POST", body: "{}" },
  );

export function notificationWebSocketUrl(): string | null {
  if (!apiBase) return null;
  const url = new URL(apiBase);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws/notifications/";
  url.search = "";
  return url.toString();
}

export function isSafeNotificationPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\");
}
import { sessionFetch } from "@/utils/auth";
