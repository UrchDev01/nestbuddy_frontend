import { useState } from 'react';
import Link from 'next/link';
import { FiBell, FiHeart, FiX } from 'react-icons/fi';
import { FaUser, FaPuzzlePiece, FaRegCommentDots } from 'react-icons/fa';
import Button from '@/components/Button';
import { usePathname } from 'next/navigation';
import NotificationsMenu from './NotificationsMenu';

interface MobileNavBarProps {
        userAuthenticated: boolean;
        handleLogout: () => Promise<void>;
        isLoggingOut: boolean;
        unreadMessageCount: number;
}

const MobileNavBar: React.FC<MobileNavBarProps> = ({ userAuthenticated, handleLogout, isLoggingOut, unreadMessageCount }) => {
        const [isOpen, setIsOpen] = useState(false);
        const pathname = usePathname();

        const menuLinkClass = (href: string) =>
                `flex items-center gap-4 rounded-xl px-4 py-3.5 text-base font-medium transition-colors duration-200
     ${pathname === href
                        ? 'bg-[#eaf5ff] text-[#2879ef]'
                        : 'text-[#35506f] hover:bg-[#f3f8ff] hover:text-[#2879ef]'
                }`;

        return (
                <div className="lg:hidden">
                        {/* Top Bar */}
                        <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between gap-2 border-b border-[#e8f0fa] bg-white-1 px-3 shadow-[0_4px_18px_rgba(16,43,80,0.08)] sm:px-5">
                                <Link href="/" aria-label="NestBuddy home">
                                        <img
                                                src="/new ui/NestbuddyLogo.png"
                                                alt="NestBuddy Logo"
                                                className="h-auto w-[120px] sm:w-[140px]"
                                        />
                                </Link>
                                {userAuthenticated && <div className="ml-auto"><NotificationsMenu /></div>}
                                {!userAuthenticated && <Link href="/sign-up" className="ml-auto shrink-0 rounded-full bg-[#2879ef] px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1467dc] sm:px-4 sm:text-sm">Get started</Link>}
                                <button
                                        onClick={() => setIsOpen(true)}
                                        type="button"
                                        aria-label="Open navigation menu"
                                        aria-expanded={isOpen}
                                        className="flex h-10 w-10 items-center justify-center rounded-full text-[#35506f] transition-colors hover:bg-[#f3f8ff] active:scale-95"
                                >
                                        <span className="flex flex-col gap-1.5" aria-hidden="true">
                                                <span className="block h-0.5 w-5 rounded-full bg-current" />
                                                <span className="block h-0.5 w-5 rounded-full bg-current" />
                                                <span className="block h-0.5 w-5 rounded-full bg-current" />
                                        </span>
                                </button>
                        </header>

                        {/* Backdrop */}
                        <div
                                className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-md transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                        }`}
                                onClick={() => setIsOpen(false)}
                        />

                        {/* Sliding Menu */}
                        <nav
                                aria-label="Mobile navigation"
                                className={`fixed top-0 left-0 h-full w-80 max-w-[92vw] bg-white-1 shadow-2xl z-50 flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                                        }`}
                        >
                                {/* Menu Header */}
                                <div className="flex h-16 items-center justify-between border-b border-[#e8f0fa] px-5">
                                        <Link href="/" onClick={() => setIsOpen(false)} aria-label="NestBuddy home">
                                                <img
                                                        src="/new ui/NestbuddyLogo.png"
                                                        alt="NestBuddy Logo"
                                                        className="h-auto w-[140px]"
                                                />
                                        </Link>
                                        <button
                                                onClick={() => setIsOpen(false)}
                                                type="button"
                                                aria-label="Close navigation menu"
                                                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#f3f8ff] active:scale-95"
                                        >
                                                <FiX className="h-5 w-5 text-[#35506f]" />
                                        </button>
                                </div>

                                <div className="flex-1 overflow-y-auto px-4 py-8">
                                        <ul className="space-y-2">
                                                {[
                                                        { href: "/", label: "Home" },
                                                        { href: "/find-a-place", label: "Find a Place" },
                                                        { href: "/ai-roommate-finder", label: "AI Roommate Finder" },
                                                        { href: "/how-it-works", label: "How It Works" },
                                                ].map((item) => (
                                                        <li key={item.href}>
                                                                <Link
                                                                        href={item.href}
                                                                        onClick={() => setIsOpen(false)}
                                                                        className={menuLinkClass(item.href)}
                                                                >
                                                                        <span>{item.label}</span>
                                                                </Link>
                                                        </li>
                                                ))}
                                        </ul>

                                        {/* Auth Section */}
                                        {userAuthenticated ? (
                                                <>
                                                        <div className="my-8 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                                                        <div className="space-y-2">
                                                                {[
                                                                        { href: "/profile", icon: <FaUser className="w-5 h-5" />, label: "Profile" },
                                                                        { href: "/favorites", icon: <FiHeart className="w-5 h-5" />, label: "My Favorites" },
                                                                        { href: "/messages", icon: <FaRegCommentDots className="w-5 h-5" />, label: "Messages" },
                                                                        { href: "/notifications", icon: <FiBell className="h-5 w-5" />, label: "Notifications" },
                                                                        { href: "/compatibility-quiz", icon: <FaPuzzlePiece className="w-5 h-5" />, label: "Compatibility Quiz" },
                                                                ].map((item) => (
                                                                        <Link
                                                                                key={item.href}
                                                                                href={item.href}
                                                                                onClick={() => setIsOpen(false)}
                                                                                className={`${menuLinkClass(item.href)} ${item.href === pathname ? 'pl-8' : ''}`}
                                                                        >
                                                                                {item.icon}
                                                                                <span>{item.label}</span>
                                                                                {item.href === "/messages" && unreadMessageCount > 0 && (
                                                                                        <span aria-label={`${unreadMessageCount} unread messages`} className="ml-auto rounded-full bg-[#2879ef] px-2.5 py-1 text-xs font-bold text-white-1">
                                                                                                {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                                                                                        </span>
                                                                                )}
                                                                        </Link>
                                                                ))}
                                                        </div>

                                                        <div className="mt-10 px-4">
                                                                <Button
                                                                        title="Sign Out"
                                                                        containerStyles="w-full bg-red-400 text-white-1 font-bold rounded-2xl py-5 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
                                                                        handleClick={() => void handleLogout().finally(() => setIsOpen(false))}
                                                                        textStyles=''
                                                                        isLoading={isLoggingOut}
                                                                        isLoadingText='Signing out...'
                                                                        isDisabled={isLoggingOut}
                                                                />
                                                        </div>
                                                </>
                                        ) : (
                                                <div className="mt-8 grid gap-3 px-1">
                                                        <Link
                                                                href="/sign-in"
                                                                onClick={() => setIsOpen(false)}
                                                                className="rounded-full border border-[#dce8f5] px-5 py-3.5 text-center font-semibold text-[#35506f] transition-colors hover:bg-[#f3f8ff]"
                                                        >
                                                                Log in
                                                        </Link>
                                                        <Link
                                                                href="/sign-up"
                                                                onClick={() => setIsOpen(false)}
                                                                className="rounded-full bg-[#2879ef] px-5 py-3.5 text-center font-semibold text-white shadow-sm transition-colors hover:bg-[#1467dc]"
                                                        >
                                                                Get started
                                                        </Link>
                                                </div>
                                        )}
                                </div>
                        </nav>
                </div>
        );
};

export default MobileNavBar;
