"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiCheck, FiEdit2, FiStar, FiTrash2, FiX } from "react-icons/fi";
import { deletePropertyReview, editPropertyReview, fetchPropertyReviews, postPropertyReview } from "@/utils/api";
import { getPropertyActionError, readPropertyPage, trapDialogTab } from "@/utils/propertyPageUtils";

interface PropertyReview {
    id: number;
    user: {
        id: number;
        first_name?: string;
        last_name?: string;
    };
    user_name?: string;
    rating: number;
    title?: string | null;
    comment: string;
    is_verified: boolean;
    created_at: string;
}

interface PropertyReviewsProps {
    propertyId: number;
    propertySlug: string;
    userAuthenticated: boolean;
    currentUserId?: number | null;
    averageRating: number | null;
    reviewCount: number;
    onReviewUpdated: () => void | Promise<void>;
}

function formattedDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function StarRating({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex items-center gap-0.5" aria-label={label}>
            {[1, 2, 3, 4, 5].map((star) => <FiStar key={star} aria-hidden="true" className={star <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"} size={16} />)}
        </div>
    );
}

export default function PropertyReviews({
    propertyId,
    propertySlug,
    userAuthenticated,
    currentUserId,
    averageRating,
    reviewCount,
    onReviewUpdated,
}: PropertyReviewsProps) {
    const router = useRouter();
    const [reviews, setReviews] = useState<PropertyReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [nextPage, setNextPage] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [reviewTitle, setReviewTitle] = useState("");
    const [reviewText, setReviewText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingRating, setEditingRating] = useState(5);
    const [editingText, setEditingText] = useState("");
    const [savingEdit, setSavingEdit] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const loadReviews = useCallback(async (page = 1, append = false) => {
        const response = await fetchPropertyReviews(propertyId, page);
        const result = readPropertyPage<PropertyReview>(response);
        if (!result) throw new Error("Reviews returned incomplete data.");
        setReviews((current) => append ? [...current, ...result.results] : result.results);
        setHasMore(result.hasMore);
        setNextPage(result.nextPage);
    }, [propertyId]);

    useEffect(() => {
        let active = true;
        setIsLoading(true);
        setLoadError(null);
        void fetchPropertyReviews(propertyId, 1)
            .then((response: unknown) => {
                if (!active) return;
                const result = readPropertyPage<PropertyReview>(response);
                if (!result) throw new Error("Reviews returned incomplete data.");
                setReviews(result.results);
                setHasMore(result.hasMore);
                setNextPage(result.nextPage);
            })
            .catch((cause: unknown) => {
                if (active) setLoadError(getPropertyActionError(cause, "Reviews couldn't be loaded right now."));
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

    const submitReview = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!userAuthenticated) { signIn(); return; }
        if (!reviewText.trim()) { setError("Write a review before submitting."); return; }
        setSubmitting(true);
        setError(null);
        try {
            await postPropertyReview(propertyId, { rating, title: reviewTitle.trim(), comment: reviewText.trim() });
            await loadReviews(1);
            await onReviewUpdated();
            setReviewTitle("");
            setReviewText("");
            setRating(5);
            setModalOpen(false);
            setSuccess("Thanks! Your review has been posted.");
        } catch (cause) {
            setError(getPropertyActionError(cause, "We couldn't submit your review. Please try again."));
        } finally {
            setSubmitting(false);
        }
    };

    const saveEdit = async (review: PropertyReview) => {
        if (!editingText.trim()) { setError("Write a review before saving."); return; }
        setSavingEdit(true);
        setError(null);
        try {
            const response = await editPropertyReview(review.id, { rating: editingRating, title: review.title ?? undefined, comment: editingText.trim() });
            if (response instanceof Response && !response.ok) throw new Error("This review could not be edited.");
            setReviews((current) => current.map((item) => item.id === review.id ? { ...item, rating: editingRating, comment: editingText.trim() } : item));
            setEditingId(null);
            await onReviewUpdated();
            setSuccess("Your review has been updated.");
        } catch (cause) {
            setError(getPropertyActionError(cause, "We couldn't update your review right now. Please try again."));
        } finally {
            setSavingEdit(false);
        }
    };

    const removeReview = async (reviewId: number) => {
        setError(null);
        try {
            const response = await deletePropertyReview(reviewId);
            if (response instanceof Response && !response.ok) throw new Error("This review could not be deleted.");
            setReviews((current) => current.filter((review) => review.id !== reviewId));
            setPendingDelete(null);
            await onReviewUpdated();
            setSuccess("Your review has been deleted.");
        } catch (cause) {
            setError(getPropertyActionError(cause, "We couldn't delete your review right now. Please try again."));
        }
    };

    const loadMore = async () => {
        if (!nextPage || isLoadingMore) return;
        setIsLoadingMore(true);
        setError(null);
        try {
            await loadReviews(nextPage, true);
        } catch (cause) {
            setError(getPropertyActionError(cause, "More reviews couldn't be loaded right now."));
        } finally {
            setIsLoadingMore(false);
        }
    };

    const retryReviews = async () => {
        setIsLoading(true);
        setLoadError(null);
        try {
            await loadReviews(1);
        } catch (cause) {
            setLoadError(getPropertyActionError(cause, "Reviews couldn't be loaded right now."));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="rounded-2xl border border-slate-200 bg-white-1 p-5 shadow-sm sm:p-7" aria-labelledby="property-reviews-title">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2879ef]">Experiences</p>
                    <h2 id="property-reviews-title" className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">Reviews</h2>
                </div>
                {reviewCount > 0 && averageRating !== null && (
                    <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-slate-900">{averageRating.toFixed(1)}</span>
                            <div><StarRating value={Math.round(averageRating)} label={`Average rating ${averageRating.toFixed(1)} out of 5`} /><p className="mt-1 text-xs text-slate-600">Based on {reviewCount} {reviewCount === 1 ? "review" : "reviews"}</p></div>
                        </div>
                    </div>
                )}
            </div>

            {userAuthenticated && (
                <button type="button" onClick={() => setModalOpen(true)} className="mt-4 min-h-11 rounded-lg border border-[#2879ef] px-4 py-2.5 text-sm font-bold text-[#1f6fdd] transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef] focus-visible:ring-offset-2">Write a review</button>
            )}
            {!userAuthenticated && (
                <p className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-700">
                    <button type="button" onClick={signIn} className="font-semibold text-[#1f6fdd] underline underline-offset-2">Sign in</button> to leave a review after a completed stay.
                </p>
            )}
            {error && <div role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}
            {loadError && <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><span>{loadError}</span><button type="button" onClick={() => void retryReviews()} className="font-bold underline underline-offset-2">Try again</button></div>}
            {success && <div role="status" className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><FiCheck className="mt-0.5 shrink-0" />{success}</div>}

            {isLoading ? (
                <div className="mt-6 space-y-4" aria-label="Loading reviews">{[1, 2].map((item) => <div key={item} className="animate-pulse rounded-xl bg-slate-50 p-4"><div className="h-4 w-1/3 rounded bg-slate-200" /><div className="mt-3 h-3 w-1/4 rounded bg-slate-100" /><div className="mt-5 h-12 rounded bg-slate-100" /></div>)}</div>
            ) : reviews.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-9 text-center">
                    <FiStar aria-hidden="true" className="mx-auto text-amber-400" size={26} />
                    <h3 className="mt-3 font-bold text-slate-900">No reviews yet</h3>
                    <p className="mt-1 text-sm text-slate-500">Be the first to share your experience.</p>
                </div>
            ) : (
                <div className="mt-5 divide-y divide-slate-100">
                    {reviews.map((review) => {
                        const name = review.user_name?.trim() || [review.user.first_name, review.user.last_name].filter(Boolean).join(" ") || "NestBuddy member";
                        const ownReview = Boolean(currentUserId && currentUserId === review.user.id);
                        return (
                            <article key={review.id} className="py-5 first:pt-0 last:pb-0">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50 font-bold text-[#2879ef]">{name.charAt(0).toUpperCase()}</div>
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-slate-900">{name}</p>
                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                <StarRating value={review.rating} label={`${review.rating} out of 5 stars`} />
                                                {formattedDate(review.created_at) && <time dateTime={review.created_at} className="text-xs text-slate-500">{formattedDate(review.created_at)}</time>}
                                            </div>
                                        </div>
                                    </div>
                                    {review.is_verified && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Verified stay</span>}
                                </div>
                                {review.title && <h3 className="mt-4 font-semibold text-slate-900">{review.title}</h3>}
                                {editingId === review.id ? (
                                    <div className="mt-3 space-y-3">
                                        <fieldset>
                                            <legend className="text-sm font-semibold text-slate-700">Rating</legend>
                                            <div className="mt-1 flex gap-1" role="radiogroup" aria-label="Choose rating">
                                                {[1, 2, 3, 4, 5].map((star) => <button type="button" key={star} role="radio" aria-checked={editingRating === star} aria-label={`${star} ${star === 1 ? "star" : "stars"}`} onClick={() => setEditingRating(star)} className="p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef]"><FiStar className={star <= editingRating ? "fill-amber-400 text-amber-400" : "text-slate-300"} size={22} /></button>)}
                                            </div>
                                        </fieldset>
                                        <label className="block text-sm font-semibold text-slate-700">Review<textarea value={editingText} onChange={(event) => setEditingText(event.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-slate-300 p-3 font-normal focus:border-[#2879ef] focus:outline-none focus:ring-2 focus:ring-blue-100" /></label>
                                        <div className="flex gap-2"><button type="button" onClick={() => void saveEdit(review)} disabled={savingEdit} className="rounded-lg bg-[#2879ef] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{savingEdit ? "Saving…" : "Save review"}</button><button type="button" onClick={() => setEditingId(null)} disabled={savingEdit} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button></div>
                                    </div>
                                ) : <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">{review.comment}</p>}
                                {ownReview && editingId !== review.id && (
                                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                                        <button type="button" onClick={() => { setEditingId(review.id); setEditingRating(review.rating); setEditingText(review.comment); }} className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-[#2879ef]"><FiEdit2 /> Edit review</button>
                                        {pendingDelete === review.id ? <span className="inline-flex items-center gap-2 text-slate-600">Delete this review?<button type="button" onClick={() => void removeReview(review.id)} className="font-bold text-rose-700">Delete</button><button type="button" onClick={() => setPendingDelete(null)} className="font-semibold">Keep it</button></span> : <button type="button" onClick={() => setPendingDelete(review.id)} className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-rose-700"><FiTrash2 /> Delete review</button>}
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}

            {hasMore && !isLoading && <div className="mt-5 text-center"><button type="button" onClick={() => void loadMore()} disabled={isLoadingMore} className="min-h-10 rounded-lg border border-blue-200 px-4 py-2 text-sm font-bold text-[#1f6fdd] hover:bg-blue-50 disabled:opacity-60">{isLoadingMore ? "Loading…" : "Load more reviews"}</button></div>}

            {modalOpen && (
                <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) setModalOpen(false); }}>
                    <section role="dialog" aria-modal="true" aria-labelledby="write-review-title" onKeyDown={trapDialogTab} className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white-1 p-5 shadow-xl sm:max-w-lg sm:rounded-2xl sm:p-6">
                        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#2879ef]">Share your experience</p><h3 id="write-review-title" className="mt-1 text-xl font-bold text-slate-900">Write a review</h3></div><button type="button" onClick={() => setModalOpen(false)} disabled={submitting} aria-label="Close review form" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"><FiX size={20} /></button></div>
                        <form onSubmit={(event) => void submitReview(event)} className="mt-5 space-y-4">
                            <fieldset><legend className="text-sm font-semibold text-slate-800">Rating</legend><div className="mt-1 flex gap-1" role="radiogroup" aria-label="Choose a rating">{[1, 2, 3, 4, 5].map((star) => <button type="button" key={star} role="radio" aria-checked={rating === star} aria-label={`${star} ${star === 1 ? "star" : "stars"}`} onClick={() => setRating(star)} className="rounded p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef]"><FiStar className={star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"} size={24} /></button>)}</div><p className="text-xs text-slate-500">{rating} out of 5</p></fieldset>
                            <label className="block text-sm font-semibold text-slate-800">Title (optional)<input value={reviewTitle} onChange={(event) => setReviewTitle(event.target.value)} maxLength={100} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 font-normal text-slate-800 focus:border-[#2879ef] focus:outline-none focus:ring-2 focus:ring-blue-100" /></label>
                            <label className="block text-sm font-semibold text-slate-800">Review<textarea value={reviewText} onChange={(event) => setReviewText(event.target.value)} required rows={5} maxLength={5000} disabled={submitting} placeholder="Share what you think future guests should know…" className="mt-1 w-full rounded-lg border border-slate-300 p-3 font-normal text-slate-800 focus:border-[#2879ef] focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50" /></label>
                            {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setModalOpen(false)} disabled={submitting} className="min-h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button><button type="submit" disabled={submitting || !reviewText.trim()} className="min-h-11 rounded-lg bg-[#2879ef] px-5 text-sm font-bold text-white-1 hover:bg-[#1766d5] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Submitting…" : "Submit review"}</button></div>
                        </form>
                    </section>
                </div>
            )}
        </section>
    );
}
