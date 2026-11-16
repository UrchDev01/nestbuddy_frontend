"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import { fetchProperties } from "@/utils/api";
import { Property, PropertyFilter } from "@/types";
import PropertyFilters from "@/components/PropertyFilters";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import AuthGuard from "@/app/hoc/AuthGuard";
import VerificationGuard from "@/components/VerificationGuard";
import { FaBed, FaBath, FaMapMarkerAlt, FaHeart } from "react-icons/fa";
import { MdAttachMoney } from "react-icons/md";
import BannerSection from "@/components/BannerSection";

const PropertiesContent = () => {
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
        const itemsPerPage = 5; // Updated to match backend pagination
        const totalPages = Math.ceil(totalProperties / itemsPerPage);

        const getOrderingFromUrl = () => searchParams.get('ordering') || '-created_at';
        const [currentOrdering, setCurrentOrdering] = useState<string>(getOrderingFromUrl());

        const [isInitialLoad, setIsInitialLoad] = useState(true);

        useEffect(() => {
                const handleUrlChange = async () => {
                        const page = getPageFromUrl();
                        const ordering = getOrderingFromUrl();
                        const urlFilters = getInitialFilters();

                        // Skip the initial load to prevent double-fetching
                        if (isInitialLoad) {
                                setIsInitialLoad(false);
                                return;
                        }

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
        }, [searchParams.toString(), filters, currentPage, currentOrdering]);

        // Initial load
        useEffect(() => {
                if (isInitialLoad) {
                        const page = getPageFromUrl();
                        const ordering = getOrderingFromUrl();
                        const initialFilters = getInitialFilters();
                        loadProperties(page, ordering, initialFilters);
                }
        }, []);

        const loadProperties = async (page: number, ordering: string, currentFilters: PropertyFilter) => {
                setLoading(true);
                setError(null);

                try {
                        const response = await fetchProperties(page, itemsPerPage, {
                                ...currentFilters,
                                ordering
                        });

                        // Match the backend's response structure
                        if (response?.status === 'success' && response?.data?.results) {
                                setProperties(response.data.results);
                                setTotalProperties(response.data.count || 0);
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

        // Format price with comma separators
        const formatPrice = (price: number) => {
                return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        };

        // Render error state if there's an error
        if (error) {
                return <div className="text-center h-[60vh] mt-[10rem] text-red-500">{error}</div>;
        }

        return (
                <div className="w-full px-4 flex flex-col items-start">
                        <BannerSection bannerImage="/loginbg.webp" alt="Properties Banner" />

                        {/* Content */}
                        <div className="w-full bg-gray-1 px-6 h-auto pb-[13rem] rounded-4xl mt-4 flex flex-col items-center justify-center gap-4 relative">
                                {/* Header */}
                                <Image src="/footer-bg-shape_light.png" alt="Shape" width={1000} height={1000} className="w-[42%] h-[110px] object-cover absolute top-[-100px] left-1/2 transform -translate-x-1/2" />
                                <div className="w-[42%] text-center flex justify-center items-center h-[110px] absolute z-50 top-[-100px] left-1/2 transform -translate-x-1/2">
                                        <h1 className="text-[3rem] font-bold text-gray-2">Properties</h1>
                                </div>
                                <Image
                                        src="/footer-bg-shape.png"
                                        alt="right-corner.png"
                                        width={500}
                                        height={500}
                                        className="absolute bottom-0 right-0 left-1/2 transform -translate-x-1/2 h-[100px] w-[600px]"
                                />

                                {/* Filter Section */}
                                <PropertyFilters
                                        onFilterChange={handleFilterChange}
                                        initialFilters={filters}
                                        totalProperties={totalProperties}
                                />

                                {/* Sorting Options */}
                                <div className="w-full flex justify-between items-center mb-4">
                                        <div className="text-sm text-gray-600">{totalProperties} properties found</div>
                                        <div className="flex items-center">
                                                <span className="mr-2 text-sm">Sort by:</span>
                                                <select
                                                        value={currentOrdering}
                                                        onChange={(e) => handleSortChange(e.target.value)}
                                                        className="p-2 border border-gray-300 rounded-md text-sm"
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
                                        <div className="text-center h-[60vh] mt-[10rem]">Loading properties...</div>
                                ) : error ? (
                                        <div className="text-center h-[60vh] mt-[10rem] text-red-500">
                                                <p>{error}</p>
                                                <button
                                                        onClick={() => handlePageChange(currentPage)}
                                                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                                >
                                                        Retry
                                                </button>
                                        </div>
                                ) : properties.length === 0 ? (
                                        <div className="text-center mt-10">No properties found matching your criteria.</div>
                                ) : (
                                        <>
                                                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        {properties.map((property) => (
                                                                <div key={property.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                                                                        {/* Property Image */}
                                                                        <Link href={`/properties/${property.slug}`}>
                                                                                <div className="relative h-48 w-full">
                                                                                        <Image
                                                                                                src={`http://127.0.0.1:8000${property.primary_image}` || '/default-property.jpg'}
                                                                                                alt={property.title}
                                                                                                fill
                                                                                                className="object-cover"
                                                                                        />
                                                                                        <div className="absolute top-2 right-2">
                                                                                                <button className="bg-white p-2 rounded-full shadow-md">
                                                                                                        <FaHeart className="text-gray-400 hover:text-red-500" />
                                                                                                </button>
                                                                                        </div>
                                                                                        <div className="absolute bottom-2 left-2">
                                                                                                <span className={`px-2 py-1 rounded-md text-white text-xs ${property.listing_type === 'rent' ? 'bg-blue-500' :
                                                                                                        property.listing_type === 'sale' ? 'bg-green-500' : 'bg-purple-500'
                                                                                                        }`}>
                                                                                                        {property.listing_type === 'rent' ? 'For Rent' :
                                                                                                                property.listing_type === 'sale' ? 'For Sale' : 'Short Term'}
                                                                                                </span>
                                                                                        </div>
                                                                                </div>
                                                                        </Link>

                                                                        {/* Property Details */}
                                                                        <div className="p-4">
                                                                                <div className="flex justify-between items-start mb-2">
                                                                                        <div>
                                                                                                <h3 className="text-lg font-semibold truncate">{property.title}</h3>
                                                                                                <div className="flex items-center text-gray-600 text-sm mt-1">
                                                                                                        <FaMapMarkerAlt className="mr-1" />
                                                                                                        <span className="truncate">{property.address}, {property.city.name}</span>
                                                                                                </div>
                                                                                        </div>
                                                                                        <div className="text-right">
                                                                                                <div className="flex items-center text-green-600 font-bold">
                                                                                                        <MdAttachMoney className="text-lg" />
                                                                                                        <span>{formatPrice(property.price)}</span>
                                                                                                </div>
                                                                                                <span className="text-xs text-gray-500">
                                                                                                        {property.rental_period === 'monthly' ? '/month' :
                                                                                                                property.rental_period === 'yearly' ? '/year' :
                                                                                                                        property.rental_period === 'weekly' ? '/week' : '/day'}
                                                                                                </span>
                                                                                        </div>
                                                                                </div>

                                                                                {/* Property Features */}
                                                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                                                                        <div className="flex items-center text-gray-700 text-sm">
                                                                                                <FaBed className="mr-1" />
                                                                                                <span>{property.num_bedrooms} {property.num_bedrooms === 1 ? 'Bed' : 'Beds'}</span>
                                                                                        </div>
                                                                                        <div className="flex items-center text-gray-700 text-sm">
                                                                                                <FaBath className="mr-1" />
                                                                                                <span>{property.num_bathrooms} {property.num_bathrooms === 1 ? 'Bath' : 'Baths'}</span>
                                                                                        </div>
                                                                                        <div className="text-xs bg-gray-100 px-2 py-1 rounded-md">
                                                                                                {property.property_type}
                                                                                        </div>
                                                                                </div>
                                                                        </div>
                                                                </div>
                                                        ))}
                                                </div>

                                                {totalPages > 1 && (
                                                        <div className="w-full flex justify-center mt-8 mb-4">
                                                                <Pagination
                                                                        currentPage={currentPage}
                                                                        totalPages={totalPages}
                                                                        onPageChange={handlePageChange}
                                                                />
                                                        </div>
                                                )}
                                        </>
                                )}
                        </div>
                </div>
        );
};

export default function PropertiesPage() {
        return (
                <AuthGuard><VerificationGuard><Suspense fallback={<div className="w-full p-8 text-center text-slate-500">Loading properties...</div>}><PropertiesContent /></Suspense></VerificationGuard></AuthGuard>
        );
}