"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiCheck, FiEdit2, FiMessageCircle, FiPlus, FiSend, FiTrash2, FiX } from "react-icons/fi";
import { answerPropertyQuestion, deletePropertyQuestion, editPropertyQuestionAnswer, fetchPropertyQuestions, postPropertyQuestion, updatePropertyQuestion } from "@/utils/api";
import { getPropertyActionError, readPropertyPage, trapDialogTab } from "@/utils/propertyPageUtils";

interface PropertyQuestion {
    id: number;
    user?: {
        id: number;
        first_name?: string;
        last_name?: string;
    };
    question: string;
    user_name?: string;
    answer?: string | null;
    is_answered: boolean;
    created_at: string;
    answered_at?: string | null;
}

interface PropertyQAProps {
    propertyId: number;
    propertySlug: string;
    userAuthenticated: boolean;
    isOwner: boolean;
    currentUserId?: number | null;
}

function displayDate(value?: string | null): string {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export default function PropertyQA({ propertyId, propertySlug, userAuthenticated, isOwner, currentUserId }: PropertyQAProps) {
    const router = useRouter();
    const [questions, setQuestions] = useState<PropertyQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [nextPage, setNextPage] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [questionText, setQuestionText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [answering, setAnswering] = useState<Record<number, boolean>>({});
    const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
    const [editingQuestionText, setEditingQuestionText] = useState("");
    const [editingAnswer, setEditingAnswer] = useState<number | null>(null);
    const [editingAnswerText, setEditingAnswerText] = useState("");
    const [pendingDelete, setPendingDelete] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const loadQuestions = useCallback(async (page = 1, append = false) => {
        const response = await fetchPropertyQuestions(propertyId, page);
        const result = readPropertyPage<PropertyQuestion>(response);
        if (!result) throw new Error("Questions returned incomplete data.");
        setQuestions((current) => append ? [...current, ...result.results] : result.results);
        setHasMore(result.hasMore);
        setNextPage(result.nextPage);
    }, [propertyId]);

    useEffect(() => {
        let active = true;
        setIsLoading(true);
        setLoadError(null);
        void fetchPropertyQuestions(propertyId, 1)
            .then((response: unknown) => {
                if (!active) return;
                const result = readPropertyPage<PropertyQuestion>(response);
                if (!result) throw new Error("Questions returned incomplete data.");
                setQuestions(result.results);
                setHasMore(result.hasMore);
                setNextPage(result.nextPage);
            })
            .catch((cause: unknown) => {
                if (active) setLoadError(getPropertyActionError(cause, "Questions couldn't be loaded right now."));
            })
            .finally(() => { if (active) setIsLoading(false); });
        return () => { active = false; };
    }, [propertyId]);

    useEffect(() => {
        if (!modalOpen) return;
        const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setModalOpen(false); };
        document.addEventListener("keydown", closeOnEscape);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", closeOnEscape);
            document.body.style.overflow = "";
        };
    }, [modalOpen]);

    const signIn = () => router.push(`/sign-in?redirect=${encodeURIComponent(`/properties/${propertySlug}`)}`);

    const submitQuestion = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!userAuthenticated) { signIn(); return; }
        const text = questionText.trim();
        if (!text) { setError("Write a question before submitting."); return; }

        setSubmitting(true);
        setError(null);
        try {
            await postPropertyQuestion(propertyId, text);
            await loadQuestions(1);
            setQuestionText("");
            setModalOpen(false);
            setSuccess("Your question has been sent to the property owner.");
        } catch (cause) {
            setError(getPropertyActionError(cause, "We couldn't send your question right now. Please try again."));
        } finally {
            setSubmitting(false);
        }
    };

    const submitAnswer = async (question: PropertyQuestion) => {
        const text = (answers[question.id] ?? "").trim();
        if (!text) { setError("Write an answer before submitting."); return; }
        setAnswering((current) => ({ ...current, [question.id]: true }));
        setError(null);
        try {
            const response = await answerPropertyQuestion(question.id, text);
            const body = response as Partial<PropertyQuestion>;
            setQuestions((current) => current.map((item) => item.id === question.id
                ? { ...item, answer: body.answer ?? text, is_answered: body.is_answered ?? true, answered_at: body.answered_at ?? null }
                : item));
            setAnswers((current) => ({ ...current, [question.id]: "" }));
            setSuccess("Your answer has been posted.");
        } catch (cause) {
            setError(getPropertyActionError(cause, "We couldn't submit your answer right now. Please try again."));
        } finally {
            setAnswering((current) => ({ ...current, [question.id]: false }));
        }
    };

    const saveQuestionEdit = async (question: PropertyQuestion) => {
        const text = editingQuestionText.trim();
        if (!text) { setError("Write a question before saving."); return; }
        setError(null);
        try {
            const response = await updatePropertyQuestion(question.id, { question: text });
            if (response instanceof Response && !response.ok) throw new Error("This question can no longer be edited.");
            setQuestions((current) => current.map((item) => item.id === question.id ? { ...item, question: text } : item));
            setEditingQuestion(null);
            setSuccess("Your question has been updated.");
        } catch (cause) {
            setError(getPropertyActionError(cause, "We couldn't update your question right now. Please try again."));
        }
    };

    const removeQuestion = async (questionId: number) => {
        setError(null);
        try {
            const response = await deletePropertyQuestion(questionId);
            if (response instanceof Response && !response.ok) throw new Error("This question cannot be deleted.");
            setQuestions((current) => current.filter((question) => question.id !== questionId));
            setPendingDelete(null);
            setSuccess("Your question has been deleted.");
        } catch (cause) {
            setError(getPropertyActionError(cause, "We couldn't delete your question right now. Please try again."));
        }
    };

    const saveAnswerEdit = async (question: PropertyQuestion) => {
        const text = editingAnswerText.trim();
        if (!text) { setError("Write an answer before saving."); return; }
        setError(null);
        try {
            const response = await editPropertyQuestionAnswer(question.id, text) as Partial<PropertyQuestion>;
            setQuestions((current) => current.map((item) => item.id === question.id
                ? { ...item, answer: response.answer ?? text, answered_at: response.answered_at ?? item.answered_at }
                : item));
            setEditingAnswer(null);
            setSuccess("Your answer has been updated.");
        } catch (cause) {
            setError(getPropertyActionError(cause, "We couldn't update your answer right now. Please try again."));
        }
    };

    const loadMore = async () => {
        if (!nextPage || isLoadingMore) return;
        setIsLoadingMore(true);
        setError(null);
        try {
            await loadQuestions(nextPage, true);
        } catch (cause) {
            setError(getPropertyActionError(cause, "More questions couldn't be loaded right now."));
        } finally {
            setIsLoadingMore(false);
        }
    };

    const retryQuestions = async () => {
        setIsLoading(true);
        setLoadError(null);
        try {
            await loadQuestions(1);
        } catch (cause) {
            setLoadError(getPropertyActionError(cause, "Questions couldn't be loaded right now."));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="rounded-2xl border border-slate-200 bg-white-1-1 p-5 shadow-sm sm:p-7" aria-labelledby="property-questions-title">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2879ef]">Ask the community</p>
                    <h2 id="property-questions-title" className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">Questions &amp; Answers</h2>
                </div>
                <button type="button" onClick={() => userAuthenticated ? setModalOpen(true) : signIn()} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#2879ef] px-4 py-2.5 text-sm font-bold text-white-1 transition hover:bg-[#1766d5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef] focus-visible:ring-offset-2">
                    <FiPlus aria-hidden="true" /> Ask a question
                </button>
            </div>

            {!userAuthenticated && (
                <p className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-700">
                    <button type="button" onClick={signIn} className="font-semibold text-[#1f6fdd] underline underline-offset-2">Sign in</button> to ask a question.
                </p>
            )}
            {error && <div role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}
            {loadError && <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><span>{loadError}</span><button type="button" onClick={() => void retryQuestions()} className="font-bold underline underline-offset-2">Try again</button></div>}
            {success && <div role="status" className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><FiCheck className="mt-0.5 shrink-0" />{success}</div>}

            {isLoading ? (
                <div className="mt-6 space-y-4" aria-label="Loading questions">
                    {[1, 2].map((item) => <div key={item} className="animate-pulse rounded-xl bg-slate-50 p-4"><div className="h-4 w-3/4 rounded bg-slate-200" /><div className="mt-3 h-3 w-1/3 rounded bg-slate-100" /><div className="mt-5 h-12 rounded bg-slate-100" /></div>)}
                </div>
            ) : questions.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-9 text-center">
                    <FiMessageCircle aria-hidden="true" className="mx-auto text-[#2879ef]" size={26} />
                    <h3 className="mt-3 font-bold text-slate-900">No questions yet</h3>
                    <p className="mt-1 text-sm text-slate-500">Be the first to ask about this property.</p>
                </div>
            ) : (
                <div className="mt-5 divide-y divide-slate-100">
                    {questions.map((question) => {
                        const author = question.user_name?.trim() || [question.user?.first_name, question.user?.last_name].filter(Boolean).join(" ") || "NestBuddy member";
                        const isAuthor = Boolean(currentUserId && question.user?.id === currentUserId);
                        return (
                            <article key={question.id} className="py-5 first:pt-0 last:pb-0">
                                <div className="flex items-start gap-3">
                                    <div aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50 text-sm font-bold text-[#2879ef]">{author.charAt(0).toUpperCase()}</div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                            <p className="font-semibold text-slate-900">{author}</p>
                                            {displayDate(question.created_at) && <time dateTime={question.created_at} className="text-xs text-slate-500">{displayDate(question.created_at)}</time>}
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${question.is_answered ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{question.is_answered ? "Answered" : "Awaiting answer"}</span>
                                        </div>
                                        {editingQuestion === question.id ? (
                                            <div className="mt-3 space-y-2">
                                                <textarea value={editingQuestionText} onChange={(event) => setEditingQuestionText(event.target.value)} rows={3} aria-label="Edit your question" className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-800 focus:border-[#2879ef] focus:outline-none focus:ring-2 focus:ring-blue-100" />
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={() => void saveQuestionEdit(question)} className="rounded-lg bg-[#2879ef] px-3 py-2 text-sm font-semibold text-white-1">Save question</button>
                                                    <button type="button" onClick={() => setEditingQuestion(null)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">Cancel</button>
                                                </div>
                                            </div>
                                        ) : <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{question.question}</p>}

                                        {isAuthor && !question.is_answered && editingQuestion !== question.id && (
                                            <div className="mt-3 flex flex-wrap gap-3 text-xs">
                                                <button type="button" onClick={() => { setEditingQuestion(question.id); setEditingQuestionText(question.question); }} className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-[#2879ef]"><FiEdit2 /> Edit</button>
                                                {pendingDelete === question.id ? (
                                                    <span className="inline-flex items-center gap-2 text-slate-600">
                                                        Delete this question?
                                                        <button type="button" onClick={() => void removeQuestion(question.id)} className="font-bold text-rose-700">Delete</button>
                                                        <button type="button" onClick={() => setPendingDelete(null)} className="font-semibold">Keep it</button>
                                                    </span>
                                                ) : <button type="button" onClick={() => setPendingDelete(question.id)} className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-rose-700"><FiTrash2 /> Delete</button>}
                                            </div>
                                        )}

                                        {question.is_answered && (
                                            <div className="mt-4 rounded-xl border border-blue-100 bg-[#f4f8ff] p-4">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><span className="grid h-7 w-7 place-items-center rounded-full bg-white-1 text-[#2879ef]"><FiCheck /></span>Owner / agent</div>
                                                    {displayDate(question.answered_at) && <time dateTime={question.answered_at ?? undefined} className="text-xs text-slate-500">{displayDate(question.answered_at)}</time>}
                                                </div>
                                                {editingAnswer === question.id ? (
                                                    <div className="mt-3 space-y-2">
                                                        <textarea value={editingAnswerText} onChange={(event) => setEditingAnswerText(event.target.value)} rows={3} aria-label="Edit your answer" className="w-full rounded-lg border border-slate-300 bg-white-1 p-3 text-sm text-slate-800 focus:border-[#2879ef] focus:outline-none focus:ring-2 focus:ring-blue-100" />
                                                        <div className="flex gap-2">
                                                            <button type="button" onClick={() => void saveAnswerEdit(question)} className="rounded-lg bg-[#2879ef] px-3 py-2 text-sm font-semibold text-white-1">Save answer</button>
                                                            <button type="button" onClick={() => setEditingAnswer(null)} className="rounded-lg border border-slate-200 bg-white-1 px-3 py-2 text-sm font-semibold text-slate-700">Cancel</button>
                                                        </div>
                                                    </div>
                                                ) : <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{question.answer}</p>}
                                                {isOwner && editingAnswer !== question.id && <button type="button" onClick={() => { setEditingAnswer(question.id); setEditingAnswerText(question.answer ?? ""); }} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#1f6fdd]"><FiEdit2 /> Edit answer</button>}
                                            </div>
                                        )}

                                        {!question.is_answered && isOwner && (
                                            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                <label htmlFor={`answer-${question.id}`} className="text-sm font-semibold text-slate-800">Your answer</label>
                                                <textarea id={`answer-${question.id}`} value={answers[question.id] ?? ""} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} rows={3} className="mt-2 w-full rounded-lg border border-slate-300 bg-white-1 p-3 text-sm text-slate-800 focus:border-[#2879ef] focus:outline-none focus:ring-2 focus:ring-blue-100" placeholder="Write a helpful response" />
                                                <button type="button" onClick={() => void submitAnswer(question)} disabled={answering[question.id]} className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#2879ef] px-4 py-2 text-sm font-bold text-white-1 transition hover:bg-[#1766d5] disabled:cursor-not-allowed disabled:opacity-60">
                                                    <FiSend /> {answering[question.id] ? "Submitting…" : "Submit answer"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {hasMore && !isLoading && (
                <div className="mt-5 text-center">
                    <button type="button" onClick={() => void loadMore()} disabled={isLoadingMore} className="min-h-10 rounded-lg border border-blue-200 px-4 py-2 text-sm font-bold text-[#1f6fdd] transition hover:bg-blue-50 disabled:opacity-60">{isLoadingMore ? "Loading…" : "Load more questions"}</button>
                </div>
            )}

            {modalOpen && (
                <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) setModalOpen(false); }}>
                    <section role="dialog" aria-modal="true" aria-labelledby="ask-question-title" onKeyDown={trapDialogTab} className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white-1 p-5 shadow-xl sm:max-w-lg sm:rounded-2xl sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#2879ef]">Property enquiry</p><h3 id="ask-question-title" className="mt-1 text-xl font-bold text-slate-900">Ask a question</h3></div>
                            <button type="button" onClick={() => setModalOpen(false)} disabled={submitting} aria-label="Close question form" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"><FiX size={20} /></button>
                        </div>
                        <form onSubmit={(event) => void submitQuestion(event)} className="mt-5">
                            <label htmlFor="property-question" className="text-sm font-semibold text-slate-800">Question</label>
                            <textarea id="property-question" value={questionText} onChange={(event) => setQuestionText(event.target.value)} required maxLength={2000} rows={5} autoFocus disabled={submitting} placeholder="Ask about the property, its features, or the rental process…" className="mt-2 w-full resize-y rounded-xl border border-slate-300 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#2879ef] focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50" />
                            {error && <p role="alert" className="mt-2 text-sm text-rose-700">{error}</p>}
                            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <button type="button" onClick={() => setModalOpen(false)} disabled={submitting} className="min-h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
                                <button type="submit" disabled={submitting || !questionText.trim()} className="min-h-11 rounded-lg bg-[#2879ef] px-5 text-sm font-bold text-white-1 hover:bg-[#1766d5] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Sending…" : "Ask question"}</button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </section>
    );
}
