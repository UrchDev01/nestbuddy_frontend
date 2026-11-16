"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AuthGuard from "@/app/hoc/AuthGuard";
import { fetchCurrentProfile, updateProfileSection } from "@/utils/api";
import { isAuthenticated } from "@/utils/auth";
import Input from "@/components/Input";
import Button from "@/components/Button";
import ProfileUpdateLayout from "@/components/ProfileUpdateLayout";
import { is } from "date-fns/locale";

interface FormValues {
        profile_image: File | null;
        bio: string;
        user_first_name: string;
        user_last_name: string;
        user_phone: string;
        facebook: string;
        instagram: string;
        linkedin: string;
        twitter: string;

}

const UpdateProfileBasic = () => {
        const [formValues, setFormValues] = useState<FormValues>({
                bio: "",
                profile_image: null,
                user_first_name: '',
                user_last_name: '',
                user_phone: '',
                facebook: "",
                instagram: "",
                linkedin: "",
                twitter: "",

        });
        const [isLoading, setIsLoading] = useState(false);
        const [errorMessage, setErrorMessage] = useState<string | null>(null);
        const [successMessage, setSuccessMessage] = useState<string | null>(null);
        const [profileId, setProfileId] = useState('')
        const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

        const router = useRouter();


        useEffect(() => {
                const getCurrentProfileId = async () => {
                        const checkAuth = await isAuthenticated()
                        if (!checkAuth) {
                                router.push('/login')
                                return
                        }
                        const profile = await fetchCurrentProfile()
                        if (profile) {
                                setFormValues({
                                        bio: profile.main_profile.bio,
                                        profile_image: null,
                                        user_first_name: profile.main_profile.user?.first_name || "",
                                        user_last_name: profile.main_profile.user?.last_name || "",
                                        user_phone: profile.main_profile.user?.phone || "",
                                        facebook: profile.social?.facebook || "",
                                        instagram: profile.social?.instagram || "",
                                        linkedin: profile.social?.linkedin || "",
                                        twitter: profile.social?.twitter || "",


                                })
                                setProfileImagePreview(profile.main_profile.profile_image)
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

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setFormValues({
                                ...formValues,
                                profile_image: file,
                        });
                        const reader = new FileReader();
                        reader.onloadend = () => {
                                setProfileImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);// Preview the selected image
                }
        };


        const handleFormSubmit = async (e: React.FormEvent) => {
                e.preventDefault();
                setIsLoading(true);
                setErrorMessage(null);
                setSuccessMessage(null);

                try {
                        const mainFormData = new FormData();
                        mainFormData.append("section", "main");
                        mainFormData.append("bio", formValues.bio);
                        mainFormData.append("user_first_name", formValues.user_first_name);
                        mainFormData.append("user_last_name", formValues.user_last_name);
                        mainFormData.append("user_phone", formValues.user_phone);
                        if (formValues.profile_image) {
                                mainFormData.append("profile_image", formValues.profile_image);

                        }


                        const mainResponse = await updateProfileSection("main", mainFormData);
                        // --- Social profile ---
                        const socialFormData = new FormData();
                        socialFormData.append("section", "social");
                        socialFormData.append("facebook", formValues.facebook || "");
                        socialFormData.append("twitter", formValues.twitter || "");
                        socialFormData.append("linkedin", formValues.linkedin || "");
                        socialFormData.append("instagram", formValues.instagram || "");

                        const socialResponse = await updateProfileSection("social", socialFormData);

                        if (mainResponse && socialResponse) {
                                setSuccessMessage("Profile updated successfully!");
                        }

                } catch (error) {
                        console.error("Error updating profile:", error);
                        setErrorMessage("Failed to update profile.");
                } finally {
                        setIsLoading(false);
                }
        };

        return (
                <ProfileUpdateLayout
                        title="Basic profile"
                        description="Keep your name, profile photo, bio, and social links up to date."
                >
                                        <form onSubmit={handleFormSubmit} className="w-full flex flex-col gap-6 text-slate-700">
                                                <div className="flex flex-col gap-2">
                                                        <label className="font-semibold text-white-1">Profile Image</label>
                                                        {profileImagePreview && (
                                                                <Image
                                                                        src={profileImagePreview}
                                                                        alt="Profile Preview"
                                                                        width={100}
                                                                        height={100}
                                                                        className="rounded-full object-cover"
                                                                />
                                                        )}
                                                        <input type="file" name="profile_image" onChange={handleFileChange} />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="user_first_name" className="font-semibold text-white-1">First Name</label>
                                                        <Input

                                                                type="text"
                                                                name="user_first_name"
                                                                value={formValues.user_first_name}
                                                                placeholder="Enter your first name"
                                                                handleOnchange={handleInputChange}
                                                        />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="user_last_name" className="font-semibold text-white-1">Last Name</label>
                                                        <Input

                                                                type="text"
                                                                name="user_last_name"
                                                                value={formValues.user_last_name}
                                                                placeholder="Enter your last name"
                                                                handleOnchange={handleInputChange}
                                                        />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="user_phone" className="font-semibold text-white-1">Phone</label>
                                                        <Input

                                                                type="text"
                                                                name="user_phone"
                                                                value={formValues.user_phone}
                                                                placeholder="Enter your phone number"
                                                                handleOnchange={handleInputChange}
                                                        />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="user_facebook" className="font-semibold text-white-1">Facebook</label>
                                                        <Input

                                                                type="text"
                                                                name="facebook"
                                                                value={formValues.facebook}
                                                                placeholder="Enter your Facebook profile link"
                                                                handleOnchange={handleInputChange}
                                                        />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="user_instagram" className="font-semibold text-white-1">Instagram</label>
                                                        <Input

                                                                type="text"
                                                                name="instagram"
                                                                value={formValues.instagram}
                                                                placeholder="Enter your Instagram profile link"
                                                                handleOnchange={handleInputChange}
                                                        />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="user_twitter" className="font-semibold text-white-1">Twitter</label>
                                                        <Input

                                                                type="text"
                                                                name="twitter"
                                                                value={formValues.twitter}
                                                                placeholder="Enter your Twitter profile link"
                                                                handleOnchange={handleInputChange}
                                                        />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="user_linkedin" className="font-semibold text-white-1">LinkedIn</label>
                                                        <Input

                                                                type="text"
                                                                name="linkedin"
                                                                value={formValues.linkedin}
                                                                placeholder="Enter your LinkedIn profile link"
                                                                handleOnchange={handleInputChange}
                                                        />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="bio" className="font-semibold text-white-1">Bio</label>
                                                        <textarea
                                                                id="bio"
                                                                name="bio"
                                                                value={formValues.bio}
                                                                placeholder="Write something about yourself"
                                                                onChange={handleInputChange}
                                                                className="w-full p-3 border rounded text-black-1"
                                                        />
                                                </div>


                                                <Button
                                                        title="Update Profile"
                                                        containerStyles="bg-gray-2 text-white-1 p-3 rounded-lg mt-5"
                                                        isLoading={isLoading}
                                                        isLoadingText="Updating..."
                                                        handleClick={handleFormSubmit}

                                                />


                                        </form>
                                {successMessage && (
                                        <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                                {successMessage}
                                        </p>
                                )}
                </ProfileUpdateLayout>


        )
}

export default function ProtectedProfileUpdate() {
        return (
                <AuthGuard>
                        <UpdateProfileBasic />
                </AuthGuard>
        );
}