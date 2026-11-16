"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bath, Bed, ChevronRight, Heart, Home as HomeIcon, MapPin } from "lucide-react";
import type { PropertyCardProps } from "@/types";
import { toggleFavorite } from "@/utils/api";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

function backendImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (!apiBaseUrl) return null;
  return new URL(path, `${apiBaseUrl.replace(/\/$/, "")}/`).toString();
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

interface FeaturedPropertyCardProps {
  property: PropertyCardProps;
  onFavoriteChange?: (id: number, isFavorited: boolean) => void;
}

export default function FeaturedPropertyCard({
  property,
  onFavoriteChange,
}: FeaturedPropertyCardProps) {
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState<boolean>(Boolean(property.is_favorited));
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState<boolean>(false);

  const imageUrl = backendImageUrl(property.primary_image);
  const locationText = [property.city_name, property.state_name].filter(Boolean).join(", ");
  const rentalPeriodText =
    property.listing_type === "Sale"
      ? "one-time"
      : ` / ${property.rental_period || "month"}`;

  const isAvailable = property.property_status?.toLowerCase() === "available" || property.property_status === "AVAILABLE";

  const handleFavoriteClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/sign-in");
        return;
      }
    }

    if (isUpdatingFavorite) return;

    const previousState = isFavorited;
    const nextState = !previousState;
    setIsFavorited(nextState);
    setIsUpdatingFavorite(true);

    try {
      await toggleFavorite(property.id);
      onFavoriteChange?.(property.id, nextState);
    } catch (err) {
      // Revert on error
      setIsFavorited(previousState);
      console.error("Failed to update favorite status", err);
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white-1 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
      <Link href={`/properties/${property.slug}`} className="relative flex flex-col h-full">
        {/* Dominant Property Cover Photograph */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={property.title || "Property listing"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
              <HomeIcon className="h-12 w-12 stroke-[1.2]" />
            </div>
          )}

          {/* Gradient overlay for contrast on top controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/30 pointer-events-none" />

          {/* Badges: Property Type & Availability */}
          <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5 z-10">
            {property.property_type && (
              <span className="rounded-full bg-white-1/95 px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-sm backdrop-blur-sm">
                {property.property_type}
              </span>
            )}
            {isAvailable ? (
              <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-semibold text-white-1 shadow-sm backdrop-blur-sm flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-white-1 animate-pulse" />
                Available
              </span>
            ) : property.property_status ? (
              <span className="rounded-full bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-white-1 shadow-sm backdrop-blur-sm">
                {property.property_status}
              </span>
            ) : null}
          </div>

          {/* Favorite Button */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFavorited ? "Remove from saved favorites" : "Save property to favorites"}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white-1/95 text-slate-700 shadow-md backdrop-blur-sm transition-transform duration-200 hover:scale-110 active:scale-95 hover:bg-white-1"
          >
            <Heart
              className={`h-4.5 w-4.5 transition-colors ${
                isFavorited ? "fill-rose-500 text-rose-500" : "text-slate-600 hover:text-rose-500"
              }`}
            />
          </button>
        </div>

        {/* Card Body */}
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            {/* Title */}
            <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-blue-600 line-clamp-1">
              {property.title}
            </h3>

            {/* Location */}
            <p className="mt-1.5 flex items-center text-xs text-slate-500 line-clamp-1">
              <MapPin className="mr-1 h-3.5 w-3.5 shrink-0 text-blue-500" />
              <span>{locationText || "Location available upon request"}</span>
            </p>

            {/* Specs: Bedrooms & Bathrooms */}
            <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Bed className="h-4 w-4 text-slate-400" />
                <span className="font-medium text-slate-700">{property.num_bedrooms ?? 0}</span>{" "}
                {property.num_bedrooms === 1 ? "Bed" : "Beds"}
              </span>
              <span className="flex items-center gap-1.5">
                <Bath className="h-4 w-4 text-slate-400" />
                <span className="font-medium text-slate-700">{property.num_bathrooms ?? 0}</span>{" "}
                {property.num_bathrooms === 1 ? "Bath" : "Baths"}
              </span>
              {property.is_furnished && (
                <span className="ml-auto rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                  Furnished
                </span>
              )}
            </div>
          </div>

          {/* Pricing & CTA Footer */}
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                {formatPrice(property.price)}
              </span>
              <span className="ml-1 text-xs font-normal text-slate-500">
                {rentalPeriodText}
              </span>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white-1">
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
