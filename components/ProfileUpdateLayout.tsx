"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiUser } from "react-icons/fi";
import { fetchCurrentProfile } from "@/utils/api";

const commonProfileUpdateSteps = [
    { href: "/profile-update/basic", label: "Basic profile" },
    { href: "/profile-update/demographic", label: "Demographic information" },
    { href: "/profile-update/roommate-preferrence", label: "Roommate preferences" },
    { href: "/profile-update/lifestyle", label: "Lifestyle and interests" },
];

const profileTypeSteps = {
    student: { href: "/profile-update/school", label: "Education" },
    professional: { href: "/profile-update/profession", label: "Work profile" },
};

interface ProfileUpdateLayoutProps {
    title: string;
    description: string;
    children: ReactNode;
}

export default function ProfileUpdateLayout({
    title,
    description,
    children,
}: ProfileUpdateLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [userType, setUserType] = useState<string | null>(null);
    const [profileTypeLoaded, setProfileTypeLoaded] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadUserType = async () => {
            try {
                const profile = await fetchCurrentProfile();
                if (isMounted && profile?.user_type) {
                    setUserType(profile.user_type);
                }
            } catch (error) {
                console.error("Failed to load account type for profile update:", error);
            } finally {
                if (isMounted) {
                    setProfileTypeLoaded(true);
                }
            }
        };

        void loadUserType();
        return () => {
            isMounted = false;
        };
    }, []);

    const applicableTypeStep = userType === "student" || userType === "professional"
        ? profileTypeSteps[userType]
        : null;
    const profileUpdateSteps = [...commonProfileUpdateSteps, ...(applicableTypeStep ? [applicableTypeStep] : [])];
    const isWrongTypeRoute =
        (pathname === profileTypeSteps.student.href && userType !== "student") ||
        (pathname === profileTypeSteps.professional.href && userType !== "professional");

    useEffect(() => {
        if (!profileTypeLoaded || !isWrongTypeRoute) {
            return;
        }

        const targetStep = applicableTypeStep?.href;
        router.replace(targetStep ?? "/profile");
    }, [applicableTypeStep, isWrongTypeRoute, profileTypeLoaded, router]);

    const isProfileTypeForm =
        pathname === profileTypeSteps.student.href ||
        pathname === profileTypeSteps.professional.href;
    const shouldWaitForAccountType = isProfileTypeForm && !profileTypeLoaded;
    const currentStep = profileUpdateSteps.findIndex((step) => step.href === pathname);
    const isStepForm = currentStep !== -1;
    const previousStep = currentStep > 0 ? profileUpdateSteps[currentStep - 1] : null;
    const nextStep = currentStep >= 0 && currentStep < profileUpdateSteps.length - 1
        ? profileUpdateSteps[currentStep + 1]
        : null;

    return (
        <main className="nb-profile-update min-h-screen bg-[#f4f8ff] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <header className="rounded-3xl border border-[#dfeeff] bg-gradient-to-r from-[#eaf3ff] via-[#f4f8fe] to-[#e8f2fe] p-5 shadow-[0_10px_35px_rgba(24,84,180,0.06)] sm:p-7">
                    <div className="flex items-start gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#2879ef] shadow-sm">
                            <FiUser aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2879ef]">Profile settings</p>
                            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
                        </div>
                    </div>
                </header>

                <section className="nb-profile-update-card mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)] sm:p-7">
                    {shouldWaitForAccountType || isWrongTypeRoute ? (
                        <p role="status" className="py-8 text-center text-sm font-medium text-slate-500">
                            Loading the correct profile form...
                        </p>
                    ) : (
                        children
                    )}
                    <nav
                        aria-label="Profile form navigation"
                        className="mt-8 border-t border-slate-100 pt-5"
                    >
                        {isStepForm && (
                            <>
                                <div className="mb-4 flex items-center justify-between text-xs font-semibold text-slate-500">
                                <span>Profile setup</span>
                                <span>Step {currentStep + 1} of {profileUpdateSteps.length}</span>
                                </div>
                                <div
                                    className="mb-5 h-1.5 overflow-hidden rounded-full bg-slate-100"
                                    role="progressbar"
                                    aria-label="Profile setup progress"
                                    aria-valuemin={1}
                                    aria-valuemax={profileUpdateSteps.length}
                                    aria-valuenow={currentStep + 1}
                                >
                                    <div
                                        className="h-full rounded-full bg-[#2879ef] transition-[width] duration-300"
                                        style={{
                                            width: `${((currentStep + 1) / profileUpdateSteps.length) * 100}%`,
                                        }}
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                {previousStep ? (
                                    <Link
                                        href={previousStep.href}
                                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#2879ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef]"
                                    >
                                        <FiArrowLeft aria-hidden="true" />
                                        Previous
                                    </Link>
                                ) : (
                                    <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-300" aria-disabled="true">
                                        <FiArrowLeft aria-hidden="true" />
                                        Previous
                                    </span>
                                )}

                                {nextStep && (
                                    <Link
                                        href={nextStep.href}
                                        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#2879ef] px-5 py-2.5 text-sm font-bold text-white-1 shadow-sm transition hover:bg-[#1f6fdd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef] focus-visible:ring-offset-2"
                                    >
                                        Next
                                        <span className="hidden sm:inline">: {nextStep.label}</span>
                                        <FiArrowRight aria-hidden="true" />
                                    </Link>
                                )}
                                </div>
                            </>
                        )}
                        <div className={`flex ${isStepForm ? "justify-end pt-4" : "justify-end"}`}>
                            <Link
                                href="/profile"
                                className="inline-flex min-h-10 items-center rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-[#2879ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2879ef]"
                            >
                                Skip to profile
                            </Link>
                        </div>
                    </nav>
                </section>
            </div>
        </main>
    );
}
