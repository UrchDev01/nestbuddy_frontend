"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, MapPin, Sparkles, User as UserIcon } from "lucide-react";
import type { FeaturedRoommate } from "@/utils/api";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

function backendImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (!apiBaseUrl) return null;
  return new URL(path, `${apiBaseUrl.replace(/\/$/, "")}/`).toString();
}

function getSeekingLabel(seeking: string | null | undefined): string {
  switch (seeking) {
    case "have_place":
      return "Has a Place (Needs Roommate)";
    case "need_place":
      return "Looking for a Place";
    case "both":
      return "Open to Options";
    default:
      return "Looking for Roommate";
  }
}

interface RoommateDiscoveryCardProps {
  mate: FeaturedRoommate;
}

export default function RoommateDiscoveryCard({ mate }: RoommateDiscoveryCardProps) {
  const imageUrl = backendImageUrl(mate.main_profile?.profile_image);
  const firstName = mate.main_profile?.user_first_name?.trim() || "NestBuddy Member";
  const age = mate.demographic?.age;
  const location =
    mate.roommate_preferences?.preferred_city_name ||
    mate.demographic?.current_city_name ||
    mate.demographic?.state_of_residence_name ||
    "Location flexible";

  const seekingStatus = getSeekingLabel(mate.roommate_preferences?.seeking);
  const bio = mate.main_profile?.bio?.trim();
  const hasValidScore =
    typeof mate.compatibility_score === "number" &&
    mate.compatibility_score > 0 &&
    mate.compatibility_score <= 100;

  const initials = firstName.charAt(0).toUpperCase();

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white-1 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <Link href={`/roommates/${mate.slug}`} className="relative flex flex-col h-full">
        {/* Profile Photograph Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-blue-50">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${firstName}'s profile`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-tr from-slate-100 via-blue-50 to-indigo-50 text-slate-400">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100/80 text-2xl font-bold text-blue-700 shadow-inner">
                {initials || <UserIcon className="h-8 w-8" />}
              </div>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

          {/* Compatibility Score (ONLY when valid and returned from backend) */}
          {hasValidScore && (
            <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-blue-600/95 px-3 py-1 text-[11px] font-semibold text-white-1 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-amber-300" />
              <span>{Math.round(mate.compatibility_score!)}% Match</span>
            </div>
          )}

          {/* Seeking Status Badge */}
          <div className="absolute bottom-3 left-3 z-10">
            <span className="rounded-full bg-white-1/95 px-3 py-1 text-[11px] font-medium text-slate-800 shadow-sm backdrop-blur-sm">
              {seekingStatus}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            {/* Name and Age */}
            <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-600 line-clamp-1">
              {firstName}
              {age ? <span className="font-normal text-slate-500">, {age}</span> : null}
            </h3>

            {/* Current City */}
            <p className="mt-1 flex items-center text-xs text-slate-500 line-clamp-1">
              <MapPin className="mr-1 h-3.5 w-3.5 shrink-0 text-blue-500" />
              <span>{location}</span>
            </p>

            {/* Short Biography */}
            <p className="mt-3 text-xs leading-relaxed text-slate-600 line-clamp-2">
              {bio ||
                "Looking to connect with respectful, compatible roommates for a comfortable and shared living experience."}
            </p>
          </div>

          {/* View Profile Action */}
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-blue-600">
            <span className="group-hover:underline">View Profile</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 transition-transform duration-200 group-hover:translate-x-1 group-hover:bg-blue-600 group-hover:text-white-1">
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
