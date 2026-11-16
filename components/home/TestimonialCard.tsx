"use client";

import React from "react";
import Image from "next/image";
import { Quote, Star, User as UserIcon } from "lucide-react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

function backendImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (!apiBaseUrl) return null;
  return new URL(path, `${apiBaseUrl.replace(/\/$/, "")}/`).toString();
}

export type HomepageReview = {
  id: number;
  user_name: string;
  rating: number;
  title: string | null;
  comment: string;
  property: number;
  user?: {
    first_name?: string;
    last_name?: string;
    profile?: {
      profile_image?: string | null;
    };
  };
};

interface TestimonialCardProps {
  review: HomepageReview;
}

export default function TestimonialCard({ review }: TestimonialCardProps) {
  // Extract user's first name
  const rawName = review.user?.first_name || review.user_name || "NestBuddy Member";
  const firstName = rawName.trim().split(" ")[0] || "NestBuddy Member";
  const initial = firstName.charAt(0).toUpperCase();

  const profileImage = backendImageUrl(review.user?.profile?.profile_image);

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-7 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md">
      <div>
        {/* Top bar: Subtle quote mark + Rating stars */}
        <div className="flex items-center justify-between">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Quote className="h-4 w-4 fill-blue-600" />
          </span>

          {review.rating > 0 && (
            <div className="flex items-center gap-0.5" aria-label={`Rated ${review.rating} out of 5 stars`}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < review.rating
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-100 text-slate-200"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Review Title if present */}
        {review.title && (
          <h4 className="mt-4 text-sm font-bold text-slate-900 line-clamp-1">
            {review.title}
          </h4>
        )}

        {/* Review Text - The primary visual focus */}
        <p className="mt-3 text-sm leading-relaxed text-slate-700 italic">
          &ldquo;{review.comment}&rdquo;
        </p>
      </div>

      {/* Author Info */}
      <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
        {profileImage ? (
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-slate-200">
            <Image
              src={profileImage}
              alt={firstName}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 text-sm font-bold text-blue-700">
            {initial || <UserIcon className="h-4 w-4" />}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 line-clamp-1">{firstName}</p>
          <p className="text-[11px] text-slate-500 line-clamp-1">
            Community Member · Property #{review.property}
          </p>
        </div>
      </div>
    </article>
  );
}
