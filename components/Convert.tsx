import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const Convert = () => {
        const images = [
                '/reve-image-13.jpeg',
                '/reve-image-15.jpeg',
                '/reve-image-16.jpeg',
                '/reve-image-10.jpeg',
                '/reve-image-12.jpeg',
                '/reve-image-14.jpeg',
        ];

        const [currentImage, setCurrentImage] = useState(images[0]); // Set the first image as the default
        const [currentIndex, setCurrentIndex] = useState(0);

        // Automatically change the image every 5 seconds
        useEffect(() => {
                const interval = setInterval(() => {
                        setCurrentIndex((prevIndex) => {
                                const nextIndex = (prevIndex + 1) % images.length;
                                setCurrentImage(images[nextIndex]);
                                return nextIndex;
                        });
                }, 5000);

                return () => clearInterval(interval); // Cleanup interval on component unmount
        }, [images]);

        // Handle image click
        const handleImageClick = (image: string, index: number) => {
                setCurrentImage(image);
                setCurrentIndex(index);
        };

        return (
                <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{
                                duration: 0.8,
                                ease: "easeOut"
                        }}
                        className="flex flex-col items-start justify-start relative w-full h-[550px] md:p-4 p-2 bg-gray-1 rounded-tr-4xl rounded-bl-4xl rounded-br-4xl mt-[5rem] md:mt-[7rem]">
                        {/* Main Image */}
                        <Image
                                src={currentImage}
                                alt="convert"
                                width={1000}
                                height={850}
                                className="object-cover w-full md:h-[400px] h-[460px]  rounded-4xl"
                        />



                        <div className='absolute  flex flex-col items-center justify-center w-full h-full gap-4'>
                                <h1 className="lg:text-5xl md:text-4xl text-2xl font-bold apply-text-color text-center text-[#42f7df] shadow-md ">Convert Your Property</h1>
                                <p className="text-center font-semibold text-[#000000] apply-text-color text-wrap p-3 w-full">Convert your property into a co-living space and <br /> start earning rental income</p>
                                <button className="bg-gold-1 text-white px-4 py-2 rounded-lg mt-4">Get Started</button>
                        </div>




                        {/* Top Left Shape */}
                        <div className="absolute top-[-68px] md:top-[-95px]  left-0 md:w-[78%] w-[77%] md:h-[100px] h-[70px] scale-x-[-1]">
                                <Image
                                        src="/top-right-corner-list.svg"
                                        alt="top-left-corner-shape.png"
                                        width={1000}
                                        height={500}
                                        className="w-full h-full" // Adjusted top value
                                />

                        </div>

                        {/* Title Section */}
                        <div className="flex items-center justify-left w-[73%] px-6 py-2 absolute  top-[-5.8rem] left-0">
                                <div className="flex flex-col gap-3 text-black-1">
                                        <div className="flex gap-2 justify-start items-center">
                                                <div className="w-[7px] h-[7px] rounded-full bg-white-1"></div>
                                                <h3 className="font-semibold md:text-md text-[12px] text-white-1">Property Type</h3>
                                        </div>
                                        <h1 className="lg:text-[30px] md:text-[23px] text-[16px] font-bold text-white-1">Choose Property Type</h1>
                                </div>
                        </div>



                        <Image src='/footer-bg-shape.svg' alt='right-corner.png' width={500} height={500}
                                className='absolute bottom-0 right-0 left-1/2 transform -translate-x-1/2 md:h-[100px] h-[70px] w-[45%]' />






                        {/* Bottom Right Images */}
                        <div className="absolute bottom-[1rem] p-1 right-0 w-[30%]  flex items-start md:gap-2 gap-1 justify-end">
                                {images.slice(0, 3).map((image, index) => (
                                        <Image
                                                key={index}
                                                src={image}
                                                alt={`right-bottom-${index}`}
                                                width={500}
                                                height={500}
                                                className="left-0 md:w-[25%] w-[30%] md:h-[60px] h-[30px]  rounded-lg object-cover cursor-pointer"
                                                onClick={() => handleImageClick(image, index)}
                                        />
                                ))}
                        </div>

                        {/* Bottom Left Images */}
                        <div className="absolute bottom-[1rem] p-1 left-0 w-[30%]  flex items-start md:gap-2 gap-1 justify-start">
                                {images.slice(3).map((image, index) => (
                                        <Image
                                                key={index + 3}
                                                src={image}
                                                alt={`left-bottom-${index}`}
                                                width={500}
                                                height={500}
                                                className="left-0 md:w-[25%] w-[30%] md:h-[60px] h-[30px] rounded-lg object-cover cursor-pointer"
                                                onClick={() => handleImageClick(image, index + 3)}
                                        />
                                ))}
                        </div>
                </motion.div>
        );
};

export default Convert;