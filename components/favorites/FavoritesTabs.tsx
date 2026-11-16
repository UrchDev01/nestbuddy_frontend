"use client";

import React from "react";
import { FiHome, FiUsers } from "react-icons/fi";

export type FavoritesTabType = "properties" | "roommates";

interface FavoritesTabsProps {
  activeTab: FavoritesTabType;
  onTabChange: (tab: FavoritesTabType) => void;
  propertiesCount?: number;
  roommatesCount?: number;
}

export default function FavoritesTabs({
  activeTab,
  onTabChange,
  propertiesCount,
  roommatesCount,
}: FavoritesTabsProps) {
  const tabs = [
    {
      id: "properties" as FavoritesTabType,
      label: "Properties",
      icon: FiHome,
      count: propertiesCount,
    },
    {
      id: "roommates" as FavoritesTabType,
      label: "Roommates",
      icon: FiUsers,
      count: roommatesCount,
    },
  ];

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (index + 1) % tabs.length;
      onTabChange(tabs[nextIndex].id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      onTabChange(tabs[prevIndex].id);
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Favorites sections"
      className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-100 p-1.5 border border-slate-200/80 shadow-inner"
    >
      {tabs.map((tab, idx) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef] focus-visible:ring-offset-2 ${
              isActive
                ? "bg-[#2879ef] text-white shadow-sm shadow-[#2879ef]/25"
                : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
            }`}
          >
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span
                className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold leading-none ${
                  isActive
                    ? "bg-white/25 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
