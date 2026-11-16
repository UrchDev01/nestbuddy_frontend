"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FiAlertCircle, FiHome, FiSliders } from "react-icons/fi";
import { fetchProperties } from "@/utils/api";
import type { Property, PropertyFilter } from "@/types";
import Pagination from "@/components/Pagination";
import DirectoryPropertyCard from "@/components/DirectoryPropertyCard";
import PropertySearchFilters from "@/components/PropertySearchFilters";

const PAGE_SIZE = 12;
const booleanFilters = new Set([
  "accepts_pets",
  "accepts_students",
  "is_furnished",
  "bills_included",
]);

function parseFilters(params: URLSearchParams): PropertyFilter {
  const filters: PropertyFilter = {};
  params.forEach((value, key) => {
    if (key === "page" || key === "ordering" || value === "") return;
    if (booleanFilters.has(key))
      Object.assign(filters, { [key]: value === "true" });
    else Object.assign(filters, { [key]: value });
  });
  return filters;
}

function buildUrl(
  pathname: string,
  filters: PropertyFilter,
  page: number,
  ordering: string,
) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "")
      params.set(key, String(value));
  });
  if (ordering) params.set("ordering", ordering);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function PropertySkeletons() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="h-48 bg-slate-100" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-1/3 rounded bg-slate-100" />
            <div className="h-5 w-4/5 rounded bg-slate-200" />
            <div className="h-3 w-3/5 rounded bg-slate-100" />
            <div className="flex gap-2">
              <div className="h-8 w-20 rounded bg-slate-100" />
              <div className="h-8 w-20 rounded bg-slate-100" />
            </div>
            <div className="h-10 rounded-lg bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FindAPlaceDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const requestRef = useRef(0);
  const filters = useMemo(
    () => parseFilters(new URLSearchParams(query)),
    [query],
  );
  const currentPage = Math.max(1, Number(searchParams.get("page") || "1") || 1);
  const ordering = searchParams.get("ordering") || "-created_at";
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    const request = ++requestRef.current;
    setLoading(true);
    setError(null);
    void fetchProperties(currentPage, PAGE_SIZE, { ...filters, ordering })
      .then((response: unknown) => {
        if (request !== requestRef.current) return;
        const body = response as {
          status?: string;
          data?: { data?: { results?: Property[]; count?: number } };
        };
        const result = body?.data?.data;
        if (
          body?.status !== "success" ||
          !result ||
          !Array.isArray(result.results) ||
          typeof result.count !== "number"
        )
          throw new Error("The property service returned incomplete data.");
        setProperties(result.results);
        setTotal(result.count);
      })
      .catch((cause: unknown) => {
        if (request !== requestRef.current) return;
        const status =
          typeof cause === "object" && cause !== null && "status" in cause
            ? (cause as { status?: number }).status
            : undefined;
        setProperties([]);
        setTotal(0);
        setError(
          status === 401 || status === 403
            ? "Please sign in again to browse properties."
            : "We couldn’t retrieve properties right now. Check your connection and try again.",
        );
      })
      .finally(() => {
        if (request === requestRef.current) setLoading(false);
      });
  }, [currentPage, filters, ordering, retry]);

  const applyFilters = useCallback(
    (next: PropertyFilter) =>
      router.push(buildUrl(pathname, next, 1, ordering), { scroll: false }),
    [ordering, pathname, router],
  );
  const changePage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages && page !== currentPage)
        router.push(buildUrl(pathname, filters, page, ordering), {
          scroll: false,
        });
    },
    [currentPage, filters, ordering, pathname, router, totalPages],
  );
  const changeSort = (next: string) =>
    router.push(buildUrl(pathname, filters, 1, next), { scroll: false });

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12 text-slate-800">
      <div className="mx-auto w-full max-w-[1720px] px-3 pt-8 sm:px-5 sm:pt-5 lg:px-7">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#2879ef]">
              NestBuddy property directory
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Find a place
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Explore places that fit your needs, budget, and lifestyle.
            </p>
          </div>
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-500">
              Available listings
            </p>
            <p className="text-sm font-bold text-[#1f6fdd]">
              {loading ? "Updating…" : `${total.toLocaleString()} places`}
            </p>
          </div>
        </header>
        <PropertySearchFilters
          filters={filters}
          onApply={applyFilters}
          totalProperties={total}
        />
        <section className="mt-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Property results
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {loading
                  ? "Updating listings…"
                  : `${total.toLocaleString()} ${total === 1 ? "place" : "places"} found`}
              </p>
            </div>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600">
              <FiSliders className="text-[#2879ef]" />
              <span className="sr-only">Sort listings</span>
              <select
                value={ordering}
                onChange={(event) => changeSort(event.target.value)}
                className="bg-transparent outline-none"
              >
                <option value="-created_at">Newest first</option>
                <option value="created_at">Oldest first</option>
                <option value="price">Price: low to high</option>
                <option value="-price">Price: high to low</option>
                <option value="-views_count">Most viewed</option>
              </select>
            </label>
          </div>
          {loading ? (
            <PropertySkeletons />
          ) : error ? (
            <div
              role="alert"
              className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-rose-100 bg-white px-6 py-12 text-center shadow-sm"
            >
              <FiAlertCircle className="mb-4 text-rose-500" size={28} />
              <h3 className="text-lg font-bold text-slate-900">
                Unable to load properties
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{error}</p>
              <button
                type="button"
                onClick={() => setRetry((value) => value + 1)}
                className="mt-5 rounded-lg bg-[#2879ef] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1467dc]"
              >
                Try again
              </button>
            </div>
          ) : properties.length === 0 ? (
            <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
              <FiHome className="mb-4 text-[#2879ef]" size={32} />
              <h3 className="text-xl font-bold text-slate-900">
                No places found
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                We couldn’t find properties matching your current filters. Try
                widening your search.
              </p>
              <button
                type="button"
                onClick={() => applyFilters({})}
                className="mt-5 rounded-lg border border-blue-200 px-5 py-2.5 text-sm font-bold text-[#2879ef] hover:bg-blue-50"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {properties.map((property) => (
                  <DirectoryPropertyCard
                    key={property.id}
                    property={property}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <nav
                  aria-label="Property result pages"
                  className="mt-8 flex justify-center"
                >
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={changePage}
                    isLoading={loading}
                  />
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
