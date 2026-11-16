"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  FiCheck,
  FiMapPin,
  FiBriefcase,
  FiAlertCircle,
  FiUser,
  FiCompass,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import type { FavoriteRoommateItem } from "@/types";

interface FavoriteRoommateCardProps {
  roommate: FavoriteRoommateItem;
  onRemove: (favoriteId: number, userId: number) => Promise<void>;
}

export default function FavoriteRoommateCard({
  roommate,
  onRemove,
}: FavoriteRoommateCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  // Initials for avatar fallback
  const initials = useMemo(() => {
    return roommate.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }, [roommate.name]);

  // Budget formatting
  const formattedBudget = useMemo(() => {
    if (!roommate.budget || !Number.isFinite(roommate.budget)) return null;
    return new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(roommate.budget);
  }, [roommate.budget]);

  // Profile image URL
  const profileImageUrl = useMemo(() => {
    if (!roommate.profile_image) return null;
    if (roommate.profile_image.startsWith("http://") || roommate.profile_image.startsWith("https://")) {
      return roommate.profile_image;
    }
    const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    return `${base.replace(/\/$/, "")}${roommate.profile_image.startsWith("/") ? "" : "/"}${roommate.profile_image}`;
  }, [roommate.profile_image]);

  // Compatibility score badge styling
  const matchStrength = useMemo(() => {
    if (roommate.compatibility_score === null || roommate.compatibility_score === undefined) {
      return null;
    }
    if (roommate.compatibility_score >= 80) {
      return {
        label: "Strong Match",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }
    if (roommate.compatibility_score >= 60) {
      return {
        label: "Good Match",
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }
    return {
      label: "Match",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    };
  }, [roommate.compatibility_score]);

  // Seeking status label
  const seekingLabel = useMemo(() => {
    switch (roommate.seeking) {
      case "have_place":
        return "Has accommodation";
      case "need_place":
        return "Needs accommodation";
      case "both":
        return "Flexible arrangement";
      default:
        return roommate.seeking || null;
    }
  }, [roommate.seeking]);

  const handleRemoveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRemoving) return;

    setIsRemoving(true);
    try {
      await onRemove(roommate.id, roommate.user_id);
    } finally {
      setIsRemoving(false);
    }
  };

  // If candidate is not accessible (deactivated, unverified, or no longer looking)
  if (!roommate.is_accessible || !roommate.slug) {
    return (
      <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5 shadow-sm transition hover:border-slate-400">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 font-bold">
                <FiUser className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-slate-700">
                  {roommate.name || "Unavailable Profile"}
                </h3>
                <span className="inline-flex items-center rounded-md bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  {roommate.status_label || "Unavailable"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveClick}
              disabled={isRemoving}
              aria-label="Remove unavailable roommate from favorites"
              title="Remove from favorites"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm transition hover:bg-rose-50 active:scale-95 disabled:opacity-50"
            >
              {isRemoving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
              ) : (
                <FaHeart className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50/80 p-3 text-xs text-amber-800 border border-amber-200/60">
            <FiAlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <p className="leading-relaxed">
              This profile is currently inaccessible or no longer eligible for roommate matching. You can remove it from your saved list.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200/60 text-right">
          <button
            type="button"
            onClick={handleRemoveClick}
            disabled={isRemoving}
            className="text-xs font-bold text-rose-600 hover:text-rose-700"
          >
            Remove from favorites
          </button>
        </div>
      </article>
    );
  }

  const profileHref = `/roommates/${roommate.slug}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
      {/* Top Header with Image, Name, Score, and Heart */}
      <div className="flex items-start justify-between gap-3 p-4 pb-3">
        <Link href={profileHref} className="flex min-w-0 items-center gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-indigo-50 border border-indigo-100/80">
            {profileImageUrl && !imageFailed ? (
              <img
                src={profileImageUrl}
                alt=""
                onError={() => setImageFailed(true)}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-lg font-bold text-indigo-700">
                {initials || <FiUser />}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="inline-flex max-w-full items-center gap-1.5">
              <h3 className="truncate text-base font-bold text-slate-900 transition group-hover:text-[#2879ef]">
                {roommate.name}
              </h3>
              {roommate.is_verified && (
                <span
                  title="Verified identity"
                  className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
                >
                  <FiCheck className="h-2.5 w-2.5 stroke-[3]" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 capitalize">
              {roommate.user_type === "student"
                ? "Student"
                : roommate.user_type === "professional"
                ? "Professional"
                : "Roommate seeker"}
            </p>
          </div>
        </Link>

        {/* Heart remove button */}
        <button
          type="button"
          onClick={handleRemoveClick}
          disabled={isRemoving}
          aria-label={`Remove ${roommate.name} from favorites`}
          title="Remove from favorites"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-rose-500 shadow-sm transition hover:bg-rose-50 hover:scale-110 active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          {isRemoving ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
          ) : (
            <FaHeart className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Badges and Attributes */}
      <div className="px-4 pb-2 flex flex-wrap items-center gap-1.5">
        {matchStrength && (
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold ${matchStrength.className}`}
          >
            {roommate.compatibility_score}% {matchStrength.label}
          </span>
        )}
        {seekingLabel && (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-[#2879ef]">
            <FiCompass className="h-3 w-3" />
            {seekingLabel}
          </span>
        )}
      </div>

      {/* Details Section */}
      <div className="flex flex-1 flex-col px-4 py-2 space-y-2 text-xs text-slate-600">
        {/* City and Age/Gender */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500">
          {roommate.city && (
            <span className="inline-flex items-center gap-1">
              <FiMapPin className="h-3.5 w-3.5 text-[#2879ef]" />
              {roommate.city}
            </span>
          )}
          {(roommate.age || roommate.gender) && (
            <span>
              {[roommate.age ? `${roommate.age} yrs` : null, roommate.gender]
                .filter(Boolean)
                .join(" · ")}
            </span>
          )}
        </div>

        {/* Profession or Education */}
        {roommate.profession && (
          <p className="flex items-center gap-1.5 text-slate-700 font-medium">
            <FiBriefcase className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="line-clamp-1">{roommate.profession}</span>
          </p>
        )}

        {/* Budget */}
        {formattedBudget && (
          <p className="text-slate-700">
            <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">
              Budget:{" "}
            </span>
            <span className="font-bold text-[#163e70]">₦{formattedBudget}</span>
          </p>
        )}

        {/* Short Bio */}
        {roommate.bio && (
          <p className="line-clamp-2 text-slate-500 pt-1 leading-relaxed">
            {roommate.bio}
          </p>
        )}

        {/* Lifestyle/Hobbies Pills */}
        {roommate.hobbies && roommate.hobbies.length > 0 && (
          <div className="pt-1 flex flex-wrap gap-1">
            {roommate.hobbies.slice(0, 3).map((hobby) => (
              <span
                key={hobby}
                className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600"
              >
                {hobby}
              </span>
            ))}
            {roommate.hobbies.length > 3 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-400">
                +{roommate.hobbies.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <Link
          href={profileHref}
          className="font-bold text-[#2879ef] hover:underline"
        >
          View profile
        </Link>
        <span className="text-[11px] text-slate-400">
          Saved on NestBuddy
        </span>
      </div>
    </article>
  );
}
