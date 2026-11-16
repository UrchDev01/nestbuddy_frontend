"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Modal from "@/components/Modal";
import { useRouter } from "next/navigation";
import {
        fetchProfessions,
        fetchCurrentWorkingClassProfile,
        updateWorkingClassProfile

} from "@/utils/api";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Select from "react-select"; // For searchable dropdowns
import AuthGuard from "@/app/hoc/AuthGuard";
import ProfileUpdateTypeGuard from "@/components/ProfileUpdateTypeGuard";
import BannerSection from "@/components/BannerSection";
import PageHeaderSection from "@/components/PageHeaderSection";

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
        const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
        const [profileId, setProfileId] = useState('')


        const router = useRouter();

        useEffect(() => {
                const getCurrentProfessionalProfileId = async () => {
                        const profile = await fetchCurrentWorkingClassProfile()
                        if (profile) {
                                setProfileId(profile.data.id)
                        }
                }

                getCurrentProfessionalProfileId()
        }, [])


        useEffect(() => {
                const fetchData = async () => {
                        try {
                                const [profile, professionData,] = await Promise.all([
                                        fetchCurrentWorkingClassProfile(),
                                        fetchProfessions(),

                                ]);

                                if (profile) {
                                        setFormValues({

                                                profession: profile.data.profession?.id || "",



                                        });

                                }

                                setProfessions(professionData.data.map((profession: any) => ({ value: profession.id, label: profession.name })));
                        } catch (error) {
                                console.error("Error fetching data:", error);
                                setErrorMessage("Failed to load profile details or necessary data.");
                        }
                };

                fetchData();
        }, []);

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
                        formData.append("profession", formValues.profession);


                        // Send the FormData to the backend
                        const updatedProfile = await updateWorkingClassProfile(profileId, formData);

                        if (updatedProfile) {
                                setSuccessMessage("Professional Profile updated successfully!");
                                setIsSuccessModalOpen(true);


                                setTimeout(() => {
                                        router.push("/profile")

                                }, 2000);
                        }
                } catch (error) {
                        console.error("Error updating professional profile:", error);
                        setErrorMessage("Failed to update professional profile. Please try again.");
                } finally {
                        setIsLoading(false);
                }
        };

        return (

                <div className="w-full px-4 flex flex-col justify-start items-start">
                        <BannerSection bannerImage="/loginbg.webp" alt="Profile Update Banner" />


                        <div className="w-full h-auto pb-[13rem] rounded-4xl bg-gray-1 mt-4 flex flex-col items-center justify-center gap-4 relative">
                                <PageHeaderSection title="Profile Update" />

                                <div className="w-[35%] h-full flex flex-col justify-start items-start mt-5">
                                        <div className="flex flex-col gap-4">
                                                <h2 className="font-bold text-white-1 text-[1.3rem] mb-6">Complete Your Profile Update.</h2>

                                        </div>


                                        <form onSubmit={handleFormSubmit} className="w-full max-w-2xl flex flex-col gap-6">
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
                                        </form>
                                </div>

                                {/* Success Modal */}
                                <Modal
                                        isOpen={isSuccessModalOpen}
                                        onClose={() => setIsSuccessModalOpen(false)}
                                        title="Professional Profile Update"
                                >
                                        <div className="text-center">
                                                <h2 className="text-green-500 font-bold text-lg">Profile Updated Successfully!</h2>
                                                <p className="text-gray-700">You will be redirected shortly...</p>
                                        </div>
                                </Modal>
                        </div>
                </div>

        );
};

export default function ProtectedProfessionalProfileUpdate() {
        return (
                <AuthGuard>
                        <ProfileUpdateTypeGuard expectedUserType="professional">
                                <ProfessionalProfileUpdate />
                        </ProfileUpdateTypeGuard>
                </AuthGuard>
        );
}