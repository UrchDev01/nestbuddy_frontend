'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FiBookOpen, FiEdit2, FiLayers } from 'react-icons/fi';
import { FaGraduationCap, FaUniversity } from 'react-icons/fa';
import { StudentProfileProps } from '@/types';

interface EducationItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
}

const EducationItem: React.FC<EducationItemProps> = ({ icon, label, value }) => {
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

const StudentProfile: React.FC<StudentProfileProps> = (props) => {
  const router = useRouter();

  const handleEditProfile = () => {
    router.push('/profile-update/school');
  };

  return (
    <div className="rounded-2xl border border-[#dfeeff] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] sm:p-6">
      {/* Section Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2879ef] text-white shadow-xs">
            <FaGraduationCap className="h-5 w-5" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Education
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

      {/* Grid of Education Info */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <EducationItem
          icon={<FaUniversity className="text-base" />}
          label="School / Institution"
          value={props.school_name}
        />
        <EducationItem
          icon={<FiBookOpen className="text-base" />}
          label="Department"
          value={props.department_name}
        />
        <EducationItem
          icon={<FiLayers className="text-base" />}
          label="Current Level"
          value={props.level ? `${props.level} Level` : null}
        />
      </div>
    </div>
  );
};

export default StudentProfile;