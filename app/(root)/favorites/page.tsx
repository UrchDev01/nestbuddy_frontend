"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiHeart, FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import AuthGuard from "@/app/hoc/AuthGuard";
import FavoritesTabs, { FavoritesTabType } from "@/components/favorites/FavoritesTabs";
import FavoritePropertyCard from "@/components/favorites/FavoritePropertyCard";
import FavoriteRoommateCard from "@/components/favorites/FavoriteRoommateCard";
import FavoritesEmptyState from "@/components/favorites/FavoritesEmptyState";
import FavoritesSkeleton from "@/components/favorites/FavoritesSkeleton";
import {
  fetchFavoriteProperties,
  fetchFavoriteRoommates,
  removeFavoriteProperty,
  removeFavoriteRoommate,
} from "@/utils/api";
import type { FavoritePropertyItem, FavoriteRoommateItem, Property } from "@/types";

function FavoritesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active tab state - initialize from URL query param if present
  const initialTab = searchParams.get("tab") === "roommates" ? "roommates" : "properties";
  const [activeTab, setActiveTab] = useState<FavoritesTabType>(initialTab);

  // Properties state
  const [properties, setProperties] = useState<FavoritePropertyItem[]>([]);
  const [propertiesCount, setPropertiesCount] = useState<number | undefined>(undefined);
  const [propertiesPage, setPropertiesPage] = useState(1);
  const [propertiesTotalPages, setPropertiesTotalPages] = useState(1);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);

  // Roommates state
  const [roommates, setRoommates] = useState<FavoriteRoommateItem[]>([]);
  const [roommatesCount, setRoommatesCount] = useState<number | undefined>(undefined);
  const [roommatesPage, setRoommatesPage] = useState(1);
  const [roommatesTotalPages, setRoommatesTotalPages] = useState(1);
  const [roommatesLoading, setRoommatesLoading] = useState(true);
  const [roommatesError, setRoommatesError] = useState<string | null>(null);

  // Toast notifications for removals and errors
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Update URL param when tab changes without full reload
  const handleTabChange = (newTab: FavoritesTabType) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(window.location.search);
    if (newTab === "roommates") {
      params.set("tab", "roommates");
    } else {
      params.delete("tab");
    }
    const newRelativePathQuery = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState(null, "", newRelativePathQuery);
  };

  // Load favorite properties
  const loadProperties = useCallback(async (page: number = 1) => {
    setPropertiesLoading(true);
    setPropertiesError(null);
    try {
      const response = await fetchFavoriteProperties(page, 9);
      if (response && response.status === "success" && response.data) {
        // Handle paginated data format
        const items: FavoritePropertyItem[] = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];
        const count = typeof response.data.count === "number" ? response.data.count : items.length;
        const totalPages = typeof response.data.total_pages === "number"
          ? response.data.total_pages
          : Math.ceil(count / 9) || 1;

        setProperties(items);
        setPropertiesCount(count);
        setPropertiesTotalPages(totalPages);
        setPropertiesPage(page);
      } else {
        throw new Error("Unable to load favorite properties.");
      }
    } catch (err: unknown) {
      console.error("Error loading favorite properties:", err);
      setPropertiesError(err instanceof Error ? err.message : "Couldn't load your saved properties. Please try again.");
    } finally {
      setPropertiesLoading(false);
    }
  }, []);

  // Load favorite roommates
  const loadRoommates = useCallback(async (page: number = 1) => {
    setRoommatesLoading(true);
    setRoommatesError(null);
    try {
      const response = await fetchFavoriteRoommates(page, 9);
      if (response && response.status === "success" && response.data) {
        const items: FavoriteRoommateItem[] = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];
        const count = typeof response.data.count === "number" ? response.data.count : items.length;
        const totalPages = typeof response.data.total_pages === "number"
          ? response.data.total_pages
          : Math.ceil(count / 9) || 1;

        setRoommates(items);
        setRoommatesCount(count);
        setRoommatesTotalPages(totalPages);
        setRoommatesPage(page);
      } else {
        throw new Error("Unable to load favorite roommates.");
      }
    } catch (err: unknown) {
      console.error("Error loading favorite roommates:", err);
      setRoommatesError(err instanceof Error ? err.message : "Couldn't load your saved roommates. Please try again.");
    } finally {
      setRoommatesLoading(false);
    }
  }, []);

  // Initial load for both categories to populate counts
  useEffect(() => {
    loadProperties(1);
    loadRoommates(1);
  }, [loadProperties, loadRoommates]);

  // Remove property favorite with optimistic update
  const handleRemoveProperty = async (favoriteId: number, propertyId: number) => {
    const previousProperties = [...properties];
    const previousCount = propertiesCount;

    // Optimistically remove from state
    setProperties((prev) => prev.filter((item) => item.id !== favoriteId && item.property !== propertyId));
    setPropertiesCount((prev) => (typeof prev === "number" ? Math.max(0, prev - 1) : 0));

    try {
      await removeFavoriteProperty(propertyId);
      showToast("Property removed from favorites.", "success");
    } catch (err: unknown) {
      console.error("Failed to remove favorite property:", err);
      // Rollback on error
      setProperties(previousProperties);
      setPropertiesCount(previousCount);
      showToast("Couldn't remove property from favorites. Please try again.", "error");
    }
  };

  // Remove roommate favorite with optimistic update
  const handleRemoveRoommate = async (favoriteId: number, userId: number) => {
    const previousRoommates = [...roommates];
    const previousCount = roommatesCount;

    // Optimistically remove from state
    setRoommates((prev) => prev.filter((item) => item.id !== favoriteId && item.user_id !== userId));
    setRoommatesCount((prev) => (typeof prev === "number" ? Math.max(0, prev - 1) : 0));

    try {
      await removeFavoriteRoommate(userId);
      showToast("Roommate removed from favorites.", "success");
    } catch (err: unknown) {
      console.error("Failed to remove favorite roommate:", err);
      // Rollback on error
      setRoommates(previousRoommates);
      setRoommatesCount(previousCount);
      showToast("Couldn't remove roommate from favorites. Please try again.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 pt-6">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-6 ">
        {/* Page Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-rose-500 mb-1">
              <FaHeart className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Saved Items
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
              My Favorites
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Keep track of the properties and roommates you&apos;re interested in.
            </p>
          </div>

          {/* Accessible Tabs */}
          <div className="shrink-0">
            <FavoritesTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              propertiesCount={propertiesCount}
              roommatesCount={roommatesCount}
            />
          </div>
        </div>

        {/* Informational Disclaimer Banner */}
        <div className="mt-4 rounded-xl bg-blue-50/70 border border-blue-100 p-3 text-xs text-[#1e5bb0] flex items-center gap-2">
          <FiAlertCircle className="h-4 w-4 shrink-0 text-[#2879ef]" />
          <span>
            <strong>Discovery notice:</strong> NestBuddy helps you discover accommodations and connect with roommates. Saved items are kept for your personal viewing and do not constitute a rental booking or property reservation.
          </span>
        </div>

        {/* Tab Content Section */}
        <div className="mt-6">
          {activeTab === "properties" ? (
            <section
              id="tabpanel-properties"
              role="tabpanel"
              aria-labelledby="tab-properties"
            >
              {propertiesLoading ? (
                <FavoritesSkeleton count={6} />
              ) : propertiesError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-8 text-center">
                  <FiAlertCircle className="mx-auto h-8 w-8 text-rose-500 mb-2" />
                  <p className="text-sm font-semibold text-rose-800">{propertiesError}</p>
                  <button
                    type="button"
                    onClick={() => loadProperties(propertiesPage)}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700"
                  >
                    <FiRefreshCw className="h-3.5 w-3.5" />
                    <span>Try again</span>
                  </button>
                </div>
              ) : properties.length === 0 ? (
                <FavoritesEmptyState type="properties" />
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {properties.map((item) => {
                      const prop: Property = item.property_details || (item as unknown as Property);
                      return (
                        <FavoritePropertyCard
                          key={item.id}
                          favoriteId={item.id}
                          property={prop}
                          onRemove={handleRemoveProperty}
                        />
                      );
                    })}
                  </div>

                  {/* Pagination for Properties */}
                  {propertiesTotalPages > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        disabled={propertiesPage <= 1}
                        onClick={() => loadProperties(propertiesPage - 1)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <span className="px-3 text-xs font-semibold text-slate-500">
                        Page {propertiesPage} of {propertiesTotalPages}
                      </span>
                      <button
                        type="button"
                        disabled={propertiesPage >= propertiesTotalPages}
                        onClick={() => loadProperties(propertiesPage + 1)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          ) : (
            <section
              id="tabpanel-roommates"
              role="tabpanel"
              aria-labelledby="tab-roommates"
            >
              {roommatesLoading ? (
                <FavoritesSkeleton count={6} />
              ) : roommatesError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-8 text-center">
                  <FiAlertCircle className="mx-auto h-8 w-8 text-rose-500 mb-2" />
                  <p className="text-sm font-semibold text-rose-800">{roommatesError}</p>
                  <button
                    type="button"
                    onClick={() => loadRoommates(roommatesPage)}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700"
                  >
                    <FiRefreshCw className="h-3.5 w-3.5" />
                    <span>Try again</span>
                  </button>
                </div>
              ) : roommates.length === 0 ? (
                <FavoritesEmptyState type="roommates" />
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {roommates.map((roommate) => (
                      <FavoriteRoommateCard
                        key={roommate.id}
                        roommate={roommate}
                        onRemove={handleRemoveRoommate}
                      />
                    ))}
                  </div>

                  {/* Pagination for Roommates */}
                  {roommatesTotalPages > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        disabled={roommatesPage <= 1}
                        onClick={() => loadRoommates(roommatesPage - 1)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <span className="px-3 text-xs font-semibold text-slate-500">
                        Page {roommatesPage} of {roommatesTotalPages}
                      </span>
                      <button
                        type="button"
                        disabled={roommatesPage >= roommatesTotalPages}
                        onClick={() => loadRoommates(roommatesPage + 1)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Floating Toast notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold shadow-xl transition-all ${
            toastMessage.type === "success"
              ? "bg-slate-900 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 rounded p-1 hover:bg-white/20"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProtectedFavoritesPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-slate-500">Loading your favorites...</div>}>
        <FavoritesContent />
      </Suspense>
    </AuthGuard>
  );
}
