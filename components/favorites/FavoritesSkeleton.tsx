"use client";

import React from "react";

export default function FavoritesSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      aria-label="Loading favorites..."
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm animate-pulse"
        >
          {/* Cover image skeleton */}
          <div className="h-48 w-full bg-slate-200 relative">
            <div className="absolute top-3 left-3 h-6 w-20 rounded-full bg-slate-300" />
            <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-slate-300" />
          </div>

          {/* Content skeleton */}
          <div className="flex flex-1 flex-col p-4 space-y-3">
            <div className="h-5 w-3/4 rounded bg-slate-200" />
            <div className="h-4 w-1/2 rounded bg-slate-200" />
            <div className="flex gap-3 pt-2">
              <div className="h-4 w-16 rounded bg-slate-200" />
              <div className="h-4 w-16 rounded bg-slate-200" />
              <div className="h-4 w-20 rounded bg-slate-200" />
            </div>
            <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="h-6 w-28 rounded bg-slate-200" />
              <div className="h-4 w-16 rounded bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
