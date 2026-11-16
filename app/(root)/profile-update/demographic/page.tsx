"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import AuthGuard from "@/app/hoc/AuthGuard";
import { useRouter } from "next/navigation";
import {
        fetchCurrentProfile,
        updateProfileSection,
        fetchStates,
        fetchCities,
        fetchReligions,
        fetchInterests,
        fetchTribes
} from "@/utils/api";
import { isAuthenticated } from "@/utils/auth";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Select from "@/components/ProfileUpdateSelect";
import ProfileUpdateLayout from "@/components/ProfileUpdateLayout";

interface FormValues {
        gender: string;
        religion: string;
        tribe: string;
        date_of_birth: string;
        state_of_origin: string;
        state_of_residence: string;
        current_city: string;
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
                gender: "",
                date_of_birth: "",
                tribe: "",
                religion: "",
                state_of_origin: "",
                state_of_residence: "",
                current_city: ""
        });

        const [states, setStates] = useState<Option[]>([]);
        const [cities, setCities] = useState<Option[]>([]);
        const [religions, setReligions] = useState<Option[]>([]);
        const [tribes, setTribes] = useState<Option[]>([]);
        const [isLoading, setIsLoading] = useState(false);
        const [errorMessage, setErrorMessage] = useState<string | null>(null);
        const [successMessage, setSuccessMessage] = useState<string | null>(null);



        const router = useRouter();

        useEffect(() => {
                const getCurrentProfileId = async () => {
                        const checkAuth = await isAuthenticated()
                        if (!checkAuth) {
                                router.push('/login')
                                return
                        }
                        try {
                                const [profile, statesData, tribeData, citiesData, religionsData] = await Promise.all([
                                        fetchCurrentProfile(),
                                        fetchStates(),
                                        fetchTribes(),
                                        fetchCities(),
                                        fetchReligions(),
                                ]);

                                const stateOptions = getOptions(statesData, "states");
                                const tribeOptions = getOptions(tribeData, "tribes");
                                const cityOptions = getOptions(citiesData, "cities");
                                const religionOptions = getOptions(religionsData, "religions");
                                setStates(stateOptions);
                                setTribes(tribeOptions);
                                setCities(cityOptions);
                                setReligions(religionOptions);

                                const demographic = profile?.demographic;
                                if (demographic) {
                                        setFormValues({
                                                gender: demographic.gender || "",
                                                date_of_birth: demographic.date_of_birth
                                                        ? demographic.date_of_birth.toString()
                                                        : "",
                                                religion: demographic.religion ? String(demographic.religion) : "",
                                                state_of_origin: demographic.state_of_origin
                                                        ? String(demographic.state_of_origin)
                                                        : "",
                                                state_of_residence: demographic.state_of_residence
                                                        ? String(demographic.state_of_residence)
                                                        : "",
                                                current_city: demographic.current_city
                                                        ? String(demographic.current_city)
                                                        : "",
                                                tribe: demographic.tribe ? String(demographic.tribe) : "",
                                        });
                                }
                        } catch (error) {
                                console.error("Error loading demographic profile options:", error);
                                setErrorMessage(
                                        error instanceof Error
                                                ? error.message
                                                : "Unable to load demographic options. Please try again."
                                );
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

                try {
                        const demoFormData = new FormData();
                        demoFormData.append("section", "demographic");
                        demoFormData.append("date_of_birth", formValues.date_of_birth); // "2000-05-15"
                        demoFormData.append("gender", formValues.gender || "");
                        demoFormData.append("tribe", formValues.tribe || "");
                        demoFormData.append("religion", formValues.religion || "");
                        demoFormData.append("state_of_origin", formValues.state_of_origin || "");
                        demoFormData.append("state_of_residence", formValues.state_of_residence || "");
                        demoFormData.append("current_city", formValues.current_city || "");

                        const demoResponse = await updateProfileSection("demographic", demoFormData);

                        if (demoResponse.status === "success") {
                                setSuccessMessage("Profile updated successfully!");
                        } else if (demoResponse.error) {
                                setErrorMessage(demoResponse.error || "Failed to update profile.");
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
                        title="Demographic information"
                        description="Add and update the personal details that help your NestBuddy profile feel complete."
                >
                                        <form onSubmit={handleFormSubmit} className="w-full flex flex-col gap-6 text-slate-700">
                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="gender" className="font-semibold text-white-1">Gender</label>
                                                        <Select
                                                                id="gender"
                                                                name="gender"
                                                                value={
                                                                        formValues.gender
                                                                                ? { value: formValues.gender, label: formValues.gender }
                                                                                : null
                                                                }
                                                                onChange={(selected) =>
                                                                        setFormValues({ ...formValues, gender: selected?.value || "" })
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
                                                        <label htmlFor="date_of_birth" className="font-semibold text-white-1">
                                                                Date of Birth
                                                        </label>
                                                        <input
                                                                type="date"
                                                                id="date_of_birth"
                                                                name="date_of_birth"
                                                                value={formValues.date_of_birth || ""}
                                                                onChange={(e) =>
                                                                        setFormValues({ ...formValues, date_of_birth: e.target.value })
                                                                }
                                                                className="w-full p-3 border rounded text-black-1"
                                                        />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="tribe" className="font-semibold text-white-1">Tribe</label>
                                                        <Select
                                                                id="tribe"
                                                                name="tribe"
                                                                value={tribes.find((t) => t.value === formValues.tribe) || null}
                                                                onChange={(selected) =>
                                                                        setFormValues({ ...formValues, tribe: selected?.value || "" })
                                                                }
                                                                options={tribes}
                                                                placeholder="Select Tribe"
                                                                isSearchable
                                                                className="text-black-1"
                                                        />
                                                </div>



                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="religion" className="font-semibold text-white-1">Religion</label>
                                                        <Select
                                                                id="religion"
                                                                name="religion"
                                                                value={religions.find((r) => r.value === formValues.religion) || null}
                                                                onChange={(selected) =>
                                                                        setFormValues({ ...formValues, religion: selected?.value || "" })
                                                                }
                                                                options={religions}
                                                                placeholder="Select Religion"
                                                                isSearchable
                                                                className="text-black-1"
                                                        />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="state_of_origin" className="font-semibold text-white-1">State of Origin</label>
                                                        <Select
                                                                id="state_of_origin"
                                                                name="state_of_origin"
                                                                value={states.find((s) => s.value === formValues.state_of_origin) || null}
                                                                onChange={(selected) =>
                                                                        setFormValues({ ...formValues, state_of_origin: selected?.value || "" })
                                                                }
                                                                options={states}
                                                                placeholder="Select State of Origin"
                                                                isSearchable
                                                                className="text-black-1"
                                                        />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="state_of_residence" className="font-semibold text-white-1">State of Residence</label>
                                                        <Select
                                                                id="state_of_residence"
                                                                name="state_of_residence"
                                                                value={states.find((s) => s.value === formValues.state_of_residence) || null}
                                                                onChange={(selected) =>
                                                                        setFormValues({ ...formValues, state_of_residence: selected?.value || "" })
                                                                }
                                                                options={states}
                                                                placeholder="Select State of Residence"
                                                                isSearchable
                                                                className="text-black-1"
                                                        />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="current_city" className="font-semibold text-white-1">Current City</label>
                                                        <Select
                                                                id="current_city"
                                                                name="current_city"
                                                                value={cities.find((c) => c.value === formValues.current_city) || null}
                                                                onChange={(selected) =>
                                                                        setFormValues({ ...formValues, current_city: selected?.value || "" })
                                                                }
                                                                options={cities}
                                                                placeholder="Select Current City"
                                                                isSearchable
                                                                className="text-black-1"
                                                        />
                                                </div>

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