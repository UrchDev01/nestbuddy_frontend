"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiFilter, FiSearch, FiX } from "react-icons/fi";
import { fetchPropertyFilterOptions } from "@/utils/api";
import type { PropertyFilter } from "@/types";
import {
  listingTypeOptions,
  propertyStatusOptions,
  propertyTypeOptions,
  rentalPeriodOptions,
} from "@/utils/options";

type Option = { value: string; label: string };
type FilterOptions = {
  states: Option[];
  cities: Option[];
  amenities: Option[];
};

const boolKeys = new Set<keyof PropertyFilter>([
  "accepts_pets",
  "accepts_students",
  "is_furnished",
  "bills_included",
]);
const labels: Record<keyof PropertyFilter, string> = {
  search: "Search",
  state: "State",
  city: "City",
  property_type: "Property",
  listing_type: "Listing",
  min_price: "Min price",
  max_price: "Max price",
  min_bedrooms: "Min beds",
  max_bedrooms: "Max beds",
  min_bathrooms: "Min baths",
  max_bathrooms: "Max baths",
  amenities: "Amenities",
  accepts_pets: "Accepts pets",
  accepts_students: "Accepts students",
  is_furnished: "Furnished",
  bills_included: "Bills included",
  available_from: "Available from",
  rental_period: "Rental period",
  property_status: "Status",
  ordering: "Sort",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold text-[#35506f]">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

export default function PropertySearchFilters({
  filters,
  onApply,
  totalProperties,
}: {
  filters: PropertyFilter;
  onApply: (filters: PropertyFilter) => void;
  totalProperties: number;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<PropertyFilter>(filters);
  const [search, setSearch] = useState(filters.search ?? "");
  const [options, setOptions] = useState<FilterOptions>({
    states: [],
    cities: [],
    amenities: [],
  });
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const queryKey = JSON.stringify(filters);

  useEffect(() => {
    setDraft(filters);
    setSearch(filters.search ?? "");
  }, [queryKey]);
  useEffect(() => {
    void fetchPropertyFilterOptions()
      .then((data) =>
        setOptions({
          states: (data.states ?? []).map((item: { name: string }) => ({
            value: item.name,
            label: item.name,
          })),
          cities: (data.cities ?? []).map((item: { name: string }) => ({
            value: item.name,
            label: item.name,
          })),
          amenities: (data.amenities ?? []).map(
            (item: { id: number; name: string }) => ({
              value: String(item.id),
              label: item.name,
            }),
          ),
        }),
      )
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search !== (filters.search ?? ""))
        onApply({
          ...filters,
          ...(search ? { search } : { search: undefined }),
        });
    }, 450);
    return () => window.clearTimeout(timer);
  }, [search, filters, onApply]);
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [drawerOpen]);

  const active = useMemo(
    () =>
      Object.entries(filters).filter(
        ([key, value]) =>
          key !== "ordering" &&
          value !== undefined &&
          value !== null &&
          value !== "",
      ) as [keyof PropertyFilter, string | boolean][],
    [filters],
  );
  const setDraftValue = (
    key: keyof PropertyFilter,
    value: string | boolean | undefined,
  ) => setDraft((previous) => ({ ...previous, [key]: value }));
  const remove = (key: keyof PropertyFilter) =>
    onApply({ ...filters, [key]: undefined });
  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white-1 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#2879ef] focus:ring-2 focus:ring-blue-100";

  return (
    <section
      aria-label="Property search filters"
      className="w-full rounded-lg border border-slate-200 bg-white-1 shadow-sm"
    >
      <div className="grid divide-y divide-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-[minmax(220px,1.35fr)_minmax(150px,.85fr)_minmax(150px,.85fr)_auto_minmax(155px,.8fr)]">
        <label className="flex min-w-0 items-center gap-2 px-3 py-2.5 text-slate-400">
          <FiSearch className="shrink-0" />
          <span className="sr-only">Search places</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search properties or location"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400"
          />
        </label>
        <label className="hidden min-w-0 items-center gap-2 px-3 py-2.5 md:flex">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Location
          </span>
          <select
            value={filters.city ?? ""}
            onChange={(event) =>
              onApply({ ...filters, city: event.target.value || undefined })
            }
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700"
          >
            <option value="">Any city</option>
            {options.cities.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="hidden min-w-0 items-center gap-2 px-3 py-2.5 md:flex">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Property
          </span>
          <select
            value={filters.property_type ?? ""}
            onChange={(event) =>
              onApply({
                ...filters,
                property_type: event.target.value || undefined,
              })
            }
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700"
          >
            <option value="">Any type</option>
            {propertyTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => {
            setDraft(filters);
            setDrawerOpen(true);
          }}
          aria-expanded={drawerOpen}
          aria-haspopup="dialog"
          className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-[#bd8100] transition hover:bg-[#fff8e7] lg:border-l lg:border-slate-200"
        >
          <FiFilter />
          Filters{active.length ? ` (${active.length})` : ""}
        </button>
        <p className="flex items-center justify-center px-3 py-2 text-center text-xs font-semibold text-slate-500">
          Results:{" "}
          <span className="ml-1 text-slate-800">
            {totalProperties.toLocaleString()} places
          </span>
        </p>
      </div>
      {active.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-3 py-3">
          <span className="text-xs font-semibold text-slate-500">Active:</span>
          {active.map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 py-1 pl-2.5 pr-1 text-xs font-semibold text-[#2879ef]"
            >
              {labels[key]}:{" "}
              {boolKeys.has(key) ? (value ? "Yes" : "No") : value}
              <button
                type="button"
                onClick={() => remove(key)}
                aria-label={`Remove ${labels[key]} filter`}
                className="rounded-full p-0.5 hover:bg-blue-100"
              >
                <FiX />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => onApply({})}
            className="ml-auto text-xs font-bold text-[#2879ef] hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
      {drawerOpen && (
        <div
          className="fixed inset-x-0 bottom-0 top-16 z-40 flex justify-end bg-slate-950/25 lg:top-[72px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDrawerOpen(false);
          }}
        >
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="property-filter-title"
            className="flex h-full w-full max-w-3xl flex-col overflow-hidden bg-white-1 shadow-2xl"
          >
            <header className="flex items-center justify-between bg-slate-800 px-5 py-4 text-white-1 sm:px-7">
              <div>
                <h2 id="property-filter-title" className="text-lg font-bold">
                  Find your place
                </h2>
                <p className="text-sm text-slate-300">
                  Set the details that matter for your next home.
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
                className="rounded-full p-2 text-slate-300 hover:bg-white-1/10 hover:text-white-1"
              >
                <FiX size={20} />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-5 sm:p-7">
              <div className="space-y-8">
                <section>
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-[.14em] text-[#4e75a3]">
                    Location
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="State">
                      <select
                        value={draft.state ?? ""}
                        onChange={(event) =>
                          setDraftValue(
                            "state",
                            event.target.value || undefined,
                          )
                        }
                        className={inputClass}
                      >
                        <option value="">Any state</option>
                        {options.states.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="City">
                      <select
                        value={draft.city ?? ""}
                        onChange={(event) =>
                          setDraftValue("city", event.target.value || undefined)
                        }
                        className={inputClass}
                      >
                        <option value="">Any city</option>
                        {options.cities.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </section>
                <section>
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-[.14em] text-[#4e75a3]">
                    Property
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Property type">
                      <select
                        value={draft.property_type ?? ""}
                        onChange={(event) =>
                          setDraftValue(
                            "property_type",
                            event.target.value || undefined,
                          )
                        }
                        className={inputClass}
                      >
                        <option value="">Any type</option>
                        {propertyTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Listing type">
                      <select
                        value={draft.listing_type ?? ""}
                        onChange={(event) =>
                          setDraftValue(
                            "listing_type",
                            event.target.value || undefined,
                          )
                        }
                        className={inputClass}
                      >
                        <option value="">Any listing</option>
                        {listingTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Status">
                      <select
                        value={draft.property_status ?? ""}
                        onChange={(event) =>
                          setDraftValue(
                            "property_status",
                            event.target.value || undefined,
                          )
                        }
                        className={inputClass}
                      >
                        <option value="">Any status</option>
                        {propertyStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Minimum bedrooms">
                      <input
                        inputMode="numeric"
                        value={draft.min_bedrooms ?? ""}
                        onChange={(event) =>
                          setDraftValue(
                            "min_bedrooms",
                            event.target.value.replace(/\D/g, "") || undefined,
                          )
                        }
                        className={inputClass}
                        placeholder="No minimum"
                      />
                    </Field>
                    <Field label="Minimum bathrooms">
                      <input
                        inputMode="numeric"
                        value={draft.min_bathrooms ?? ""}
                        onChange={(event) =>
                          setDraftValue(
                            "min_bathrooms",
                            event.target.value.replace(/\D/g, "") || undefined,
                          )
                        }
                        className={inputClass}
                        placeholder="No minimum"
                      />
                    </Field>
                    <Field label="Available from">
                      <input
                        type="date"
                        value={draft.available_from ?? ""}
                        onChange={(event) =>
                          setDraftValue(
                            "available_from",
                            event.target.value || undefined,
                          )
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </section>
                <section>
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-[.14em] text-[#4e75a3]">
                    Price & rental
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Minimum price">
                      <input
                        inputMode="numeric"
                        value={draft.min_price ?? ""}
                        onChange={(event) =>
                          setDraftValue(
                            "min_price",
                            event.target.value.replace(/\D/g, "") || undefined,
                          )
                        }
                        className={inputClass}
                        placeholder="₦ Minimum"
                      />
                    </Field>
                    <Field label="Maximum price">
                      <input
                        inputMode="numeric"
                        value={draft.max_price ?? ""}
                        onChange={(event) =>
                          setDraftValue(
                            "max_price",
                            event.target.value.replace(/\D/g, "") || undefined,
                          )
                        }
                        className={inputClass}
                        placeholder="₦ Maximum"
                      />
                    </Field>
                    <Field label="Rental period">
                      <select
                        value={draft.rental_period ?? ""}
                        onChange={(event) =>
                          setDraftValue(
                            "rental_period",
                            event.target.value || undefined,
                          )
                        }
                        className={inputClass}
                      >
                        <option value="">Any period</option>
                        {rentalPeriodOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </section>
                <section>
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-[.14em] text-[#4e75a3]">
                    Features
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {options.amenities.map((amenity) => {
                      const selected = (draft.amenities ?? "")
                        .split(",")
                        .filter(Boolean);
                      const checked = selected.includes(amenity.value);
                      return (
                        <label
                          key={amenity.value}
                          className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-[#35506f]"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setDraftValue(
                                "amenities",
                                (checked
                                  ? selected.filter(
                                      (value) => value !== amenity.value,
                                    )
                                  : [...selected, amenity.value]
                                ).join(",") || undefined,
                              )
                            }
                            className="h-4 w-4 accent-[#2879ef]"
                          />
                          {amenity.label}
                        </label>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4">
                    {(
                      [
                        ["accepts_pets", "Accepts pets"],
                        ["accepts_students", "Accepts students"],
                        ["is_furnished", "Furnished"],
                        ["bills_included", "Bills included"],
                      ] as const
                    ).map(([key, label]) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 text-sm font-medium text-[#35506f]"
                      >
                        <input
                          type="checkbox"
                          checked={draft[key] === true}
                          onChange={(event) =>
                            setDraftValue(
                              key,
                              event.target.checked ? true : undefined,
                            )
                          }
                          className="h-4 w-4 accent-[#2879ef]"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </section>
              </div>
            </div>
            <footer className="flex gap-3 border-t border-slate-200 p-4 sm:px-7">
              <button
                type="button"
                onClick={() => setDraft({})}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  onApply(draft);
                  setDrawerOpen(false);
                }}
                className="flex-1 rounded-lg bg-[#2879ef] px-4 py-3 text-sm font-semibold text-white-1 hover:bg-[#1467dc]"
              >
                Apply filters
              </button>
            </footer>
          </div>
        </div>
      )}
    </section>
  );
}
