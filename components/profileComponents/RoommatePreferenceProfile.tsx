'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  FiUsers, 
  FiHome, 
  FiDollarSign, 
  FiCalendar, 
  FiMapPin, 
  FiCompass, 
  FiSun, 
  FiEdit2,
  FiUser
} from 'react-icons/fi';
import { FaWallet } from 'react-icons/fa';
import { RoommatePreferenceProfileProps } from '@/types';

interface PreferenceItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
}

const PreferenceItem: React.FC<PreferenceItemProps> = ({ icon, label, value }) => {
  const displayValue = value !== null && value !== undefined && value !== '' ? String(value) : '—';

  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-3.5 transition-all hover:border-blue-200 hover:shadow-2xs">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf5ff] text-[#2879ef]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="truncate text-sm font-bold text-slate-800" title={displayValue}>
          {displayValue}
        </p>
      </div>
    </div>
  );
};

const RoommatePreferenceProfile: React.FC<RoommatePreferenceProfileProps> = (props) => {
  const router = useRouter();

  const handleEditProfile = () => {
    router.push('/profile-update/roommate-preferrence');
  };

  // Format budget with currency symbol
  const formattedBudget = props.budget
    ? `₦${Number(props.budget).toLocaleString('en-NG')}`
    : '—';

  // Format seeking status
  const seekingLabels: Record<string, string> = {
    have_place: "I have a place & need a roommate",
    need_place: "I'm Searching for accommodation.",
    both: "Open to either place or finding one",
    none: "Not looking right now",
  };
  const seekingText = props.seeking ? seekingLabels[props.seeking] || props.seeking : '—';

  return (
    <div className="rounded-2xl border border-[#dfeeff] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] sm:p-6">
      {/* Section Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2879ef] text-white shadow-xs">
            <FiUsers className="h-5 w-5" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Roommate Preferences
          </h2>
        </div>

        <button
          type="button"
          onClick={handleEditProfile}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50/50 hover:text-[#2879ef] active:scale-95"
        >
          <FiEdit2 className="text-xs" />
          <span>Edit</span>
        </button>
      </div>

      {/* Grid of Preferences */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <PreferenceItem
          icon={<FaWallet className="text-base" />}
          label="Budget"
          value={formattedBudget}
        />
        <PreferenceItem
          icon={<FiHome className="text-base" />}
          label="Seeking"
          value={seekingText}
        />
        <PreferenceItem
          icon={<FiUsers className="text-base" />}
          label="Max Roommates"
          value={props.max_roommates ? `${props.max_roommates}` : null}
        />
        <PreferenceItem
          icon={<FiCalendar className="text-base" />}
          label="Preferred Min Age"
          value={props.preferred_age_min ? `${props.preferred_age_min}` : null}
        />
        <PreferenceItem
          icon={<FiCalendar className="text-base" />}
          label="Preferred Max Age"
          value={props.preferred_age_max ? `${props.preferred_age_max}` : null}
        />
        <PreferenceItem
          icon={<FiUser className="text-base" />}
          label="Preferred Gender"
          value={props.preferred_gender}
        />
        <PreferenceItem
          icon={<FiCompass className="text-base" />}
          label="Preferred Tribe"
          value={props.preferred_tribe_name}
        />
        <PreferenceItem
          icon={<FiSun className="text-base" />}
          label="Preferred Religion"
          value={props.preferred_religion_name}
        />
        <PreferenceItem
          icon={<FiMapPin className="text-base" />}
          label={props.seeking === 'have_place' ? "Accommodation Location" : "Preferred Location"}
          value={props.seeking === 'have_place' ? props.accommodation_city_name : props.preferred_city_name}
        />
        {props.accommodation_city_name && props.seeking !== 'have_place' && (
          <PreferenceItem
            icon={<FiHome className="text-base" />}
            label="Available Accommodation"
            value={props.accommodation_city_name}
          />
        )}
      </div>
    </div>
  );
};

export default RoommatePreferenceProfile;
