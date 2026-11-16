"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
        fetchProfessions,
        fetchCurrentProfile,
        updateProfileSection,

} from "@/utils/api";
import { isAuthenticated } from "@/utils/auth";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Select from "@/components/ProfileUpdateSelect";
import AuthGuard from "@/app/hoc/AuthGuard";
import ProfileUpdateLayout from "@/components/ProfileUpdateLayout";

interface FormValues {
        profession: string;


}

interface Option {
        value: string;
        label: string;
}



const ProfessionalProfileUpdate = () => {
        const [formValues, setFormValues] = useState<FormValues>({
                profession: "",

        });


        const [professions, setProfessions] = useState<Option[]>([]);
        const [isLoading, setIsLoading] = useState(false);
        const [errorMessage, setErrorMessage] = useState<string | null>(null);
        const [successMessage, setSuccessMessage] = useState<string | null>(null);
        const [profileId, setProfileId] = useState('')


        const router = useRouter();

        useEffect(() => {
                const getCurrentProfile = async () => {
                        const checkAuth = await isAuthenticated()
                        if (!checkAuth) {
                                router.push('/login')
                                return
                        }
                        const profile = await fetchCurrentProfile()
                        const professionalData = await fetchProfessions()
                        if (profile) {
                                setFormValues({

                                        profession: profile.working_profile?.profession
                                                ? String(profile.working_profile.profession)
                                                : "",



                                });
                        }

                        setProfessions(professionalData.data.map((profession: any) => ({
                                value: String(profession.id),
                                label: profession.name,
                        })));
                }

                getCurrentProfile()
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
                        // Create a FormData object
                        const formData = new FormData();

                        // Append all fields to FormData
                        formData.append("section", "working");
                        formData.append("profession", formValues.profession);


                        // Send the FormData to the backend
                        const updatedProfile = await updateProfileSection("working", formData)

                        if (updatedProfile?.status === "success") {
                                setSuccessMessage("Professional Profile updated successfully!");
                        } else {
                                const error = updatedProfile?.error;
                                setErrorMessage(
                                        typeof error === "string"
                                                ? error
                                                : error && typeof error === "object"
                                                        ? Object.values(error).flat().join(" ")
                                                        : "Failed to update professional profile. Please try again."
                                );
                        }
                } catch (error) {
                        console.error("Error updating professional profile:", error);
                        setErrorMessage("Failed to update professional profile. Please try again.");
                } finally {
                        setIsLoading(false);
                }
        };

        return (

                <ProfileUpdateLayout
                        title="Work profile"
                        description="Choose your profession so your profile reflects your current work."
                >
                                        <form onSubmit={handleFormSubmit} className="w-full flex flex-col gap-6 text-slate-700">
                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="profession" className="font-semibold text-white-1">Profession</label>
                                                        <Select
                                                                id="profession"
                                                                name="profession"
                                                                value={professions.find((p) => p.value === formValues.profession) || null}
                                                                onChange={(selected) =>
                                                                        setFormValues({ ...formValues, profession: selected?.value || "" })
                                                                }
                                                                options={professions}
                                                                placeholder="Select profession"
                                                                isSearchable
                                                        />
                                                </div>


                                                <Button
                                                        title="Update Profile"
                                                        containerStyles="bg-black-1 text-white-1 p-3 rounded-lg mt-5"
                                                        isLoading={isLoading}
                                                        isLoadingText="Updating..."
                                                        handleClick={handleFormSubmit}

                                                />
                                                {errorMessage && (
                                                        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                                                {errorMessage}
                                                        </p>
                                                )}
                                                {successMessage && (
                                                        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                                                {successMessage}
                                                        </p>
                                                )}
                                        </form>
                </ProfileUpdateLayout>

        );
};

export default function ProtectedProfessionalProfileUpdate() {
        return (
                <AuthGuard>
                        <ProfessionalProfileUpdate />
                </AuthGuard>
        );
}