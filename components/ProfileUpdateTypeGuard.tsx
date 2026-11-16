"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { fetchCurrentProfile } from "@/utils/api";

interface ProfileUpdateTypeGuardProps {
    expectedUserType: "student" | "professional";
    children: ReactNode;
}

const profileUpdateRoutes = {
    student: "/profile-update/school",
    professional: "/profile-update/profession",
};

export default function ProfileUpdateTypeGuard({
    expectedUserType,
    children,
}: ProfileUpdateTypeGuardProps) {
    const router = useRouter();
    const [userType, setUserType] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadUserType = async () => {
            try {
                const profile = await fetchCurrentProfile();
                if (isMounted && profile?.user_type) {
                    setUserType(profile.user_type);
                }
            } catch (error) {
                console.error("Failed to verify account type for profile update:", error);
            } finally {
                if (isMounted) {
                    setIsLoaded(true);
                }
            }
        };

        void loadUserType();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!isLoaded || userType === expectedUserType) {
            return;
        }

        const redirectPath = userType === "student" || userType === "professional"
            ? profileUpdateRoutes[userType]
            : "/profile";
        router.replace(redirectPath);
    }, [expectedUserType, isLoaded, router, userType]);

    if (!isLoaded || userType !== expectedUserType) {
        return (
            <p role="status" className="px-4 py-10 text-center text-sm font-medium text-slate-500">
                Loading the correct profile form...
            </p>
        );
    }

    return children;
}
