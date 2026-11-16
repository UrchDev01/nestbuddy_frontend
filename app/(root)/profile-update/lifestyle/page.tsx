"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
        fetchCurrentProfile,
        updateProfileSection,
        fetchInterests

} from "@/utils/api";
import { isAuthenticated } from "@/utils/auth";
import Button from "@/components/Button";
import AuthGuard from "@/app/hoc/AuthGuard";
import ProfileUpdateLayout from "@/components/ProfileUpdateLayout";

interface FormValues {
        hobbies: string[];
}

interface Option {
        value: string;
        label: string;
}

function getHobbyOptions(response: unknown): Option[] {
        if (typeof response !== "object" || response === null) {
                throw new Error("Unable to load hobbies. Please try again.");
        }

        const payload = (response as { data?: unknown }).data;
        const records = Array.isArray(payload)
                ? payload
                : typeof payload === "object" && payload !== null && "results" in payload
                        ? (payload as { results: unknown }).results
                        : null;

        if (!Array.isArray(records)) {
                throw new Error("Unable to load hobbies. Please try again.");
        }

        return records
                .filter((record): record is { id: string | number; interest: string } =>
                        typeof record === "object" &&
                        record !== null &&
                        "id" in record &&
                        (typeof record.id === "string" || typeof record.id === "number") &&
                        "interest" in record &&
                        typeof record.interest === "string" &&
                        record.interest.trim().length > 0
                )
                .map((record) => ({ value: String(record.id), label: record.interest }));
}



const LifestyleProfileUpdate = () => {
        const [formValues, setFormValues] = useState<FormValues>({
                hobbies: [],
        });


        const [hobbies, setHobbies] = useState<Option[]>([]);
        const [isLoading, setIsLoading] = useState(false);
        const [isLoadingHobbies, setIsLoadingHobbies] = useState(true);
        const [errorMessage, setErrorMessage] = useState<string | null>(null);
        const [successMessage, setSuccessMessage] = useState<string | null>(null);
        const router = useRouter();

        useEffect(() => {
                const getCurrentProfile = async () => {
                        const checkAuth = await isAuthenticated()
                        if (!checkAuth) {
                                router.push('/login')
                                return
                        }
                        try {
                                const interestData = await fetchInterests();
                                setHobbies(getHobbyOptions(interestData));
                        } catch (error) {
                                console.error("Error loading hobbies:", error);
                                setErrorMessage(
                                        error instanceof Error
                                                ? error.message
                                                : "Unable to load hobbies. Please try again."
                                );
                        } finally {
                                setIsLoadingHobbies(false);
                        }

                        try {
                                const profile = await fetchCurrentProfile();
                                const savedHobbies = profile?.lifestyle?.hobbies;
                                if (Array.isArray(savedHobbies)) {
                                        setFormValues({
                                                hobbies: savedHobbies.map((hobby: string | number) => String(hobby)),
                                        });
                                }
                        } catch (error) {
                                console.error("Error loading saved hobbies:", error);
                        }
                }

                getCurrentProfile()
        }, [])




        const handleHobbyClick = (hobbyId: string) => {
                if (formValues.hobbies.includes(hobbyId)) {
                        setFormValues({
                                ...formValues,
                                hobbies: formValues.hobbies.filter((id) => id !== hobbyId),
                        });
                } else {
                        setFormValues({
                                ...formValues,
                                hobbies: [...formValues.hobbies, hobbyId],
                        });
                }
        };




        const handleFormSubmit = async (e: React.FormEvent) => {
                e.preventDefault();
                setIsLoading(true);
                setErrorMessage(null);
                setSuccessMessage(null);

                try {
                        // Create a FormData object
                        const formData = new FormData();

                        // Append all fields to FormData
                        formData.append("section", "lifestyle");
                        formValues.hobbies.forEach((hobby) => {
                                formData.append("hobbies", String(hobby));
                        });

                        // Send the FormData to the backend
                        const updatedProfile = await updateProfileSection("lifestyle", formData)

                        if (updatedProfile?.status === "success") {
                                setSuccessMessage("Lifestyle Profile updated successfully!");
                        } else {
                                setErrorMessage(
                                        typeof updatedProfile?.error === "string"
                                                ? updatedProfile.error
                                                : "Failed to update lifestyle profile. Please try again."
                                );
                        }
                } catch (error) {
                        console.error("Error updating lifestyle profile:", error);
                        setErrorMessage("Failed to update lifestyle profile. Please try again.");
                } finally {
                        setIsLoading(false);
                }
        };

        return (

                <ProfileUpdateLayout
                        title="Lifestyle and interests"
                        description="Add hobbies and interests here. Smoking and pet comfort preferences are answered in the roommate compatibility quiz."
                >
                                        <form onSubmit={handleFormSubmit} className="w-full flex flex-col gap-6 text-slate-700">
                                                <div className="w-full h-[40vh] overflow-y-auto custom-scrollbar">
                                                        <label className="font-semibold text-white-1">Hobbies</label>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                                {hobbies.map((hobby) => (
                                                                        <button
                                                                                type="button"
                                                                                key={hobby.value}
                                                                                aria-pressed={formValues.hobbies.includes(hobby.value)}
                                                                                className={`cursor-pointer px-4 py-2 rounded-full border ${formValues.hobbies.includes(hobby.value)
                                                                                        ? "bg-gray-2 text-white-1"
                                                                                        : "bg-white-1 text-gray-700"
                                                                                        }`}
                                                                                onClick={() => handleHobbyClick(hobby.value)}
                                                                        >
                                                                                {hobby.label}
                                                                        </button>
                                                                ))}
                                                                {!isLoadingHobbies && hobbies.length === 0 && !errorMessage && (
                                                                        <p className="text-sm text-slate-500">No hobbies are available right now.</p>
                                                                )}
                                                        </div>
                                                        {isLoadingHobbies && <p className="mt-2 text-sm text-slate-500">Loading hobbies...</p>}
                                                </div>


                                                <Button
                                                        title="Update Profile"
                                                        containerStyles="bg-black-1 text-white-1 p-3 rounded-lg mt-5"
                                                        isLoading={isLoading}
                                                        isLoadingText="Updating..."
                                                        handleClick={handleFormSubmit}

                                                />
                                        </form>

                                {errorMessage && (
                                        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                                {errorMessage}
                                        </p>
                                )}
                                {successMessage && (
                                        <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                                {successMessage}
                                        </p>
                                )}
                </ProfileUpdateLayout>

        );
};

export default function ProtectedProfessionalProfileUpdate() {
        return (
                <AuthGuard>
                        <LifestyleProfileUpdate />
                </AuthGuard>
        );
}