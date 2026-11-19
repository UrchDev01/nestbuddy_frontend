"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  FiArrowLeft,
  FiCheck,
  FiLoader,
  FiSearch,
  FiSend,
} from "react-icons/fi";
import {
  ChatConversation,
  ChatMessage,
  currentUserId,
  listConversations,
  listMessages,
  markConversationRead,
  websocketUrl,
} from "@/utils/messages";

const stamp = (date: string | null) =>
  date
    ? new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(date))
    : "";
const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
function Avatar({ name, image }: { name: string; image: string | null }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eaf3ff] font-bold text-[#2879ef]">
      {image ? (
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </div>
  );
}

export default function MessagesWorkspace({
  conversationId,
}: {
  conversationId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [userId, setUserId] = useState<number | null>(null);
  const [identityLoading, setIdentityLoading] = useState(true);
  const [identityError, setIdentityError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selected, setSelected] = useState<string | undefined>(conversationId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [older, setOlder] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [connection, setConnection] = useState<
    "connecting" | "connected" | "reconnecting" | "offline"
  >("offline");
  const [typing, setTyping] = useState(false);
  const socket = useRef<WebSocket | null>(null);
  const retry = useRef(0);
  const typingTimer = useRef<number | undefined>(undefined);
  const conversationSearch = useRef("");
  const bottom = useRef<HTMLDivElement | null>(null);
  const active = conversations.find((item) => item.id === selected);
  const detailRoute = pathname !== "/messages";
  useEffect(() => {
    let alive = true;
    void currentUserId()
      .then((id) => {
        if (!alive) return;
        setUserId(id);
        setIdentityError(
          id === null ? "Please sign in again to send messages." : null,
        );
      })
      .catch(() => {
        if (alive)
          setIdentityError("Unable to verify your sign-in. Please try again.");
      })
      .finally(() => alive && setIdentityLoading(false));
    return () => {
      alive = false;
    };
  }, []);
  const loadConversations = useCallback(async (search = "") => {
    setLoading(true);
    try {
      setConversations(await listConversations(search));
      setError(null);
    } catch {
      setError("Something went wrong while loading your messages.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);
  useEffect(() => {
    const refreshConversations = () => {
      if (document.visibilityState !== "visible") return;
      const search = conversationSearch.current;
      void listConversations(search)
        .then((updated) => {
          if (search === conversationSearch.current) {
            setConversations(updated);
            setError(null);
          }
        })
        .catch(() => {
          setError("Unable to refresh your conversations.");
        });
    };
    const interval = window.setInterval(refreshConversations, 2000);
    document.addEventListener("visibilitychange", refreshConversations);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshConversations);
    };
  }, []);
  useEffect(() => {
    setSelected(conversationId);
  }, [conversationId]);
  const mergeMessage = useCallback(
    (message: ChatMessage, clientId?: string) => {
      setMessages((current) => {
        const matchingLocal =
          clientId
            ? current.find((item) => item.client_id === clientId)
            : current.find(
                (item) =>
                  item.status === "sending" &&
                  item.sender_id === message.sender_id &&
                  item.conversation_id === message.conversation_id &&
                  item.content === message.content,
              );

        if (matchingLocal) {
          return current.map((item) =>
            item === matchingLocal
              ? { ...message, client_id: clientId ?? matchingLocal.client_id }
              : item,
          );
        }

        return current.some((item) => item.id === message.id)
          ? current
          : [...current, message];
      });
      setConversations((current) =>
        current
          .map((item) =>
            item.id === message.conversation_id
              ? {
                  ...item,
                  last_message_preview: message.content,
                  last_message_at: message.created_at,
                  unread_count:
                    message.sender_id === userId
                      ? item.unread_count
                      : item.unread_count + 1,
                }
              : item,
          )
          .sort((a, b) =>
            (b.last_message_at || "").localeCompare(a.last_message_at || ""),
          ),
      );
    },
    [userId],
  );
  useEffect(() => {
    if (!selected) {
      setMessages([]);
      return;
    }
    let alive = true;
    setHistoryLoading(true);
    void listMessages(selected)
      .then((page) => {
        if (alive) {
          setMessages(page.messages);
          setOlder(page.next_before);
        }
      })
      .catch(() => alive && setError("Unable to load this conversation."))
      .finally(() => alive && setHistoryLoading(false));
    void markConversationRead(selected).catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [selected]);
  useEffect(() => {
    if (!selected) return;
    const url = websocketUrl(selected);
    if (!url) return;
    let closed = false;
    let reconnectTimer: number | undefined;
    const connect = () => {
      setConnection(retry.current ? "reconnecting" : "connecting");
      const ws = new WebSocket(url);
      socket.current = ws;
      ws.onopen = () => {
        retry.current = 0;
        setConnection("connected");
        ws.send(JSON.stringify({ event: "message.read" }));
      };
      ws.onmessage = ({ data }) => {
        const event = JSON.parse(data) as {
          event: string;
          message?: ChatMessage;
          client_id?: string;
          message_ids?: number[];
          read_at?: string;
          user_id?: number;
          reader_id?: number;
        };
        if (event.event === "message.created" && event.message) {
          mergeMessage(event.message, event.client_id);
          if (
            event.message.sender_id !== userId &&
            document.visibilityState === "visible"
          )
            ws.send(JSON.stringify({ event: "message.read" }));
        }
        if (event.event === "typing.started" && event.user_id !== userId)
          setTyping(true);
        if (event.event === "typing.stopped" && event.user_id !== userId)
          setTyping(false);
        if (
          event.event === "message.read" &&
          event.message_ids &&
          event.read_at
        ) {
          setMessages((current) =>
            current.map((message) =>
              event.message_ids!.includes(Number(message.id))
                ? { ...message, read_at: event.read_at!, status: "read" }
                : message,
            ),
          );
          if (event.reader_id === userId)
            setConversations((current) =>
              current.map((conversation) =>
                conversation.id === selected
                  ? { ...conversation, unread_count: 0 }
                  : conversation,
              ),
            );
        }
      };
      const handleVisibilityChange = () => {
        if (
          document.visibilityState === "visible" &&
          ws.readyState === WebSocket.OPEN
        )
          ws.send(JSON.stringify({ event: "message.read" }));
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      ws.onerror = () => ws.close();
      ws.onclose = () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
        if (!closed) {
          setConnection("offline");
          reconnectTimer = window.setTimeout(
            connect,
            Math.min(1000 * 2 ** retry.current++, 15000),
          );
        }
      };
    };
    connect();
    return () => {
      closed = true;
      socket.current?.close();
      if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer);
      window.clearTimeout(typingTimer.current);
    };
  }, [selected, mergeMessage, userId]);
  useEffect(() => {
    if (messages.length) bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);
  const openConversation = (id: string) => {
    setSelected(id);
    router.push(`/messages/${id}`);
  };
  const loadOlder = async () => {
    if (!selected || !older) return;
    const page = await listMessages(selected, older);
    setMessages((current) => [...page.messages, ...current]);
    setOlder(page.next_before);
  };
  const send = (event?: FormEvent) => {
    event?.preventDefault();
    const content = draft.trim();
    if (
      !content ||
      !selected ||
      userId === null ||
      socket.current?.readyState !== WebSocket.OPEN
    )
      return;
    const client_id = crypto.randomUUID();
    setMessages((current) => [
      ...current,
      {
        id: client_id,
        client_id,
        conversation_id: selected,
        sender_id: userId,
        content,
        created_at: new Date().toISOString(),
        read_at: null,
        status: "sending",
      },
    ]);
    socket.current.send(
      JSON.stringify({ event: "message.send", content, client_id }),
    );
    socket.current.send(JSON.stringify({ event: "typing.stop" }));
    setDraft("");
  };
  const onDraft = (value: string) => {
    setDraft(value);
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({ event: "typing.start" }));
      window.clearTimeout(typingTimer.current);
      typingTimer.current = window.setTimeout(
        () => socket.current?.send(JSON.stringify({ event: "typing.stop" })),
        1200,
      );
    }
  };
  const onKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };
  return (
    <div className="h-full min-h-0 bg-[#f4f8ff] p-0 lg:p-5">
      <div className="mx-auto flex h-full min-h-0 max-w-7xl flex-col overflow-hidden bg-white shadow-[0_16px_45px_rgba(24,84,180,0.09)] md:grid md:grid-cols-[320px_minmax(0,1fr)] lg:rounded-3xl lg:border lg:border-[#dfeeff]">
        <aside
          className={`${detailRoute ? "hidden md:flex" : "flex"} min-h-0 flex-1 flex-col border-r border-slate-100`}
        >
          <div className="border-b border-slate-100 p-5">
            <h1 className="text-xl font-extrabold text-[#102b50]">Messages</h1>
            <label className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-slate-500">
              <FiSearch />
              <input
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Search conversations"
                onChange={(event) => {
                  conversationSearch.current = event.target.value;
                  window.setTimeout(
                    () => void loadConversations(event.target.value),
                    250,
                  );
                }}
              />
            </label>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-4 p-4 animate-pulse">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-16 rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-7 text-center">
                <p className="font-bold text-slate-800">No conversations yet</p>
                <p className="mt-2 text-sm text-slate-500">
                  Connect with potential roommates and start a conversation.
                </p>
                <Link
                  href="/ai-roommate-finder"
                  className="mt-4 inline-flex rounded-xl bg-[#2879ef] px-4 py-2 text-sm font-bold text-white"
                >
                  Find roommates
                </Link>
              </div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => openConversation(conversation.id)}
                  className={`flex w-full gap-3 border-b border-slate-50 p-4 text-left transition hover:bg-[#f5f9ff] ${selected === conversation.id ? "bg-[#eaf3ff]" : ""}`}
                >
                  <Avatar
                    name={conversation.other_participant.name}
                    image={conversation.other_participant.profile_image}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex justify-between gap-2">
                      <strong className="truncate text-sm text-slate-800">
                        {conversation.other_participant.name}
                      </strong>
                      <time className="text-[11px] text-slate-400">
                        {stamp(conversation.last_message_at)}
                      </time>
                    </span>
                    <span className="mt-1 flex items-center gap-2">
                      <span className="truncate text-xs text-slate-500">
                        {conversation.last_message_preview ||
                          "Start the conversation"}
                      </span>
                      {conversation.unread_count > 0 && (
                        <b className="rounded-full bg-[#2879ef] px-1.5 py-0.5 text-[10px] text-white">
                          {conversation.unread_count}
                        </b>
                      )}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>
        <section
          className={`${detailRoute || selected ? "flex" : "hidden md:flex"} min-h-0 flex-1 flex-col`}
        >
          {!selected || !active ? (
            <div className="m-auto p-8 text-center">
              <h2 className="text-xl font-bold text-[#102b50]">
                Choose a conversation
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Your messages with potential roommates appear here.
              </p>
            </div>
          ) : (
            <>
              <header className="flex shrink-0 items-center gap-3 border-b border-slate-100 p-4">
                <Link
                  href="/messages"
                  className="rounded-lg p-2 text-slate-600 md:hidden"
                  aria-label="Back to messages"
                >
                  <FiArrowLeft />
                </Link>
                <Link
                  href={`/roommates/${active.other_participant.slug}`}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2879ef]"
                >
                  <Avatar
                    name={active.other_participant.name}
                    image={active.other_participant.profile_image}
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-bold text-slate-800 hover:text-[#2879ef]">
                      {active.other_participant.name}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {typing
                        ? `${active.other_participant.name.split(" ")[0]} is typing…`
                        : connection === "connected"
                          ? "Connected"
                          : "Connection lost. Reconnecting…"}
                    </span>
                  </span>
                </Link>
              </header>
              <div className="min-h-0 flex-1 overflow-y-auto bg-[#f8fbff] p-4">
                {older && (
                  <button
                    onClick={() => void loadOlder()}
                    className="mx-auto mb-4 block rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"
                  >
                    Load older messages
                  </button>
                )}
                {historyLoading && (
                  <div className="p-4 text-center text-sm text-slate-500">
                    <FiLoader className="inline animate-spin" /> Loading
                    conversation…
                  </div>
                )}
                {messages.map((message) => (
                  <div
                    key={String(message.id)}
                    className={`mb-3 flex ${message.sender_id === userId ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm shadow-sm ${message.sender_id === userId ? "rounded-br-md bg-[#2879ef] text-white" : "rounded-bl-md bg-white text-slate-700"}`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <p
                        className={`mt-1 text-right text-[10px] ${message.sender_id === userId ? "text-blue-100" : "text-slate-400"}`}
                      >
                        {stamp(message.created_at)}{" "}
                        {message.sender_id === userId &&
                          (message.status === "sending" ? (
                            "· Sending…"
                          ) : message.read_at ? (
                            <>
                              <FiCheck className="inline" />
                              <FiCheck className="-ml-1 inline" /> Read
                            </>
                          ) : (
                            <>
                              <FiCheck className="inline" /> Sent
                            </>
                          ))}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottom} />
              </div>
              <form
                onSubmit={send}
                className="shrink-0 border-t border-slate-100 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
              >
                <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-[#2879ef]">
                  <textarea
                    value={draft}
                    onChange={(event) => onDraft(event.target.value)}
                    onKeyDown={onKey}
                    maxLength={2000}
                    rows={1}
                    placeholder={
                      identityError
                        ? identityError
                        : connection === "connected"
                        ? "Type a message…"
                        : "Connection lost. Reconnecting…"
                    }
                    disabled={
                      connection !== "connected" ||
                      identityLoading ||
                      identityError !== null
                    }
                    className="max-h-28 min-h-10 flex-1 text-black-1 resize-none bg-transparent px-2 py-2 text-sm outline-none disabled:cursor-not-allowed"
                    aria-label="Message"
                  />
                  <button
                    disabled={
                      !draft.trim() ||
                      connection !== "connected" ||
                      identityLoading ||
                      identityError !== null
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2879ef] text-white disabled:opacity-40"
                    aria-label="Send message"
                  >
                    <FiSend />
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
      {error && (
        <p
          role="alert"
          className="mx-auto mt-3 max-w-7xl rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
        >
          {error}{" "}
          <button
            onClick={() => void loadConversations()}
            className="font-bold underline"
          >
            Try again
          </button>
        </p>
      )}
    </div>
  );
}
