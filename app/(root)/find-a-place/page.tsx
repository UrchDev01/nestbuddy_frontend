"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import { motion } from 'framer-motion';
import { fetchProperties } from "@/utils/api";
import { Property, PropertyFilter } from "@/types";
import PropertyFilters from "@/components/PropertyFilters";
import Pagination from "@/components/Pagination";
import PropertyCard from "@/components/PropertyCard";
import AuthGuard from "@/app/hoc/AuthGuard";
import VerificationGuard from "@/components/VerificationGuard";
import BannerSection from "@/components/BannerSection";
import PageHeaderSection from "@/components/PageHeaderSection";
import LoadingTwo from "@/components/LoadingTwo";
import FindAPlaceDashboard from "@/components/FindAPlaceDashboard";

const FindAPlace = () => {
        return <FindAPlaceDashboard />;

        const router = useRouter();
        const pathname = usePathname();
        const searchParams = useSearchParams();
        const [properties, setProperties] = useState<Property[]>([]);
        const [totalProperties, setTotalProperties] = useState(0);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState<string | null>(null);

        // Get initial filters from URL parameters
        const getInitialFilters = () => {
                const params: Record<string, any> = {};
                searchParams.forEach((value, key) => {
                        if (key !== 'page' && key !== 'ordering') {
                                params[key] = value;
                        }
                });
                return params;
        };

        const [filters, setFilters] = useState<PropertyFilter>(getInitialFilters());

        // Get page and ordering from URL or default values
        const getPageFromUrl = () => parseInt(searchParams.get('page') || '1', 10);
        const page = getPageFromUrl();
        const [currentPage, setCurrentPage] = useState<number>(page);
        const itemsPerPage = 5;
        const totalPages = Math.ceil(totalProperties / itemsPerPage);

        const getOrderingFromUrl = () => searchParams.get('ordering') || '-created_at';
        const [currentOrdering, setCurrentOrdering] = useState<string>(getOrderingFromUrl());

        useEffect(() => {
                const loadInitialProperties = async () => {
                        const page = getPageFromUrl();
                        const ordering = getOrderingFromUrl();
                        const initialFilters = getInitialFilters();
                        await loadProperties(page, ordering, initialFilters);
                };

                loadInitialProperties();
        }, []);

        useEffect(() => {
                const handleUrlChange = async () => {
                        const page = getPageFromUrl();
                        const ordering = getOrderingFromUrl();
                        const urlFilters = getInitialFilters();

                        // Deep comparison of filters to prevent unnecessary updates
                        const hasFilterChanges = JSON.stringify(urlFilters) !== JSON.stringify(filters);
                        const hasPageChange = page !== currentPage;
                        const hasOrderingChange = ordering !== currentOrdering;

                        // Only update if there are actual changes
                        if (hasFilterChanges || hasPageChange || hasOrderingChange) {
                                setCurrentPage(page);
                                setCurrentOrdering(ordering);
                                if (hasFilterChanges) {
                                        setFilters(urlFilters);
                                }
                                await loadProperties(page, ordering, urlFilters);
                        }
                };

                handleUrlChange();
        }, [searchParams.toString()]);

        const loadProperties = async (page: number, ordering: string, currentFilters: PropertyFilter) => {
                setLoading(true);
                setError(null);

                try {
                        const response = await fetchProperties(page, itemsPerPage, {
                                ...currentFilters,
                                ordering
                        });

                        // Match the exact backend response structure
                        if (response?.status === 'success' && response?.data) {
                                console.log("fetched properties", response)
                                setProperties(response.data.data.results);
                                setTotalProperties(response.data.data.count);
                        } else {
                                setProperties([]);
                                setTotalProperties(0);
                                console.error('Invalid response format:', response);
                                setError("No properties found");
                        }
                } catch (err: any) {
                        console.error("Error fetching properties:", err);
                        setError(err.message || "An error occurred while fetching properties");
                        setProperties([]);
                        setTotalProperties(0);
                } finally {
                        setLoading(false);
                }
        };

        const handleFilterChange = (newFilters: PropertyFilter) => {
                const params = new URLSearchParams();

                // Add filters to URL
                Object.entries(newFilters).forEach(([key, value]) => {
                        if (value !== undefined && value !== null && value !== '') {
                                params.append(key, value.toString());
                        }
                });

                // Add ordering parameter
                params.append('ordering', currentOrdering);

                // Reset to page 1 when filters change
                params.append('page', '1');

                // Update URL without causing a navigation
                const newUrl = `${pathname}?${params.toString()}`;
                router.push(newUrl, { scroll: false });
        };

        const handlePageChange = (page: number) => {
                if (page > totalPages) return;

                const params = new URLSearchParams(searchParams.toString());
                params.set('page', page.toString());

                router.push(`${pathname}?${params.toString()}`, { scroll: false });
        };

        const handleSortChange = (newOrdering: string) => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('ordering', newOrdering);

                router.push(`${pathname}?${params.toString()}`, { scroll: false });
        };



        return (
                <div
                        className="w-full md:px-4 px-0 md:mb-0 mb-3 flex flex-col items-start">

                        <BannerSection bannerImage="/findp.png" alt="Find a Place Banner" />

                        {/* Content */}
                        <motion.div
                                initial={{ y: 100, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true, amount: 0.1 }}
                                transition={{
                                        duration: 0.8,
                                        ease: "easeOut"
                                }} className="w-full bg-gray-1 md:px-6 px-2 pb-24  rounded-4xl mt-3 flex flex-col items-center justify-center gap-4 relative">
                                <PageHeaderSection title="Properties" />
                                {/* Filter Section */}
                                <PropertyFilters
                                        onFilterChange={handleFilterChange}
                                        initialFilters={filters}
                                        totalProperties={totalProperties}
                                />

                                {/* Sorting Options */}
                                <div className="w-full flex justify-between items-center mb-4">
                                        <div className="font-inter  text-white-1 text-sm ">{totalProperties} properties found</div>
                                        <div className="flex items-center">
                                                <span className="hidden md:block mr-2 font-inter text-sm  text-white-1">Sort by:</span>
                                                <select
                                                        value={currentOrdering}
                                                        onChange={(e) => handleSortChange(e.target.value)}
                                                        className="font-inter p-2 border border-gray-300 rounded-md text-sm"
                                                >
                                                        <option value="-created_at">Newest First</option>
                                                        <option value="created_at">Oldest First</option>
                                                        <option value="price">Price (Low to High)</option>
                                                        <option value="-price">Price (High to Low)</option>
                                                        <option value="-views_count">Most Viewed</option>
                                                </select>
                                        </div>
                                </div>

                                {/* Status Display */}
                                {loading ? (
                                        <div className="flex items-center justify-center min-h-screen"><LoadingTwo /></div>
                                ) : error ? (
                                        <div className="flex items-center justify-center min-h-screen text-red-500">
                                                <p>{error}</p>
                                                <button
                                                        onClick={() => handlePageChange(currentPage)}
                                                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                                >
                                                        Retry
                                                </button>
                                        </div>
                                ) : properties.length === 0 ? (
                                        <div className="flex items-center justify-center gap-2 pb-24 text-yellow-200">
                                                <span className="text-2xl">🏠</span>
                                                <span>No properties found matching your criteria</span>
                                                <span className="text-2xl">🔍</span>
                                        </div>
                                ) : (
                                        <div className="pb-24 w-full">
                                                <div className="w-full  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        {properties.map((property) => (
                                                                <PropertyCard key={property.id}  {...property} />

                                                        ))}
                                                </div>

                                                {totalPages > 1 && (
                                                        <div className="w-full flex justify-center items-center  py-4 mt-5">
                                                                <Pagination
                                                                        currentPage={currentPage}
                                                                        totalPages={totalPages}
                                                                        onPageChange={handlePageChange}
                                                                />
                                                        </div>
                                                )}
                                        </div>
                                )}
                        </motion.div>
                </div>
        );
};

export default function ProtectedFindAPlace() {
        return (
                <AuthGuard>
                        <VerificationGuard><FindAPlace /></VerificationGuard>
                </AuthGuard>
        );
}
