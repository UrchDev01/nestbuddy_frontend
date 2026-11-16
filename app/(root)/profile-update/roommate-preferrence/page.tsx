"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import AuthGuard from "@/app/hoc/AuthGuard";
import { useRouter } from "next/navigation";
import {
        fetchCurrentProfile,
        updateProfileSection,
        fetchCities,
        fetchReligions,
        fetchTribes
} from "@/utils/api";
import { isAuthenticated } from "@/utils/auth";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Select from "@/components/ProfileUpdateSelect";
import ProfileUpdateLayout from "@/components/ProfileUpdateLayout";

interface FormValues {
        preferred_gender: string;
        preferred_religion: string;
        preferred_tribe: string;
        preferred_age_min: string;
        preferred_age_max: string;
        budget: string;
        preferred_city: string;
        accommodation_city: string;
        seeking: string;
        max_roommates: string
        preferred_city_name: string;
}

interface Option {
        value: string;
        label: string;
}

function getOptions(response: unknown, resourceName: string): Option[] {
        if (typeof response !== "object" || response === null) {
                throw new Error(`Could not load ${resourceName}.`);
        }

        const payload = (response as { data?: unknown }).data;
        const records = Array.isArray(payload)
                ? payload
                : typeof payload === "object" && payload !== null && "results" in payload
                        ? (payload as { results: unknown }).results
                        : null;

        if (!Array.isArray(records)) {
                throw new Error(`Could not load ${resourceName}.`);
        }

        return records
                .filter((record): record is { id: string | number; name: string } =>
                        typeof record === "object" &&
                        record !== null &&
                        "id" in record &&
                        (typeof record.id === "string" || typeof record.id === "number") &&
                        "name" in record &&
                        typeof record.name === "string" &&
                        record.name.trim().length > 0
                )
                .map((record) => ({ value: String(record.id), label: record.name }));
}


