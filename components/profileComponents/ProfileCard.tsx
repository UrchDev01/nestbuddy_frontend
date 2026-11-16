'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FiMapPin, 
  FiShield, 
  FiEdit3, 
  FiArrowLeft, 
  FiCheckCircle, 
  FiMail,
  FiAward
} from 'react-icons/fi';
import { FaCheckCircle } from 'react-icons/fa';
import { ProfileProps, VerificationProfileProps } from '@/types';

interface ProfileCardProps extends ProfileProps {
  verification?: VerificationProfileProps | null;
  location?: string | null;
  completionPercent?: number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  profile_image, 
  bio, 
  user, 
  verification, 
  location,
  completionPercent = 70
}) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'NestBuddy User';
  const email = user?.email || '';
  const profileLocation = location || null;
  const isVerified = Boolean(verification?.id_verified || user?.is_verified);

  // Compute initials for avatar fallback
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'NB';

  // Profile strength tier
  const getStrengthTier = (percent: number) => {
    if (percent >= 85) return { label: 'Excellent', color: 'text-emerald-600', barColor: 'bg-emerald-500' };
    if (percent >= 60) return { label: 'Good', color: 'text-emerald-600', barColor: 'bg-emerald-500' };
    if (percent >= 40) return { label: 'Moderate', color: 'text-amber-600', barColor: 'bg-amber-500' };
    return { label: 'Incomplete', color: 'text-rose-600', barColor: 'bg-rose-500' };
  };

  const strength = getStrengthTier(completionPercent);

  return (
    <div className="space-y-4">
      {/* Top back navigation */}
     

      {/* Hero Card Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#dfeeff] bg-gradient-to-r from-[#eaf3ff] via-[#f4f8fe] to-[#e8f2fe] p-5 shadow-[0_10px_35px_rgba(24,84,180,0.06)] sm:p-7 md:p-8">
        {/* Subtle decorative background graphic / tagline */}
        <div className="pointer-events-none absolute right-4 top-4 hidden select-none md:block lg:right-8 lg:top-6">
          <div className="text-right">
            <span className="font-serif italic tracking-wide text-[#80aee8]/60 text-lg lg:text-xl font-medium">
              Better Roommates - Bigger Dreams
            </span>
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Avatar + Details */}
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start lg:items-center">
            {/* Avatar Container */}
            <div className="relative shrink-0">
              {profile_image && !imageError ? (
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-md sm:h-28 sm:w-28 md:h-32 md:w-32">
                  <Image
                    src={profile_image}
                    alt={fullName}
                    fill
                    sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
                    className="object-cover"
                    onError={() => setImageError(true)}
                    priority
                  />
                </div>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-[#2879ef] to-[#1a5ac7] text-2xl font-black text-white shadow-md sm:h-28 sm:w-28 sm:text-3xl md:h-32 md:w-32 md:text-4xl">
                  {initials}
                </div>
              )}

              {/* Online/Verified badge on avatar */}
              {isVerified ? (
                <div 
                  title="Verified Profile"
                  className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#2879ef] text-white shadow-sm sm:h-8 sm:w-8"
                >
                  <FaCheckCircle className="text-sm sm:text-base text-white" />
                </div>
              ) : (
                <div 
                  title="Active"
                  className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white bg-emerald-500 shadow-sm"
                />
              )}
            </div>

            {/* Profile Info */}
            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  {fullName}
                </h1>
                {isVerified && (
                  <span title="Verified user" className="inline-flex text-[#2879ef]">
                    <FaCheckCircle className="text-lg sm:text-xl" />
                  </span>
                )}
              </div>

              {email && (
                <p className="mt-1 flex items-center justify-center gap-1.5 text-sm font-medium text-slate-600 sm:justify-start">
                  <FiMail className="text-slate-400 text-xs" />
                  {email}
                </p>
              )}

              {profileLocation && (
                <p className="mt-1 flex items-center justify-center gap-1 text-xs font-semibold text-slate-500 sm:justify-start">
                  <FiMapPin className="text-[#2879ef]" />
                  <span>{profileLocation}</span>
                </p>
              )}

              <p className="mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-slate-600">
                {bio?.trim() ? bio : <span className="italic text-slate-400">No bio available</span>}
              </p>

              {/* Action buttons */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
                {!isVerified ? (
                  <Link
                    href="/verify"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#2879ef] px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-[#1f6fdd] active:scale-95"
                  >
                    <FiShield className="text-sm" />
                    <span>Get Verified</span>
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    <FiCheckCircle className="text-emerald-600" />
                    <span>Verified Account</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => router.push('/profile-update/basic')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs backdrop-blur-xs transition hover:bg-white hover:text-slate-900 active:scale-95"
                >
                  <FiEdit3 className="text-xs sm:text-sm text-slate-500" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Profile Strength Card */}
          <div className="w-full shrink-0 lg:w-72">
            <div className="rounded-2xl border border-blue-100/90 bg-white/90 p-4 shadow-xs backdrop-blur-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2879ef]">
                  <FiShield className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Profile Strength
                  </p>
                  <p className={`text-base font-bold ${strength.color}`}>
                    {strength.label}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
                  <span>Completion</span>
                  <span className="font-bold text-slate-800">{completionPercent}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${strength.barColor}`}
                    style={{ width: `${Math.min(Math.max(completionPercent, 5), 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;