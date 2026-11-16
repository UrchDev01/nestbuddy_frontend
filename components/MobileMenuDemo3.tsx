"use client";
import React, { useState } from "react";
import { FaBars } from "react-icons/fa";

const menuItems = ["Home", "About", "Services", "Contact"];

const MobileMenuDemo3: React.FC = () => {
        const [navOpen, setNavOpen] = useState(false);

        return (
                <div className="relative w-full min-h-screen bg-gray-100 flex flex-col items-center justify-center">
                        {/* Mobile Frame */}
                        <div className="relative w-[375px] h-[667px] bg-gray-300 shadow-lg overflow-hidden">
                                {/* Burger Button */}
                                <button
                                        className="absolute left-5 top-4 z-30 w-8 h-8 flex flex-col justify-between"
                                        onClick={() => setNavOpen((open) => !open)}
                                        aria-label="Open menu"
                                >
                                        <span className="block h-1 bg-red-500 rounded transition-all" />
                                        <span className="block h-1 bg-red-500 rounded transition-all" />
                                        <span className="block h-1 bg-red-500 rounded transition-all" />
                                </button>

                                {/* Side Nav */}
                                <ul
                                        className={`fixed top-0 left-0 h-full w-48 bg-white z-40 pt-24 pl-6 transition-all duration-500
            ${navOpen ? "translate-x-0" : "-translate-x-full"}
          `}
                                >
                                        {menuItems.map((item, idx) => (
                                                <li key={item} className="h-10 flex items-center mb-6 text-lg font-semibold text-gray-700">
                                                        {item}
                                                </li>
                                        ))}
                                </ul>

                                {/* Main Content with fade+scale+hide effect */}
                                <div
                                        className={`absolute top-0 left-0 w-full h-full bg-gray-50 z-10 transition-all duration-500
            ${navOpen ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"}
          `}
                                >
                                        <div className="h-16 bg-gray-200" />
                                        <div className="h-72 w-full relative overflow-hidden">
                                                <img
                                                        src="https://unsplash.com/photos/rAlGkaDAeOo/download?w=640"
                                                        alt="Demo"
                                                        className="object-cover w-full h-full absolute left-0 top-0"
                                                />
                                        </div>
                                        <div className="h-5 w-1/2 mx-auto my-10 bg-gray-200 rounded" />
                                        <div className="space-y-4 px-5">
                                                {[...Array(9)].map((_, i) => (
                                                        <div key={i} className="h-2.5 bg-gray-200 rounded" />
                                                ))}
                                        </div>
                                </div>
                        </div>
                </div>
        );
};

export default MobileMenuDemo3;
