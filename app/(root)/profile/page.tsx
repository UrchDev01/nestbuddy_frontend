"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FiAlertCircle, 
  FiCheckCircle, 
  FiChevronRight, 
  FiEdit3, 
  FiLock, 
  FiShield, 
  FiBell, 
  FiHome,
  FiRefreshCw
} from "react-icons/fi";
import { fetchCurrentProfile } from "@/utils/api";
import ProfileCard from "@/components/profileComponents/ProfileCard";
import DemographicProfile from "@/components/profileComponents/DemographicProfile";
import RoommatePreferenceProfile from "@/components/profileComponents/RoommatePreferenceProfile";
import LifestyleProfile from "@/components/profileComponents/LifestyleProfile";
import StudentProfile from "@/components/profileComponents/StudentProfile";
import WorkingClassProfile from "@/components/profileComponents/WorkingClassProfile";
import SocialProfile from "@/components/profileComponents/SocialProfile";
import SecurityProfile from "@/components/profileComponents/SecurityProfile";
import AuthGuard from "@/app/hoc/AuthGuard";
import { 
  ProfileProps, 
  DemographicProfileProps, 
  RoommatePreferenceProfileProps, 
  LifestyleProfileProps, 
  StudentProfileProps, 
  WorkingClassProfileProps, 
  SocialProfileProps, 
  VerificationProfileProps 
} from "@/types";

type ActiveTab = "overview" | "preferences" | "lifestyle" | "reviews";

