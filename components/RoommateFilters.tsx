"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiFilter, FiSearch, FiX } from "react-icons/fi";
import { fetchRoommateFilterOptions, type RoommateFilterOptions } from "@/utils/api";

export interface RoommateFiltersState {
    search_name?: string;
    city?: string;
    preferred_city?: string;
    school?: string;
    department?: string;
    min_budget?: string;
    max_budget?: string;
    preferred_age_min?: string;
    preferred_age_max?: string;
    seeking?: string;
    preferred_tribe?: string;
    preferred_gender?: string;
    preferred_religion?: string;
    max_roommates?: string;
    interests?: string[];
    user_type?: string;
    level?: string;
    profession?: string;
    state_of_origin?: string;
    min_compatibility?: string;
}

interface RoommateFiltersProps {
    filters: RoommateFiltersState;
    onFilterChange: (filters: RoommateFiltersState) => void;
    totalMatches: number;
}

type Option = { value: string; label: string };

const selectClass = "mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
const inputClass = selectClass;

function optionsFrom<T extends { name?: string; interest?: string }>(
    items: T[] | undefined,
    field: "name" | "interest" = "name",
): Option[] {
    return (items ?? []).flatMap((item) => {
        const label = item[field];
        return typeof label === "string" && label.trim()
            ? [{ value: label, label }]
            : [];
    });
}

function RoommateFilterControls({
    filters,
    onChange,
    options,
}: {
    filters: RoommateFiltersState;
    onChange: (key: keyof RoommateFiltersState, value: string | string[]) => void;
    options: Partial<RoommateFilterOptions>;
}) {
    const cities = optionsFrom(options.cities);
    const states = optionsFrom(options.states);
    const schools = optionsFrom(options.schools);
    const departments = optionsFrom(options.departments);
    const religions = optionsFrom(options.religions);
    const tribes = optionsFrom(options.tribes);
    const interests = optionsFrom(options.interests, "interest");

    const textField = (
        key: keyof RoommateFiltersState,
        label: string,
        placeholder: string,
        type = "text",
        props: { min?: number; max?: number; step?: number } = {},
    ) => (
        <label className="block text-sm font-medium text-slate-700" htmlFor={`roommate-${key}`}>
            {label}
            <input
                id={`roommate-${key}`}
                type={type}
                min={props.min}
                max={props.max}
                step={props.step}
                inputMode={type === "number" ? "numeric" : undefined}
                value={typeof filters[key] === "string" ? filters[key] as string : ""}
                onChange={(event) => onChange(key, event.target.value)}
                placeholder={placeholder}
                className={inputClass}
            />
        </label>
    );

    const selectField = (
        key: keyof RoommateFiltersState,
        label: string,
        choices: Option[],
        placeholder: string,
    ) => (
        <label className="block text-sm font-medium text-slate-700" htmlFor={`roommate-${key}`}>
            {label}
            <select
                id={`roommate-${key}`}
                value={typeof filters[key] === "string" ? filters[key] as string : ""}
                onChange={(event) => onChange(key, event.target.value)}
                className={selectClass}
            >
                <option value="">{placeholder}</option>
                {choices.map((choice) => (
                    <option key={choice.value} value={choice.value}>{choice.label}</option>
                ))}
            </select>
        </label>
    );

    return (
        <div className="space-y-6">
            <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Basics</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                    {textField("search_name", "Name", "Search by name")}
                    {selectField("preferred_city", "Preferred city", cities, "Any preferred city")}
                    {selectField("seeking", "Looking for", [
                        { value: "need_place", label: "Needs a place" },
                        { value: "have_place", label: "Has a place" },
                        { value: "both", label: "Either" },
                    ], "Any arrangement")}
                    {selectField("user_type", "Profile type", [
                        { value: "student", label: "Student" },
                        { value: "professional", label: "Professional" },
                    ], "All profiles")}
                </div>
            </div>

            <div className="space-y-6 border-t border-slate-200 pt-5">
                    <div>
                        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Preferences</h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {selectField("city", "Current city", cities, "Any current city")}
                            {selectField("state_of_origin", "State of origin", states, "Any state")}
                            {selectField("preferred_gender", "Gender", [
                                { value: "Male", label: "Male" },
                                { value: "Female", label: "Female" },
                            ], "Any gender")}
                            {selectField("preferred_religion", "Religion", religions, "Any religion")}
                            {selectField("preferred_tribe", "Tribe", tribes, "Any tribe")}
                            {textField("preferred_age_min", "Minimum age", "No minimum", "number", { min: 18 })}
                            {textField("preferred_age_max", "Maximum age", "No maximum", "number", { min: 18 })}
                            {textField("max_roommates", "Minimum roommate capacity", "Any number", "number", { min: 1 })}
                            {textField("min_compatibility", "Minimum match", "0–100", "number", { min: 0, max: 100 })}
                            <fieldset className="min-w-0 text-sm font-medium text-slate-700">
                                <legend>Interests</legend>
                                <details className="mt-1 rounded-xl border border-slate-200 bg-white shadow-sm">
                                    <summary className="cursor-pointer px-3 py-2.5 text-sm text-slate-600">
                                        {filters.interests?.length
                                            ? `${filters.interests.length} selected`
                                            : "Choose interests"}
                                    </summary>
                                    <div className="grid max-h-48 grid-cols-1 gap-1 overflow-y-auto border-t border-slate-100 p-2 sm:grid-cols-2">
                                        {interests.length > 0 ? interests.map((interest) => (
                                            <label key={interest.value} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-normal hover:bg-indigo-50">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.interests?.includes(interest.value) ?? false}
                                                    onChange={(event) => {
                                                        const selected = filters.interests ?? [];
                                                        onChange("interests", event.target.checked
                                                            ? [...selected, interest.value]
                                                            : selected.filter((item) => item !== interest.value));
                                                    }}
                                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span>{interest.label}</span>
                                            </label>
                                        )) : (
                                            <p className="col-span-full px-2 py-3 text-xs font-normal text-slate-500">No interest options are available.</p>
                                        )}
                                    </div>
                                </details>
                            </fieldset>
                        </div>
                    </div>

                    {filters.user_type === "student" && (
                        <div>
                            <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Student details</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {selectField("school", "School", schools, "Any school")}
                                {selectField("department", "Department", departments, "Any department")}
                                {textField("level", "Study level", "Any level")}
                            </div>
                        </div>
                    )}

                    {filters.user_type === "professional" && (
                        <div>
                            <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Professional details</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {textField("profession", "Profession", "Any profession")}
                            </div>
                        </div>
                    )}

                    <div>
                        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Maximum monthly budget</h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {textField("min_budget", "Minimum budget", "No minimum", "number", { min: 0 })}
                            {textField("max_budget", "Maximum budget", "No maximum", "number", { min: 0 })}
                        </div>
                    </div>
                </div>
        </div>
    );
}

