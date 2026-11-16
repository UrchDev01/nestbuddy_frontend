"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from 'react-markdown';
import { fetchCompatibilityDetails, requestCompatibilityAnalysis } from "@/utils/api";
import { CompatibilityDetails } from "@/types";
import { FaMapMarkerAlt, FaMoneyBillWave, FaLightbulb, FaUsers, FaClipboardCheck, FaChevronDown } from "react-icons/fa";
import { BsFillPatchCheckFill, BsXCircleFill } from "react-icons/bs";
import AuthGuard from "@/app/hoc/AuthGuard";
import VerificationGuard from "@/components/VerificationGuard";
import StartChatButton from "@/components/StartChatButton";
import { FiLoader } from "react-icons/fi";

function QuizComparison({ comparison, potentialRoommateName }: {
        comparison: CompatibilityDetails["data"]["quiz_comparison"];
        potentialRoommateName: string;
}) {
        const [openCategories, setOpenCategories] = useState<Set<string>>(() => new Set(comparison.categories.map((category) => category.id)));
        const summary = comparison.summary;
        const totalQuestions = summary.similar_answers + summary.different_answers + summary.not_answered_by_both;
        const indicators = [
                ["Similar answers", summary.similar_answers, "border-emerald-100 bg-emerald-50 text-emerald-700"],
                ["Different answers", summary.different_answers, "border-amber-100 bg-amber-50 text-amber-700"],
                ["Not answered by both", summary.not_answered_by_both, "border-slate-200 bg-slate-50 text-slate-600"],
        ] as const;
        const toggleCategory = (id: string) => setOpenCategories((current) => {
                const next = new Set(current);
                next.has(id) ? next.delete(id) : next.add(id);
                return next;
        });

        return <section className="mt-5 rounded-2xl border border-blue-100 bg-white-1 p-5 shadow-[0_7px_24px_rgba(40,121,239,0.06)] sm:p-7">
                <div><h2 className="flex items-center gap-2 text-base font-bold text-[#0d478c]"><FaClipboardCheck className="text-[#2879ef]" />Lifestyle &amp; Quiz Comparison</h2><p className="mt-1 text-sm text-[#53749b]">See the preferences behind your compatibility score.</p></div>
                {totalQuestions === 0 ? <div className="mt-5 rounded-xl border border-dashed border-blue-100 bg-[#f7fbff] px-4 py-6 text-sm text-[#53749b]"><p className="font-semibold text-[#355d8c]">No quiz comparisons available yet.</p><p className="mt-1">There&apos;s not enough shared quiz information to compare your roommate preferences right now.</p></div> : <>
                        <div className="mt-5 grid gap-3 sm:grid-cols-3">{indicators.map(([label, count, color]) => <div key={label} className={`rounded-xl border px-4 py-3 ${color}`}><p className="text-2xl font-bold">{count}</p><p className="mt-1 text-xs font-semibold">{label}</p></div>)}</div>
                        <div className="mt-5 space-y-3">{comparison.categories.map((category) => {
                                const categorySummary = category.questions.reduce((counts, question) => ({
                                        comparable: counts.comparable + (question.both_answered ? 1 : 0),
                                        similar: counts.similar + (question.comparison === "similar" ? 1 : 0),
                                        different: counts.different + (question.comparison === "different" ? 1 : 0),
                                }), { comparable: 0, similar: 0, different: 0 });
                                const isOpen = openCategories.has(category.id);
                                return <div key={category.id} className="overflow-hidden rounded-xl border border-blue-100">
                                        <button type="button" onClick={() => toggleCategory(category.id)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-3 bg-[#f7fbff] px-4 py-4 text-left transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2879ef]">
                                                <span><span className="block font-bold text-[#0d478c]">{category.name}</span><span className="mt-1 block text-xs text-[#53749b]">{categorySummary.comparable} comparable · {categorySummary.similar} similar · {categorySummary.different} different</span></span><FaChevronDown aria-hidden="true" className={`shrink-0 text-[#2879ef] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                        </button>
                                        {isOpen && <div className="divide-y divide-blue-50">{category.questions.map((question) => {
                                                const status = question.comparison === "similar" ? ["Similar answers", "bg-emerald-50 text-emerald-700"] : question.comparison === "different" ? ["Different expectations", "bg-amber-50 text-amber-700"] : ["Not answered", "bg-slate-100 text-slate-600"];
                                                return <article key={question.id} className="p-4"><h3 className="font-semibold leading-6 text-[#163e70]">{question.question}</h3><div className="mt-3 grid gap-2 sm:grid-cols-2"><div className="rounded-lg bg-[#f7fbff] px-3 py-2"><p className="text-xs font-bold uppercase tracking-wide text-[#53749b]">You</p><p className="mt-1 text-sm text-[#355d8c]">{question.your_answer?.text || "Not answered"}</p></div><div className="rounded-lg bg-[#f7fbff] px-3 py-2"><p className="text-xs font-bold uppercase tracking-wide text-[#53749b]">{potentialRoommateName}</p><p className="mt-1 text-sm text-[#355d8c]">{question.potential_roommate_answer?.text || "Not answered"}</p></div></div><span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${status[1]}`}>{status[0]}</span></article>;
                                        })}</div>}
                                </div>;
                        })}</div>
                </>}
        </section>;
}


