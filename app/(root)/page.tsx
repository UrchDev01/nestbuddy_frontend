"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Heart,
  Home as HomeIcon,
  Layers,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import {
  fetchFeaturedProperties,
  fetchFeaturedRoommates,
  fetchHomepageReviews,
} from "@/utils/api";
import type { PropertyCardProps } from "@/types";
import type { FeaturedRoommate } from "@/utils/api";
import FeaturedPropertyCard from "@/components/home/FeaturedPropertyCard";
import RoommateDiscoveryCard from "@/components/home/RoommateDiscoveryCard";
import TestimonialCard, { HomepageReview } from "@/components/home/TestimonialCard";

type FinderMode = "roommate" | "place" | "listing";

const propertyTypes = [
  "Self Contain",
  "Single Room",
  "Shared Apartment",
  "Mini Flat",
  "Flat",
  "Duplex",
  "Bungalow",
  "Terrace",
  "Mansion",
  "Penthouse",
  "Commercial Space",
  "Office Space",
  "Shop",
  "Warehouse",
  "Student Lodge",
  "Other",
];

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? `${fallback} ${error.message}` : fallback;
}

export default function HomePage() {
  const [mates, setMates] = useState<FeaturedRoommate[]>([]);
  const [properties, setProperties] = useState<PropertyCardProps[]>([]);
  const [reviews, setReviews] = useState<HomepageReview[]>([]);
  const [loading, setLoading] = useState({ mates: true, properties: true, reviews: true });
  const [errors, setErrors] = useState<{
    mates: string | null;
    properties: string | null;
    reviews: string | null;
  }>({
    mates: null,
    properties: null,
    reviews: null,
  });

  const loadHomepageData = useCallback(async () => {
    setLoading({ mates: true, properties: true, reviews: true });
    setErrors({ mates: null, properties: null, reviews: null });

    const [roommateResult, propertyResult, reviewResult] = await Promise.allSettled([
      fetchFeaturedRoommates(),
      fetchFeaturedProperties(),
      fetchHomepageReviews(),
    ]);

    if (roommateResult.status === "fulfilled" && Array.isArray(roommateResult.value?.data)) {
      setMates(roommateResult.value.data);
    } else {
      setMates([]);
      setErrors((current) => ({
        ...current,
        mates:
          roommateResult.status === "rejected"
            ? errorMessage(roommateResult.reason, "Unable to load featured roommates.")
            : "The featured roommates service returned an invalid response.",
      }));
    }

    if (propertyResult.status === "fulfilled" && Array.isArray(propertyResult.value?.data)) {
      setProperties(propertyResult.value.data);
    } else {
      setProperties([]);
      setErrors((current) => ({
        ...current,
        properties:
          propertyResult.status === "rejected"
            ? errorMessage(propertyResult.reason, "Unable to load featured listings.")
            : "The featured listings service returned an invalid response.",
      }));
    }

    if (
      reviewResult.status === "fulfilled" &&
      Array.isArray(reviewResult.value?.data?.data?.results)
    ) {
      setReviews(reviewResult.value.data.data.results);
    } else {
      setReviews([]);
      setErrors((current) => ({
        ...current,
        reviews:
          reviewResult.status === "rejected"
            ? errorMessage(reviewResult.reason, "Unable to load community reviews.")
            : "The reviews service returned an invalid response.",
      }));
    }

    setLoading({ mates: false, properties: false, reviews: false });
  }, []);

  useEffect(() => {
    void loadHomepageData();
  }, [loadHomepageData]);

  const handlePropertyFavoriteChange = (id: number, isFavorited: boolean) => {
    setProperties((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_favorited: isFavorited } : item))
    );
  };

  return (
    <div className="min-h-screen bg-white-1 text-black-1 selection:bg-blue-100 selection:text-blue-900">
      {/* =========================================================
          SECTION 2: HERO SECTION
         ========================================================= */}
      <section className="relative overflow-visible bg-gradient-to-b from-[#f7fbff] via-[#edf5fd] to-white-1 pb-16 pt-10 md:pb-32 md:pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Hero Copy */}
            <div className="z-10 lg:col-span-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-100/90 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Find your people. Find your place.
              </span>

              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-[#0f2744] sm:text-5xl lg:text-6xl lg:leading-[1.12]">
                A Better Place to Live Starts With the Right People.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Finding a place to live or the right person to share it with shouldn&apos;t be
                complicated. NestBuddy helps you discover accommodation, connect with compatible
                roommates and find a place that feels like home.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/ai-roommate-finder"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white-1 shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Users className="h-4 w-4" />
                  Find a Roommate
                </Link>
                <Link
                  href="/find-a-place"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white-1 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                >
                  <HomeIcon className="h-4 w-4 text-slate-500" />
                  Explore Properties
                </Link>
              </div>

              {/* Hero highlights */}
              <div className="mt-10 grid grid-cols-3 gap-3 border-t border-slate-200/80 pt-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <BrainCircuit className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 leading-tight">
                    AI Roommate Matching
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <HomeIcon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 leading-tight">
                    Verified Properties
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Upload className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 leading-tight">
                    Direct Listings
                  </span>
                </div>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="relative lg:col-span-6">
              <div className="relative mx-auto aspect-[16/11] w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200/70 shadow-2xl">
                <Image
                  src={encodeURI("/New images/hero.jpg")}
                  alt="Friends sharing a comfortable modern apartment"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-right"
                />
              </div>
            </div>
          </div>

          {/* Interactive Search Finder */}
          <div className="mt-14">
            <Finder />
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 3: ABOUT NESTBUDDY (WHY NESTBUDDY)
         ========================================================= */}
      <section className="py-12 md:py-28" id="about-us">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left Image */}
            <div className="order-2 lg:order-1 lg:col-span-6">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-slate-200/80 shadow-xl">
                <Image
                  src={encodeURI("/New images/about.jpg")}
                  alt="A modern living room environment fostering positive connections"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Right Copy */}
            <div className="order-1 lg:order-2 lg:col-span-6">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                WHY NESTBUDDY
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0f2744] sm:text-4xl">
                Finding a Home Is Easier When You Have the Right People.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                A good living experience is about more than four walls. It&apos;s about finding the
                right environment, the right people and a place where you feel comfortable.
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                NestBuddy brings roommate discovery and accommodation search together, helping you
                make more informed decisions about where and how you live.
              </p>

              {/* 3 Key Benefits */}
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/40">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Find Compatible Roommates</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      Discover people with similar lifestyles, preferences and living expectations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/40">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <HomeIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Explore Places to Live</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      Discover accommodation options that match your preferred location and budget.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/40">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Connect With Confidence</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      Get to know potential roommates and arrange property viewings through the platform.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Learn More <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 4: HOW NESTBUDDY WORKS
         ========================================================= */}
      <section className="bg-slate-50/80 py-12 md:py-28" id="how-it-works">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              SIMPLE BY DESIGN
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0f2744] sm:text-4xl">
              Your Next Living Experience in Four Simple Steps.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Whether you&apos;re searching for a roommate or your next home, NestBuddy makes it
              easier to get started.
            </p>
          </div>

          {/* 4 Steps Grid */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Step 1 */}
            <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white-1 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="relative mb-5 aspect-square w-full overflow-hidden rounded-xl bg-blue-50">
                <Image
                  src={encodeURI("/New images/how-it-works-illus-1.jpg")}
                  alt="Step 01 – Create Your Profile"
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover"
                />
              </div>
              <span className="inline-block text-xs font-bold text-blue-600 tracking-wider">
                STEP 01
              </span>
              <h3 className="mt-2 text-base font-bold text-slate-900">Create Your Profile</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Tell us a little about yourself, your lifestyle and what you&apos;re looking for.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white-1 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="relative mb-5 aspect-square w-full overflow-hidden rounded-xl bg-blue-50">
                <Image
                  src={encodeURI("/New images/how-it-works-illus-2.jpg")}
                  alt="Step 02 – Discover Your Options"
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover"
                />
              </div>
              <span className="inline-block text-xs font-bold text-blue-600 tracking-wider">
                STEP 02
              </span>
              <h3 className="mt-2 text-base font-bold text-slate-900">Discover Your Options</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Explore roommate profiles, take the compatibility quiz or browse available
                properties.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white-1 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="relative mb-5 aspect-square w-full overflow-hidden rounded-xl bg-blue-50">
                <Image
                  src={encodeURI("/New images/how-it-works-illus-3.jpg")}
                  alt="Step 03 – Connect and Explore"
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover"
                />
              </div>
              <span className="inline-block text-xs font-bold text-blue-600 tracking-wider">
                STEP 03
              </span>
              <h3 className="mt-2 text-base font-bold text-slate-900">Connect and Explore</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Connect with potential roommates or arrange a viewing with a property agent.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white-1 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="relative mb-5 aspect-square w-full overflow-hidden rounded-xl bg-blue-50">
                <Image
                  src={encodeURI("/New images/how-it-works-illus-4.jpg")}
                  alt="Step 04 – Make Your Move"
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover"
                />
              </div>
              <span className="inline-block text-xs font-bold text-blue-600 tracking-wider">
                STEP 04
              </span>
              <h3 className="mt-2 text-base font-bold text-slate-900">Make Your Move</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Find the right arrangement and take the next step towards a better living experience.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white-1 shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 5: FEATURED PROPERTY LISTINGS (REDESIGNED)
         ========================================================= */}
      <section className="py-12 md:py-28" id="featured-properties">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-slate-100 pb-8">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                EXPLORE PLACES
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0f2744] sm:text-4xl">
                Find a Place You&apos;ll Love Coming Home To.
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                From private apartments to shared living spaces, explore accommodation options in
                locations that work for you.
              </p>
            </div>
            <Link
              href="/find-a-place"
              className="inline-flex items-center gap-1.5 self-start text-sm font-bold text-blue-600 hover:text-blue-700 md:self-end"
            >
              Explore All Properties <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Properties Content */}
          <div className="mt-12">
            {errors.properties ? (
              <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center">
                <p className="text-sm font-medium text-red-800">{errors.properties}</p>
                <button
                  type="button"
                  onClick={loadHomepageData}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white-1 hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            ) : loading.properties ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((skeleton) => (
                  <div
                    key={skeleton}
                    className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white-1 p-4 shadow-sm animate-pulse"
                  >
                    <div className="aspect-[16/10] w-full rounded-xl bg-slate-200" />
                    <div className="mt-4 h-5 w-3/4 rounded bg-slate-200" />
                    <div className="mt-2 h-4 w-1/2 rounded bg-slate-200" />
                    <div className="mt-6 flex justify-between border-t border-slate-100 pt-4">
                      <div className="h-6 w-1/3 rounded bg-slate-200" />
                      <div className="h-6 w-12 rounded bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-12 text-center">
                <HomeIcon className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-4 text-base font-bold text-slate-800">
                  No Featured Properties Currently Available
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Browse all listings to discover available apartments and shared spaces.
                </p>
                <Link
                  href="/find-a-place"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white-1 hover:bg-blue-700"
                >
                  Browse All Properties <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.slice(0, 3).map((property) => (
                  <FeaturedPropertyCard
                    key={property.id}
                    property={property}
                    onFavoriteChange={handlePropertyFavoriteChange}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 6: ROOMMATE DISCOVERY (REDESIGNED)
         ========================================================= */}
      <section className="bg-slate-50/70 py-12 md:py-28" id="roommate-discovery">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-slate-200 pb-8">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                MEET YOUR POTENTIAL ROOMMATES
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0f2744] sm:text-4xl">
                More Than a Roommate. Find Someone You Can Live With.
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                Sharing a home is easier when your lifestyles and expectations align. Discover
                people looking for roommates, explore their profiles and see how compatible your
                living preferences might be.
              </p>
            </div>
            <Link
              href="/ai-roommate-finder"
              className="inline-flex items-center gap-1.5 self-start text-sm font-bold text-blue-600 hover:text-blue-700 md:self-end"
            >
              Find Your Roommate <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* 3 Supporting Benefits */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-slate-200/80 bg-white-1 p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-3">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Lifestyle Compatibility</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                Compare habits, preferences and expectations before deciding to share a living space.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white-1 p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 mb-3">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Personalised Matching</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                Discover people based on your roommate preferences and lifestyle information.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white-1 p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 mb-3">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Meaningful Connections</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                Get to know potential roommates and understand their expectations before making a
                decision.
              </p>
            </div>
          </div>

          {/* Roommates Grid */}
          <div className="mt-12">
            {errors.mates ? (
              <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center">
                <p className="text-sm font-medium text-red-800">{errors.mates}</p>
                <button
                  type="button"
                  onClick={loadHomepageData}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white-1 hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            ) : loading.mates ? (
              <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4">
                {[1, 2, 3].map((skeleton) => (
                  <div key={skeleton} className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
                    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white-1 p-4 shadow-sm animate-pulse">
                      <div className="aspect-[4/3] w-full rounded-xl bg-slate-200" />
                      <div className="mt-4 h-5 w-2/3 rounded bg-slate-200" />
                      <div className="mt-2 h-4 w-1/2 rounded bg-slate-200" />
                      <div className="mt-4 h-10 w-full rounded bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : mates.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white-1 p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-4 text-base font-bold text-slate-800">
                  No Roommate Profiles Currently Displayed
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Explore our roommate matching directory to meet potential living partners.
                </p>
                <Link
                  href="/ai-roommate-finder"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white-1 hover:bg-blue-700"
                >
                  Explore All Roommates <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div
                className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
                role="region"
                aria-label="Featured potential roommates"
                tabIndex={0}
              >
                {mates.slice(0, 6).map((mate) => (
                  <div key={mate.id} className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
                    <RoommateDiscoveryCard mate={mate} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 7: AI COMPATIBILITY MATCHING
         ========================================================= */}
      <section className="py-12 md:py-28" id="ai-compatibility">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left Copy */}
            <div className="lg:col-span-6">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                SMARTER ROOMMATE MATCHING
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0f2744] sm:text-4xl">
                Compatibility Goes Beyond Sharing the Same Address.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Your ideal roommate isn&apos;t necessarily someone with the same interests as you.
                It&apos;s someone whose lifestyle, habits and expectations can work well alongside
                yours.
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                NestBuddy&apos;s compatibility system analyses your preferences, lifestyle and quiz
                responses to help you discover potential roommates with more in common.
              </p>

              {/* Key Features List */}
              <ul className="mt-6 space-y-2.5 text-sm font-medium text-slate-700">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  Lifestyle and habit comparisons
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  Shared interests and personality traits
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  Living preferences and cleanliness standards
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  Deep compatibility insights
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  AI-generated explanations of potential compatibility
                </li>
              </ul>

              <div className="mt-8">
                <Link
                  href="/compatibility-quiz"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white-1 shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg"
                >
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Discover Your Compatibility
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="lg:col-span-6">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-slate-200/80 shadow-2xl">
                <Image
                  src={encodeURI("/New images/AI compatibility.jpg")}
                  alt="AI Compatibility Matching"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 8: WHY CHOOSE NESTBUDDY?
         ========================================================= */}
      <section className="bg-slate-50/80 py-12 md:py-28" id="why-choose">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              THE NESTBUDDY DIFFERENCE
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0f2744] sm:text-4xl">
              A Smarter Way to Find Where and With Whom You Live.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              We&apos;ve brought the important parts of finding a living arrangement together in one
              place, so you can spend less time searching and more time making the right connections.
            </p>
          </div>

          {/* 6 Platform Benefits Grid */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Benefit 1 */}
            <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white-1 p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="relative mb-5 h-14 w-14 overflow-hidden rounded-xl bg-blue-50">
                <Image
                  src={encodeURI("/New images/why-nestbuddy-illus-1.jpg")}
                  alt="Identity Review"
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <h3 className="text-base font-bold text-slate-900">Identity Review</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Identity verification helps build a more accountable community where everyone feels
                confident.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white-1 p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="relative mb-5 h-14 w-14 overflow-hidden rounded-xl bg-amber-50">
                <Image
                  src={encodeURI("/New images/why-nestbuddy-illus-2.jpg")}
                  alt="AI Compatibility"
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <h3 className="text-base font-bold text-slate-900">AI Compatibility</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Discover potential roommates based on lifestyle, cleanliness and living preferences.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white-1 p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="relative mb-5 h-14 w-14 overflow-hidden rounded-xl bg-emerald-50">
                <Image
                  src={encodeURI("/New images/why-nestbuddy-illus-3.jpg")}
                  alt="Personalised Discovery"
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <h3 className="text-base font-bold text-slate-900">Personalised Discovery</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Find people and properties tailored to what truly matters to you and your budget.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white-1 p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="relative mb-5 h-14 w-14 overflow-hidden rounded-xl bg-indigo-50">
                <Image
                  src={encodeURI("/New images/why-nestbuddy-illus-4.jpg")}
                  alt="Flexible Living"
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <h3 className="text-base font-bold text-slate-900">Flexible Living</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Explore shared accommodation, full apartments and independent living options.
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white-1 p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="relative mb-5 h-14 w-14 overflow-hidden rounded-xl bg-purple-50">
                <Image
                  src={encodeURI("/New images/property-discovery.jpg")}
                  alt="Illustration of verified property discovery"
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <h3 className="text-base font-bold text-slate-900">Property Discovery</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Browse authentic accommodation listings uploaded directly by verified agents and
                property owners.
              </p>
            </div>

            {/* Benefit 6 */}
            <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white-1 p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="relative mb-5 h-14 w-14 overflow-hidden rounded-xl bg-rose-50">
                <Image
                  src={encodeURI("/New images/direct-viewing-requests.jpg")}
                  alt="Illustration of direct property viewing requests"
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <h3 className="text-base font-bold text-slate-900">Direct Viewing Requests</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Connect directly with property managers to schedule viewings at your convenience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 9: LIST YOUR PROPERTY
         ========================================================= */}
      <section className="py-12 md:py-28" id="list-property">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left Copy */}
            <div className="lg:col-span-6">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                FOR AGENTS AND PROPERTY OWNERS
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0f2744] sm:text-4xl">
                Have a Property to Rent or Sell? Let More People Discover It.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Connect your property with people actively searching for their next home. List your
                apartment, house or shared accommodation on NestBuddy and reach potential tenants
                and buyers.
              </p>

              {/* Benefits Checklist */}
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-600 shrink-0" />
                  <span>Create and manage property listings with ease.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-600 shrink-0" />
                  <span>Showcase properties with photographs and important specifications.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-600 shrink-0" />
                  <span>Receive viewing requests directly from interested users.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-600 shrink-0" />
                  <span>Manage enquiries and communications in one place.</span>
                </li>
              </ul>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/list-property"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white-1 shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  List Your Property
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white-1 px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="lg:col-span-6">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-slate-200/80 shadow-2xl">
                <Image
                  src={encodeURI("/New images/list-your-property.jpg")}
                  alt="Property listing showcase"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 10: TESTIMONIALS (REDESIGNED)
          Rule: If API returns insufficient genuine testimonials (0 reviews),
          hide the section completely!
         ========================================================= */}
      {reviews.length > 0 && (
        <section className="bg-slate-50/70 py-12 md:py-28" id="testimonials">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                COMMUNITY STORIES
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0f2744] sm:text-4xl">
                Better Living Starts With Better Connections.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Discover how people are using NestBuddy to explore accommodation and find potential
                roommates.
              </p>
            </div>

            {/* Testimonials Grid: 3 Desktop, 2 Tablet, 1 Mobile */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.slice(0, 3).map((review) => (
                <TestimonialCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          SECTION 11: FINAL CALL TO ACTION
         ========================================================= */}
      <section className="mx-auto my-10 max-w-7xl px-4 sm:px-6 md:my-16 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#0b213b] px-6 py-14 text-white-1 shadow-2xl sm:px-12 md:py-24">
          {/* Background image with overlay */}
          <div className="absolute inset-0 opacity-40 mix-blend-luminosity">
            <Image
              src={encodeURI("/New images/Final-CTA.jpg")}
              alt="Comfortable shared living space"
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b213b] via-[#0b213bcc] to-transparent pointer-events-none" />

          {/* CTA Content */}
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white-1/10 px-3.5 py-1 text-xs font-semibold text-white-1 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-amber-300" />
              Start Your Journey
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white-1 sm:text-4xl lg:text-5xl">
              Ready to Find Your Place or Your People?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-200">
              Join NestBuddy today and start connecting with compatible roommates and discovering
              homes that fit your lifestyle.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-7 py-3.5 text-sm font-bold text-slate-900 shadow-lg transition-all duration-200 hover:bg-amber-300 hover:shadow-xl"
              >
                Get Started <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/ai-roommate-finder"
                className="inline-flex items-center gap-2 rounded-xl border border-white-1/30 bg-white-1/10 px-6 py-3.5 text-sm font-semibold text-white-1 backdrop-blur-sm hover:bg-white-1/20"
              >
                Find a Roommate
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   SEARCH INTERFACE (FINDER)
   Three search modes: Find a Roommate, Find a Place, List a Property
   ========================================================= */
function Finder() {
  const router = useRouter();
  const [mode, setMode] = useState<FinderMode>("roommate");
  const [location, setLocation] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [seeking, setSeeking] = useState("need_place");
  const [listingType, setListingType] = useState("Rent");

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "listing") {
      router.push("/list-property");
      return;
    }

    const params = new URLSearchParams();

    if (location.trim()) {
      params.set(mode === "roommate" ? "preferred_city" : "city", location.trim());
    }

    if (maxBudget) {
      params.set(mode === "roommate" ? "max_budget" : "max_price", maxBudget);
    }

    if (mode === "roommate") {
      params.set("seeking", seeking);
    } else {
      if (availableFrom && mode === "place") params.set("available_from", availableFrom);
      if (propertyType) params.set("property_type", propertyType);
      params.set("listing_type", listingType);
    }

    const query = params.toString();
    const destination = mode === "roommate" ? "/ai-roommate-finder" : "/find-a-place";
    router.push(query ? `${destination}?${query}` : destination);
  }

  const tabs: [FinderMode, string][] = [
    ["roommate", "Find a Roommate"],
    ["place", "Find a Place"],
    ["listing", "List a Property"],
  ];

  return (
    <div className="relative mx-auto max-w-5xl rounded-3xl border border-slate-200/90 bg-white-1 p-4 shadow-xl sm:p-6">
      {/* Search Mode Tabs */}
      <div
        className="flex items-center gap-2 border-b border-slate-100 pb-4 overflow-x-auto"
        role="tablist"
        aria-label="Search options"
      >
        {tabs.map(([tabMode, label]) => (
          <button
            type="button"
            role="tab"
            aria-selected={mode === tabMode}
            key={tabMode}
            onClick={() => setMode(tabMode)}
            className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-200 ${
              mode === tabMode
                ? "bg-blue-600 text-white-1 shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Fields */}
      <form onSubmit={submitSearch} className="mt-5">
        {mode === "listing" ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Ready to list your apartment, house, or room?
              </h4>
              <p className="mt-1 text-xs text-slate-600">
                Reach verified tenants and buyers looking for great living arrangements across Nigeria.
              </p>
            </div>
            <button
              type="submit"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white-1 shadow hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Go to Property Listing Flow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Location */}
            <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/50 p-3 transition-colors focus-within:border-blue-500 focus-within:bg-white-1">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <MapPin className="h-3 w-3 text-blue-500" />
                {mode === "roommate" ? "Preferred Location" : "Location"}
              </span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Lagos, Abuja, Ibadan"
                className="mt-1.5 w-full bg-transparent text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {/* Budget */}
            <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/50 p-3 transition-colors focus-within:border-blue-500 focus-within:bg-white-1">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <Wallet className="h-3 w-3 text-blue-500" />
                Budget (Max ₦)
              </span>
              <input
                type="number"
                min="0"
                step="10000"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                placeholder="Any budget"
                className="mt-1.5 w-full bg-transparent text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {/* Mode-specific third field */}
            {mode === "roommate" ? (
              <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/50 p-3 transition-colors focus-within:border-blue-500 focus-within:bg-white-1">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <Users className="h-3 w-3 text-blue-500" />
                  Living Arrangement
                </span>
                <select
                  value={seeking}
                  onChange={(e) => setSeeking(e.target.value)}
                  className="mt-1.5 w-full bg-transparent text-xs font-medium text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="need_place">Looking for a Place</option>
                  <option value="have_place">Has a Place (Needs Roommate)</option>
                  <option value="both">Open to Both</option>
                </select>
              </div>
            ) : (
              <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/50 p-3 transition-colors focus-within:border-blue-500 focus-within:bg-white-1">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <HomeIcon className="h-3 w-3 text-blue-500" />
                  Property Type
                </span>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="mt-1.5 w-full bg-transparent text-xs font-medium text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="">Any Property Type</option>
                  {propertyTypes.map((type) => (
                    <option value={type} key={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-xs font-bold text-white-1 shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Search className="h-4 w-4" />
                {mode === "roommate" ? "Find Roommates" : "Search Properties"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