function filterLabel(key: keyof RoommateFiltersState): string {
    const labels: Partial<Record<keyof RoommateFiltersState, string>> = {
        search_name: "Name",
        city: "Current city",
        preferred_city: "Preferred city",
        school: "School",
        department: "Department",
        min_budget: "Min budget",
        max_budget: "Max budget",
        preferred_age_min: "Min age",
        preferred_age_max: "Max age",
        seeking: "Looking for",
        preferred_tribe: "Tribe",
        preferred_gender: "Gender",
        preferred_religion: "Religion",
        max_roommates: "Roommates",
        user_type: "Profile type",
        level: "Study level",
        profession: "Profession",
        state_of_origin: "State of origin",
        min_compatibility: "Min match",
        interests: "Interest",
    };
    return labels[key] ?? key;
}

export default function RoommateFilters({ filters, onFilterChange, totalMatches }: RoommateFiltersProps) {
    const [options, setOptions] = useState<Partial<RoommateFilterOptions>>({});
    const [failedOptions, setFailedOptions] = useState<string[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [draft, setDraft] = useState<RoommateFiltersState>(filters);
    const [searchDraft, setSearchDraft] = useState(filters.search_name ?? "");
    const [optionsRetry, setOptionsRetry] = useState(0);
    const drawerRef = useRef<HTMLElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const latestFilters = useRef(filters);
    latestFilters.current = filters;

    useEffect(() => {
        let active = true;
        void fetchRoommateFilterOptions().then((loadedOptions) => {
            if (!active) return;
            setOptions(loadedOptions.options);
            setFailedOptions(loadedOptions.failed);
        }).catch((error: unknown) => {
            if (active) console.error("Unable to load roommate filter data", error);
        });
        return () => { active = false; };
    }, [optionsRetry]);

    useEffect(() => {
        setSearchDraft(filters.search_name ?? "");
        setDraft(filters);
    }, [filters]);

    useEffect(() => {
        if (!drawerOpen) return;
        closeRef.current?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setDrawerOpen(false);
            }
        };
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target;
            if (
                target instanceof Node
                && !drawerRef.current?.contains(target)
                && !triggerRef.current?.contains(target)
            ) {
                setDrawerOpen(false);
            }
        };
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("pointerdown", onPointerDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("pointerdown", onPointerDown);
            triggerRef.current?.focus();
        };
    }, [drawerOpen]);

    useEffect(() => () => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
    }, []);

    const activeFilters = useMemo(() => Object.entries(filters).flatMap(([key, value]) => {
        if (Array.isArray(value)) {
            return value.map((item) => ({ key: key as keyof RoommateFiltersState, value: item }));
        }
        return typeof value === "string" && value !== ""
            ? [{ key: key as keyof RoommateFiltersState, value }]
            : [];
    }), [filters]);

    const change = (key: keyof RoommateFiltersState, value: string | string[]) => {
        if (key === "search_name") {
            setSearchDraft(value as string);
            if (searchTimer.current) clearTimeout(searchTimer.current);
            searchTimer.current = setTimeout(() => {
                onFilterChange({ ...latestFilters.current, search_name: value as string });
            }, 350);
            return;
        }
        const next = { ...filters, [key]: value };
        if (value === "" || (Array.isArray(value) && value.length === 0)) delete next[key];
        onFilterChange(next);
    };

    const changeDraft = (key: keyof RoommateFiltersState, value: string | string[]) => {
        const next = { ...draft, [key]: value };
        if (value === "" || (Array.isArray(value) && value.length === 0)) delete next[key];
        setDraft(next);
    };

    const clearAll = () => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        setSearchDraft("");
        setDraft({});
        onFilterChange({});
    };

    const removeFilter = (key: keyof RoommateFiltersState, value: string) => {
        if (key === "search_name") setSearchDraft("");
        if (Array.isArray(filters[key])) {
            change(key, (filters[key] as string[]).filter((item) => item !== value));
        } else {
            change(key, "");
        }
    };

    const controls = (values: RoommateFiltersState, update: (key: keyof RoommateFiltersState, value: string | string[]) => void) => (
        <RoommateFilterControls filters={values} onChange={update} options={options} />
    );

    return (
        <section aria-label="Roommate search filters" className="w-full rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] divide-x divide-slate-200 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-[minmax(190px,1.25fr)_minmax(150px,1fr)_minmax(120px,.75fr)_minmax(130px,.8fr)_minmax(130px,.8fr)_auto_minmax(150px,1fr)]">
                <label className="flex min-w-0 items-center gap-2 px-3 py-2.5 text-slate-400">
                    <FiSearch className="shrink-0" aria-hidden="true" />
                    <span className="sr-only">Search by name</span>
                    <input value={searchDraft} onChange={(event) => change("search_name", event.target.value)} placeholder="Search name" className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400" />
                </label>
                <label className="hidden min-w-0 items-center gap-2 px-3 py-2.5 sm:flex">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Location</span>
                    <select value={filters.preferred_city ?? ""} onChange={(event) => change("preferred_city", event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700">
                        <option value="">Any city</option>
                        {optionsFrom(options.cities).map((city) => <option key={city.value} value={city.value}>{city.label}</option>)}
                    </select>
                </label>
                <label className="hidden min-w-0 items-center gap-2 px-3 py-2.5 sm:flex">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Budget</span>
                    <select value={filters.min_budget ?? ""} onChange={(event) => change("min_budget", event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700">
                        <option value="">Any</option><option value="50000">₦50k+</option><option value="100000">₦100k+</option><option value="200000">₦200k+</option>
                    </select>
                </label>
                <label className="hidden min-w-0 items-center gap-2 px-3 py-2.5 sm:flex">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Age</span>
                    <select value={filters.preferred_age_min ?? ""} onChange={(event) => change("preferred_age_min", event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700">
                        <option value="">Any</option><option value="18">18+</option><option value="21">21+</option><option value="25">25+</option><option value="30">30+</option>
                    </select>
                </label>
                <label className="hidden min-w-0 items-center gap-2 px-3 py-2.5 sm:flex">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Profile</span>
                    <select value={filters.user_type ?? ""} onChange={(event) => change("user_type", event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700">
                        <option value="">All</option><option value="student">Student</option><option value="professional">Professional</option>
                    </select>
                </label>
                <button
                    ref={triggerRef}
                    type="button"
                    onClick={() => { setDraft(filters); setDrawerOpen(!drawerOpen); }}
                    aria-haspopup="dialog"
                    aria-expanded={drawerOpen}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-[#bd8100] transition hover:bg-[#fff8e7] lg:border-l lg:border-slate-200"
                >
                    <FiFilter aria-hidden="true" />
                    Filters{activeFilters.length > 0 ? ` (${activeFilters.length})` : ""}
                </button>
                <p className="hidden items-center justify-center px-3 py-2 text-center text-xs font-semibold text-slate-500 sm:flex">
                    Results: <span className="ml-1 text-slate-800">{totalMatches.toLocaleString()} {totalMatches === 1 ? "roommate" : "roommates"}</span>
                </p>
            </div>

            {activeFilters.length > 0 && (
                <div className="mt-3 hidden flex-wrap gap-2 px-3 pb-3 sm:flex" aria-label="Active filters">
                    {activeFilters.map(({ key, value }, index) => (
                        <span key={`${key}-${value}-${index}`} className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 py-1 pl-3 pr-1.5 text-xs font-medium text-indigo-800">
                            {filterLabel(key)}: {value}
                            <button
                                type="button"
                                onClick={() => removeFilter(key, value)}
                                aria-label={`Remove ${filterLabel(key)} filter ${value}`}
                                className="rounded-full p-1 transition hover:bg-indigo-100"
                            >
                                <FiX aria-hidden="true" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {drawerOpen && (
                <aside
                    ref={drawerRef}
                    role="dialog"
                    aria-modal="false"
                    aria-labelledby="roommate-filter-title"
                    className="fixed bottom-0 right-0 top-16 z-40 flex w-[min(460px,92vw)] flex-col overflow-hidden border-l border-[#dce8f5] bg-white-1 shadow-[-12px_0_32px_rgba(16,43,80,0.14)] lg:top-[72px]"
                >
                        <header className="flex items-center justify-between border-b border-[#e8f0fa] bg-white px-5 py-4 text-[#35506f] sm:px-7">
                            <div>
                                <h2 id="roommate-filter-title" className="text-lg font-bold">Roommate filters</h2>
                                <p className="text-sm text-slate-500">Refine your results without leaving the directory.</p>
                            </div>
                            <button ref={closeRef} type="button" onClick={() => setDrawerOpen(false)} aria-label="Close filters" className="rounded-full p-2 text-[#35506f] hover:bg-[#f3f8ff] hover:text-[#2879ef]">
                                <FiX aria-hidden="true" size={20} />
                            </button>
                        </header>
                        <div className="border-b border-slate-200 px-5 py-3 sm:px-7">
                            {failedOptions.length > 0 && (
                                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status">
                                    <span>Some choices could not be loaded ({failedOptions.join(", ")}).</span>
                                    <button type="button" onClick={() => setOptionsRetry((attempt) => attempt + 1)} className="font-semibold underline underline-offset-2">Retry</button>
                                </div>
                            )}
                            <button type="button" onClick={() => setDraft({})} className="text-xs font-bold uppercase tracking-wide text-slate-500 hover:text-[#2879ef]">Clear draft filters</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
                            {controls(draft, changeDraft)}
                        </div>
                        <footer className="flex gap-3 border-t border-slate-200 p-4 sm:px-7">
                            <button type="button" onClick={clearAll} disabled={activeFilters.length === 0 && searchDraft === ""} className="flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                                Clear all
                            </button>
                            <button type="button" onClick={() => { onFilterChange(draft); setDrawerOpen(false); }} className="flex-1 rounded-lg bg-[#2879ef] px-4 py-3 text-sm font-semibold text-white-1 hover:bg-[#1467dc]">
                                Show matches
                            </button>
                        </footer>
                </aside>
            )}
        </section>
    );
}
