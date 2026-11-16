"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import AuthGuard from "@/app/hoc/AuthGuard";
import {
    fetchCurrentProfile,
    updateProfile,
    fetchStates,
    fetchCities,
    fetchReligions,
    fetchInterests,
} from "@/utils/api";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Select from "@/components/ProfileUpdateSelect";
import ProfileUpdateLayout from "@/components/ProfileUpdateLayout";

interface FormValues {
    gender: string;
    hobbies: string[];
    religion: string;
    state_of_origin: string;
    state_of_residence: string;
    current_city: string;
    looking_for_roommate: boolean;
    looking_for_accommodation: boolean;
    budget: string;
    preferred_gender: string;
    bio: string;
    profile_image: File | null;
    user_first_name: string;
    user_last_name: string;
    user_phone: string;
}

interface Option {
    value: string;
    label: string;
}

interface InterestProps {
    interest: string;
    value: string;
}

const ProfileUpdatePage = () => {
    const [formValues, setFormValues] = useState<FormValues>({
        gender: "",
        hobbies: [],
        religion: "",
        state_of_origin: "",
        state_of_residence: "",
        current_city: "",
        looking_for_roommate: false,
        looking_for_accommodation: false,
        budget: "",
        preferred_gender: "",
        bio: "",
        profile_image: null,
        user_first_name: '',
        user_last_name: '',
        user_phone: ''

    });
    const [states, setStates] = useState<Option[]>([]);
    const [cities, setCities] = useState<Option[]>([]);
    const [religions, setReligions] = useState<Option[]>([]);
    const [hobbies, setHobbies] = useState<Option[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [profileId, setProfileId] = useState('')
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);


    useEffect(() => {
        const getCurrentProfileId = async () => {
            const profile = await fetchCurrentProfile()
            if (profile) {
                setProfileId(profile.data?.id || profile.id || "")
            }
        }

        getCurrentProfileId()
    }, [])


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profile, statesData, citiesData, religionsData, interestsData] = await Promise.all([
                    fetchCurrentProfile(),
                    fetchStates(),
                    fetchCities(),
                    fetchReligions(),
                    fetchInterests(),
                ]);

                if (profile) {
                    const profileData = profile.data || {};
                    setFormValues({
                        gender: profileData.gender || "",
                        hobbies: profileData.hobbies?.map((hobby: any) => hobby.id) || [],
                        religion: profileData.religion?.id || "",
                        state_of_origin: profileData.state_of_origin?.id || "",
                        state_of_residence: profileData.state_of_residence?.id || "",
                        current_city: profileData.current_city?.id || "",
                        looking_for_roommate: profileData.looking_for_roommate || false,
                        looking_for_accommodation: profileData.looking_for_accommodation || false,
                        budget: profileData.budget || "",
                        preferred_gender: profileData.preferred_gender || "",
                        bio: profile.main_profile?.bio || profileData.bio || "",
                        profile_image: null,
                        user_first_name: profile.main_profile?.user?.first_name || profileData.user?.first_name || "",
                        user_last_name: profile.main_profile?.user?.last_name || profileData.user?.last_name || "",
                        user_phone: profile.main_profile?.user?.phone || profileData.user?.phone || "",

                    });

                    // Set the profile image preview from the API response if available
                    const profileImage = profile.main_profile?.profile_image || profileData.profile_image;
                    if (profileImage) {
                        setProfileImagePreview(profileImage);
                    }
                }

                setStates(statesData.data.map((state: any) => ({ value: state.id, label: state.name })));
                setCities(citiesData.data.map((city: any) => ({ value: city.id, label: city.name })));
                setReligions(religionsData.data.map((religion: any) => ({ value: religion.id, label: religion.name })));
                setHobbies(interestsData.data.map((hobby: any) => ({ value: hobby.id, label: hobby.interest })));
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
            formData.append("gender", formValues.gender);
            formData.append("religion", formValues.religion);
            formData.append("state_of_origin", formValues.state_of_origin);
            formData.append("state_of_residence", formValues.state_of_residence);
            formData.append("current_city", formValues.current_city);
            formData.append("looking_for_roommate", formValues.looking_for_roommate ? "true" : "false");
            formData.append("looking_for_accommodation", formValues.looking_for_accommodation ? "true" : "false");
            formData.append("budget", formValues.budget);
            formData.append("preferred_gender", formValues.preferred_gender);
            formData.append("bio", formValues.bio);

            // Append user account fields
            formData.append("user_first_name", formValues.user_first_name);
            formData.append("user_last_name", formValues.user_last_name);
            formData.append("user_phone", formValues.user_phone);

            // Append hobbies and interests as arrays
            formValues.hobbies.forEach((hobby) => formData.append("hobbies[]", hobby));


            // Append the profile image if it exists
            if (formValues.profile_image) {
                formData.append("profile_image", formValues.profile_image);
            }

            // Send the FormData to the backend
            const updatedProfile = await updateProfile(profileId, formData);

            if (updatedProfile) {
                setSuccessMessage("Profile updated successfully!");

                // Fetch updated profile data
                const updatedProfileData = await fetchCurrentProfile();
                if (updatedProfileData.data.profile_image) {
                    setProfileImagePreview(updatedProfileData.data.profile_image);
                }
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setErrorMessage("Failed to update profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProfileUpdateLayout
            title="Update your profile"
            description="Manage your personal details, preferences, lifestyle, and public profile information."
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
                            <label htmlFor="preferred_gender" className="font-semibold text-white-1">Preferred Gender</label>
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
                                    { value: "Both", label: "Both" },
                                ]}
                                placeholder="Select Preferred Gender"
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

                        <div className="w-full h-[40vh] overflow-y-auto custom-scrollbar">
                            <label className="font-semibold text-white-1">Hobbies</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {hobbies.map((hobby) => (
                                    <div
                                        key={hobby.value}
                                        className={`cursor-pointer px-4 py-2 rounded-full border ${formValues.hobbies.includes(hobby.value)
                                            ? "bg-gray-2 text-white-1"
                                            : "bg-white-1 text-gray-700"
                                            }`}
                                        onClick={() => handleHobbyClick(hobby.value)}
                                    >
                                        {hobby.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="flex items-center gap-2">
                                <input
                                    id="looking_for_roommate"
                                    type="checkbox"
                                    name="looking_for_roommate"
                                    checked={formValues.looking_for_roommate}
                                    onChange={handleInputChange}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="looking_for_roommate" className="font-semibold text-white-1">Looking for Roommate</label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    id="looking_for_accommodation"
                                    type="checkbox"
                                    name="looking_for_accommodation"
                                    checked={formValues.looking_for_accommodation}
                                    onChange={handleInputChange}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="looking_for_accommodation" className="font-semibold text-white-1">Looking for Accommodation</label>
                            </div>

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

    );
};

export default function ProtectedProfileUpdate() {
    return (
        <AuthGuard>
            <ProfileUpdatePage />
        </AuthGuard>
    );
}