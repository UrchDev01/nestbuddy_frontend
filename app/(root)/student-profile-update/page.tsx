"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Modal from "@/components/Modal";
import { useRouter } from "next/navigation";
import {
        fetchDepartments,
        fetchSchools,
        fetchCurrentStudentProfile,
        updateStudentProfile

} from "@/utils/api";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Select from "react-select"; // For searchable dropdowns
import AuthGuard from "@/app/hoc/AuthGuard";
import ProfileUpdateTypeGuard from "@/components/ProfileUpdateTypeGuard";
import BannerSection from "@/components/BannerSection";
import PageHeaderSection from "@/components/PageHeaderSection";

interface FormValues {
        school: string;
        department: string;
        level: string;

}

interface Option {
        value: string;
        label: string;
}



const StudentProfileUpdate = () => {
        const [formValues, setFormValues] = useState<FormValues>({
                school: "",
                department: "",
                level: ""


        });

        const [schools, setSchools] = useState<Option[]>([]);
        const [departments, setDepartments] = useState<Option[]>([]);
        const [isLoading, setIsLoading] = useState(false);
        const [errorMessage, setErrorMessage] = useState<string | null>(null);
        const [successMessage, setSuccessMessage] = useState<string | null>(null);
        const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
        const [profileId, setProfileId] = useState('')


        const router = useRouter();

        useEffect(() => {
                const getCurrentStudentProfileId = async () => {
                        const profile = await fetchCurrentStudentProfile()
                        if (profile) {
                                setProfileId(profile.data.id)
                        }
                }

                getCurrentStudentProfileId()
        }, [])


        useEffect(() => {
                const fetchData = async () => {
                        try {
                                const [profile, schoolData, departmentsData] = await Promise.all([
                                        fetchCurrentStudentProfile(),
                                        fetchSchools(),
                                        fetchDepartments()

                                ]);

                                if (profile) {
                                        setFormValues({

                                                school: profile.data.school?.id || "",
                                                department: profile.data.department?.id || "",
                                                level: profile.data.level || "",


                                        });

                                }

                                setSchools(schoolData.data.map((school: any) => ({ value: school.id, label: school.name })));
                                setDepartments(departmentsData.data.map((department: any) => ({ value: department.id, label: department.name })));
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
                        formData.append("school", formValues.school);
                        formData.append("department", formValues.department);
                        formData.append("level", formValues.level);

                        // Send the FormData to the backend
                        const updatedProfile = await updateStudentProfile(profileId, formData);

                        if (updatedProfile) {
                                setSuccessMessage("Student Profile updated successfully!");
                                setIsSuccessModalOpen(true);


                                setTimeout(() => {
                                        router.push("/profile")

                                }, 2000);
                        }
                } catch (error) {
                        console.error("Error updating student profile:", error);
                        setErrorMessage("Failed to update student profile. Please try again.");
                } finally {
                        setIsLoading(false);
                }
        };

        return (

                <div className="w-full px-4">
                        <BannerSection bannerImage="/loginbg.webp" alt="Student Profile Update Banner" />

                        <div className="w-full h-auto pb-[13rem] rounded-4xl bg-gray-1 mt-4 flex flex-col items-center justify-center gap-4 relative">
                                <PageHeaderSection title="Profile Update" />

                                <div className="w-[35%] h-full flex flex-col justify-start items-start mt-5">
                                        <div className="flex flex-col gap-4">
                                                <h2 className="font-bold text-white-5 text-[1.3rem] mb-6">Complete Your Profile Update.</h2>

                                        </div>


                                        <form onSubmit={handleFormSubmit} className="w-full max-w-2xl flex flex-col gap-6">
                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="level" className="font-semibold text-white-1">Level</label>
                                                        <Select
                                                                id="level"
                                                                name="level"
                                                                value={
                                                                        formValues.level
                                                                                ? { value: formValues.level, label: formValues.level }
                                                                                : null
                                                                }
                                                                onChange={(selected) =>
                                                                        setFormValues({ ...formValues, level: selected?.value || "" })
                                                                }
                                                                options={[
                                                                        { value: "100 level", label: "100 level" },
                                                                        { value: "200 level", label: "200 level" },
                                                                        { value: "300 level", label: "300 level" },
                                                                        { value: "400 level", label: "400 level" },
                                                                        { value: "500 level", label: "500 level" },
                                                                        { value: "600 level", label: "600 level" },
                                                                ]}
                                                                placeholder="Select Level"
                                                                isSearchable
                                                        />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="school" className="font-semibold text-white-1">School</label>
                                                        <Select
                                                                id="school"
                                                                name="school"
                                                                value={schools.find((s) => s.value === formValues.school) || null}
                                                                onChange={(selected) =>
                                                                        setFormValues({ ...formValues, school: selected?.value || "" })
                                                                }
                                                                options={schools}
                                                                placeholder="Select School"
                                                                isSearchable
                                                        />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                        <label htmlFor="department" className="font-semibold text-white-1">Department</label>
                                                        <Select
                                                                id="department"
                                                                name="department"
                                                                value={departments.find((d) => d.value === formValues.department) || null}
                                                                onChange={(selected) =>
                                                                        setFormValues({ ...formValues, department: selected?.value || "" })
                                                                }
                                                                options={departments}
                                                                placeholder="Select Department"
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
                                        title="Student Profile Update"
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

export default function ProtectedStudentProfileUpdate() {
        return (
                <AuthGuard>
                        <ProfileUpdateTypeGuard expectedUserType="student">
                                <StudentProfileUpdate />
                        </ProfileUpdateTypeGuard>
                </AuthGuard>
        );
}