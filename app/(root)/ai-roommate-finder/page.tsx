"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FiAlertCircle, FiCheckCircle, FiCircle, FiLoader, FiRefreshCw, FiUsers } from "react-icons/fi";
import AuthGuard from "@/app/hoc/AuthGuard";
import VerificationGuard from "@/components/VerificationGuard";
import Pagination from "@/components/Pagination";
import PotentialRoommateCard from "@/components/PotentialRoommateCard";
import RoommateFilters, { type RoommateFiltersState } from "@/components/RoommateFilters";
import { fetchPotentialMatches, requestManualMatchRefresh } from "@/utils/api";
import { getRoommateOnboarding, type RoommateOnboarding } from "@/utils/auth";
import type { ApiResponse, RoommateProps } from "@/types";

const ITEMS_PER_PAGE = 12;
const FILTER_KEYS: (keyof RoommateFiltersState)[] = [
    "search_name", "city", "preferred_city", "school", "department",
    "min_budget", "max_budget", "preferred_age_min", "preferred_age_max",
    "seeking", "preferred_tribe", "preferred_gender", "preferred_religion",
    "max_roommates", "user_type", "level", "profession",
    "state_of_origin", "min_compatibility",
];

function parseFilters(params: URLSearchParams): RoommateFiltersState {
    const filters: RoommateFiltersState = {};
    FILTER_KEYS.forEach((key) => {
        const value = params.get(key);
        if (value !== null && value !== "") Object.assign(filters, { [key]: value });
    });
    const interests = params.getAll("interests").filter(Boolean);
    if (interests.length) filters.interests = interests;
    return filters;
}

function buildFinderUrl(pathname: string, filters: RoommateFiltersState, page: number): string {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((item) => { if (item) params.append(key, item); });
        } else if (typeof value === "string" && value) {
            params.set(key, value);
        }
    });
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
}

