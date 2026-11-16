"use client";

import React from "react";
import Link from "next/link";
import { FiHome, FiUsers, FiArrowRight } from "react-icons/fi";

interface FavoritesEmptyStateProps {
  type: "properties" | "roommates";
}

export default function FavoritesEmptyState({ type }: FavoritesEmptyStateProps) {
  const isProperties = type === "properties";

  const content = isProperties
    ? {
        icon: FiHome,
        title: "No favorite properties yet",
        description:
          "Properties you save will appear here. Explore available properties and save the ones you like.",
        ctaText: "Explore Properties",
        ctaHref: "/find-a-place",
        iconColor: "text-[#2879ef] bg-[#2879ef]/10",
      }
    : {
        icon: FiUsers,
        title: "No favorite roommates yet",
        description:
          "Save roommate profiles you're interested in so you can easily find them again.",
        ctaText: "Find Roommates",
        ctaHref: "/ai-roommate-finder",
        iconColor: "text-indigo-600 bg-indigo-50",
      };

  const Icon = content.icon;

  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white px-6 py-16 text-center shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-2xl ${content.iconColor} mb-4 shadow-sm`}
      >
        <Icon className="h-8 w-8" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">{content.title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500 leading-relaxed">
        {content.description}
      </p>
      <Link
        href={content.ctaHref}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2879ef] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1f6fdd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef] focus-visible:ring-offset-2 active:scale-95"
      >
        <span>{content.ctaText}</span>
        <FiArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
