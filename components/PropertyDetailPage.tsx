"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiCheck, FiEdit2, FiHeart, FiMapPin, FiShare2, FiShield, FiStar } from "react-icons/fi";
import { FaBath, FaBed } from "react-icons/fa";
import PropertyImageGallery from "@/components/PropertyImageGallery";
import PropertyDetailSidebar from "@/components/PropertyDetailSidebar";
import PropertyQA from "@/components/PropertyQA";
import PropertyReviews from "@/components/PropertyReviews";
import { checkIsFavorited, fetchCurrentProfile, fetchProperties, fetchPropertyBySlug, toggleFavorite } from "@/utils/api";
import { isAuthenticated } from "@/utils/auth";
import type { Property, PropertyDetailProps } from "@/types";
import { getApiPage, getPropertyActionError, propertyImageUrl } from "@/utils/propertyPageUtils";
import AuthGuard from "@/app/hoc/AuthGuard";
import VerificationGuard from "@/components/VerificationGuard";

function DetailSkeleton() {
    return (
        <div role="status" aria-label="Loading property details" className="min-h-screen bg-[#f8fafc] px-3 pb-10 pt-12 sm:px-5 lg:px-7">
            <span className="sr-only">Loading property details…</span>
            <div className="mx-auto max-w-[1440px] animate-pulse">
                <div className="mb-4 h-5 w-32 rounded bg-slate-200" />
                <div className="aspect-[16/8] rounded-2xl bg-slate-200" />
                <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-4"><div className="h-8 w-3/5 rounded bg-slate-200" /><div className="h-4 w-2/5 rounded bg-slate-100" /><div className="h-28 rounded-2xl bg-white" /><div className="h-48 rounded-2xl bg-white" /></div>
                    <div className="h-96 rounded-2xl bg-white" />
                </div>
            </div>
        </div>
    );
}

function statusClass(status: string): string {
    switch (status.toLowerCase()) {
        case "available": return "bg-emerald-50 text-emerald-700 ring-emerald-200";
        case "pending": return "bg-amber-50 text-amber-800 ring-amber-200";
        case "rented":
        case "sold": return "bg-slate-100 text-slate-700 ring-slate-200";
        case "maintenance":
        case "off market": return "bg-rose-50 text-rose-700 ring-rose-200";
        default: return "bg-blue-50 text-blue-700 ring-blue-200";
    }
}