const Profile = () => {
  const router = useRouter();

  const [basicProfile, setBasicProfile] = useState<ProfileProps | null>(null);
  const [demographicProfile, setDemographicProfile] = useState<DemographicProfileProps | null>(null);
  const [roommatePreferenceProfile, setRoommatePreferenceProfile] = useState<RoommatePreferenceProfileProps | null>(null);
  const [lifestyleProfile, setLifestyleProfile] = useState<LifestyleProfileProps | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfileProps | null>(null);
  const [workingClassProfile, setWorkingClassProfile] = useState<WorkingClassProfileProps | null>(null);
  const [socialProfile, setSocialProfile] = useState<SocialProfileProps | null>(null);
  const [verificationProfile, setVerificationProfile] = useState<VerificationProfileProps | null>(null);
  const [isStudent, setIsStudent] = useState(false);
  const [isWorkingClass, setIsWorkingClass] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        const response = await fetchCurrentProfile();
        if (!isMounted) return;

        if (!response) {
          setErrorMessage("We couldn't load your profile right now. Please try again.");
          return;
        }

        setBasicProfile(response.main_profile ?? null);
        setDemographicProfile(response.demographic ?? null);
        setRoommatePreferenceProfile(response.roommate_preferences ?? null);
        setLifestyleProfile(response.lifestyle ?? null);
        setSocialProfile(response.social ?? null);
        setVerificationProfile(response.verification ?? null);
        const userType = response.user_type;
        const studentAccount = userType === "student";
        const professionalAccount = userType === "professional";
        setIsStudent(studentAccount);
        setIsWorkingClass(professionalAccount);
        setStudentProfile(
          studentAccount
            ? response.student_profile ?? { school_name: null, department_name: null, level: null }
            : null,
        );
        setWorkingClassProfile(
          professionalAccount
            ? response.working_profile ?? { profession_name: null }
            : null,
        );
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (isMounted) {
          setErrorMessage("We couldn't load your profile right now. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [retryCount]);

  // Compute profile completion percentage dynamically from real profile data
  const completionPercent = useMemo(() => {
    const fields = [
      Boolean(basicProfile?.bio),
      Boolean(basicProfile?.profile_image),
      Boolean(demographicProfile?.gender),
      Boolean(demographicProfile?.age),
      Boolean(demographicProfile?.current_city_name),
      Boolean(demographicProfile?.religion_name),
      Boolean(demographicProfile?.tribe_name),
      Boolean(roommatePreferenceProfile?.seeking && roommatePreferenceProfile.seeking !== "none"),
      Boolean(roommatePreferenceProfile?.budget),
      Boolean(lifestyleProfile?.hobbies && lifestyleProfile.hobbies.length > 0),
      Boolean(socialProfile?.instagram || socialProfile?.twitter || socialProfile?.linkedin || socialProfile?.facebook),
      Boolean(verificationProfile?.id_verified),
    ];
    const filledCount = fields.filter(Boolean).length;
    return Math.round((filledCount / fields.length) * 100);
  }, [
    basicProfile,
    demographicProfile,
    lifestyleProfile,
    roommatePreferenceProfile,
    socialProfile,
    verificationProfile,
  ]);

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === "preferences") {
      const el = document.getElementById("roommate-preferences-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (tab === "lifestyle") {
      const el = document.getElementById("lifestyle-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (tab === "overview") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Loading skeleton matching the actual profile page layout
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f8ff] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Hero skeleton */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="animate-pulse flex flex-col sm:flex-row items-center gap-6">
              <div className="h-28 w-28 rounded-full bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-3 text-center sm:text-left w-full">
                <div className="h-7 w-48 rounded-lg bg-slate-200 mx-auto sm:mx-0" />
                <div className="h-4 w-64 rounded-lg bg-slate-100 mx-auto sm:mx-0" />
                <div className="h-3 w-36 rounded-lg bg-slate-100 mx-auto sm:mx-0" />
                <div className="h-4 w-full max-w-md rounded-lg bg-slate-100 mx-auto sm:mx-0" />
              </div>
              <div className="h-28 w-64 rounded-2xl bg-slate-100 shrink-0" />
            </div>
          </div>

          {/* Grid skeleton */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-4">
              <div className="h-48 rounded-2xl bg-white border border-slate-200 p-5 animate-pulse" />
              <div className="h-48 rounded-2xl bg-white border border-slate-200 p-5 animate-pulse" />
            </div>
            <div className="space-y-6 lg:col-span-8">
              <div className="h-64 rounded-2xl bg-white border border-slate-200 p-5 animate-pulse" />
              <div className="h-72 rounded-2xl bg-white border border-slate-200 p-5 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Graceful error state with retry action
  if (errorMessage) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f4f8ff] px-4 py-12">
        <div className="mx-auto max-w-md rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <FiAlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Unable to load profile</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={() => setRetryCount((prev) => prev + 1)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2879ef] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1f6fdd] active:scale-95"
          >
            <FiRefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f8ff] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Profile Hero Section */}
        {basicProfile && (
          <ProfileCard
            {...basicProfile}
            verification={verificationProfile}
            location={demographicProfile?.current_city_name ?? null}
            completionPercent={completionPercent}
          />
        )}

        {/* Tab Navigation (Matching Reference Image) */}
        <div className="flex items-center gap-2 border-b border-slate-200/90 pb-px overflow-x-auto">
          <button
            type="button"
            onClick={() => handleTabClick("overview")}
            className={`whitespace-nowrap px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors ${
              activeTab === "overview"
                ? "border-b-2 border-[#2879ef] text-[#2879ef]"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => handleTabClick("preferences")}
            className={`whitespace-nowrap px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors ${
              activeTab === "preferences"
                ? "border-b-2 border-[#2879ef] text-[#2879ef]"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Roommate Preferences
          </button>
          <button
            type="button"
            onClick={() => handleTabClick("lifestyle")}
            className={`whitespace-nowrap px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors ${
              activeTab === "lifestyle"
                ? "border-b-2 border-[#2879ef] text-[#2879ef]"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Lifestyle
          </button>
          <button
            type="button"
            onClick={() => handleTabClick("reviews")}
            className={`whitespace-nowrap px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors ${
              activeTab === "reviews"
                ? "border-b-2 border-[#2879ef] text-[#2879ef]"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Reviews
          </button>
        </div>

        {/* Main Dashboard Layout (2 Columns on Desktop, Single Column on Mobile) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column / Sidebar (lg:col-span-4) */}
          <aside className="space-y-6 lg:col-span-4">
            {/* Security Section */}
            <SecurityProfile isVerified={Boolean(verificationProfile?.id_verified)} />

            {/* Socials Section */}
            {socialProfile ? (
              <SocialProfile {...socialProfile} />
            ) : (
              <SocialProfile
                facebook={null}
                twitter={null}
                instagram={null}
                linkedin={null}
                verified_socials_count={0}
              />
            )}

            {/* Quick Actions Card (Matching Reference Image) */}
            <div className="rounded-2xl border border-[#dfeeff] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] sm:p-6">
              <h3 className="mb-4 text-base font-bold text-slate-900">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/profile-update/basic"
                  className="flex items-center justify-between rounded-xl p-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#2879ef]"
                >
                  <div className="flex items-center gap-2.5">
                    <FiEdit3 className="text-slate-400" />
                    <span>Edit Profile</span>
                  </div>
                  <FiChevronRight className="text-slate-400" />
                </Link>

                <Link
                  href="/reset-password"
                  className="flex items-center justify-between rounded-xl p-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#2879ef]"
                >
                  <div className="flex items-center gap-2.5">
                    <FiLock className="text-slate-400" />
                    <span>Change Password</span>
                  </div>
                  <FiChevronRight className="text-slate-400" />
                </Link>

                <Link
                  href="/profile/active-sessions"
                  className="flex items-center justify-between rounded-xl p-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#2879ef]"
                >
                  <div className="flex items-center gap-2.5">
                    <FiShield className="text-slate-400" />
                    <span>Privacy Settings</span>
                  </div>
                  <FiChevronRight className="text-slate-400" />
                </Link>

                <button
                  type="button"
                  onClick={() => showToast("Notification preferences are configured automatically for your account.")}
                  className="flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#2879ef]"
                >
                  <div className="flex items-center gap-2.5">
                    <FiBell className="text-slate-400" />
                    <span>Notification Preferences</span>
                  </div>
                  <FiChevronRight className="text-slate-400" />
                </button>
              </div>
            </div>

            {/* Matching Promotion Card (Bottom left of reference image) */}
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-[#edf5ff] to-[#f5f9ff] p-5 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2879ef] text-white shadow-xs">
                <FiHome className="h-5 w-5" />
              </div>
              <h4 className="mt-3 text-sm font-bold text-slate-900">
                Find your perfect roommate or place
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Your profile helps us match you with the best opportunities.
              </p>
              <div className="mt-4 flex gap-2">
                <Link
                  href="/ai-roommate-finder"
                  className="inline-flex rounded-lg bg-[#2879ef] px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#1f6fdd]"
                >
                  Find roommates
                </Link>
                <Link
                  href="/find-a-place"
                  className="inline-flex rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-[#1f6fdd] transition hover:bg-blue-50"
                >
                  Find place
                </Link>
              </div>
            </div>
          </aside>

          {/* Right Column / Main Content (lg:col-span-8) */}
          <main className="space-y-6 lg:col-span-8">
            {/* Demographic Information Section */}
            {demographicProfile && (
              <section id="demographic-section" aria-label="Demographic information">
                <DemographicProfile {...demographicProfile} />
              </section>
            )}

            {/* Roommate Preferences Section */}
            {roommatePreferenceProfile && (
              <section id="roommate-preferences-section" aria-label="Roommate preferences">
                <RoommatePreferenceProfile {...roommatePreferenceProfile} />
              </section>
            )}

            {/* Lifestyle Section */}
            {lifestyleProfile && (
              <section id="lifestyle-section" aria-label="Lifestyle and hobbies">
                <LifestyleProfile {...lifestyleProfile} />
              </section>
            )}

            {/* Education Profile (if user is student) */}
            {isStudent && studentProfile && (
              <section id="student-section" aria-label="Education info">
                <StudentProfile {...studentProfile} />
              </section>
            )}

            {/* Work Profile (if user is working class) */}
            {isWorkingClass && workingClassProfile && (
              <section id="working-section" aria-label="Work profile">
                <WorkingClassProfile {...workingClassProfile} />
              </section>
            )}
          </main>
        </div>
      </div>

      {/* Non-blocking Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-xl transition-all">
          <FiCheckCircle className="text-base text-[#2879ef]" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-xs text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default function ProtectedProfile() {
  return (
    <AuthGuard>
      <Profile />
    </AuthGuard>
  );
}