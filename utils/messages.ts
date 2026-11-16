import { getCurrentUser, sessionFetch } from "@/utils/auth";

export interface ChatParticipant { id: number; slug: string; name: string; profile_image: string | null; is_available: boolean; }
export interface ChatConversation { id: string; other_participant: ChatParticipant; last_message_preview: string; last_message_at: string | null; unread_count: number; }
export interface ChatMessage { id: number | string; conversation_id: string; sender_id: number; content: string; created_at: string; read_at: string | null; status: "sending" | "sent" | "read" | "failed"; client_id?: string; }

const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!apiBase) throw new Error("Messaging is not configured yet.");
  const response = await sessionFetch(`${apiBase}/api/v1/messages/${path}`, { ...init, headers: { "Content-Type": "application/json", ...(init.headers ?? {}) } });
  const body = await response.json().catch(() => ({})) as { data?: T; detail?: string; message?: string };
  if (!response.ok) throw new Error(body.detail || body.message || "Something went wrong while loading your messages.");
  return body.data as T;
}
export const listConversations = (search = "") => request<ChatConversation[]>(`conversations${search ? `?search=${encodeURIComponent(search)}` : ""}`);
export const createConversation = (participant_id: number) => request<ChatConversation>("conversations", { method: "POST", body: JSON.stringify({ participant_id }) });
export const listMessages = (conversationId: string, before?: number | null) => request<{ messages: ChatMessage[]; next_before: number | null }>(`conversations/${conversationId}/messages?limit=30${before ? `&before=${before}` : ""}`);
export const markConversationRead = (conversationId: string) => request<{ read_count: number }>(`conversations/${conversationId}/read`, { method: "POST", body: "{}" });
// The HttpOnly session cookie cannot be decoded in the browser, so resolve the
// current user's ID through the authenticated session endpoint.
export async function currentUserId(): Promise<number | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  if (typeof user.id !== "number" || !Number.isSafeInteger(user.id)) {
    throw new Error("The server returned an invalid current-user response.");
  }
  return user.id;
}
export function websocketUrl(conversationId: string) { if (!apiBase) return null; const url = new URL(apiBase); url.protocol = url.protocol === "https:" ? "wss:" : "ws:"; url.pathname = `/ws/messages/${conversationId}/`; return url.toString(); }