function CompatibilityDashboard({
        data,
        onBack,
        onRequestAnalysis,
        analysisSubmitting,
        retryWait,
}: {
        data: CompatibilityDetails["data"];
        onBack: () => void;
        onRequestAnalysis: (forceRegenerate?: boolean) => void;
        analysisSubmitting: boolean;
        retryWait: number;
}) {
        const [showAnalysis, setShowAnalysis] = useState(false);
        const [confirmRegeneration, setConfirmRegeneration] = useState(false);
        const previousAnalysis = useRef(data.ai_analysis);
        const target = data.user2;
        useEffect(() => {
                if (data.ai_analysis && previousAnalysis.current !== data.ai_analysis) {
                        setShowAnalysis(true);
                }
                previousAnalysis.current = data.ai_analysis;
        }, [data.ai_analysis]);
        const overallScore = typeof data.overall_score === "number" ? data.overall_score : null;
        const scoreColor = overallScore !== null ? (overallScore >= 80 ? "#16b978" : overallScore >= 60 ? "#e6a51c" : "#e45b5b") : "#94a3b8";
        const scoreRows = [
                ["Location", data.location_score, <FaMapMarkerAlt key="location" />],
                ["Budget", data.budget_score, <FaMoneyBillWave key="budget" />],
                ["Lifestyle", data.lifestyle_score, <FaLightbulb key="lifestyle" />],
                ["Interests", data.interest_score, <BsFillPatchCheckFill key="interests" />],
                ["Quiz", data.quiz_score, <FaClipboardCheck key="quiz" />],
        ] as const;
        const factorRows = [
                ["Gender preference", data.lifestyle_factors.gender_preference_match],
                ["Religious background", data.lifestyle_factors.religion_match],
        ];
        const occupation = target.user_type === "professional"
                ? target.profession || "Professional"
                : [target.school, target.department, target.level].filter(Boolean).join(" · ") || "Student";
        const facts = [
                ["Max roommates", target.max_roommates, <FaUsers key="roommates" />],
                ["Preferred age range", target.preferred_age_range, <FaClipboardCheck key="age" />],
                ["Preferred tribe", target.preferred_tribe, <FaUsers key="tribe" />],
                ["Preferred religion", target.preferred_religion, <BsFillPatchCheckFill key="religion" />],
                ["Preferred location", target.preferred_city, <FaMapMarkerAlt key="city" />],
                ["Accommodation location", target.accommodation_city, <FaMapMarkerAlt key="accommodation" />],
        ] as const;

        return (
                <div className="min-h-screen bg-[#f7fbff] pb-12 text-[#163e70]">
                        <div className="mx-auto w-full max-w-[1480px] px-4 pt-5 sm:px-6 lg:px-8">
                                <section className="relative overflow-hidden rounded-2xl bg-[#0d3157] px-5 py-7 text-white-1 shadow-sm sm:px-8 sm:py-9">
                                        <img src="/roommate-page-image.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#061d36]/95 via-[#092a4d]/85 to-[#092a4d]/55" />
                                        <div className="relative max-w-xl">
                                                <button onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white-1/80 bg-white-1 px-4 py-2 text-sm font-bold text-[#092a4d] shadow-md transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white-1 focus-visible:ring-offset-2 focus-visible:ring-offset-[#092a4d]">← Back to roommates</button>
                                                <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white-1 drop-shadow-md sm:text-5xl">RoomieFit</h1>
                                                <p className="mt-1 text-lg font-medium text-blue-100">Your AI compatibility analysis</p>
                                                <p className="mt-4 max-w-md text-sm leading-6 text-blue-50">Get to know your potential roommate better with a clear view of the habits, preferences, and strengths you share.</p>
                                        </div>
                                </section>

                                <section className="mt-5 rounded-2xl border border-blue-100 bg-white-1 p-4 shadow-[0_7px_24px_rgba(40,121,239,0.06)] sm:p-5">
                                        <div className="grid gap-5 lg:grid-cols-[1.45fr_.9fr] lg:items-center">
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-blue-50 text-xl font-bold text-[#2879ef] shadow-sm sm:h-28 sm:w-28">
                                                                {target.profile_image ? <img src={target.profile_image} alt={target.name} className="h-full w-full object-cover" /> : target.name.slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                                <h2 className="text-2xl font-bold tracking-tight text-[#0d478c]">{target.name}</h2>
                                                                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#355d8c]"><span>{target.age} years</span><span>{target.gender}</span><span>{target.tribe || "Tribe not specified"}</span><span>{target.religion || "Religion not specified"}</span></p>
                                                                <p className="mt-3 text-sm text-[#355d8c]"><span className="font-semibold text-[#2879ef]">Profession:</span> {occupation}</p>
                                                                {data.common_interests.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{data.common_interests.slice(0, 6).map((interest) => <span key={interest} className="rounded-full bg-[#eaf4ff] px-3 py-1 text-xs font-semibold text-[#2879ef]">{interest}</span>)}</div>}
                                                                <div className="mt-5">
                                                                        <StartChatButton userId={target.id} label={`Message ${target.name}`} profileSlug={target.slug} />
                                                                </div>
                                                        </div>
                                                </div>
                                                <div className="rounded-xl bg-[#f7fbff] p-5 text-center">
                                                        <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full" style={{ background: `conic-gradient(${scoreColor} ${overallScore !== null ? overallScore * 3.6 : 0}deg, #dceeff 0deg)` }}>
                                                                <div className="flex h-[88px] w-[88px] flex-col items-center justify-center rounded-full bg-white-1"><strong className="text-2xl text-[#0d478c]">{overallScore !== null ? `${overallScore}%` : "N/A"}</strong><span className="text-[10px] font-semibold text-[#53749b]">Compatibility</span></div>
                                                        </div>
                                                        <p className="mx-auto mt-4 max-w-xs text-sm leading-5 text-[#355d8c]">{overallScore !== null ? `You and ${target.name} have ${overallScore >= 80 ? "strong" : overallScore >= 60 ? "promising" : "developing"} potential as roommates.` : `Not enough profile information to score compatibility between you and ${target.name}.`}</p>
                                                </div>
                                        </div>
                                </section>

                                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                                        <section className="rounded-2xl border border-blue-100 bg-white-1 p-5 shadow-[0_7px_24px_rgba(40,121,239,0.06)]"><h2 className="flex items-center gap-2 text-base font-bold text-[#0d478c]"><FaClipboardCheck className="text-[#2879ef]" />Compatibility breakdown</h2><div className="mt-6 space-y-5">{scoreRows.map(([label, score, icon]) => <div key={label}><div className="mb-2 flex items-center justify-between text-sm"><span className="flex items-center gap-2 font-semibold text-[#355d8c]">{icon}{label}</span><span style={{ color: score === null ? "#64748b" : score >= 80 ? "#139965" : score >= 60 ? "#d7910e" : "#d54949" }}>{score === null ? "Not enough information" : `${score}%`}</span></div><div className="h-2 rounded-full bg-blue-50">{score !== null && <div className="h-2 rounded-full" style={{ width: `${score}%`, backgroundColor: score >= 80 ? "#16b978" : score >= 60 ? "#e6a51c" : "#e45b5b" }} />}</div></div>)}</div></section>
                                        <section className="rounded-2xl border border-blue-100 bg-white-1 p-5 shadow-[0_7px_24px_rgba(40,121,239,0.06)]"><h2 className="flex items-center gap-2 text-base font-bold text-[#0d478c]"><FaLightbulb className="text-[#2879ef]" />Common ground</h2><h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-[#4e75a3]">Shared interests</h3><div className="mt-3 flex flex-wrap gap-2">{data.common_interests.length ? data.common_interests.map((interest) => <span key={interest} className="rounded-md bg-[#eaf4ff] px-3 py-1.5 text-xs font-semibold text-[#2879ef]">{interest}</span>) : <p className="text-sm text-slate-500">No shared interests were listed.</p>}</div><div className="mt-6 border-t border-blue-100 pt-5"><h3 className="text-xs font-bold uppercase tracking-wide text-[#4e75a3]">Lifestyle factors</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">{factorRows.map(([label, matched]) => <p key={String(label)} className="flex items-center gap-2 text-sm text-[#355d8c]">{matched ? <BsFillPatchCheckFill className="shrink-0 text-emerald-500" /> : <BsXCircleFill className="shrink-0 text-amber-500" />}{String(label)}</p>)}</div></div></section>
                                </div>

                                <section className="mt-5 rounded-2xl border border-blue-100 bg-white-1 p-5 shadow-[0_7px_24px_rgba(40,121,239,0.06)]"><h2 className="flex items-center gap-2 text-base font-bold text-[#0d478c]"><BsFillPatchCheckFill className="text-[#2879ef]" />More about {target.name}</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{facts.map(([label, value, icon]) => <div key={label} className="rounded-xl border border-blue-100 bg-white-1 px-4 py-4"><div className="flex items-center gap-2 text-xs font-semibold text-[#4e75a3]">{icon}{label}</div><p className="mt-3 text-sm font-bold text-[#163e70]">{value || "Not specified"}</p></div>)}</div></section>

                                <QuizComparison comparison={data.quiz_comparison} potentialRoommateName={target.name} />

                                <section className="mt-5 rounded-2xl border border-blue-100 bg-white-1 p-5 shadow-[0_7px_24px_rgba(40,121,239,0.06)] sm:p-7">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                                <h2 className="flex items-center gap-2 text-base font-bold text-[#0d478c]"><FaLightbulb className="text-[#2879ef]" />AI Compatibility Analysis</h2>
                                                <span className="rounded-full bg-[#eaf4ff] px-3 py-1.5 text-[11px] font-bold text-[#2879ef]">Powered by NestBuddy AI</span>
                                        </div>
                                        {(data.analysis_status === "pending" || data.analysis_status === "processing" || analysisSubmitting) && (
                                                <div role="status" className="mt-5 flex items-center gap-2 text-sm text-[#355d8c]">
                                                        <FiLoader className="animate-spin text-[#2879ef]" aria-hidden="true" />
                                                        <span>Preparing your compatibility analysis…</span>
                                                </div>
                                        )}
                                        {confirmRegeneration && (
                                                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4" role="dialog" aria-modal="true" aria-labelledby="regenerate-analysis-title">
                                                        <h3 id="regenerate-analysis-title" className="font-semibold text-[#163e70]">Generate a fresh analysis?</h3>
                                                        <p className="mt-1 text-sm text-[#355d8c]">This will use the latest profile information and replace the saved analysis only if generation succeeds.</p>
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                                <button type="button" onClick={() => setConfirmRegeneration(false)} className="min-h-10 rounded-xl border border-blue-200 bg-white-1 px-4 py-2 text-sm font-semibold text-[#355d8c]">Cancel</button>
                                                                <button type="button" onClick={() => { setConfirmRegeneration(false); setShowAnalysis(true); onRequestAnalysis(true); }} disabled={analysisSubmitting || retryWait > 0} className="min-h-10 rounded-xl bg-[#2879ef] px-4 py-2 text-sm font-semibold text-white-1 disabled:opacity-60">Confirm generation</button>
                                                        </div>
                                                </div>
                                        )}
                                        {data.ai_analysis && showAnalysis && (
                                                <div className="prose prose-sm mt-5 max-w-none text-[#355d8c] prose-headings:text-[#0d478c] prose-p:leading-6"><ReactMarkdown>{data.ai_analysis}</ReactMarkdown></div>
                                        )}
                                        {data.ai_analysis && data.analysis_generated_at && (
                                                <p className="mt-3 text-xs text-[#53749b]">
                                                        Generated {new Date(data.analysis_generated_at).toLocaleString()}
                                                </p>
                                        )}
                                        {data.ai_analysis && data.analysis_status === "failed" && (
                                                <p role="status" className="mt-3 text-sm text-amber-700">The new analysis could not be generated, so your previous saved analysis is still available.</p>
                                        )}
                                        {data.ai_analysis ? (
                                                <div className="mt-5 flex flex-wrap gap-3">
                                                        <button
                                                                type="button"
                                                                onClick={() => setShowAnalysis((visible) => !visible)}
                                                                className="inline-flex min-h-10 items-center rounded-xl border border-[#2879ef] px-4 py-2 text-sm font-semibold text-[#2879ef] transition hover:bg-blue-50"
                                                        >
                                                                {showAnalysis ? "Hide analysis" : "Show analysis"}
                                                        </button>
                                                        <button
                                                                type="button"
                                                                onClick={() => setConfirmRegeneration(true)}
                                                                disabled={analysisSubmitting || data.analysis_status === "processing" || data.analysis_status === "pending" || retryWait > 0}
                                                                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#2879ef] px-4 py-2 text-sm font-semibold text-white-1 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                                {analysisSubmitting && <FiLoader className="animate-spin" aria-hidden="true" />}
                                                                Generate New Analysis
                                                        </button>
                                                </div>
                                        ) : data.analysis_status === "pending" || data.analysis_status === "processing" ? null : data.analysis_status === "failed" && !data.analysis_retryable ? (
                                                <p role="status" className="mt-5 text-sm text-[#355d8c]">Analysis is unavailable right now. Please try again later.</p>
                                        ) : (
                                                <div className="mt-5">
                                                        {data.analysis_status === "failed" && (
                                                                <p role="status" className="mb-3 text-sm text-[#355d8c]">We couldn&apos;t generate the analysis. You can try again.</p>
                                                        )}
                                                        {retryWait > 0 && (
                                                                <p className="mb-3 text-sm text-[#355d8c]">Please wait {retryWait} seconds before trying again.</p>
                                                        )}
                                                        <button
                                                                type="button"
                                                                onClick={() => onRequestAnalysis()}
                                                                disabled={analysisSubmitting || retryWait > 0}
                                                                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#2879ef] px-4 py-2 text-sm font-semibold text-white-1 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                                {analysisSubmitting && <FiLoader className="animate-spin" aria-hidden="true" />}
                                                                {data.analysis_status === "failed" ? "Retry analysis" : "Generate AI Analysis"}
                                                        </button>
                                                </div>
                                        )}
                                </section>
                        </div>
                </div>
        );
}

const RoommateCompatibilityDetail = () => {
        const params = useParams<{ id?: string; slug?: string }>();
        const router = useRouter();
        const pathname = usePathname();
        const roommateSlug = params.slug ?? params.id;
        const [compatibility, setCompatibility] = useState<CompatibilityDetails | null>(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);
        const [analysisSubmitting, setAnalysisSubmitting] = useState(false);
        const [retryWait, setRetryWait] = useState(0);

        useEffect(() => {
                const loadCompatibilityDetails = async () => {
                        setLoading(true);
                        try {
                                if (!roommateSlug) {
                                        throw new Error("No roommate slug provided");
                                }
                                const response = await fetchCompatibilityDetails(roommateSlug);
                                if (response && response.status === 'success') {
                                        setCompatibility(response);
                                        const canonicalSlug = response.data?.user2?.slug;
                                        if (canonicalSlug && pathname.startsWith("/roommate-compatibility/")) {
                                                router.replace(`/roommates/${canonicalSlug}/compatibility`);
                                        }
                                } else {
                                        throw new Error(response?.message || "Failed to load compatibility details");
                                }
                        } catch (err: any) {
                                console.error("Error fetching compatibility details:", err);
                                setError(err.message || "An error occurred while fetching compatibility details");
                        } finally {
                                setLoading(false);
                        }
                };

                loadCompatibilityDetails();
        }, [pathname, roommateSlug, router]);

        useEffect(() => {
                if (retryWait <= 0) return;
                const timer = setTimeout(() => setRetryWait((remaining) => Math.max(0, remaining - 1)), 1000);
                return () => clearTimeout(timer);
        }, [retryWait]);

        useEffect(() => {
                const status = compatibility?.data.analysis_status;
                if (!roommateSlug || (status !== "pending" && status !== "processing")) return;

                let timer: ReturnType<typeof setTimeout>;
                let cancelled = false;
                const poll = async () => {
                        try {
                                const response = await fetchCompatibilityDetails(roommateSlug);
                                if (cancelled) return;
                                if (response?.status === "success") {
                                        setCompatibility(response);
                                        const nextStatus = response.data?.analysis_status;
                                        if (nextStatus === "pending" || nextStatus === "processing") {
                                                timer = setTimeout(poll, 4000);
                                        }
                                }
                        } catch (cause) {
                                console.error("Unable to refresh compatibility analysis status", cause);
                                if (!cancelled) timer = setTimeout(poll, 4000);
                        }
                };
                timer = setTimeout(poll, 4000);
                return () => {
                        cancelled = true;
                        clearTimeout(timer);
                };
        }, [compatibility?.data.analysis_status, roommateSlug]);

        const handleAnalysisRequest = async (forceRegenerate = false) => {
                if (!roommateSlug || analysisSubmitting || retryWait > 0) return;
                setAnalysisSubmitting(true);
                try {
                        const result = await requestCompatibilityAnalysis(roommateSlug, forceRegenerate);
                        setCompatibility((current) => current ? {
                                ...current,
                                data: {
                                        ...current.data,
                                        analysis_status: result.analysis_status,
                                        ai_analysis: result.data?.analysis_text ?? current.data.ai_analysis,
                                        has_analysis: Boolean(result.data?.analysis_text ?? current.data.ai_analysis),
                                        analysis_generated_at: result.data?.generated_at ?? current.data.analysis_generated_at,
                                        analysis_error_code: null,
                                        analysis_retryable: false,
                                },
                        } : current);
                } catch (cause) {
                        const errorInfo = typeof cause === "object" && cause !== null
                                ? cause as { retryable?: boolean; retryAfter?: number | null; errorCode?: string | null }
                                : {};
                        setCompatibility((current) => current ? {
                                ...current,
                                data: {
                                        ...current.data,
                                        analysis_status: errorInfo.errorCode === "profile_changed" ? "not_started" : "failed",
                                        ai_analysis: errorInfo.errorCode === "profile_changed" ? null : current.data.ai_analysis,
                                        has_analysis: errorInfo.errorCode === "profile_changed" ? false : current.data.has_analysis,
                                        analysis_generated_at: errorInfo.errorCode === "profile_changed" ? null : current.data.analysis_generated_at,
                                        analysis_error_code: errorInfo.errorCode ?? null,
                                        analysis_retryable: errorInfo.retryable === true,
                                },
                        } : current);
                        if (typeof errorInfo.retryAfter === "number" && errorInfo.retryAfter > 0) {
                                setRetryWait(errorInfo.retryAfter);
                        }
                } finally {
                        setAnalysisSubmitting(false);
                }
        };

        const getScoreColor = (score: number) => {
                if (score >= 80) return "text-green-500";
                if (score >= 60) return "text-yellow-400";
                return "text-red-500";
        };

        const getProgressColor = (score: number) => {
                if (score >= 80) return "bg-green-500";
                if (score >= 60) return "bg-yellow-400";
                return "bg-red-500";
        };

        const getCompatibilityMessage = (score: number, name: string) => {
                if (score >= 80) {
                        return `You and ${name} have a strong potential for compatibility as roommates.`;
                } else if (score >= 60) {
                        return `You and ${name} have a moderate compatibility as roommates.`;
                } else {
                        return `You and ${name} might face some challenges as roommates.`;
                }
        };

        if (loading) {
                return (
                        <div className=" h-screen flex flex-col items-center justify-center">
                                <div className="relative">
                                        <div className="h-16 w-16 rounded-full border-4 border-black-1"></div>
                                        <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-t-blue-600 border-r-indigo-600 animate-spin"></div>
                                </div>
                                <p className="mt-6 text-lg font-medium text-[#0d478c]">
                                        Building your Roommate VibeCheck
                                </p>
                                <p className="text-sm text-[#0d478c] mt-2">AI analyzing compatibility...</p>
                        </div>
                );
        }

        if (error) {
                return (
                        <div className="flex flex-col justify-center items-center h-screen text-red-500">
                                <p>{error}</p>
                                <button
                                        onClick={() => router.back()}
                                        className="mt-4 px-4 py-2 bg-blue-500 text-white-1 rounded-lg hover:bg-blue-600"
                                >
                                        Go Back
                                </button>
                        </div>
                );
        }

        if (!compatibility || !compatibility.data) {
                return (
                        <div className="flex flex-col justify-center items-center h-screen">
                                <p>No compatibility data found.</p>
                                <button
                                        onClick={() => router.back()}
                                        className="mt-4 px-4 py-2 bg-blue-500 text-white-1 rounded-lg hover:bg-blue-600"
                                >
                                        Go Back
                                </button>
                        </div>
                );
        }

        const { data } = compatibility;
        const { user1, user2 } = data;

        return (
                <CompatibilityDashboard
                        data={data}
                        onBack={() => router.back()}
                        onRequestAnalysis={handleAnalysisRequest}
                        analysisSubmitting={analysisSubmitting}
                        retryWait={retryWait}
                />
        );

};

export default function ProtectedRoommateCompatibility() {
        return (
                <AuthGuard>
                        <VerificationGuard><RoommateCompatibilityDetail /></VerificationGuard>
                </AuthGuard>
        );
}
