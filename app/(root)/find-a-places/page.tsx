'use client';
import React, { useEffect, useState } from 'react';
import PropertyCard from '@/components/PropertyCard';
import { PropertyCardProps } from '@/types';
import { fetchProperties } from '@/utils/api';

const PropertyListingPage = () => {
        const [properties, setProperties] = useState<PropertyCardProps[]>([]);

        useEffect(() => {
                const getProperties = async () => {
                        const data = await fetchProperties();
                        if (data) {
                                setProperties(data.data);
                                console.log('Fetched properties:', data);
                        }
                };

                getProperties();
        }, []);

        return (
                <div className="property-listing h-[100vh]">
                        <h1 className="text-2xl font-bold mb-4">Property Listings</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {properties.map((property) => (
                                        <PropertyCard key={property.id} {...property} />
                                ))}
                        </div>
                </div>
        );
};

export default PropertyListingPage;