const FinderSkeleton = () => (
    <div className="w-full" role="status" aria-live="polite" aria-label="Loading roommate matches">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#2879ef]">
            <FiLoader className="animate-spin" aria-hidden="true" />
            <span>Finding compatible roommates…</span>
        </div>
        <div aria-hidden="true" className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="min-h-[270px] animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white-1 shadow-[0_2px_7px_rgba(15,23,42,0.05)]">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-3 pb-2 pt-3">
                        <div className="min-w-0 flex-1 space-y-2">
                            <div className="h-4 w-2/3 rounded bg-slate-200" />
                            <div className="h-3 w-1/3 rounded bg-slate-100" />
                        </div>
                        <div className="h-5 w-16 rounded bg-[#eef6ff]" />
                    </div>
                    <div className="flex gap-3 px-3 py-3">
                        <div className="h-[104px] w-[104px] shrink-0 rounded-lg bg-[#eaf5ff]" />
                        <div className="flex flex-1 flex-col justify-center gap-2">
                            <div className="h-3 w-3/4 rounded bg-slate-100" />
                            <div className="h-3 w-full rounded bg-slate-100" />
                            <div className="h-3 w-2/3 rounded bg-slate-100" />
                            <div className="h-3 w-1/2 rounded bg-slate-100" />
                        </div>
                    </div>
                    <div className="space-y-2 border-t border-slate-100 px-3 py-3">
                        <div className="h-3 w-full rounded bg-slate-100" />
                        <div className="h-3 w-4/5 rounded bg-slate-100" />
                        <div className="flex gap-1.5 pt-1">
                            <div className="h-5 w-14 rounded-full bg-[#eef6ff]" />
                            <div className="h-5 w-16 rounded-full bg-[#eef6ff]" />
                        </div>
                    </div>
                    <div className="mt-1 flex items-center justify-between border-t border-slate-100 px-3 py-3">
                        <div className="h-7 w-24 rounded-md bg-amber-50" />
                        <div className="h-7 w-20 rounded-md bg-slate-100" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const stepRoutes = {
    personal_profile: "/profile-update/basic",
    roommate_preferences: "/profile-update/roommate-preferrence",
    compatibility_quiz: "/compatibility-quiz?next=%2Fai-roommate-finder",
} as const;

function OnboardingRequired({ onboarding }: { onboarding: RoommateOnboarding }) {
    const steps = [
        { key: "personal_profile", title: "Complete Your Personal Profile", description: "Add your basic information, profile photo, bio and location.", complete: onboarding.personal_profile_complete },
        { key: "roommate_preferences", title: "Set Up Your Roommate Preferences", description: "Tell us what kind of living arrangement you're looking for, your preferred location and your accommodation preferences.", complete: onboarding.roommate_preferences_complete },
        { key: "compatibility_quiz", title: "Complete Your Compatibility Quiz", description: "Tell us about your lifestyle, habits, expectations and living preferences so we can find compatible roommates.", complete: onboarding.compatibility_quiz_complete },
    ] as const;
    const current = onboarding.next_step;
    const buttonLabel = current === "personal_profile" ? "Complete Your Profile" : current === "roommate_preferences" ? "Set Up Preferences" : "Complete Compatibility Quiz";
    return <section className="mx-auto mt-8 max-w-3xl rounded-3xl border border-amber-200 bg-white p-6 shadow-sm sm:p-9">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-700">Roommate matching setup</p>
        <h2 className="mt-3 text-3xl font-black text-slate-900">Get Ready to Find Your Roommate</h2>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">Before you can discover compatible roommates, we need you to complete your profile and compatibility quiz. This helps us recommend people whose lifestyles, habits and living preferences align with yours.</p>
        <ol className="mt-7 space-y-4">{steps.map((step, index) => <li key={step.key} className={`flex gap-4 rounded-2xl border p-4 ${step.complete ? "border-emerald-100 bg-emerald-50/50" : step.key === current ? "border-amber-300 bg-amber-50" : "border-slate-200"}`}>
            {step.complete ? <FiCheckCircle className="mt-0.5 shrink-0 text-emerald-600" size={22} /> : <FiCircle className="mt-0.5 shrink-0 text-amber-600" size={22} />}
            <div><p className="font-bold text-slate-900">{index + 1}. {step.title} {step.complete ? <span className="ml-2 text-sm text-emerald-700">Completed</span> : step.key === current ? <span className="ml-2 text-sm text-amber-700">Current step</span> : <span className="ml-2 text-sm text-slate-500">Incomplete</span>}</p><p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p></div>
        </li>)}</ol>
        {current && <Link href={stepRoutes[current]} className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-amber-500 px-5 font-bold text-white transition hover:bg-amber-600">{buttonLabel}</Link>}
    </section>;
}

function responseIsValid(value: unknown): value is ApiResponse {
    if (typeof value !== "object" || value === null || !("data" in value)) return false;
    const data = (value as ApiResponse).data;
    return Array.isArray(data?.matches)
        && typeof data?.pagination?.total_matches === "number"
        && typeof data?.pagination?.total_pages === "number"
        && typeof data?.pagination?.page === "number";
}

function PotentialRoommates() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const query = searchParams.toString();
    const [filters, setFilters] = useState<RoommateFiltersState>({});
    const [roommates, setRoommates] = useState<RoommateProps[]>([]);
    const [totalMatches, setTotalMatches] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retry, setRetry] = useState(0);
    const [matchingStatus, setMatchingStatus] = useState<"pending" | "processing" | "completed" | "failed" | null>(null);
    const [manualRefreshBusy, setManualRefreshBusy] = useState(false);
    const [manualRefreshWait, setManualRefreshWait] = useState(0);
    const [manualRefreshMessage, setManualRefreshMessage] = useState<string | null>(null);
    const [onboarding, setOnboarding] = useState<RoommateOnboarding | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        let pollTimer: ReturnType<typeof setTimeout> | undefined;
        const params = new URLSearchParams(query);
        const nextFilters = parseFilters(params);
        const parsedPage = Number(params.get("page") ?? "1");
        const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

        setFilters(nextFilters);
        setCurrentPage(page);
        setLoading(true);
        setError(null);

        void (async () => {
            const status = await getRoommateOnboarding();
            if (!status.roommate_matching_ready) {
                setOnboarding(status);
                return null;
            }
            setOnboarding(null);
            return fetchPotentialMatches(page, ITEMS_PER_PAGE, nextFilters, controller.signal);
        })()
            .then((response: unknown) => {
                if (response === null) return;
                if (!responseIsValid(response)) {
                    throw new Error("The roommate service returned incomplete match data. Please try again.");
                }
                setRoommates(response.data.matches);
                setTotalMatches(response.data.pagination.total_matches);
                setTotalPages(response.data.pagination.total_pages);
                const status = (response as ApiResponse & { matching_status?: typeof matchingStatus }).matching_status ?? "completed";
                setMatchingStatus(status);
                setManualRefreshWait(response.manual_refresh_retry_after ?? 0);
                if (status === "pending" || status === "processing") {
                    pollTimer = setTimeout(() => setRetry((value) => value + 1), 10000);
                }
            })
            .catch((cause: unknown) => {
                if (controller.signal.aborted) return;
                console.error("Unable to load roommate matches", cause);
                setRoommates([]);
                setTotalMatches(0);
                setTotalPages(0);
                const status = typeof cause === "object" && cause !== null && "status" in cause
                    ? (cause as { status?: number }).status
                    : undefined;
                setError(status === 401 || status === 403
                    ? "Your session may have expired. Sign in again to continue searching."
                    : cause instanceof Error && cause.message
                        ? cause.message
                        : "We couldn't load roommate matches. Check your connection and try again.");
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => {
            controller.abort();
            if (pollTimer) clearTimeout(pollTimer);
        };
    }, [query, retry]);

    useEffect(() => {
        if (manualRefreshWait <= 0) return;
        const timer = setTimeout(
            () => setManualRefreshWait((seconds) => Math.max(0, seconds - 1)),
            1000,
        );
        return () => clearTimeout(timer);
    }, [manualRefreshWait]);

    const handleManualRefresh = useCallback(async () => {
        if (
            manualRefreshBusy
            || manualRefreshWait > 0
            || matchingStatus === "pending"
            || matchingStatus === "processing"
        ) return;

        setManualRefreshBusy(true);
        setManualRefreshMessage(null);
        try {
            const result = await requestManualMatchRefresh();
            setMatchingStatus(result.matching_status);
            setManualRefreshWait(result.retry_after);
            setManualRefreshMessage("Fresh roommate discovery is queued. Your results will update automatically.");
            setRetry((value) => value + 1);
        } catch (cause) {
            const errorInfo = typeof cause === "object" && cause !== null
                ? cause as { retryAfter?: number | null }
                : {};
            if (typeof errorInfo.retryAfter === "number") {
                setManualRefreshWait(errorInfo.retryAfter);
            }
            setManualRefreshMessage(
                cause instanceof Error ? cause.message : "We couldn't refresh your matches.",
            );
        } finally {
            setManualRefreshBusy(false);
        }
    }, [manualRefreshBusy, manualRefreshWait, matchingStatus]);

    const handleFilterChange = useCallback((nextFilters: RoommateFiltersState) => {
        const nextUrl = buildFinderUrl(pathname, nextFilters, 1);
        setFilters(nextFilters);
        router.replace(nextUrl, { scroll: false });
    }, [pathname, router]);

    const handlePageChange = useCallback((page: number) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        router.push(buildFinderUrl(pathname, filters, page), { scroll: false });
    }, [currentPage, filters, pathname, router, totalPages]);

    const resetFilters = useCallback(() => {
        setFilters({});
        router.replace(pathname, { scroll: false });
    }, [pathname, router]);

    const resultSummary = useMemo(
        () => `${totalMatches.toLocaleString()} ${totalMatches === 1 ? "roommate" : "roommates"} found`,
        [totalMatches],
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-12 text-slate-800">
            <div className="mx-auto w-full max-w-[1720px] px-3 pt-12 sm:px-5 sm:pt-12 lg:px-7 md:mt-0 mt-5">
                <header className="mb-4 hidden flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4 sm:flex">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2879ef]">NestBuddy roommate directory</p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Find a roommate</h1>
                        <p className="mt-1 text-sm text-slate-500">Browse compatible people, compare their preferences, and make a connection.</p>
                    </div>
                    <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-500">Available now</p>
                        <p className="text-sm font-bold text-[#1f6fdd]" aria-live="polite">{loading ? "Updating…" : resultSummary}</p>
                    </div>
                </header>

                <RoommateFilters filters={filters} onFilterChange={handleFilterChange} totalMatches={totalMatches} />

                <section aria-labelledby="roommate-results-title" className="mt-5">
                    {(matchingStatus === "pending" || matchingStatus === "processing") && (
                        <p role="status" className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                            We&apos;re finding compatible roommates. This page will refresh automatically.
                        </p>
                    )}
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                        <div className="hidden sm:block">
                            <h2 id="roommate-results-title" className="text-lg font-bold text-slate-900">Roommate results</h2>
                            <p className="mt-0.5 text-sm text-slate-500" aria-live="polite">Profiles are ordered by compatibility with your preferences.</p>
                        </div>
                        <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
                            {!loading && totalPages > 1 && (
                                <p className="text-sm font-medium text-slate-500">Page {currentPage} of {totalPages}</p>
                            )}
                            <button
                                type="button"
                                onClick={() => void handleManualRefresh()}
                                disabled={manualRefreshBusy || manualRefreshWait > 0 || matchingStatus === "pending" || matchingStatus === "processing"}
                                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white-1 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                {manualRefreshBusy || matchingStatus === "pending" || matchingStatus === "processing"
                                    ? <FiLoader className="animate-spin" aria-hidden="true" />
                                    : <FiRefreshCw aria-hidden="true" />}
                                {manualRefreshBusy || matchingStatus === "pending" || matchingStatus === "processing"
                                    ? "Matching in progress"
                                    : manualRefreshWait > 0
                                        ? `Refresh in ${Math.floor(manualRefreshWait / 60)}:${String(manualRefreshWait % 60).padStart(2, "0")}`
                                        : "Refresh matches"}
                            </button>
                        </div>
                    </div>
                    {manualRefreshMessage && (
                        <p role="status" className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                            {manualRefreshMessage}
                        </p>
                    )}

                    {onboarding ? <OnboardingRequired onboarding={onboarding} /> : loading ? (
                        <FinderSkeleton />
                    ) : error ? (
                        <div role="alert" className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-rose-200 bg-white-1 px-6 py-10 text-center shadow-sm">
                            <span className="mb-4 rounded-full bg-rose-50 p-3 text-rose-600"><FiAlertCircle size={24} aria-hidden="true" /></span>
                            <h3 className="text-lg font-bold text-slate-900">We couldn't load matches</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{error}</p>
                                            {(error.includes("session") || error.includes("Sign in")) && (
                                                <Link href="/sign-in?next=%2Fai-roommate-finder" className="mt-4 text-sm font-semibold text-indigo-700 underline underline-offset-4">Sign in</Link>
                            )}
                            <button type="button" onClick={() => setRetry((attempt) => attempt + 1)} className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white-1 transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                Try again
                            </button>
                        </div>
                    ) : (matchingStatus === "pending" || matchingStatus === "processing") ? (
                        <div role="status" className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-blue-100 bg-white-1 px-6 py-12 text-center shadow-sm">
                            <span className="mb-4 rounded-full bg-blue-50 p-4 text-blue-600"><FiLoader className="animate-spin" size={28} aria-hidden="true" /></span>
                            <h3 className="text-xl font-bold text-slate-900">Finding compatible roommates</h3>
                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                                Your matches are being prepared. This page will refresh automatically.
                            </p>
                        </div>
                    ) : roommates.length === 0 ? (
                        <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-slate-200 bg-white-1 px-6 py-12 text-center shadow-sm">
                            <span className="mb-4 rounded-full bg-indigo-50 p-4 text-indigo-600"><FiUsers size={28} aria-hidden="true" /></span>
                            <h3 className="text-xl font-bold text-slate-900">No roommates match those filters</h3>
                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                                Try broadening your search or clearing a few filters to see more available profiles.
                            </p>
                            <button type="button" onClick={resetFilters} className="mt-5 rounded-xl border border-indigo-200 px-5 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50">
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                                {roommates.map((roommate) => (
                                    <PotentialRoommateCard key={roommate.user_id} roommate={roommate} />
                                ))}
                            </div>
                            {totalPages > 1 && (
                                <nav aria-label="Roommate results pages" className="mt-8 flex justify-center">
                                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} isLoading={loading} />
                                </nav>
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}

export default function PotentialRoommatesPage() {
    return (
        <AuthGuard>
            <VerificationGuard><PotentialRoommates /></VerificationGuard>
        </AuthGuard>
    );
}
