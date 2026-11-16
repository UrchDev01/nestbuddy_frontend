import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import Truncate from './Truncate'
import { MapPin, BadgeCheck, Home } from "lucide-react";
import { PropertyCardProps } from '@/types';

interface HomePropertyCardProps extends PropertyCardProps {
        direction: 'left' | 'right';
}

const HomePropertyCard = ({
        id,
        title,
        description,
        price,
        num_bedrooms,
        num_bathrooms,
        size_sqm,
        primary_image,
        city_name,
        state_name,
        property_status,
        direction,
        property_type
}: HomePropertyCardProps) => {
        const imageVariants: Variants = {
                enter: (direction: string) => ({
                        x: direction === 'right' ? 100 : -100,
                        opacity: 0
                }),
                center: {
                        x: 0,
                        opacity: 1,
                        transition: {
                                duration: 0.8,
                                ease: "easeInOut"
                        }
                }
        };

        const contentVariants: Variants = {
                enter: {
                        y: 100,
                        opacity: 0
                },
                center: {
                        y: 0,
                        opacity: 1,
                        transition: {
                                duration: 0.8,
                                ease: [0.42, 0, 0.58, 1],
                                delay: 0.3
                        }
                }
        };

        return (
                <div className='w-full flex md:flex-row flex-col items-center md:justify-between justify-center rounded-2xl relative'>
                        <motion.div
                                key={`image-${direction}-${title}`}
                                custom={direction}
                                variants={imageVariants}
                                initial="enter"
                                animate="center"
                                className='md:w-[60%] w-full md:h-[400px] h-[500px] relative '
                        >
                                <Link href={`/property/${id}`}>
                                        <Image
                                                src={`http://127.0.0.1:8000${primary_image}`}
                                                alt={title}
                                                width={500}
                                                height={500}
                                                className='w-full  md:h-full h-[300px] object-cover relative rounded-4xl'
                                        />
                                </Link>

                                <Image
                                        src="/luxury-room-vec.png"
                                        alt="luxury-room-vec.png"
                                        width={1000}
                                        height={700}
                                        className='absolute hidden md:block  top-1 right-[0rem] w-[20%] h-[400px]'
                                />

                                <Image
                                        src="/mobile-room.svg"
                                        alt="booking-bg-shape.png"
                                        width={1000}
                                        height={700}
                                        className='absolute md:hidden block  top-[201px] left-[2%] w-[95%] h-[100px] '
                                />

                        </motion.div>

                        <motion.div
                                key={`content-${direction}-${title}`}
                                variants={contentVariants}
                                initial="enter"
                                animate="center"
                                className="lg:w-[40%] md:w-[50%] w-[80%]  flex flex-col bg-white-1 rounded-2xl absolute top-[45%] md:top-[19%]  lg:right-[8%] md:right-[0.5%] right-[9.9%] z-10 shadow-4xl"
                        >
                                <Link href={`/property/${id}`} className='w-full  md:p-4 p-2 flex flex-col'>
                                        <h1 className='md:text-3xl text-xl font-extrabold text-black-1'>
                                                <Truncate text={title} length={40} />
                                        </h1>
                                        <p className='md:mt-6 mt-4 text-pink-950 md:text-2xl text-lg'>₦{price}</p>
                                        <p className='text-black-1 md:mt-6 mt-4'>
                                                <Truncate text={description} length={120} />
                                        </p>

                                        <div className="w-full  md:mt-8 mt-5 flex flex-wrap justify-between items-center text-gray-6">
                                                <p><MapPin className="w-5 h-5 inline-block mr-1" />{state_name} / {city_name}</p>
                                                <p><BadgeCheck className="w-5 h-5 inline-block mr-1" />{property_status}</p>
                                                <p><Home className="w-5 h-5  inline-block mr-1" />{property_type}</p>

                                        </div>
                                </Link>
                        </motion.div>
                </div>
        )
}

export default HomePropertyCard