'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { clsx } from 'clsx';
import Image from 'next/image';
import { FiHeart, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { FaHome, FaUser, FaPuzzlePiece, FaRegCommentDots } from 'react-icons/fa';
import { } from "react-icons/fi";
import { isAuthenticated, logoutUser } from '@/utils/auth';
import { useRouter, usePathname } from "next/navigation";
import MobileNavBar from './MobileNavBar';
import NotificationsMenu from './NotificationsMenu';
import { listConversations } from '@/utils/messages';

const NavBar = () => {
        const [isOpen, setIsOpen] = useState(false);
        const [userAuthenticated, setUserAuthenticated] = useState(false)
        const [desktopIsopen, setDesktopIsOpen] = useState(false);
        const [isLoggingOut, setIsLoggingOut] = useState(false);
        const [unreadMessageCount, setUnreadMessageCount] = useState(0);

        const router = useRouter()
        const pathname = usePathname();

        const checkAuthentication = async () => {
                console.log("Checking authentication...")
                const authenticated = await isAuthenticated()
                console.log("Auth check result:", authenticated)
                setUserAuthenticated(authenticated)
        }

        useEffect(() => {
                // Check auth status when component mounts
                checkAuthentication()

                // Add event listener for storage events to handle auth changes
                const handleStorageChange = (e: StorageEvent) => {
                        console.log("Storage event:", e.key)
                        if (e.key === 'access_token') {  // assuming you store auth token in localStorage
                                checkAuthentication()
                        }
                }

                // Also check auth status when window gains focus
                const handleFocus = () => {
                        console.log("Window focused, checking auth...")
                        checkAuthentication()
                }

                window.addEventListener('storage', handleStorageChange)
                window.addEventListener('focus', handleFocus)

                // Cleanup listeners
                return () => {
                        window.removeEventListener('storage', handleStorageChange)
                        window.removeEventListener('focus', handleFocus)
                }
        }, [])

        useEffect(() => {
                if (!userAuthenticated) {
                        setUnreadMessageCount(0);
                        return;
                }

                let active = true;
                const refreshUnreadMessages = async () => {
                        if (document.visibilityState !== "visible") return;
                        try {
                                const conversations = await listConversations();
                                if (active) {
                                        setUnreadMessageCount(
                                                conversations.reduce(
                                                        (total, conversation) => total + conversation.unread_count,
                                                        0,
                                                ),
                                        );
                                }
                        } catch (error) {
                                console.error("Unable to refresh unread message count.", error);
                        }
                };
                const onStorage = (event: StorageEvent) => {
                        if (event.key === "access_token" || event.key === null) {
                                void refreshUnreadMessages();
                        }
                };
                const interval = window.setInterval(() => {
                        void refreshUnreadMessages();
                }, 5000);
                window.addEventListener("focus", refreshUnreadMessages);
                window.addEventListener("storage", onStorage);
                document.addEventListener("visibilitychange", refreshUnreadMessages);
                void refreshUnreadMessages();

                return () => {
                        active = false;
                        window.clearInterval(interval);
                        window.removeEventListener("focus", refreshUnreadMessages);
                        window.removeEventListener("storage", onStorage);
                        document.removeEventListener("visibilitychange", refreshUnreadMessages);
                };
        }, [userAuthenticated, pathname]);

        useEffect(() => {
                function onKey(e: KeyboardEvent) {
                        if (e.key === "Escape") setIsOpen(false);
                }
                window.addEventListener("keydown", onKey);
                return () => window.removeEventListener("keydown", onKey);
        })

        const toggleDropdown = () => {
                setIsOpen(!isOpen);
        };

        const handleDropdownClick = (event: React.MouseEvent) => {
                event.stopPropagation(); // Prevent click from propagating to the document
                toggleDropdown();
        }
        const closeDropdown = () => {
                setIsOpen(false);
        };

        const handleLogout = async () => {
                if (isLoggingOut) return;
                setIsLoggingOut(true);
                try {
                        await logoutUser();
                } finally {
                        setUserAuthenticated(false);
                        closeDropdown();
                        router.push('/sign-in');
                }
        }

        const linkClass = (href: string) =>
                `whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors duration-200 ${pathname === href
                        ? "bg-[#eaf5ff] text-[#2879ef]"
                        : "text-[#35506f] hover:bg-[#f3f8ff] hover:text-[#2879ef]"
                }`;

        const sideLinkClass = (href: string) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${pathname === href
                        ? "bg-[#eaf5ff] text-[#2879ef]"
                        : "text-[#35506f] hover:bg-[#f3f8ff] hover:text-[#2879ef]"
                }`;


        return (
                <>
                        {/* Desktop NavBar */}
                        <header className="fixed left-0 right-0 top-0 z-50 hidden h-[72px] items-center justify-between border-b border-[#e8f0fa] bg-white-1 px-4 shadow-[0_4px_18px_rgba(16,43,80,0.08)] lg:flex lg:px-5">
                                <Link href="/" className="shrink-0" aria-label="NestBuddy home">
                                        <img
                                                src="/new ui/NestbuddyLogo.png"
                                                alt="NestBuddy Logo"
                                                className="h-auto w-[150px] lg:w-[200px]"
                                        />
                                </Link>

                                <nav aria-label="Main navigation" className="flex min-w-0 items-center gap-0.5 lg:gap-2">
                                        <Link href='/' className={linkClass("/")}>
                                                Home
                                        </Link>

                                        <Link href='/find-a-place' className={linkClass("/find-a-place")}>
                                                Find a place
                                        </Link>
                                        <Link href='/ai-roommate-finder' className={linkClass("/ai-roommate-finder")}>
                                                Find roommates
                                        </Link>

                                        <Link href='/how-it-works' className={linkClass("/how-it-works")}>
                                                How it works
                                        </Link>
                                </nav>


                                <div className="ml-2 flex shrink-0 items-center gap-2">
                                        {userAuthenticated && <NotificationsMenu />}

                                        <div className="relative flex items-center justify-center rounded-full text-black">
                                                {userAuthenticated ? (

                                                        <button
                                                                type="button"
                                                                aria-label="Open account menu"
                                                                aria-expanded={isOpen}
                                                                onClick={handleDropdownClick}
                                                                className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-[#35506f] transition-colors hover:bg-[#f3f8ff]"
                                                        >
                                                                {isOpen ? <FiX /> : <FiMenu />}
                                                        </button>
                                                ) : (

                                                        <div className="flex items-center gap-2">
                                                                <Link className="rounded-full px-3 py-2 text-sm font-semibold text-[#35506f] transition-colors hover:bg-[#f3f8ff] hover:text-[#2879ef] lg:px-4" href="/sign-in">Log in</Link>
                                                                <Link className="rounded-full bg-[#2879ef] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1467dc] lg:px-5" href="/sign-up">Get started</Link>
                                                        </div>

                                                )}
                                                {/* Dropdown for user profile and settings */}


                                                <div className={clsx(
                                                        "pointer-events-none absolute right-0 top-[50px] z-50 w-72 rounded-2xl border border-[#e3edf8] bg-white-1 p-2 text-[#35506f] shadow-[0_16px_40px_rgba(16,43,80,0.20)]",
                                                        "transition-all duration-300 ease-out origin-top-right",
                                                        isOpen
                                                                ? "pointer-events-auto opacity-100 scale-100 translate-y-0"
                                                                : "opacity-0 scale-95 -translate-y-2"
                                                )}
                                                >
                                                        <p className="px-3 pb-2 pt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8aa0b9]">Account</p>
                                                        <Link onClick={closeDropdown} href='/profile' className={sideLinkClass("/profile")}>
                                                            <FaUser className="h-4 w-4 shrink-0 text-[#2879ef]" /> Profile
                                                        </Link>
                                                        <Link onClick={closeDropdown} href='/favorites' className={sideLinkClass("/favorites")}>
                                                            <FiHeart className="h-4 w-4 shrink-0 text-[#2879ef]" /> My Favorites
                                                        </Link>
                                                        <Link onClick={closeDropdown} href='/list-property' className={sideLinkClass("/list-property")}>
                                                            <FaHome className="h-4 w-4 shrink-0 text-[#2879ef]" /> List a Property
                                                        </Link>
                                                        <Link onClick={closeDropdown} href='/messages' className={sideLinkClass("/messages")}>
                                                                <span className="flex min-w-0 items-center gap-3">
                                                                        <FaRegCommentDots className="h-4 w-4 shrink-0 text-[#2879ef]" />
                                                                        Messages
                                                                </span>
                                                                {unreadMessageCount > 0 && (
                                                                        <span aria-label={`${unreadMessageCount} unread messages`} className="ml-auto rounded-full bg-[#2879ef] px-2 py-0.5 text-xs font-bold text-white-1">
                                                                                {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                                                                        </span>
                                                                )}
                                                        </Link>
                                                        <Link onClick={closeDropdown} href='/compatibility-quiz' className={sideLinkClass("/compatibility-quiz")}>
                                                                <FaPuzzlePiece className="h-4 w-4 shrink-0 text-[#2879ef]" /> Compatibility Quiz
                                                        </Link>
                                                        <div className="mx-2 my-2 border-t border-[#e8f0fa]" />
                                                        <button
                                                                type="button"
                                                                onClick={handleLogout}
                                                                disabled={isLoggingOut}
                                                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#c24141] transition-colors hover:bg-[#fff3f3]"
                                                        >
                                                                <FiLogOut className="h-4 w-4 shrink-0" /> {isLoggingOut ? "Signing out..." : "Sign out"}
                                                        </button>
                                                </div>

                                        </div>



                                </div>

                        </header>
                        {/* Mobile NavBar */}
                        <MobileNavBar userAuthenticated={userAuthenticated} handleLogout={handleLogout} isLoggingOut={isLoggingOut} unreadMessageCount={unreadMessageCount} />
                </>
        )
}

export default NavBar