function validDate(value: string | null): string | null {
    if (!value) return null;
    const date = new Date(`${value.slice(0, 10)}T00:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function valueOrNull(value: number | null | undefined): number | null {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function accountIdFromProfile(payload: unknown): number | null {
    if (typeof payload !== "object" || payload === null) return null;
    const root = payload as Record<string, unknown>;
    const data = typeof root.data === "object" && root.data !== null
        ? root.data as Record<string, unknown>
        : root;
    const account = typeof data.user === "object" && data.user !== null
        ? data.user as Record<string, unknown>
        : data;
    const id = Number(account.id);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function SimilarPlaceCard({ property }: { property: Property }) {
    const [imageFailed, setImageFailed] = useState(false);
    const image = propertyImageUrl(property.primary_image);
    const price = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(property.price);
    return (
        <Link href={`/properties/${property.slug}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
            <div className="relative h-44 bg-[#eef6ff]">
                {image && !imageFailed
                    ? <img src={image} alt={property.title} onError={() => setImageFailed(true)} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                    : <div className="grid h-full place-items-center text-sm font-medium text-slate-400">Photo unavailable</div>}
                <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(property.property_status)}`}>{property.property_status}</span>
            </div>
            <div className="p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#2879ef]">{property.property_type} · {property.listing_type}</p>
                <h3 className="mt-1 line-clamp-2 font-bold text-slate-900 group-hover:text-[#1f6fdd]">{property.title}</h3>
                <p className="mt-2 truncate text-sm text-slate-500">{[property.address, property.city_name, property.state_name].filter(Boolean).join(", ")}</p>
                <p className="mt-3 font-bold text-slate-900">{price}<span className="ml-1 text-xs font-medium text-slate-500">/{property.rental_period || "listing"}</span></p>
            </div>
        </Link>
    );
}

function PropertyDetailContent() {
    const params = useParams<{ slug: string }>();
    const router = useRouter();
    const propertySlug = params.slug;
    const [property, setProperty] = useState<PropertyDetailProps | null>(null);
    const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
    const [userAuthenticated, setUserAuthenticated] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [isOwner, setIsOwner] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [shareMessage, setShareMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const refreshProperty = useCallback(async () => {
        if (!property) return;
        const response = await fetchPropertyBySlug(property.slug);
        if (response?.status !== "success" || !response?.data) return;
        setProperty(response.data as PropertyDetailProps);
        setIsFavorite(Boolean(response.data.is_favorited));
    }, [property]);

    useEffect(() => {
        if (!propertySlug) {
            setError("This property link is not valid.");
            setLoading(false);
            return;
        }

        let active = true;
        setLoading(true);
        setError(null);
        setProperty(null);
        setSimilarProperties([]);
        setCurrentUserId(null);
        setIsOwner(false);

        void (async () => {
            try {
                const response = await fetchPropertyBySlug(propertySlug);
                if (response?.status !== "success" || !response?.data) throw new Error("Property details are unavailable.");
                const details = response.data as PropertyDetailProps;
                if (!active) return;
                if (!details.slug) throw new Error("The property service did not return a property slug.");
                setProperty(details);
                setIsFavorite(Boolean(details.is_favorited));
                setLoading(false);
                if (details.slug !== propertySlug) router.replace(`/properties/${details.slug}`);

                void fetchProperties(1, 5, {
                    property_type: details.property_type,
                    city: details.city_name,
                    property_status: "Available",
                }).then((similarResponse: unknown) => {
                    if (!active) return;
                    const result = getApiPage(similarResponse);
                    setSimilarProperties((result?.results as Property[] | undefined ?? []).filter((item) => item.id !== details.id));
                }).catch(() => {
                    if (active) setSimilarProperties([]);
                });

                try {
                    const authenticated = await isAuthenticated();
                    if (!active) return;
                    setUserAuthenticated(authenticated);
                    if (authenticated) {
                        const [profileResult, favoriteResult] = await Promise.allSettled([
                            fetchCurrentProfile(),
                            checkIsFavorited(details.id),
                        ]);
                        if (!active) return;

                        if (profileResult.status === "fulfilled") {
                            const profileId = accountIdFromProfile(profileResult.value);
                            if (profileId !== null) {
                                setCurrentUserId(profileId);
                                setIsOwner(profileId === details.agent.id);
                            }
                        }
                        if (favoriteResult.status === "fulfilled") setIsFavorite(Boolean(favoriteResult.value));
                    }
                } catch (authError) {
                    console.error("Could not verify the viewer's signed-in state.", authError);
                }
            } catch (cause) {
                if (active) setError(getPropertyActionError(cause, "We couldn't load this property right now. Please try again."));
            } finally {
                if (active) setLoading(false);
            }
        })();

        return () => { active = false; };
    }, [propertySlug, retryCount, router]);

    const toggleSaved = async () => {
        if (!property) return;
        if (!userAuthenticated) {
            router.push(`/sign-in?redirect=${encodeURIComponent(`/properties/${property.slug}`)}`);
            return;
        }
        if (favoriteLoading) return;
        setFavoriteLoading(true);
        setError(null);
        try {
            const result = await toggleFavorite(property.id);
            setIsFavorite(result.status === "added");
        } catch (cause) {
            setError(getPropertyActionError(cause, "We couldn't update your saved properties. Please try again."));
        } finally {
            setFavoriteLoading(false);
        }
    };

    const shareProperty = async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: property?.title, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            setShareMessage("Property link copied.");
            window.setTimeout(() => setShareMessage(null), 3000);
        } catch (cause) {
            if (cause instanceof Error && cause.name === "AbortError") return;
            setShareMessage("This browser couldn't share the link.");
            window.setTimeout(() => setShareMessage(null), 3000);
        }
    };

    if (loading) return <DetailSkeleton />;

    if (error && !property) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-[#f8fafc] px-4 py-10">
                <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-rose-600">Property unavailable</p>
                    <h1 className="mt-2 text-2xl font-bold text-slate-900">We couldn’t open this property</h1>
                    <p role="alert" className="mt-3 text-sm leading-6 text-slate-600">{error}</p>
                    <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                        <button type="button" onClick={() => setRetryCount((value) => value + 1)} className="min-h-11 rounded-lg bg-[#2879ef] px-5 text-sm font-bold text-white hover:bg-[#1766d5]">Try again</button>
                        <Link href="/find-a-place" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-bold text-slate-700 hover:bg-slate-50">Back to places</Link>
                    </div>
                </section>
            </main>
        );
    }

    if (!property) return null;

    const bedrooms = valueOrNull(property.num_bedrooms);
    const bathrooms = valueOrNull(property.num_bathrooms);
    const size = valueOrNull(property.size_sqm);
    const formattedAvailableDate = validDate(property.available_from);
    const location = [property.address, property.landmark, property.city_name, property.state_name].filter(Boolean).join(", ");
    const displayedFeatures = [
        property.is_furnished ? "Furnished" : null,
        property.accepts_pets ? "Pets accepted" : null,
        property.accepts_students ? "Students accepted" : null,
        property.bills_included ? "Bills included" : null,
        property.parking_space ? "Parking available" : null,
    ].filter((feature): feature is string => Boolean(feature));
    const agent = property.agent;

    return (
        <main className="min-h-screen bg-[#f8fafc] pb-24 text-slate-800 sm:pb-10">
            <div className="mx-auto w-full max-w-[1440px] px-3 pt-12 sm:px-5 sm:pt-12 lg:px-7">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <Link href="/find-a-place" className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-[#1f6fdd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef]">
                        <FiArrowLeft aria-hidden="true" /> Back to places
                    </Link>
                    <div className="flex items-center gap-2">
                        {isOwner && (
                            <Link href={`/properties/${property.slug}/edit`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-[#1f6fdd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef]">
                                <FiEdit2 aria-hidden="true" /> Edit
                            </Link>
                        )}
                        <button type="button" onClick={() => void toggleSaved()} disabled={favoriteLoading} aria-pressed={isFavorite} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-rose-200 hover:text-rose-600 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef]">
                            <FiHeart aria-hidden="true" className={isFavorite ? "fill-rose-500 text-rose-500" : ""} />{favoriteLoading ? "Saving…" : isFavorite ? "Saved" : "Save"}
                        </button>
                        <button type="button" onClick={() => void shareProperty()} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-[#1f6fdd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef]">
                            <FiShare2 aria-hidden="true" /> <span className="hidden sm:inline">Share</span>
                        </button>
                    </div>
                </div>
                {shareMessage && <p role="status" className="mb-3 text-right text-sm text-emerald-700">{shareMessage}</p>}
                {error && <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}<button type="button" onClick={() => setError(null)} className="font-bold underline underline-offset-2">Dismiss</button></div>}

                <PropertyImageGallery images={property.images ?? []} propertyTitle={property.title} />

                <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-7">
                    <div className="min-w-0 space-y-5">
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#1f6fdd]">{property.listing_type}</span>
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${statusClass(property.property_status)}`}>{property.property_status}</span>
                                        {property.is_verified && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><FiShield /> Verified listing</span>}
                                    </div>
                                    <h1 className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{property.title}</h1>
                                    <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-slate-600">
                                        <FiMapPin aria-hidden="true" className="mt-1 shrink-0 text-[#2879ef]" /><span>{location || "Location not provided"}</span>
                                    </p>
                                </div>
                                {property.average_rating !== null && property.review_count > 0 && (
                                    <a href="#property-reviews" className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-3 py-2 text-sm font-bold text-slate-800 hover:bg-amber-100" aria-label={`${property.average_rating.toFixed(1)} out of 5 from ${property.review_count} reviews`}>
                                        <FiStar className="fill-amber-400 text-amber-400" /> {property.average_rating.toFixed(1)} <span className="font-medium text-slate-500">({property.review_count})</span>
                                    </a>
                                )}
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {bedrooms !== null && bedrooms > 0 && <div className="flex min-h-16 items-center gap-2 rounded-xl bg-[#f4f8ff] px-3"><FaBed aria-hidden="true" className="shrink-0 text-[#2879ef]" /><div><p className="text-sm font-bold text-slate-900">{bedrooms}</p><p className="text-xs text-slate-500">{bedrooms === 1 ? "Bedroom" : "Bedrooms"}</p></div></div>}
                                {bathrooms !== null && bathrooms > 0 && <div className="flex min-h-16 items-center gap-2 rounded-xl bg-[#f4f8ff] px-3"><FaBath aria-hidden="true" className="shrink-0 text-[#2879ef]" /><div><p className="text-sm font-bold text-slate-900">{bathrooms}</p><p className="text-xs text-slate-500">{bathrooms === 1 ? "Bathroom" : "Bathrooms"}</p></div></div>}
                                {size !== null && size > 0 && <div className="flex min-h-16 items-center gap-2 rounded-xl bg-[#f4f8ff] px-3"><span aria-hidden="true" className="text-lg font-bold text-[#2879ef]">m²</span><div><p className="text-sm font-bold text-slate-900">{size}</p><p className="text-xs text-slate-500">Floor area</p></div></div>}
                                {formattedAvailableDate && <div className="flex min-h-16 items-center gap-2 rounded-xl bg-[#f4f8ff] px-3"><FiCheck aria-hidden="true" className="shrink-0 text-emerald-600" /><div><p className="text-xs font-bold text-slate-900">{formattedAvailableDate}</p><p className="text-xs text-slate-500">Available from</p></div></div>}
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                                {property.property_type && <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">{property.property_type}</span>}
                                {property.rental_period && <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">Rental period: {property.rental_period}</span>}
                                {property.year_built && <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">Built {property.year_built}</span>}
                                {property.postal_code && <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">Postal code {property.postal_code}</span>}
                                {property.views_count > 0 && <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">{property.views_count.toLocaleString()} views</span>}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="about-property-title">
                            <h2 id="about-property-title" className="text-xl font-bold text-slate-900">About this property</h2>
                            <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-slate-600">{property.description || "No description has been provided for this property."}</p>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="amenities-title">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2879ef]">The details</p>
                                <h2 id="amenities-title" className="mt-1 text-xl font-bold text-slate-900">Features &amp; amenities</h2>
                            </div>
                            {displayedFeatures.length > 0 || property.features.length > 0 ? (
                                <div className="mt-4">
                                    <h3 className="mb-2 text-sm font-bold text-slate-800">Property features</h3>
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {displayedFeatures.map((feature) => <div key={feature} className="flex min-h-11 items-center gap-2 rounded-lg bg-slate-50 px-3 text-sm text-slate-700"><FiCheck aria-hidden="true" className="shrink-0 text-emerald-600" />{feature}</div>)}
                                        {property.features.map((feature) => <div key={`feature-${feature.id}`} className="flex min-h-11 items-center gap-2 rounded-lg bg-slate-50 px-3 text-sm text-slate-700"><FiCheck aria-hidden="true" className="shrink-0 text-emerald-600" />{feature.name}{feature.value ? `: ${feature.value}` : ""}</div>)}
                                    </div>
                                </div>
                            ) : null}
                            <div className="mt-4">
                                <h3 className="mb-2 text-sm font-bold text-slate-800">Amenities</h3>
                                {property.amenities.length > 0
                                    ? <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{property.amenities.map((amenity) => <div key={`amenity-${amenity.id}`} className="flex min-h-11 items-center gap-2 rounded-lg bg-slate-50 px-3 text-sm text-slate-700"><FiCheck aria-hidden="true" className="shrink-0 text-emerald-600" />{amenity.name}</div>)}</div>
                                    : <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">No amenities have been provided for this property.</p>}
                            </div>
                        </section>

                        <div id="property-questions">
                            <PropertyQA propertyId={property.id} propertySlug={property.slug} userAuthenticated={userAuthenticated} isOwner={isOwner} currentUserId={currentUserId} />
                        </div>
                        <div id="property-reviews">
                            <PropertyReviews
                                propertyId={property.id}
                                propertySlug={property.slug}
                                userAuthenticated={userAuthenticated}
                                currentUserId={currentUserId}
                                averageRating={property.average_rating}
                                reviewCount={property.review_count}
                                onReviewUpdated={async () => {
                                    try { await refreshProperty(); } catch { /* Keep the submitted review visible if the summary refresh fails. */ }
                                }}
                            />
                        </div>
                    </div>

                    <PropertyDetailSidebar
                        id={property.id}
                        propertySlug={property.slug}
                        agent={agent}
                        propertyStatus={property.property_status}
                        isAvailable={property.is_available}
                        availableFrom={property.available_from}
                        price={property.price}
                        rentalPeriod={property.rental_period}
                        securityDeposit={property.security_deposit}
                        userAuthenticated={userAuthenticated}
                        isOwner={isOwner}
                    />
                </div>

                {similarProperties.length > 0 && (
                    <section className="mt-10" aria-labelledby="similar-properties-title">
                        <div className="mb-4 flex items-end justify-between gap-3">
                            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2879ef]">Keep exploring</p><h2 id="similar-properties-title" className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">Similar places</h2></div>
                            <Link href="/find-a-place" className="text-sm font-bold text-[#1f6fdd] hover:underline">View all</Link>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {similarProperties.slice(0, 4).map((similar) => <SimilarPlaceCard key={similar.id} property={similar} />)}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}

export default function PropertyDetailPage() {
    return <AuthGuard><VerificationGuard><PropertyDetailContent /></VerificationGuard></AuthGuard>;
}
