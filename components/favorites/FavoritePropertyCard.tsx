"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { FiAlertCircle, FiHeart, FiMapPin, FiMaximize, FiHome } from "react-icons/fi";
import { FaBath, FaBed, FaHeart } from "react-icons/fa";
import type { Property } from "@/types";

interface FavoritePropertyCardProps {
  favoriteId: number;
  property: Property;
  onRemove: (favoriteId: number, propertyId: number) => Promise<void>;
}

export default function FavoritePropertyCard({
  favoriteId,
  property,
  onRemove,
}: FavoritePropertyCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  // Format price
  const formattedPrice = useMemo(() => {
    if (typeof property.price === "number") {
      return new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(property.price);
    }
    const parsed = parseFloat(String(property.price || 0));
    return new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(parsed);
  }, [property.price]);

  // Image URL
  const imageUrl = useMemo(() => {
    if (!property.primary_image) return null;
    if (property.primary_image.startsWith("http://") || property.primary_image.startsWith("https://")) {
      return property.primary_image;
    }
    const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    return `${base.replace(/\/$/, "")}${property.primary_image.startsWith("/") ? "" : "/"}${property.primary_image}`;
  }, [property.primary_image]);

  const locationString = useMemo(() => {
    return [property.address, property.city_name, property.state_name]
      .filter(Boolean)
      .join(", ") || "Location not specified";
  }, [property.address, property.city_name, property.state_name]);

  const isAvailable = property.property_status === "Available" || (property.is_available ?? false);

  const getStatusBadge = () => {
    const status = property.property_status || (isAvailable ? "Available" : "Unavailable");
    if (status.toLowerCase() === "available") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (status.toLowerCase().includes("rent") || status.toLowerCase().includes("occupied")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (status.toLowerCase().includes("review")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const handleRemoveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRemoving) return;

    setIsRemoving(true);
    try {
      await onRemove(favoriteId, property.id);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
      {/* Top Image Section with Overlays */}
      <div className="relative block h-52 w-full overflow-hidden bg-slate-100">
        <Link href={`/properties/${property.slug}`} className="block h-full w-full">
          {imageUrl && !imageFailed ? (
            <img
              src={imageUrl}
              alt={property.title || "Property"}
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-blue-50/50 text-[#8aa0b9]">
              <FiHome className="h-12 w-12 stroke-[1.5]" />
            </div>
          )}
        </Link>

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
          <span
            className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide backdrop-blur-sm shadow-sm ${getStatusBadge()}`}
          >
            {property.property_status || (isAvailable ? "Available" : "Unavailable")}
          </span>
          {property.property_type && (
            <span className="inline-flex items-center rounded-lg bg-black/60 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              {property.property_type}
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={handleRemoveClick}
          disabled={isRemoving}
          aria-label={`Remove ${property.title} from favorites`}
          title="Remove from favorites"
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-rose-500 shadow-md backdrop-blur-sm transition-all hover:bg-rose-50 hover:scale-110 active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          {isRemoving ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
          ) : (
            <FaHeart className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Body Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Availability Notice if not available */}
        {!isAvailable && (
          <div className="mb-2.5 flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800">
            <FiAlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
            <span>This property is currently {property.property_status || "unavailable"}.</span>
          </div>
        )}

        {/* Title */}
        <Link href={`/properties/${property.slug}`} className="group-hover:text-[#2879ef] transition-colors">
          <h3 className="line-clamp-1 text-base font-bold text-slate-900" title={property.title}>
            {property.title}
          </h3>
        </Link>

        {/* Location */}
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
          <FiMapPin className="h-3.5 w-3.5 shrink-0 text-[#2879ef]" />
          <span className="truncate">{locationString}</span>
        </p>

        {/* Price & Rental Period */}
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-xl font-extrabold text-[#163e70]">₦{formattedPrice}</span>
          <span className="text-xs font-semibold text-slate-500">
            /{property.rental_period ? property.rental_period.toLowerCase() : "period"}
          </span>
        </div>

        {/* Features Row */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600">
          {typeof property.num_bedrooms === "number" && property.num_bedrooms > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1">
              <FaBed className="text-[#2879ef]" />
              {property.num_bedrooms} {property.num_bedrooms === 1 ? "Bed" : "Beds"}
            </span>
          )}
          {typeof property.num_bathrooms === "number" && property.num_bathrooms > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1">
              <FaBath className="text-[#2879ef]" />
              {property.num_bathrooms} {property.num_bathrooms === 1 ? "Bath" : "Baths"}
            </span>
          )}
          {property.size_sqm ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1">
              <FiMaximize className="text-[#2879ef]" />
              {property.size_sqm} m²
            </span>
          ) : null}
        </div>

        {/* Card Footer */}
        <div className="mt-auto pt-3 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="truncate">Saved for discovery</span>
          <Link
            href={`/properties/${property.slug}`}
            className="font-bold text-[#2879ef] hover:underline"
          >
            View details →
          </Link>
        </div>
      </div>
    </article>
  );
}
