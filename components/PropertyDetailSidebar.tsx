"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiCalendar, FiCheck, FiClock, FiPhone, FiX } from "react-icons/fi";
import { cancelPropertyViewing, getUserPropertyViewings, schedulePropertyViewing, updateViewingStatus } from "@/utils/api";
import type { PropertyViewingProps } from "@/types";
import { getPropertyActionError, readPropertyPage, trapDialogTab } from "@/utils/propertyPageUtils";
import StartChatButton from "@/components/StartChatButton";

interface AgentInfo {
    id: number;
    slug: string;
    first_name: string;
    last_name: string;
    phone?: string | null;
    user_type?: string;
    is_verified: boolean;
}

interface PropertyDetailSidebarProps {
    id: number;
    propertySlug: string;
    agent: AgentInfo;
    propertyStatus: string;
    isAvailable: boolean;
    availableFrom: string | null;
    price: number;
    rentalPeriod: string | null;
    securityDeposit: number | null;
    userAuthenticated: boolean;
    isOwner: boolean;
}

function dateToday(): string {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 10);
}

function statusStyle(status: string): string {
    switch (status.toLowerCase()) {
        case "confirmed": return "bg-emerald-50 text-emerald-700";
        case "cancelled": return "bg-rose-50 text-rose-700";
        case "completed": return "bg-blue-50 text-blue-700";
        default: return "bg-amber-50 text-amber-800";
    }
}

function formatDate(value: string): string {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function formatTime(value: string): string {
    const [hours, minutes] = value.split(":");
    if (hours === undefined || minutes === undefined) return value;
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);
    return new Intl.DateTimeFormat(undefined, { timeStyle: "short" }).format(date);
}

