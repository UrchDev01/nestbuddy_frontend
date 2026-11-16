"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
    FiArrowLeft,
    FiBookOpen,
    FiBriefcase,
    FiCheck,
    FiHeart,
    FiHome,
    FiMapPin,
    FiShield,
    FiStar,
    FiUsers,
} from "react-icons/fi";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import AuthGuard from "@/app/hoc/AuthGuard";
import { addFavorite, fetchPublicProfile, removeFavorite } from "@/utils/api";
import type { PublicUserProfile } from "@/types";
import StartChatButton from "@/components/StartChatButton";

type ProfileError = Error & { status?: number };

function profileName(profile: PublicUserProfile): string {
    return [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "NestBuddy member";
}

function getLocation(profile: PublicUserProfile): string | null {
    const demographic = profile.demographic;
    return [demographic?.city, demographic?.state_of_residence].filter(Boolean).join(", ") || null;
}

function seekingLabel(value: string | null): string | null {
    if (!value) return null;
    const labels: Record<string, string> = {
        have_place: "Has a place and is looking for a roommate",
        need_place: "Looking for accommodation",
        both: "Open to either",
        none: "Not currently looking",
    };
    return labels[value] ?? value;
}

function PublicProfileSkeleton() {
    return (
        <div className="min-h-screen bg-[#f4f8ff] px-4 py-6 sm:px-6 lg:px-8" role="status" aria-label="Loading profile">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col items-center gap-5 sm:flex-row">
                        <div className="h-28 w-28 shrink-0 rounded-full bg-slate-200" />
                        <div className="w-full flex-1 space-y-3">
                            <div className="mx-auto h-7 w-48 rounded-lg bg-slate-200 sm:mx-0" />
                            <div className="mx-auto h-4 w-64 rounded-lg bg-slate-100 sm:mx-0" />
                            <div className="mx-auto h-3 w-36 rounded-lg bg-slate-100 sm:mx-0" />
                            <div className="h-4 w-full max-w-md rounded-lg bg-slate-100" />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="space-y-6 lg:col-span-8">
                        <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white" />
                        <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
                    </div>
                    <aside className="space-y-6 lg:col-span-4">
                        <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white" />
                        <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white" />
                    </aside>
                </div>
            </div>
        </div>
    );
}

function PublicSection({
    title,
    icon,
    children,
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-[#dfeeff] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] sm:p-6">
            <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2879ef] text-white shadow-sm">
                    {icon}
                </div>
                <h2 className="text-base font-bold text-slate-900 sm:text-lg">{title}</h2>
            </div>
            {children}
        </section>
    );
}

function PublicFact({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="min-w-0 rounded-xl border border-slate-200/80 bg-white p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-1 break-words text-sm font-bold text-slate-800">{value}</p>
        </div>
    );
}

function OtherUserProfile() {
    const params = useParams<{ id?: string; slug?: string }>();
    const router = useRouter();
    const pathname = usePathname();
    const profileId = params.slug ?? params.id ?? "";
    const [profile, setProfile] = useState<PublicUserProfile | null>(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoriteBusy, setFavoriteBusy] = useState(false);
    const [favoriteError, setFavoriteError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ProfileError | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [imageFailed, setImageFailed] = useState(false);

    const loadProfile = useCallback(async () => {
        if (!profileId) {
            setError(Object.assign(new Error("Profile not found"), { status: 404 }));
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetchPublicProfile(profileId);
            if (response.is_current_user) {
                router.replace("/profile");
                return;
            }
            if (!response.data?.slug) throw new Error("The profile service did not return a profile slug.");
            setProfile(response.data);
            setIsFavorited(Boolean(response.is_favorited));
            setImageFailed(false);
            if (pathname.startsWith("/profile/")) {
                router.replace(`/roommates/${response.data.slug}`);
            }
        } catch (cause) {
            console.error("Unable to load public profile", cause);
            setError(cause instanceof Error ? cause as ProfileError : new Error("Unable to load this profile right now."));
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }, [pathname, profileId, router]);

    useEffect(() => {
        void loadProfile();
    }, [loadProfile, retryCount]);

    const fullName = useMemo(() => profile ? profileName(profile) : "", [profile]);
    const location = profile ? getLocation(profile) : null;
    const occupation = profile?.user_type === "student"
        ? [profile.student?.school, profile.student?.department, profile.student?.level].filter(Boolean).join(" · ")
        : profile?.profession;
    const educationDetails = profile?.student ? [
        ["School", profile.student.school],
        ["Department", profile.student.department],
        ["Level", profile.student.level
            ? profile.student.level.toLowerCase().includes("level")
                ? profile.student.level
                : `${profile.student.level} Level`
            : null],
    ].filter((item): item is [string, string] => Boolean(item[1])) : [];
    const demographics = profile?.demographic ? [
        ["Age", profile.demographic.age ? `${profile.demographic.age}` : null],
        ["Gender", profile.demographic.gender],
        ["Tribe", profile.demographic.tribe],
        ["Religion", profile.demographic.religion],
        ["State of origin", profile.demographic.state_of_origin],
        ["State of residence", profile.demographic.state_of_residence],
        ["Location", location],
    ].filter((item): item is [string, string] => Boolean(item[1])) : [];
    const preferences = profile?.roommate_preferences ? [
        ["Budget", profile.roommate_preferences.budget !== null ? `₦${Number(profile.roommate_preferences.budget).toLocaleString("en-NG")}` : null],
        ["Seeking", seekingLabel(profile.roommate_preferences.seeking)],
        ["Maximum roommates", profile.roommate_preferences.max_roommates],
        ["Preferred age", profile.roommate_preferences.preferred_age_min || profile.roommate_preferences.preferred_age_max
            ? `${profile.roommate_preferences.preferred_age_min ?? "Any"}–${profile.roommate_preferences.preferred_age_max ?? "Any"}`
            : null],
        ["Preferred gender", profile.roommate_preferences.preferred_gender],
        ["Preferred tribe", profile.roommate_preferences.preferred_tribe],
        ["Preferred religion", profile.roommate_preferences.preferred_religion],
        ["Preferred location", profile.roommate_preferences.preferred_city],
        ["Accommodation location", profile.roommate_preferences.accommodation_city],
    ].filter((item): item is [string, string | number] => item[1] !== null && item[1] !== undefined && item[1] !== "") : [];
    const socialAccounts = profile?.social ? [
        ["Facebook", profile.social.facebook, FaFacebookF],
        ["Instagram", profile.social.instagram, FaInstagram],
        ["X", profile.social.twitter, FaTwitter],
        ["LinkedIn", profile.social.linkedin, FaLinkedinIn],
    ].filter((entry): entry is [string, string, typeof FaFacebookF] => Boolean(entry[1])) : [];

    const toggleFavorite = async () => {
        if (!profile || favoriteBusy) return;
        setFavoriteBusy(true);
        setFavoriteError(null);
        try {
            if (isFavorited) {
                await removeFavorite(profile.id);
                setIsFavorited(false);
            } else {
                await addFavorite(profile.id);
                setIsFavorited(true);
            }
        } catch (cause) {
            console.error("Unable to update saved profile", cause);
            setFavoriteError("We couldn't update your saved profiles. Please try again.");
        } finally {
            setFavoriteBusy(false);
        }
    };

    if (loading) return <PublicProfileSkeleton />;

    if (error || !profile) {
        const notFound = error?.status === 404;
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-[#f4f8ff] px-4 py-12">
                <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${notFound ? "bg-[#edf5ff] text-[#2879ef]" : "bg-rose-50 text-rose-600"}`}>
                        {notFound ? <FiUsers className="h-7 w-7" /> : <FiShield className="h-7 w-7" />}
                    </div>
                    <h1 className="text-xl font-extrabold text-slate-900">{notFound ? "Profile not found" : "Unable to load this profile right now"}</h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {notFound ? "We couldn't find this NestBuddy user." : "Please check your connection and try again."}
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        {!notFound && (
                            <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="rounded-xl bg-[#2879ef] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1f6fdd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef] focus-visible:ring-offset-2">
                                Try again
                            </button>
                        )}
                        <Link href="/ai-roommate-finder" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef]">
                            <FiArrowLeft aria-hidden="true" /> Back
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const initials = fullName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "NB";

    return (
        <div className="min-h-screen bg-[#f4f8ff] px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <header className="relative overflow-hidden rounded-3xl border border-[#dfeeff] bg-gradient-to-r from-[#eaf3ff] via-[#f4f8fe] to-[#e8f2fe] p-5 shadow-[0_10px_35px_rgba(24,84,180,0.06)] sm:p-7 md:p-8">
                    <Link href="/ai-roommate-finder" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#d7e6f7]  px-4 py-2 text-sm font-semibold text-[#35506f] shadow-sm transition hover:border-[#b8d4f2] hover:bg-[#f3f8ff] hover:text-[#2879ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef] focus-visible:ring-offset-2">
                        <FiArrowLeft aria-hidden="true" /> Back
                    </Link>

                    <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-white shadow-md sm:h-28 sm:w-28 md:h-32 md:w-32">
                            {profile.profile_image && !imageFailed ? (
                                <img src={profile.profile_image} alt={`${fullName}'s profile`} onError={() => setImageFailed(true)} className="h-full w-full object-cover" />
                            ) : (
                                <div aria-label={`${fullName} profile image unavailable`} className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2879ef] to-[#1a5ac7] text-2xl font-black text-white sm:text-3xl">{initials}</div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1 text-center sm:text-left">
                            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{fullName}</h1>
                                {profile.verified && <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"><FiCheck aria-hidden="true" /> Verified</span>}
                            </div>
                            <p className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm font-medium text-slate-600 sm:justify-start">
                                {profile.demographic?.age && <span>{profile.demographic.age}</span>}
                                {profile.demographic?.gender && <span>{profile.demographic.gender}</span>}
                                {occupation && <span className="inline-flex items-center gap-1"><FiBriefcase aria-hidden="true" />{occupation}</span>}
                            </p>
                            {location && <p className="mt-2 flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-500 sm:justify-start"><FiMapPin className="text-[#2879ef]" aria-hidden="true" />{location}</p>}
                            <div className="mt-4 flex flex-wrap justify-center gap-2.5 sm:justify-start">
                                <StartChatButton userId={profile.id} label="Message" profileSlug={profile.slug} />
                                <button type="button" onClick={() => void toggleFavorite()} disabled={favoriteBusy} aria-pressed={isFavorited} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#2879ef] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#1f6fdd] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef] focus-visible:ring-offset-2">
                                    <FiHeart aria-hidden="true" />{favoriteBusy ? "Saving…" : isFavorited ? "Saved profile" : "Save profile"}
                                </button>
                                <Link href={`/roommates/${profile.slug}/compatibility`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef] focus-visible:ring-offset-2">
                                    <FiStar aria-hidden="true" /> View compatibility
                                </Link>
                            </div>
                            {favoriteError && <p role="alert" className="mt-2 text-sm text-rose-700">{favoriteError}</p>}
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <main className="space-y-6 lg:col-span-8">
                        <PublicSection title="About" icon={<FiUsers aria-hidden="true" className="h-5 w-5" />}>
                            <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                                {profile.bio?.trim() || "No bio available yet."}
                            </p>
                        </PublicSection>

                        {profile.user_type === "student" && (
                            <PublicSection title="Education" icon={<FiBookOpen aria-hidden="true" className="h-5 w-5" />}>
                                {educationDetails.length ? (
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {educationDetails.map(([label, value]) => (
                                            <PublicFact key={label} label={label} value={value} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">Education details haven’t been added yet.</p>
                                )}
                            </PublicSection>
                        )}

                        {profile.user_type === "professional" && (
                            <PublicSection title="Work Profile" icon={<FiBriefcase aria-hidden="true" className="h-5 w-5" />}>
                                {profile.profession ? (
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <PublicFact label="Profession" value={profile.profession} />
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">Work details haven’t been added yet.</p>
                                )}
                            </PublicSection>
                        )}

                        {demographics.length > 0 && (
                            <PublicSection title="Demographic Information" icon={<FiUsers aria-hidden="true" className="h-5 w-5" />}>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    {demographics.map(([label, value]) => <PublicFact key={label} label={label} value={value} />)}
                                </div>
                            </PublicSection>
                        )}

                        {preferences.length > 0 && (
                            <PublicSection title="Roommate Preferences" icon={<FiHome aria-hidden="true" className="h-5 w-5" />}>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {preferences.map(([label, value]) => <PublicFact key={label} label={label} value={value} />)}
                                </div>
                            </PublicSection>
                        )}

                        {profile.lifestyle && (
                            <PublicSection title="Lifestyle & Interests" icon={<FiHeart aria-hidden="true" className="h-5 w-5" />}>
                                <div className="mt-5 border-t border-slate-100 pt-5">
                                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900"><FiStar aria-hidden="true" className="text-[#2879ef]" /> Hobbies & Interests</h3>
                                    {profile.lifestyle.interests.length ? (
                                        <div className="flex flex-wrap gap-2">
                                            {profile.lifestyle.interests.map((interest) => <span key={interest} className="inline-flex rounded-full border border-[#dfeeff] bg-[#edf5ff] px-3.5 py-1.5 text-xs font-semibold text-[#1f6fdd]">{interest}</span>)}
                                        </div>
                                    ) : <p className="text-sm italic text-slate-400">No hobbies or interests added yet.</p>}
                                </div>
                            </PublicSection>
                        )}
                    </main>

                    <aside className="space-y-6 lg:col-span-4">
                        <PublicSection title="Socials" icon={<FiUsers aria-hidden="true" className="h-5 w-5" />}>
                            {socialAccounts.length > 0 ? (
                                <div className="space-y-2">
                                    {socialAccounts.map(([label, href, Icon]) => (
                                        <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef]">
                                            <Icon aria-hidden="true" className="text-[#2879ef]" />{label}<span className="sr-only">, opens in a new tab</span>
                                        </a>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-slate-500">No social profiles linked.</p>}
                        </PublicSection>

                        {profile.properties.length > 0 && (
                            <PublicSection title="Places listed" icon={<FiHome aria-hidden="true" className="h-5 w-5" />}>
                                <div className="space-y-3">
                                    {profile.properties.map((property) => (
                                        <Link key={property.id} href={`/properties/${property.slug}`} className="group block overflow-hidden rounded-xl border border-slate-200 transition hover:border-blue-200 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef]">
                                            {property.image && <img src={property.image} alt="" className="h-36 w-full bg-[#edf5ff] object-cover" />}
                                            <div className="p-3">
                                                <p className="text-xs font-bold uppercase tracking-wide text-[#2879ef]">{property.property_type} · {property.listing_type}</p>
                                                <h3 className="mt-1 font-bold text-slate-900 group-hover:text-[#1f6fdd]">{property.title}</h3>
                                                <p className="mt-1 text-xs text-slate-500">{[property.city, property.state].filter(Boolean).join(", ")}</p>
                                                <p className="mt-2 text-sm font-bold text-slate-800">
                                                    {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(property.price))}
                                                    {property.rental_period && <span className="ml-1 text-xs font-medium text-slate-500">/{property.rental_period.toLowerCase()}</span>}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </PublicSection>
                        )}

                        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-[#edf5ff] to-[#f5f9ff] p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2879ef] text-white shadow-sm"><FiShield aria-hidden="true" /></div>
                            <h2 className="mt-3 text-sm font-bold text-slate-900">Your next step</h2>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500">Explore how your living preferences align with {fullName} on the dedicated compatibility page.</p>
                            <Link href={`/roommates/${profile.slug}/compatibility`} className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#2879ef] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#1f6fdd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef] focus-visible:ring-offset-2">
                                View compatibility
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm lg:hidden">
                <div className="mx-auto flex max-w-lg gap-2">
                    <button type="button" onClick={() => void toggleFavorite()} disabled={favoriteBusy} aria-pressed={isFavorited} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#2879ef] bg-white px-3 text-sm font-bold text-[#1f6fdd] disabled:opacity-60">
                        <FiHeart aria-hidden="true" />{isFavorited ? "Saved" : "Save"}
                    </button>
                    <Link href={`/roommates/${profile.slug}/compatibility`} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#2879ef] px-3 text-sm font-bold text-white">
                        <FiStar aria-hidden="true" /> Compatibility
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ProtectedOtherUserProfile() {
    return (
        <AuthGuard>
            <OtherUserProfile />
        </AuthGuard>
    );
}
