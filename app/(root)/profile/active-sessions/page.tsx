'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    FiMonitor,
    FiSmartphone,
    FiTablet,
    FiMapPin,
    FiClock,
    FiShield,
    FiUser,
    FiLogOut,
    FiCheckCircle,
    FiAlertCircle,
    FiX,
    FiChevronRight,
    FiRefreshCw
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import AuthGuard from '@/app/hoc/AuthGuard';
import ConfirmationModal from '@/components/ConfirmationModal';
import { fetchActiveSessions, revokeSession, revokeOtherSessions } from '@/utils/api';
import { UserSession } from '@/types';

interface Toast {
    id: number;
    type: 'success' | 'error';
    message: string;
}

const ActiveSessionsPage = () => {
    const router = useRouter();

    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state for revoking a single session
    const [sessionToRevoke, setSessionToRevoke] = useState<UserSession | null>(null);
    const [isRevokingSingle, setIsRevokingSingle] = useState<boolean>(false);

    // Modal state for revoking all other sessions
    const [isRevokeOthersModalOpen, setIsRevokeOthersModalOpen] = useState<boolean>(false);
    const [isRevokingOthers, setIsRevokingOthers] = useState<boolean>(false);

    // Toast feedback notification
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    };

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const loadSessions = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetchActiveSessions();
            if (response?.status === 'success' && Array.isArray(response.data)) {
                setSessions(response.data);
            } else {
                throw new Error(response?.message || 'Failed to retrieve active sessions.');
            }
        } catch (err: any) {
            console.error('Error loading sessions:', err);
            setError(err.message || 'Unable to load active sessions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSessions();
    }, []);

    // Handle individual session revocation
    const handleConfirmRevokeSingle = async () => {
        if (!sessionToRevoke) return;
        try {
            setIsRevokingSingle(true);
            await revokeSession(sessionToRevoke.id);
            setSessions((prev) => prev.filter((s) => s.id !== sessionToRevoke.id));
            addToast(`Signed out device: ${sessionToRevoke.browser} on ${sessionToRevoke.os}`);
            setSessionToRevoke(null);
        } catch (err: any) {
            console.error('Revoke session failed:', err);
            addToast(err.message || 'Failed to sign out device.', 'error');
        } finally {
            setIsRevokingSingle(false);
        }
    };

    // Handle revoking all other sessions
    const handleConfirmRevokeOthers = async () => {
        try {
            setIsRevokingOthers(true);
            const res = await revokeOtherSessions();
            // Retain only current session
            setSessions((prev) => prev.filter((s) => s.is_current));
            addToast('Signed out of all other sessions.');
            setIsRevokeOthersModalOpen(false);
        } catch (err: any) {
            console.error('Revoke others failed:', err);
            addToast(err.message || 'Failed to sign out other sessions.', 'error');
        } finally {
            setIsRevokingOthers(false);
        }
    };

    const currentSession = sessions.find((s) => s.is_current);
    const otherSessions = sessions.filter((s) => !s.is_current);

    const getDeviceIcon = (deviceType: string) => {
        switch (deviceType.toLowerCase()) {
            case 'mobile':
                return <FiSmartphone className="text-xl sm:text-2xl text-blue-600" />;
            case 'tablet':
                return <FiTablet className="text-xl sm:text-2xl text-blue-600" />;
            default:
                return <FiMonitor className="text-xl sm:text-2xl text-blue-600" />;
        }
    };

    const formatLastActive = (dateString: string, isCurrent: boolean) => {
        if (isCurrent) return 'Active now';
        try {
            const date = new Date(dateString);
            const diffMs = Date.now() - date.getTime();
            if (diffMs < 3 * 60 * 1000) {
                return 'Active now';
            }
            return `Last active ${formatDistanceToNow(date, { addSuffix: true })}`;
        } catch {
            return 'Recently active';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 pt-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Desktop layout: Sidebar + Content */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Desktop Sidebar Navigation */}
                    <aside className="hidden md:block w-64 lg:w-72 shrink-0">
                        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-6 sticky top-24">
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Account</h3>
                                <p className="text-sm font-medium text-gray-700 mt-1">Profile & Security Settings</p>
                            </div>

                            <nav className="space-y-1.5">
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                >
                                    <FiUser className="text-lg text-gray-400" />
                                    <span>My Profile</span>
                                </Link>

                                <Link
                                    href="/profile/active-sessions"
                                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-100/60 shadow-xs"
                                >
                                    <div className="flex items-center gap-3">
                                        <FiShield className="text-lg text-blue-600" />
                                        <span>Active Sessions</span>
                                    </div>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                                        {sessions.length}
                                    </span>
                                </Link>

                                <Link
                                    href="/profile-update/basic"
                                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                >
                                    <FiRefreshCw className="text-lg text-gray-400" />
                                    <span>Edit Profile</span>
                                </Link>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 w-full min-w-0">
                        {/* Breadcrumbs */}
                        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-2">
                            <Link href="/profile" className="hover:text-blue-600 transition-colors">
                                Profile
                            </Link>
                            <FiChevronRight className="text-gray-400 text-xs" />
                            <span className="text-gray-500">Security</span>
                            <FiChevronRight className="text-gray-400 text-xs" />
                            <span className="font-semibold text-gray-800">Active Sessions</span>
                        </nav>

                        {/* Page Header Section */}
                        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-sm mb-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight font-montserrat">
                                        Active sessions
                                    </h1>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Review devices that are currently signed in to your account.
                                    </p>
                                </div>

                                {otherSessions.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setIsRevokeOthersModalOpen(true)}
                                        className="w-full md:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 border border-red-200/60 shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0 active:scale-98"
                                    >
                                        <FiLogOut className="text-base" />
                                        <span>Sign out all other sessions</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Error Banner */}
                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start justify-between gap-3 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <FiAlertCircle className="text-xl shrink-0 text-red-600" />
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                                <button
                                    onClick={loadSessions}
                                    className="text-xs font-bold text-red-700 underline hover:no-underline shrink-0"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* Loading Skeletons */}
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm animate-pulse flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
                                            <div className="space-y-2">
                                                <div className="w-40 h-4 bg-gray-200 rounded" />
                                                <div className="w-24 h-3 bg-gray-100 rounded" />
                                                <div className="w-32 h-3 bg-gray-100 rounded" />
                                            </div>
                                        </div>
                                        <div className="w-24 h-8 bg-gray-100 rounded-lg" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Current Session Card */}
                                {currentSession && (
                                    <div className="bg-white rounded-2xl border-2 border-blue-600/30 p-5 sm:p-6 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 sm:p-3.5 bg-blue-50 rounded-xl shrink-0 border border-blue-100/80">
                                                    {getDeviceIcon(currentSession.device_type)}
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h2 className="text-base sm:text-lg font-bold text-gray-900">
                                                            {currentSession.browser} on {currentSession.os}
                                                        </h2>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-green-100 text-green-800 border border-green-200">
                                                            CURRENT DEVICE
                                                        </span>
                                                    </div>

                                                    <p className="text-xs sm:text-sm text-gray-500 font-medium">
                                                        {currentSession.os}
                                                    </p>

                                                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-gray-500 pt-1">
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <FiMapPin className="text-gray-400" />
                                                            {currentSession.location || 'Aba, Nigeria'}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5 text-green-600 font-medium">
                                                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                            Active now
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="sm:self-center shrink-0">
                                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs sm:text-sm font-semibold border border-green-200">
                                                    <FiCheckCircle className="text-green-600 text-sm" />
                                                    <span>Active now</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Other Active Sessions */}
                                {otherSessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-sm transition-all hover:shadow-md hover:border-gray-300"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 sm:p-3.5 bg-gray-50 rounded-xl shrink-0 border border-gray-100">
                                                    {getDeviceIcon(session.device_type)}
                                                </div>

                                                <div className="space-y-1">
                                                    <h2 className="text-base sm:text-lg font-bold text-gray-900">
                                                        {session.browser} on {session.os}
                                                    </h2>

                                                    <p className="text-xs sm:text-sm text-gray-500 font-medium">
                                                        {session.os}
                                                    </p>

                                                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-gray-500 pt-1">
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <FiMapPin className="text-gray-400" />
                                                            {session.location || 'Aba, Nigeria'}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <FiClock className="text-gray-400" />
                                                            {formatLastActive(session.last_active, false)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="sm:self-center shrink-0 w-full sm:w-auto">
                                                <button
                                                    type="button"
                                                    disabled={isRevokingSingle && sessionToRevoke?.id === session.id}
                                                    onClick={() => setSessionToRevoke(session)}
                                                    className="w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                                                >
                                                    <FiLogOut className="text-sm" />
                                                    <span>Sign out</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Friendly Empty State if no other sessions exist */}
                                {otherSessions.length === 0 && !loading && (
                                    <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 sm:p-10 text-center shadow-xs">
                                        <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                                            <FiShield className="w-7 h-7" />
                                        </div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900">
                                            No other active sessions
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                                            Your account is currently only signed in on this device.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Modal: Confirm Single Session Sign Out */}
            <ConfirmationModal
                isOpen={sessionToRevoke !== null}
                title="Sign out this device?"
                description="This will sign you out of Ahiankwado on this device."
                confirmButtonText="Sign out"
                cancelButtonText="Cancel"
                isLoading={isRevokingSingle}
                onConfirm={handleConfirmRevokeSingle}
                onClose={() => setSessionToRevoke(null)}
            />

            {/* Modal: Confirm Revoke All Other Sessions */}
            <ConfirmationModal
                isOpen={isRevokeOthersModalOpen}
                title="Sign out of all other sessions?"
                description="This will sign you out of Ahiankwado on every other device. Your current session will remain active."
                confirmButtonText="Sign out other sessions"
                cancelButtonText="Cancel"
                isLoading={isRevokingOthers}
                onConfirm={handleConfirmRevokeOthers}
                onClose={() => setIsRevokeOthersModalOpen(false)}
            />

            {/* Toast Notifications */}
            <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl shadow-lg border text-sm font-medium transition-all transform translate-y-0 ${
                            toast.type === 'success'
                                ? 'bg-gray-900 text-white border-gray-800'
                                : 'bg-red-600 text-white border-red-700'
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            {toast.type === 'success' ? (
                                <FiCheckCircle className="text-green-400 text-base shrink-0" />
                            ) : (
                                <FiAlertCircle className="text-white text-base shrink-0" />
                            )}
                            <span>{toast.message}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeToast(toast.id)}
                            className="p-1 rounded-md hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                        >
                            <FiX className="text-base" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function ProtectedActiveSessions() {
    return (
        <AuthGuard>
            <ActiveSessionsPage />
        </AuthGuard>
    );
}