const page = () => {

        const [formValues, setFormValues] = useState<FormValues>({
                preferred_gender: "",
                preferred_age_min: "",
                preferred_age_max: "",
                preferred_tribe: "",
                preferred_religion: "",
                budget: "",
                preferred_city: "",
                accommodation_city: "",
                seeking: "",
                max_roommates: "",
                preferred_city_name: ""
        });

        const [cities, setCities] = useState<Option[]>([]);
        const [religions, setReligions] = useState<Option[]>([]);
        const [tribes, setTribes] = useState<Option[]>([]);
        const [isLoading, setIsLoading] = useState(false);
        const [errorMessage, setErrorMessage] = useState<string | null>(null);
        const [successMessage, setSuccessMessage] = useState<string | null>(null);
        const [hasAccommodationAvailable, setHasAccommodationAvailable] = useState(false);



        const router = useRouter();

        useEffect(() => {
                const getCurrentProfileId = async () => {
                        const checkAuth = await isAuthenticated()
                        if (!checkAuth) {
                                router.push('/login')
                                return
                        }
                        try {
                                const [tribeData, citiesData, religionsData] = await Promise.all([
                                        fetchTribes(),
                                        fetchCities(),
                                        fetchReligions(),
                                ]);

                                setTribes(getOptions(tribeData, "tribes"));
                                setCities(getOptions(citiesData, "cities"));
                                setReligions(getOptions(religionsData, "religions"));
                        } catch (error) {
                                console.error("Error loading roommate preference options:", error);
                                setErrorMessage(
                                        error instanceof Error
                                                ? error.message
                                                : "Unable to load roommate preference options. Please try again."
                                );
                        }

                        try {
                                const profile = await fetchCurrentProfile();
                                const preferences = profile?.roommate_preferences;
                                if (preferences) {
                                        setHasAccommodationAvailable(Boolean(preferences.accommodation_city));
                                        setFormValues({
                                                preferred_gender: preferences.preferred_gender || "",
                                                preferred_age_min: preferences.preferred_age_min
                                                        ? String(preferences.preferred_age_min)
                                                        : "",
                                                preferred_age_max: preferences.preferred_age_max
                                                        ? String(preferences.preferred_age_max)
                                                        : "",
                                                budget: preferences.budget ? String(preferences.budget) : "",
                                                seeking: preferences.seeking || "",
                                                preferred_city: preferences.preferred_city
                                                        ? String(preferences.preferred_city)
                                                        : "",
                                                accommodation_city: preferences.accommodation_city
                                                        ? String(preferences.accommodation_city)
                                                        : "",
                                                preferred_city_name: preferences.preferred_city_name || "",
                                                preferred_religion: preferences.preferred_religion
                                                        ? String(preferences.preferred_religion)
                                                        : "",
                                                preferred_tribe: preferences.preferred_tribe
                                                        ? String(preferences.preferred_tribe)
                                                        : "",
                                                max_roommates: preferences.max_roommates
                                                        ? String(preferences.max_roommates)
                                                        : "",
                                        });
                                }
                        } catch (error) {
                                console.error("Error loading roommate preferences:", error);
                                setErrorMessage("Unable to load your saved roommate preferences.");
                        }
                }

                getCurrentProfileId()
        }, [])

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const { name, value, type } = e.target;
                const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

                setFormValues({
                        ...formValues,
                        [name]: type === "checkbox" ? checked : value,
                });
        };


        const handleFormSubmit = async (e: React.FormEvent) => {
                e.preventDefault();
                setIsLoading(true);
                setErrorMessage(null);
                setSuccessMessage(null);

                if ((formValues.seeking === "need_place" || formValues.seeking === "both") && !formValues.preferred_city) {
                        setErrorMessage("Please select the city where you want to find accommodation.");
                        setIsLoading(false);
                        return;
                }
                if (formValues.seeking === "have_place" && !formValues.accommodation_city) {
                        setErrorMessage("Please select the city where your accommodation is located.");
                        setIsLoading(false);
                        return;
                }

                try {
                        const demoFormData = new FormData();
                        demoFormData.append("section", "roommate");
                        demoFormData.append("budget", formValues.budget || "");
                        demoFormData.append("seeking", formValues.seeking);
                        demoFormData.append("preferred_gender", formValues.preferred_gender || "");
                        demoFormData.append("preferred_tribe", formValues.preferred_tribe || "");
                        demoFormData.append("preferred_religion", formValues.preferred_religion || "");
                        demoFormData.append("preferred_age_min", formValues.preferred_age_min || "");
                        demoFormData.append("preferred_age_max", formValues.preferred_age_max || "");
                        // Omit empty city values on PATCH so changing a status never erases
                        // a city saved for another arrangement.
                        if (formValues.preferred_city) demoFormData.append("preferred_city", formValues.preferred_city);
                        if (formValues.accommodation_city) demoFormData.append("accommodation_city", formValues.accommodation_city);

                        demoFormData.append("max_roommates", formValues.max_roommates || "");

                        const demoResponse = await updateProfileSection("roommate", demoFormData);

                        if (demoResponse.status === "success") {
                                setSuccessMessage("Profile updated successfully!");
                        } else if (demoResponse?.error) {
                                const error = demoResponse.error;
                                setErrorMessage(typeof error === "string" ? error : Object.values(error).flat().join(" "));
                        }

                } catch (error: any) {
                        setErrorMessage("An unexpected error occurred. Please try again.");
                        console.error("Error updating profile:", error);
                } finally {
                        setIsLoading(false);
                }
        };






        return (
                <ProfileUpdateLayout
                        title="Roommate preferences"
                        description="Set your budget, location, and the roommate preferences that matter most to you."
                >
                                        <form onSubmit={handleFormSubmit} className="w-full flex flex-col gap-6 text-slate-700">
                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="budget" className="font-semibold text-white-1">Budget</label>
                                                        <Input

                                                                type="number"
                                                                name="budget"
                                                                value={formValues.budget}
                                                                placeholder="Enter your budget"
                                                                handleOnchange={handleInputChange}
                                                        />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="preferred_age_min" className="font-semibold text-white-1">
                                                                Max Roommates
                                                        </label>
                                                        <select
                                                                id="max_roommates"
                                                                name="max_roommates"
                                                                value={formValues.max_roommates || ""}
                                                                onChange={(e) =>
                                                                        setFormValues({ ...formValues, max_roommates: e.target.value })
                                                                }
                                                                className="w-full p-3 border rounded text-black-1"
                                                        >
                                                                <option value="">Select maximum roommates</option>
                                                                {Array.from({ length: 4 }, (_, i) => 1 + i).map((age) => (
                                                                        <option key={age} value={age}>
                                                                                {age}
                                                                        </option>
                                                                ))}
                                                        </select>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="gender" className="font-semibold text-white-1">Preferred Gender</label>
                                                        <Select
                                                                id="preferred_gender"
                                                                name="preferred_gender"
                                                                value={
                                                                        formValues.preferred_gender
                                                                                ? { value: formValues.preferred_gender, label: formValues.preferred_gender }
                                                                                : null
                                                                }
                                                                onChange={(selected) =>
                                                                        setFormValues({ ...formValues, preferred_gender: selected?.value || "" })
                                                                }
                                                                options={[
                                                                        { value: "Male", label: "Male" },
                                                                        { value: "Female", label: "Female" },
                                                                ]}
                                                                placeholder="Select Gender"
                                                                isSearchable
                                                                className="text-black-1"
                                                        />

                                                </div>

                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="preferred_age_min" className="font-semibold text-white-1">
                                                                Minimum Age
                                                        </label>
                                                        <select
                                                                id="preferred_age_min"
                                                                name="preferred_age_min"
                                                                value={formValues.preferred_age_min || ""}
                                                                onChange={(e) =>
                                                                        setFormValues({ ...formValues, preferred_age_min: e.target.value })
                                                                }
                                                                className="w-full p-3 border rounded text-black-1"
                                                        >
                                                                <option value="">Select minimum age</option>
                                                                {Array.from({ length: 105 }, (_, i) => 16 + i).map((age) => (
                                                                        <option key={age} value={age}>
                                                                                {age}
                                                                        </option>
                                                                ))}
                                                        </select>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="preferred_age_max" className="font-semibold text-white-1">
                                                                Maximum Age
                                                        </label>
                                                        <select
                                                                id="preferred_age_max"
                                                                name="preferred_age_max"
                                                                value={formValues.preferred_age_max || ""}
                                                                onChange={(e) =>
                                                                        setFormValues({ ...formValues, preferred_age_max: e.target.value })
                                                                }
                                                                className="w-full p-3 border rounded text-black-1"
                                                        >
                                                                <option value="">Select maximum age</option>
                                                                {Array.from({ length: 105 }, (_, i) => 16 + i).map((age) => (
                                                                        <option key={age} value={age}>
                                                                                {age}
                                                                        </option>
                                                                ))}
                                                        </select>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="seeking" className="font-semibold text-white-1">
                                                                Accommodation arrangement
                                                        </label>
                                                        <select
                                                                id="seeking"
                                                                name="seeking"
                                                                value={formValues.seeking || ""}
                                                                onChange={(e) =>
                                                                        setFormValues({ ...formValues, seeking: e.target.value })
                                                                }
                                                                className="w-full p-3 border rounded text-black-1"
                                                        >
                                                                <option value="">Select an option</option>
                                                                <option value="have_place">I have a place — looking for someone to share it with</option>
                                                                <option value="need_place">I need accommodation — looking for a place and roommate</option>
                                                                <option value="both">Open to either — share a place or find one together</option>
                                                                <option value="none">Not looking right now — not currently searching</option>
                                                        </select>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="tribe" className="font-semibold text-white-1">Preferred Tribe</label>
                                                        <Select
                                                                id="tribe"
                                                                name="tribe"
                                                                value={tribes.find((t) => t.value === formValues.preferred_tribe) || null}
                                                                onChange={(selected) =>
                                                                        setFormValues({ ...formValues, preferred_tribe: selected?.value || "" })
                                                                }
                                                                options={tribes}
                                                                placeholder="Select Tribe"
                                                                isSearchable
                                                                className="text-black-1"
                                                        />
                                                </div>



                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="religion" className="font-semibold text-white-1">Preferred Religion</label>
                                                        <Select
                                                                id="religion"
                                                                name="religion"
                                                                value={religions.find((r) => r.value === formValues.preferred_religion) || null}
                                                                onChange={(selected) =>
                                                                        setFormValues({ ...formValues, preferred_religion: selected?.value || "" })
                                                                }
                                                                options={religions}
                                                                placeholder="Select Religion"
                                                                isSearchable
                                                                className="text-black-1"
                                                        />
                                                </div>



                                                {(formValues.seeking === "need_place" || formValues.seeking === "both") && <div className="flex flex-col gap-2">
                                                        <label htmlFor="preferred_city" className="font-semibold text-white-1">
                                                                {formValues.seeking === "need_place" ? "Which city are you looking to live in?" : "Which city would you prefer to live in?"}
                                                        </label>
                                                        <Select
                                                                id="preferred_city"
                                                                name="preferred_city"
                                                                value={cities.find((c) => c.value === String(formValues.preferred_city)) || null}
                                                                onChange={(selected) =>
                                                                        setFormValues({ ...formValues, preferred_city: selected?.value || "" })
                                                                }
                                                                options={cities}
                                                                placeholder="Select a city"
                                                                isSearchable
                                                                className="text-black-1"
                                                        />
                                                        <p className="text-sm text-slate-400">
                                                                {formValues.seeking === "need_place" ? "Select the city where you want to find accommodation." : "Select your preferred city. If you also have accommodation available, you can optionally provide its location."}
                                                        </p>
                                                </div>}
                                                {formValues.seeking === "both" && (
                                                        <label className="flex items-center gap-2 text-sm text-white-1">
                                                                <input type="checkbox" checked={hasAccommodationAvailable} onChange={(event) => setHasAccommodationAvailable(event.target.checked)} />
                                                                Do you also have accommodation available?
                                                        </label>
                                                )}
                                                {(formValues.seeking === "have_place" || (formValues.seeking === "both" && hasAccommodationAvailable)) && (
                                                        <div className="flex flex-col gap-2">
                                                                <label htmlFor="accommodation_city" className="font-semibold text-white-1">
                                                                        Which city is your accommodation located in?
                                                                </label>
                                                                <Select
                                                                        id="accommodation_city"
                                                                        name="accommodation_city"
                                                                        value={cities.find((c) => c.value === String(formValues.accommodation_city)) || null}
                                                                        onChange={(selected) =>
                                                                                setFormValues({ ...formValues, accommodation_city: selected?.value || "" })
                                                                        }
                                                                        options={cities}
                                                                        placeholder="Select accommodation city"
                                                                        isSearchable
                                                                        className="text-black-1"
                                                                />
                                                                <p className="text-sm text-slate-400">
                                                                        Select the city where your existing accommodation is located. This may be different from where you currently live.
                                                                </p>
                                                        </div>
                                                )}

                                                {errorMessage && <div className="text-red-500 bg-white-1 border border-red-500 p-2 rounded">{errorMessage}</div>}

                                                <Button
                                                        title="Update Profile"
                                                        containerStyles="bg-gray-2 text-white-1 p-3 rounded-lg mt-5"
                                                        isLoading={isLoading}
                                                        isLoadingText="Updating..."
                                                        handleClick={handleFormSubmit}


                                                />
                                                {successMessage && (
                                                        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                                                {successMessage}
                                                        </p>
                                                )}

                                        </form>
                </ProfileUpdateLayout>
        )
}

export default page
