"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/utils/auth";
import LoadingOne from "@/components/LoadingOne";

interface AuthGuardProps {
    children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const redirectToSignIn = () => {
            const next = `${window.location.pathname}${window.location.search}`;
            router.replace(`/sign-in?next=${encodeURIComponent(next)}`);
        };

        const checkAuth = async () => {
            try {
                const authenticated = await isAuthenticated();
                if (!authenticated) {
                    redirectToSignIn();
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Authentication check failed:", error);
                redirectToSignIn();
            }
        };

        checkAuth();
    }, [router]);

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen"><LoadingOne /></div>; // You can replace this with a proper loading component
    }

    return <>{children}</>;
};

export default AuthGuard;