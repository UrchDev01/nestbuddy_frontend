import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { PropertyCardProps, Property } from '@/types';
import Link from "next/link";
import { FaBed, FaBath, FaMapMarkerAlt, FaHeart, FaRegHeart } from "react-icons/fa";
import { MdAttachMoney } from "react-icons/md";
import { checkIsFavorited, toggleFavorite } from '@/utils/api';
import { getStatusBadgeColor } from '@/utils/propertyUtils';
import Truncate from './Truncate';

const PropertyCard: React.FC<Partial<PropertyCardProps> & Partial<Property> & { id: number; slug: string; title: string }> = ({
        title,
        id,
        slug,
        address,
        listing_type,
        description,
        price,
        primary_image,
        city_name,
        state_name,
        num_bedrooms,
        num_bathrooms,
        size_sqm,
        rental_period,
        property_type,
        property_status
}) => {
        const [isFavorited, setIsFavorited] = useState(false);
        const [isLoading, setIsLoading] = useState(false);

        useEffect(() => {
                const checkFavoriteStatus = async () => {
                        try {
                                const favorited = await checkIsFavorited(id);
                                setIsFavorited(favorited);
                        } catch (error) {
                                console.error('Error checking favorite status:', error);
                        }
                };

                checkFavoriteStatus();
        }, [id]);

        const handleFavoriteClick = async (e: React.MouseEvent) => {
                e.preventDefault(); // Prevent card click event
                e.stopPropagation(); // Stop event bubbling

                if (isLoading) return;

                setIsLoading(true);
                try {
                        const result = await toggleFavorite(id);
                        setIsFavorited(result.status === 'added');
                } catch (error) {
                        console.error('Error toggling favorite:', error);
                } finally {
                        setIsLoading(false);
                }
        };

        // Format price with comma separators
        const formatPrice = (price: number) => {
                return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        };


        return (
                <div className="bg-white-1 md:h-[350px] flex flex-col rounded-lg shadow-md hover:shadow-lg transition-shadow relative">

                        {/* Property Image */}
                        <Link href={`/properties/${slug}`} className='w-full h-48 relative'>
                                <div className="w-full h-full">
                                        <Image
                                                src={`http://127.0.0.1:8000${primary_image}` || '/default-jpg'}
                                                alt={title}
                                                fill
                                                className="object-cover w-full"
                                        />

                                </div>

                        </Link>

                        <div className="absolute top-2 left-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(property_status || 'available')}`}>
                                        {property_status || 'Available'}
                                </span>
                        </div>


                        <div className="absolute top-2 w-[30px] h-[30px] rounded-full right-2">
                                <button
                                        onClick={handleFavoriteClick}
                                        className="bg-white w-full p-2 rounded-full shadow-xl text-center flex items-center justify-center hover:bg-gray-100 transition-colors"
                                        disabled={isLoading}
                                >
                                        {isFavorited ? (
                                                <FaHeart className="text-red-500 text-xl" />
                                        ) : (
                                                <FaRegHeart className="text-gray-500 text-xl" />
                                        )}
                                </button>
                        </div>

                        <div className="absolute top-[158px]  left-2">
                                <span className={`px-2 py-1 rounded-md text-white-1 text-xs ${(listing_type || 'rent').toLowerCase() === 'rent' ? 'bg-blue-500' :
                                        (listing_type || '').toLowerCase() === 'sale' ? 'bg-green-500' : 'bg-purple-500'
                                        }`}>
                                        {(listing_type || 'rent').toLowerCase() === 'rent' ? 'For Rent' :
                                                (listing_type || '').toLowerCase() === 'sale' ? 'For Sale' : 'Short Term'}
                                </span>
                        </div>


                        {/* Property Details */}
                        <div className="p-4">
                                <div className="flex w-full mb-2">
                                        <div className="flex-1">


                                                <div className='flex w-full flex-wrap items-center justify-between'>
                                                        <h3 className="text-lg font-montserrat font-semibold">
                                                                <Truncate text={title} length={30} />
                                                        </h3>
                                                        <div className="flex items-center text-green-600 font-montserrat font-bold">
                                                                <MdAttachMoney className="text-lg" />
                                                                <span>{formatPrice(price || 0)}</span>
                                                        </div>

                                                </div>
                                                <div className="flex justify-start items-center text-gray-600 font-montserrat text-sm mt-1 flex-wrap">
                                                        <FaMapMarkerAlt className="mr-1" />
                                                        <Truncate text={`${address}, ${city_name}`} length={40} />
                                                </div>
                                        </div>

                                </div>

                                {/* Property Features */}
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center text-gray-700 font-playfair text-sm">
                                                <FaBed className="mr-1" />
                                                <span>{num_bedrooms} {num_bedrooms === 1 ? 'Bed' : 'Beds'}</span>
                                        </div>
                                        <div className="font-inter">

                                                <span className="text-xs text-gray-500">
                                                        /{rental_period}
                                                </span>
                                        </div>
                                        <div className="flex items-center text-gray-700 font-playfair text-sm">
                                                <FaBath className="mr-1" />
                                                <span>{num_bathrooms} {num_bathrooms === 1 ? 'Bath' : 'Baths'}</span>
                                        </div>
                                        <div className="text-xs bg-gray-100 px-2 py-1 rounded-md font-playfair">
                                                {property_type}
                                        </div>
                                </div>
                        </div>
                </div>
        );
};

export default PropertyCard;