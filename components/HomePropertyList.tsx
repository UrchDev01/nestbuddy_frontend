'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HomePropertyCard from './HomePropertyCard';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchFeaturedProperties } from '@/utils/api';
import { PropertyCardProps } from '@/types';
import { motion } from 'framer-motion';

export default function HomePropertyList() {
        const [currentIndex, setCurrentIndex] = useState(0);
        const [direction, setDirection] = useState<'left' | 'right'>('right');
        const [properties, setProperties] = useState<PropertyCardProps[]>([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

        useEffect(() => {
                const getProperties = async () => {
                        try {
                                setLoading(true);
                                const response = await fetchFeaturedProperties();
                                if (response?.data) {
                                        setProperties(response.data);
                                } else {
                                        setError('No properties found');
                                }
                        } catch (err) {
                                setError('Failed to fetch properties');
                                console.error('Error fetching properties:', err);
                        } finally {
                                setLoading(false);
                        }
                };

                getProperties();
        }, []);

        const currentProperty = properties[currentIndex];

        const handlePrevious = () => {
                if (currentIndex > 0) {
                        setDirection('left');
                        setCurrentIndex(currentIndex - 1);
                }
        };

        const handleNext = () => {
                if (currentIndex < properties.length - 1) {
                        setDirection('right');
                        setCurrentIndex(currentIndex + 1);
                }
        };

        return (
                <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className='bg-gray-1 w-full min-h-60 pb-[1rem] rounded-tl-4xl rounded-bl-4xl md:mt-[7rem] mt-[5rem] pt-2 relative'>
                        <div className='flex flex-col items-center justify-center w-full px-4 py-2'>
                                {loading ? (
                                        <div className="text-white text-center">Loading properties...</div>
                                ) : error ? (
                                        <div className="text-white text-center">{error}</div>
                                ) : properties.length === 0 ? (
                                        <div className="text-white text-center">No featured properties available</div>
                                ) : (
                                        <HomePropertyCard {...properties[currentIndex]} direction={direction} />
                                )}
                        </div>
                        <div>
                                <Image src='/top-right-corner-list.svg' alt='top-right-corner-list.png' width={500} height={500}
                                        className='absolute md:top-[-6.1rem] top-[-4.3rem] right-0 w-[76%] md:w-[76.7%] md:h-[100px] h-[70px]' />

                                <div className='flex items-center justify-between md:w-[70%] w-[70%] md:px-4 px-2 py-2 absolute z-50 md:top-[-6.1rem] top-[-4.3rem] right-0'>
                                        <div className='flex flex-col md:gap-3 gap-1 text-black-1'>
                                                <div className='flex gap-2 justify-start items-center'>
                                                        <div className='w-[7px] h-[7px] rounded-full bg-white-1'>
                                                        </div>
                                                        <h3 className='font-semibold md:text-md text-[12px] text-white-1'>SPACES</h3>
                                                </div>

                                                <h1 className='lg:text-[30px] md:text-[23px] text-[16px]   font-bold text-white-1'>Find Your Dream Space</h1>
                                        </div>

                                        <div className='flex md:gap-3 gap-1'>

                                                <button
                                                        onClick={handlePrevious}
                                                        className="lg:p-4 md:p-3 p-2 border border-white-1 text-white-1 rounded-lg hover:bg-white-1 hover:text-black-1 transition-colors hover:shadow-lg"
                                                >
                                                        <ChevronLeft className="lg:h-6 md:h-5 h-4 lg:w-6 md:w-5 w-4" />
                                                </button>


                                                <button
                                                        onClick={handleNext}
                                                        className="lg:p-4 md:p-3 p-2 border border-white-1 text-white-1 rounded-lg hover:bg-white-1 hover:text-black-1 transition-colors hover:shadow-lg">

                                                        <ChevronRight className="lg:h-6 md:h-5 h-4 lg:w-6 md:w-5 w-4" />
                                                </button>


                                        </div>


                                </div>
                        </div>
                        <div className='absolute md:bottom-[-6rem] bottom-[-4.3rem] right-0 w-[30%] md:w-[30.5%] md:h-[100px] h-[70px]'>
                                <Image src='/right-corner.svg' alt='right-corner.png' width={500} height={500}
                                        className='w-full h-full relative'
                                />
                                <Link href="/find-a-place" className='absolute top-[25%] bg-[#453030]  md:right-6 right-3 text-[12px] md:text-md md:p-3 md:py-3 p-2 rounded-full text-white-1 text-center font-bold'>See More</Link>

                        </div>



                </motion.div>
        );
}