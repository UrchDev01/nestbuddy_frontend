"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
        fetchDepartments,
        fetchSchools,
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
                        const schoolData = await fetchSchools()
                        const departmentData = await fetchDepartments()
                        if (profile) {
                                setFormValues({

                                        school: profile.student_profile.school || "",
                                        department: profile.student_profile.department || "",
                                        level: profile.student_profile.level || "",



                                });
                        }

                        setSchools(schoolData.data.map((school: any) => ({ value: school.id, label: school.name })));
                        setDepartments(departmentData.data.map((department: any) => ({ value: department.id, label: department.name })));
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
                        formData.append("section", "student");
                        formData.append("school", formValues.school);
                        formData.append("department", formValues.department);
                        formData.append("level", formValues.level);

                        // Send the FormData to the backend
                        const updatedProfile = await updateProfileSection("student", formData)

                        if (updatedProfile) {
                                setSuccessMessage("Student Profile updated successfully!");
                        }
                } catch (error) {
                        console.error("Error updating student profile:", error);
                        setErrorMessage("Failed to update student profile. Please try again.");
                } finally {
                        setIsLoading(false);
                }
        };

        return (

                <ProfileUpdateLayout
                        title="Education"
                        description="Add your school, department, and current level to your profile."
                >
                                        <form onSubmit={handleFormSubmit} className="w-full flex flex-col gap-6 text-slate-700">
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
                                                                        { value: "100", label: "100 level" },
                                                                        { value: "200", label: "200 level" },
                                                                        { value: "300", label: "300 level" },
                                                                        { value: "400", label: "400 level" },
                                                                        { value: "500", label: "500 level" },
                                                                        { value: "600", label: "600 level" },
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
                                                {successMessage && (
                                                        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                                                {successMessage}
                                                        </p>
                                                )}
                                        </form>
                </ProfileUpdateLayout>

        );
};

export default function ProtectedStudentProfileUpdate() {
        return (
                <AuthGuard>
                        <StudentProfileUpdate />
                </AuthGuard>
        );
}