export default function PropertyDetailSidebar({
    id,
    propertySlug,
    agent,
    propertyStatus,
    isAvailable,
    availableFrom,
    price,
    rentalPeriod,
    securityDeposit,
    userAuthenticated,
    isOwner,
}: PropertyDetailSidebarProps) {
    const router = useRouter();
    const [viewings, setViewings] = useState<PropertyViewingProps[]>([]);
    const [isLoadingViewings, setIsLoadingViewings] = useState(false);
    const [viewingsError, setViewingsError] = useState<string | null>(null);
    const [viewingsPage, setViewingsPage] = useState(1);
    const [hasMoreViewings, setHasMoreViewings] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingViewing, setEditingViewing] = useState<PropertyViewingProps | null>(null);
    const [preferredDate, setPreferredDate] = useState("");
    const [preferredTime, setPreferredTime] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const available = propertyStatus.toLowerCase() === "available" && isAvailable;
    const earliestDate = availableFrom?.slice(0, 10);
    const today = dateToday();
    const minViewingDate = earliestDate && earliestDate > today ? earliestDate : today;
    const canStartRequest = !isOwner && (
        !userAuthenticated ||
        (!isLoadingViewings && !viewingsError && viewings.length === 0)
    );
    const agentName = [agent.first_name, agent.last_name].filter(Boolean).join(" ") || "Property agent";
    const initials = agentName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
    const priceText = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(price);

    const loadViewings = useCallback(async (pageNumber = 1, append = false) => {
        if (!userAuthenticated) return;
        setIsLoadingViewings(true);
        setViewingsError(null);
        try {
            const response: unknown = await getUserPropertyViewings(id, { as_owner: isOwner, page: pageNumber });
            const page = readPropertyPage<PropertyViewingProps>(response);
            if (!page) throw new Error("Viewing requests returned incomplete data.");
            setViewings((current) => append ? [...current, ...page.results] : page.results);
            setViewingsPage(pageNumber);
            setHasMoreViewings(page.hasMore);
        } catch (cause) {
            setViewingsError(getPropertyActionError(cause, "Viewing requests couldn't be loaded right now."));
        } finally {
            setIsLoadingViewings(false);
        }
    }, [id, isOwner, userAuthenticated]);

    useEffect(() => { void loadViewings(); }, [loadViewings]);

    useEffect(() => {
        if (!modalOpen) return;
        const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape" && !submitting) setModalOpen(false); };
        document.addEventListener("keydown", closeOnEscape);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", closeOnEscape);
            document.body.style.overflow = "";
        };
    }, [modalOpen, submitting]);

    const signIn = () => router.push(`/sign-in?redirect=${encodeURIComponent(`/properties/${propertySlug}`)}`);

    const openScheduler = (viewing?: PropertyViewingProps) => {
        if (!userAuthenticated) { signIn(); return; }
        setError(null);
        setEditingViewing(viewing ?? null);
        setPreferredDate(viewing?.preferred_date ?? "");
        setPreferredTime(viewing?.preferred_time?.slice(0, 5) ?? "");
        setNotes(viewing?.notes ?? "");
        setModalOpen(true);
    };

    const submitViewing = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!userAuthenticated) { signIn(); return; }
        if (!available || !preferredDate || !preferredTime) return;
        setSubmitting(true);
        setError(null);
        try {
            await schedulePropertyViewing(id, {
                preferred_date: preferredDate,
                preferred_time: preferredTime,
                notes: notes.trim() || undefined,
            }, editingViewing?.id);
            await loadViewings();
            setModalOpen(false);
            setEditingViewing(null);
            setSuccess(editingViewing ? "Your viewing request has been updated." : "Your viewing request has been sent. It will remain requested until the owner responds.");
        } catch (cause) {
            setError(getPropertyActionError(cause, "We couldn't submit your viewing request. Please try again."));
        } finally {
            setSubmitting(false);
        }
    };

    const changeStatus = async (viewingId: number, status: "confirmed" | "cancelled") => {
        setUpdatingId(viewingId);
        setError(null);
        try {
            await updateViewingStatus(viewingId, status);
            await loadViewings();
            setSuccess(status === "confirmed" ? "Viewing confirmed." : "Viewing request declined.");
        } catch (cause) {
            setError(getPropertyActionError(cause, "We couldn't update this viewing request. Please try again."));
        } finally {
            setUpdatingId(null);
        }
    };

    const cancelViewing = async (viewingId: number) => {
        setUpdatingId(viewingId);
        setError(null);
        try {
            await cancelPropertyViewing(id, viewingId);
            await loadViewings();
            setSuccess("Your viewing request was cancelled.");
        } catch (cause) {
            setError(getPropertyActionError(cause, "We couldn't cancel this viewing request. Please try again."));
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <>
            <aside className="rounded-2xl border border-slate-200 bg-white-1 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-6 lg:sticky lg:top-24" aria-label="Contact and viewing details">
                <div className="border-b border-slate-100 pb-5">
                    <p className="text-2xl font-bold tracking-tight text-slate-950">{priceText}<span className="ml-1 text-sm font-semibold text-slate-500">/{rentalPeriod || "listing"}</span></p>
                    {securityDeposit !== null && securityDeposit > 0 && <p className="mt-1 text-sm text-slate-500">Security deposit: {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(securityDeposit)}</p>}
                    <div className="mt-4 flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{propertyStatus}</span>
                        {!isAvailable && propertyStatus.toLowerCase() === "available" && <span className="text-xs text-slate-500">Not currently accepting viewing requests</span>}
                    </div>
                </div>

                <div className="py-5">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#2879ef]">Listed by</p>
                    <div className="mt-3 flex items-center gap-3">
                        <div aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-50 text-sm font-bold text-[#2879ef]">{initials || "NB"}</div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <h2 className="truncate font-bold text-slate-900">{agentName}</h2>
                                {agent.is_verified && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Verified</span>}
                            </div>
                            <p className="text-sm text-slate-500">{agent.user_type || "Property agent"}</p>
                        </div>
                    </div>
                    <div className="mt-4 space-y-2.5 text-sm text-slate-600">
                        {agent.phone && <a href={`tel:${agent.phone}`} className="flex min-h-9 items-center gap-2 hover:text-[#1f6fdd]"><FiPhone className="shrink-0 text-[#2879ef]" />{agent.phone}</a>}
                    </div>
                    {!isOwner && <div className="mt-4"><StartChatButton userId={agent.id} label="Message agent" redirectPath={`/properties/${propertySlug}`} profileSlug={agent.slug} /></div>}
                </div>

                <div className="border-t border-slate-100 pt-5">
                    <h2 className="flex items-center gap-2 font-bold text-slate-900"><FiCalendar className="text-[#2879ef]" /> Schedule a viewing</h2>
                    <p className="mt-2 text-sm leading-5 text-slate-500">Choose a date and time that works for you. The owner must confirm your request.</p>
                    {!available ? (
                        <p className="mt-4 rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-600">Viewing requests aren’t available for this listing right now.</p>
                    ) : canStartRequest && (
                        <button type="button" onClick={() => openScheduler()} disabled={isLoadingViewings} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#2879ef] px-4 py-3 text-sm font-bold text-white-1 shadow-sm transition hover:bg-[#1766d5] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef] focus-visible:ring-offset-2"><FiCalendar /> Request a viewing</button>
                    )}
                    {isOwner && <p className="mt-4 rounded-lg bg-blue-50 px-3 py-3 text-sm text-slate-600">You manage this listing. Viewing requests appear below.</p>}
                </div>

                {userAuthenticated && (
                    <div className="mt-5 border-t border-slate-100 pt-5">
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="font-bold text-slate-900">{isOwner ? "Viewing requests" : "Your viewing"}</h3>
                            {isLoadingViewings && <FiClock className="animate-pulse text-[#2879ef]" aria-label="Loading viewing requests" />}
                        </div>
                        {viewingsError && <div role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{viewingsError}<button type="button" onClick={() => void loadViewings()} className="ml-2 font-bold underline">Retry</button></div>}
                        {!isLoadingViewings && viewings.length === 0 && !viewingsError && <p className="mt-3 rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-500">{isOwner ? "No viewing requests yet." : "No viewing scheduled."}</p>}
                        <div className="mt-3 space-y-3">
                            {viewings.map((viewing) => {
                                const status = viewing.status || "requested";
                                const waiting = updatingId === viewing.id;
                                return (
                                    <article key={viewing.id} className="rounded-xl border border-slate-200 p-3">
                                        {isOwner && <p className="mb-2 text-sm font-semibold text-slate-900">{viewing.user_name || "NestBuddy member"}</p>}
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="text-sm font-semibold text-slate-800">{formatDate(viewing.preferred_date)} · {formatTime(viewing.preferred_time)}</p>
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusStyle(status)}`}>{status}</span>
                                        </div>
                                        {viewing.notes && <p className="mt-2 text-sm text-slate-600">{viewing.notes}</p>}
                                        {!isOwner && status === "requested" && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <button type="button" onClick={() => openScheduler(viewing)} disabled={waiting} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Change request</button>
                                                <button type="button" onClick={() => void cancelViewing(viewing.id)} disabled={waiting} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">{waiting ? "Updating…" : "Cancel request"}</button>
                                            </div>
                                        )}
                                        {isOwner && status === "requested" && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <button type="button" onClick={() => void changeStatus(viewing.id, "confirmed")} disabled={waiting} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"><FiCheck /> {waiting ? "Updating…" : "Confirm"}</button>
                                                <button type="button" onClick={() => void changeStatus(viewing.id, "cancelled")} disabled={waiting} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">Decline</button>
                                            </div>
                                        )}
                                        {isOwner && status === "confirmed" && (
                                            <button type="button" onClick={() => void changeStatus(viewing.id, "cancelled")} disabled={waiting} className="mt-3 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">{waiting ? "Updating…" : "Cancel viewing"}</button>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                        {hasMoreViewings && !isLoadingViewings && <button type="button" onClick={() => void loadViewings(viewingsPage + 1, true)} className="mt-3 min-h-10 w-full rounded-lg border border-blue-200 text-sm font-bold text-[#1f6fdd] hover:bg-blue-50">Load more requests</button>}
                    </div>
                )}

                {error && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}
                {success && <p role="status" className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"><FiCheck className="mt-0.5 shrink-0" />{success}</p>}
            </aside>

            {available && canStartRequest && (
                <div className={`fixed inset-x-0 bottom-0 z-40 grid ${!isOwner ? "grid-cols-2" : "grid-cols-1"} gap-2 border-t border-slate-200 bg-white-1 p-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] sm:hidden`}>
                    {!isOwner && <StartChatButton userId={agent.id} label="Message agent" redirectPath={`/properties/${propertySlug}`} profileSlug={agent.slug} />}
                    <button type="button" onClick={() => openScheduler()} className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#2879ef] px-3 text-sm font-bold text-white-1"><FiCalendar /> Schedule</button>
                </div>
            )}

            {modalOpen && (
                <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) setModalOpen(false); }}>
                    <section role="dialog" aria-modal="true" aria-labelledby="schedule-viewing-title" onKeyDown={trapDialogTab} className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white-1 p-5 shadow-xl sm:max-w-lg sm:rounded-2xl sm:p-6">
                        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#2879ef]">Property visit</p><h2 id="schedule-viewing-title" className="mt-1 text-xl font-bold text-slate-900">{editingViewing ? "Update viewing request" : "Request a viewing"}</h2></div><button type="button" onClick={() => setModalOpen(false)} disabled={submitting} aria-label="Close viewing form" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"><FiX size={20} /></button></div>
                        <p className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5 text-sm leading-5 text-slate-700">Select your preferred date and time. These are preferences, not confirmed availability; the owner will respond to your request.</p>
                        <form onSubmit={(event) => void submitViewing(event)} className="mt-5 space-y-4">
                            <label className="block text-sm font-semibold text-slate-800">Preferred date<input type="date" value={preferredDate} onChange={(event) => setPreferredDate(event.target.value)} min={minViewingDate} required disabled={submitting} autoFocus className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 font-normal text-slate-800 focus:border-[#2879ef] focus:outline-none focus:ring-2 focus:ring-blue-100" /></label>
                            <label className="block text-sm font-semibold text-slate-800">Preferred time<input type="time" value={preferredTime} onChange={(event) => setPreferredTime(event.target.value)} required disabled={submitting} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 font-normal text-slate-800 focus:border-[#2879ef] focus:outline-none focus:ring-2 focus:ring-blue-100" /></label>
                            <label className="block text-sm font-semibold text-slate-800">Message to the owner (optional)<textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={1000} rows={3} disabled={submitting} placeholder="Add a note about your visit" className="mt-1 w-full rounded-lg border border-slate-300 p-3 font-normal text-slate-800 focus:border-[#2879ef] focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50" /></label>
                            {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setModalOpen(false)} disabled={submitting} className="min-h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button><button type="submit" disabled={submitting || !preferredDate || !preferredTime} className="min-h-11 rounded-lg bg-[#2879ef] px-5 text-sm font-bold text-white-1 hover:bg-[#1766d5] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Requesting…" : editingViewing ? "Update request" : "Request viewing"}</button></div>
                        </form>
                    </section>
                </div>
            )}
        </>
    );
}
