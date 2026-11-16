'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  FiHeart, 
  FiStar, 
  FiEdit2
} from 'react-icons/fi';
import { LifestyleProfileProps } from '@/types';

const LifestyleProfile: React.FC<LifestyleProfileProps> = ({ 
  hobbies_detail 
}) => {
  const router = useRouter();

  const handleEditProfile = () => {
    router.push('/profile-update/lifestyle');
  };

  // Extract valid hobby strings safely
  const formattedHobbies = Array.isArray(hobbies_detail)
    ? hobbies_detail
        .map((h: any) => {
          if (!h) return null;
          if (typeof h === 'string') return h;
          if (typeof h === 'object') return h.interest || h.name || null;
          return null;
        })
        .filter((h): h is string => Boolean(h && h.trim()))
    : [];

  return (
    <div className="rounded-2xl border border-[#dfeeff] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] sm:p-6">
      {/* Section Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2879ef] text-white shadow-xs">
            <FiHeart className="h-5 w-5" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Lifestyle
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

      {/* Hobbies / Interests Section */}
      <div className="mt-6 border-t border-slate-100 pt-5">
        <div className="mb-3.5 flex items-center gap-2">
          <FiStar className="text-[#2879ef] text-base" />
          <h3 className="text-sm font-bold text-slate-900">Hobbies & Interests</h3>
        </div>

        {formattedHobbies.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {formattedHobbies.map((hobby, index) => (
              <span
                key={`${hobby}-${index}`}
                className="inline-flex items-center rounded-full border border-[#dfeeff] bg-[#edf5ff] px-3.5 py-1.5 text-xs font-semibold text-[#1f6fdd] transition hover:bg-[#dfeeff]"
              >
                {hobby}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-slate-400">No hobbies or interests added yet.</p>
        )}
      </div>
    </div>
  );
};

export default LifestyleProfile;