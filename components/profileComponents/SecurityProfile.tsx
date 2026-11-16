'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiShield, FiArrowRight, FiCheck } from 'react-icons/fi';
import { fetchActiveSessions } from '@/utils/api';

interface SecurityProfileProps {
  isVerified?: boolean;
}

const SecurityProfile: React.FC<SecurityProfileProps> = ({ isVerified = false }) => {
  const [sessionCount, setSessionCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadSessionCount = async () => {
      try {
        const response = await fetchActiveSessions();
        if (isMounted && response?.status === 'success') {
          const count = response.total_active_sessions ?? response.data?.length ?? 1;
          setSessionCount(count);
        } else {
          if (isMounted) setSessionCount(1);
        }
      } catch (err) {
        console.error('Failed to load session count:', err);
        if (isMounted) setSessionCount(1);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSessionCount();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-[#dfeeff] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#2879ef]">
            <FiShield className="text-base" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Security</h3>
        </div>

        {isVerified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
            <FiCheck className="text-xs text-emerald-600" />
            <span>Verified</span>
          </span>
        )}
      </div>

      {/* Active Sessions Block */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active sessions
          </p>
          <p className="mt-0.5 text-base font-extrabold text-slate-900">
            {loading ? (
              <span className="inline-block h-5 w-28 animate-pulse rounded bg-slate-100" />
            ) : (
              `${sessionCount ?? 1} active session${sessionCount === 1 ? '' : 's'}`
            )}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Manage the devices currently signed in to your account.
          </p>
        </div>

        <Link
          href="/profile/active-sessions"
          className="inline-flex w-full items-center justify-between rounded-xl border border-blue-100 bg-[#edf5ff]/80 px-4 py-2.5 text-xs font-bold text-[#1f6fdd] transition hover:bg-[#dfeeff] active:scale-98"
        >
          <span>View active sessions</span>
          <FiArrowRight className="text-sm" />
        </Link>
      </div>
    </div>
  );
};

export default SecurityProfile;
