"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiBriefcase, FiCheck, FiHeart, FiMapPin, FiUser } from "react-icons/fi";
import { FaFacebookF, FaHeart, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import type { RoommateProps } from "@/types";
import { addFavorite, checkIsFavoritedUser, removeFavorite } from "@/utils/api";
import StartChatButton from "@/components/StartChatButton";

interface PotentialRoommateCardProps {
    roommate: RoommateProps;
}

function externalUrl(value: string | null): string | null {
    if (!value) return null;
    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
    } catch {
        return null;
    }
}

function formatBudget(value: number | null): string | null {
    if (value === null || !Number.isFinite(value)) return null;
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}

export default function PotentialRoommateCard({ roommate }: PotentialRoommateCardProps) {
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [favoriteError, setFavoriteError] = useState<string | null>(null);
    const [imageFailed, setImageFailed] = useState(false);
    const initials = roommate.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
    const detailsHref = `/roommates/${roommate.slug}`;
    const budget = formatBudget(roommate.budget);
    const profession = roommate.user_type === "student"
        ? [roommate.school, roommate.department, roommate.level].filter(Boolean).join(" · ")
        : roommate.profession;
    const locationDetails = roommate.seeking === "have_place"
        ? roommate.accommodation_city ? [`Has accommodation in ${roommate.accommodation_city}`] : []
        : roommate.seeking === "need_place"
            ? roommate.preferred_city ? [`Looking for accommodation in ${roommate.preferred_city}`] : []
            : roommate.seeking === "both"
                ? [
                    ...(roommate.preferred_city ? [`Prefers to live in ${roommate.preferred_city}`] : []),
                    ...(roommate.accommodation_city ? [`Also has accommodation in ${roommate.accommodation_city}`] : []),
                ]
                : [];
    const matchStrength = roommate.compatibility_score >= 80
        ? { label: "Strong", className: "bg-emerald-50 text-emerald-700" }
        : roommate.compatibility_score >= 60
            ? { label: "Maybe", className: "bg-amber-50 text-amber-700" }
            : { label: "Weak", className: "bg-rose-50 text-rose-700" };
    const socialAccounts = [
        { label: "Facebook", value: roommate.facebook, Icon: FaFacebookF },
        { label: "Instagram", value: roommate.instagram, Icon: FaInstagram },
        { label: "Twitter", value: roommate.twitter, Icon: FaTwitter },
        { label: "LinkedIn", value: roommate.linkedin, Icon: FaLinkedinIn },
    ];
    const socialLinks = socialAccounts.flatMap(({ label, value, Icon }) => {
        const href = externalUrl(value);
        return href ? [{ label, href, Icon }] : [];
    });

    useEffect(() => {
        let active = true;
        void checkIsFavoritedUser(roommate.user_id)
            .then((status) => { if (active) setIsFavorited(status); })
            .catch((error: unknown) => {
                if (active) console.error("Unable to check roommate favorite status", error);
            });
        return () => { active = false; };
    }, [roommate.user_id]);

    const handleFavoriteToggle = async () => {
        if (favoriteLoading) return;
        setFavoriteLoading(true);
        setFavoriteError(null);
        try {
            if (isFavorited) {
                await removeFavorite(roommate.user_id);
                setIsFavorited(false);
            } else {
                await addFavorite(roommate.user_id);
                setIsFavorited(true);
            }
        } catch (error) {
            console.error("Unable to update roommate favorite", error);
            setFavoriteError(error instanceof Error ? error.message : "Couldn't update favorites. Please try again.");
        } finally {
            setFavoriteLoading(false);
        }
    };

    return (
        <article className="group flex h-full min-h-[270px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_7px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-3 pb-2 pt-3">
                <div className="min-w-0">
                    <Link href={detailsHref} className="inline-flex max-w-full items-center gap-1.5">
                        <h3 className="truncate text-sm font-bold text-slate-900 transition group-hover:text-[#2879ef]">{roommate.name}</h3>
                        {roommate.is_verified && <FiCheck aria-label="Verified profile" className="shrink-0 rounded-full bg-emerald-100 p-0.5 text-emerald-700" size={15} />}
                    </Link>
                    <p className="text-[11px] text-slate-500">{roommate.user_type === "student" ? "Student" : roommate.user_type === "professional" ? "Professional" : "Roommate profile"}</p>
                </div>
                <span
                    className={`shrink-0 rounded px-1.5 py-1 text-[10px] font-bold ${matchStrength.className}`}
                    aria-label={`${roommate.compatibility_score}% ${matchStrength.label.toLowerCase()} match`}
                    title={`${matchStrength.label} match`}
                >
                    {roommate.compatibility_score}% {matchStrength.label}
                </span>
            </div>

            <div className="flex gap-3 px-3 py-3">
                <Link href={detailsHref} aria-label={`View ${roommate.name}'s profile`} className="relative h-[104px] w-[104px] shrink-0 overflow-hidden rounded-lg bg-indigo-50">
                    {roommate.profile_image && !imageFailed ? (
                        // The image URL comes from the backend and may not be hosted on a configured Next image domain.
                        <img
                            src={roommate.profile_image}
                            alt=""
                            onError={() => setImageFailed(true)}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <span aria-hidden="true" className="flex h-full w-full items-center justify-center text-xl font-bold text-indigo-700">
                            {initials || <FiUser />}
                        </span>
                    )}
                </Link>
                <div className="min-w-0 flex-1 space-y-1.5 text-[11px] leading-4 text-slate-600">
                    <p>{roommate.age !== null ? `${roommate.age} years` : "Age not specified"}{roommate.gender ? ` · ${roommate.gender}` : ""}</p>
                    {profession && <p className="flex gap-1.5"><FiBriefcase className="mt-0.5 shrink-0 text-slate-400" /><span className="line-clamp-2">{profession}</span></p>}
                    {locationDetails.map((detail) => <p key={detail} className="flex gap-1.5"><FiMapPin className="mt-0.5 shrink-0 text-[#2879ef]" /><span className="line-clamp-2">{detail}</span></p>)}
                    {budget !== null && <p><span className="font-semibold uppercase text-[9px] tracking-wide text-slate-400">Budget </span>₦{budget}</p>}
                    {typeof roommate.confidence === "number" && <p className="text-[10px] text-slate-500">Based on {roommate.confidence}% of compatibility factors</p>}
                </div>
            </div>

            <div className="flex-1 border-t border-slate-100 px-3 py-2.5">
                {roommate.bio && <p className="line-clamp-2 text-[11px] leading-4 text-slate-500">{roommate.bio}</p>}
                {roommate.hobbies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1" aria-label="Interests">
                        {roommate.hobbies.slice(0, 3).map((hobby) => (
                            <span key={hobby} className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">{hobby}</span>
                        ))}
                        {roommate.hobbies.length > 3 && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">+{roommate.hobbies.length - 3}</span>
                        )}
                    </div>
                )}
            </div>

            <footer className="flex items-center justify-between gap-3 border-t border-slate-100 px-3 py-2.5">
                <StartChatButton userId={roommate.user_id} label="Message" profileSlug={roommate.slug} />
                <div className="flex items-center gap-3">
                    {socialLinks.length > 0 && (
                        <div className="flex items-center gap-1.5">
                            {socialLinks.map(({ label, href, Icon }) => (
                                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${roommate.name} on ${label}`} className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                                    <Icon aria-hidden="true" size={14} />
                                </a>
                            ))}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={handleFavoriteToggle}
                        disabled={favoriteLoading}
                        aria-label={isFavorited ? `Remove ${roommate.name} from favorites` : `Add ${roommate.name} to favorites`}
                        aria-pressed={isFavorited}
                        className="rounded-full p-1.5 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-wait disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-rose-300"
                    >
                        {isFavorited ? <FaHeart aria-hidden="true" /> : <FiHeart aria-hidden="true" size={19} />}
                    </button>
                </div>
            </footer>
            {favoriteError && <p role="alert" className="px-3 pb-3 text-xs text-rose-700">{favoriteError}</p>}
        </article>
    );
}
