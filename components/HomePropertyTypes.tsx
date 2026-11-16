import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const propertyTypes = [
        { type: 'Self Contain', icon: '🏠' },
        { type: 'Single Room', icon: '🛏️' },
        { type: 'Student Lodge', icon: '🎓' },
        { type: 'Shared Apartment', icon: '🏘️' },
        { type: 'Mini Flat', icon: '🏡' },
        { type: 'Flat', icon: '🏢' },
        { type: 'Duplex', icon: '🏚️' },


];

const HomePropertyTypes: React.FC = () => {
        return (
                <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{
                                duration: 0.8,
                                ease: "easeOut"
                        }}
                        className="flex w-full mt-[5rem] md:mt-[7rem] bg-gray-1 rounded-br-4xl rounded-tr-4xl relative">
                        <div className="flex w-full py-4 px-0 rounded-br-4xl rounded-bl-4xl rounded-tr-4xl overflow-x-auto">
                                <div className="flex property-type mt-6 flex-nowrap lg:gap-[170px] md:gap-[120px] gap-[90px]  text-gold-1 font-bold overflow-x-auto pb-4 no-scrollbar scroll-smooth " style={{ minWidth: '100%' }}>

                                        <Link
                                                href="/find-a-place?property_type=Self Contain"

                                                className="flex flex-col property-item  items-center justify-center gap-2 animate-item-scroll p-2  rounded-br-4xl rounded-bl-4xl shadow-sm lg:h-[200px] md:h-[160px] h-[130px] lg:w-[200px] md:w-[160px] w-[130px]  flex-shrink-0 relative"
                                        >
                                                <span className="bg-gray-1 p-4 md:w-[100px] md:h-[100px] w-[80px] h-[80px] lg:text-[50px] md:text-[35px] text-[28px]  rounded-full text-center flex justify-center items-center">
                                                        🏠
                                                </span>
                                                <span className='text-[13px] md:text-md lg:text-[15px]'>Self Contain</span>

                                                <Image
                                                        src="/top-left.png" alt='top left'
                                                        width={500}
                                                        height={500}
                                                        className='absolute top-0 lg:left-[-100px] md:left[-70px] left-[-78px] lg:w-[120px] md:w-[100px] w-[80px] lg:h-[130px] md:h-[100px] h-[80px]'
                                                />

                                                <Image
                                                        src="/top-right.png" alt='top left'
                                                        width={500}
                                                        height={500}
                                                        className='absolute top-0 lg:right-[-100px] md:right-[-97px] right-[-78px] lg:w-[120px] md:w-[100px] w-[80px] lg:h-[130px] md:h-[100px] h-[80px]'
                                                />
                                        </Link>



                                        <Link
                                                href="/find-a-place?property_type=Single Room"

                                                className="flex flex-col property-item  items-center justify-center gap-2 animate-item-scroll p-2  rounded-tr-4xl rounded-tl-4xl shadow-sm lg:h-[200px] md:h-[160px] h-[130px] lg:w-[200px] md:w-[160px] w-[130px] flex-shrink-0 relative"
                                        >
                                                <span className="bg-gray-1 p-4 md:w-[100px] md:h-[100px] w-[80px] h-[80px] lg:text-[50px] md:text-[35px] text-[28px] rounded-full text-center flex justify-center items-center">
                                                        🛏️
                                                </span>
                                                <span className='text-[13px] md:text-md lg:text-[15px]'>Single Room</span>

                                                <Image
                                                        src="/bottom-left.png" alt='top left'
                                                        width={500}
                                                        height={500}
                                                        className='absolute bottom-0 lg:left-[-100px] md:left[-70px] left-[-78px] lg:w-[120px] md:w-[100px] w-[80px] lg:h-[130px] md:h-[100px] h-[80px]'
                                                />

                                                <Image
                                                        src="/bottom-right.png" alt='top left'
                                                        width={500}
                                                        height={500}
                                                        className='absolute bottom-0 lg:right-[-100px] md:right-[-97px] right-[-78px] lg:w-[120px] md:w-[100px] w-[80px] lg:h-[130px] md:h-[100px] h-[80px]'
                                                />
                                        </Link>


                                        <Link
                                                href="/find-a-place?property_type=Student Lodge"

                                                className="flex flex-col property-item  items-center justify-center gap-2 animate-item-scroll p-2  rounded-br-4xl rounded-bl-4xl shadow-sm lg:h-[200px] md:h-[160px] h-[130px] lg:w-[200px] md:w-[160px] w-[130px] flex-shrink-0 relative"
                                        >
                                                <span className="bg-gray-1 p-4 md:w-[100px] md:h-[100px] w-[80px] h-[80px] lg:text-[50px] md:text-[35px] text-[28px] rounded-full text-center flex justify-center items-center">
                                                        🎓
                                                </span>
                                                <span className='text-[13px] md:text-md lg:text-[15px]'>Student Lodge</span>

                                                <Image
                                                        src="/top-left.png" alt='top left'
                                                        width={500}
                                                        height={500}
                                                        className='absolute top-0 lg:left-[-100px] md:left[-70px] left-[-78px] lg:w-[120px] md:w-[100px] w-[80px] lg:h-[130px] md:h-[100px] h-[80px]'
                                                />

                                                <Image
                                                        src="/top-right.png" alt='top left'
                                                        width={500}
                                                        height={500}
                                                        className='absolute top-0 lg:right-[-100px] md:right-[-97px] right-[-78px] lg:w-[120px] md:w-[100px] w-[80px] lg:h-[130px] md:h-[100px] h-[80px]'
                                                />
                                        </Link>


                                        <Link
                                                href="/find-a-place?property_type=Shared Apartment"

                                                className="flex flex-col property-item  items-center justify-center gap-2 animate-item-scroll p-2  rounded-tr-4xl rounded-tl-4xl shadow-sm lg:h-[200px] md:h-[160px] h-[130px] lg:w-[200px] md:w-[160px] w-[130px] flex-shrink-0 relative"
                                        >
                                                <span className="bg-gray-1 p-4 md:w-[100px] md:h-[100px] w-[80px] h-[80px] lg:text-[50px] md:text-[35px] text-[28px] rounded-full text-center flex justify-center items-center">
                                                        🏘️
                                                </span>
                                                <span className='text-[13px] md:text-md lg:text-[15px]'>Shared Apartment</span>

                                                <Image
                                                        src="/bottom-left.png" alt='top left'
                                                        width={500}
                                                        height={500}
                                                        className='absolute bottom-0 lg:left-[-100px] md:left[-70px] left-[-78px] lg:w-[120px] md:w-[100px] w-[80px] lg:h-[130px] md:h-[100px] h-[80px]'
                                                />

                                                <Image
                                                        src="/bottom-right.png" alt='top left'
                                                        width={500}
                                                        height={500}
                                                        className='absolute bottom-0 lg:right-[-100px] md:right-[-97px] right-[-78px] lg:w-[120px] md:w-[100px] w-[80px] lg:h-[130px] md:h-[100px] h-[80px]'
                                                />
                                        </Link>

                                        <Link
                                                href="/find-a-place?property_type=Mini Flat"

                                                className="flex flex-col property-item  items-center justify-center gap-2 animate-item-scroll p-2  rounded-br-4xl rounded-bl-4xl shadow-sm lg:h-[200px] md:h-[160px] h-[130px] lg:w-[200px] md:w-[160px] w-[130px] flex-shrink-0 relative"
                                        >
                                                <span className="bg-gray-1 p-4 md:w-[100px] md:h-[100px] w-[80px] h-[80px] lg:text-[50px] md:text-[35px] text-[28px] rounded-full text-center flex justify-center items-center">
                                                        🏡
                                                </span>
                                                <span className='text-[13px] md:text-md lg:text-[15px]'>Mini Flat</span>

                                                <Image
                                                        src="/top-left.png" alt='top left'
                                                        width={500}
                                                        height={500}
                                                        className='absolute top-0 lg:left-[-100px] md:left[-70px] left-[-78px] lg:w-[120px] md:w-[100px] w-[80px] lg:h-[130px] md:h-[100px] h-[80px]'
                                                />

                                                <Image
                                                        src="/top-right.png" alt='top left'
                                                        width={500}
                                                        height={500}
                                                        className='absolute top-0 lg:right-[-100px] md:right-[-97px] right-[-78px] lg:w-[120px] md:w-[100px] w-[80px] lg:h-[130px] md:h-[100px] h-[80px]'
                                                />
                                        </Link>

                                        <Link
                                                href="/find-a-place?property_type=Flat"

                                                className="flex flex-col property-item  items-center justify-center gap-2 animate-item-scroll p-2  rounded-tr-4xl rounded-tl-4xl shadow-sm lg:h-[200px] md:h-[160px] h-[130px] lg:w-[200px] md:w-[160px] w-[130px] flex-shrink-0 relative"
                                        >
                                                <span className="bg-gray-1 p-4 md:w-[100px] md:h-[100px] w-[80px] h-[80px] lg:text-[50px] md:text-[35px] text-[28px] rounded-full text-center flex justify-center items-center">
                                                        🏢
                                                </span>
                                                <span className='text-[13px] md:text-md lg:text-[15px]'>Flat</span>

                                                <Image
                                                        src="/bottom-left.png" alt='top left'
                                                        width={500}
                                                        height={500}
                                                        className='absolute bottom-0 lg:left-[-100px] md:left[-70px] left-[-78px] lg:w-[120px] md:w-[100px] w-[80px] lg:h-[130px] md:h-[100px] h-[80px]'
                                                />

                                                <Image
                                                        src="/bottom-right.png" alt='top left'
                                                        width={500}
                                                        height={500}
                                                        className='absolute bottom-0 lg:right-[-100px] md:right-[-97px] right-[-78px] lg:w-[120px] md:w-[100px] w-[80px] lg:h-[130px] md:h-[100px] h-[80px]'
                                                />
                                        </Link>

                                        <Link
                                                href="/find-a-place?property_type=Duplex"

                                                className="flex flex-col property-item  items-center justify-center gap-2 animate-item-scroll p-2  rounded-br-4xl rounded-bl-4xl shadow-sm lg:h-[200px] md:h-[160px] h-[130px] lg:w-[200px] md:w-[160px] w-[130px] flex-shrink-0 relative"
                                        >
                                                <span className="bg-gray-1 p-4 md:w-[100px] md:h-[100px] w-[80px] h-[80px] lg:text-[50px] md:text-[35px] text-[28px] rounded-full text-center flex justify-center items-center">
                                                        🏚️
                                                </span>
                                                <span className='text-[13px] md:text-md lg:text-[15px]'>Duplex</span>

                                                <Image
                                                        src="/top-left.png" alt='top left'
                                                        width={500}
                                                        height={500}
                                                        className='absolute top-0 lg:left-[-100px] md:left[-70px] left-[-78px] lg:w-[120px] md:w-[100px] w-[80px] lg:h-[130px] md:h-[100px] h-[80px]'
                                                />

                                                <Image
                                                        src="/top-right.png" alt='top left'
                                                        width={500}
                                                        height={500}
                                                        className='absolute top-0 lg:right-[-100px] md:right-[-97px] right-[-78px] lg:w-[120px] md:w-[100px] w-[80px] lg:h-[130px] md:h-[100px] h-[80px]'
                                                />
                                        </Link>

                                </div>




                                <div className='flex items-center justify-left w-[73%] px-6 py-2 absolute z-10  top-[-5.8rem] left-0'>
                                        <div className='flex flex-col gap-3 text-white-1'>
                                                <div className='flex gap-2 justify-start items-center'>
                                                        <div className='w-[7px] h-[7px] rounded-full bg-white-1'>
                                                        </div>
                                                        <h3 className='font-semibold md:text-md text-[12px] text-white-1'>Property Type</h3>
                                                </div>

                                                <h1 className='lg:text-[30px] md:text-[23px] text-[16px] font-bold text-white-1'>Choose Property Type</h1>
                                        </div>




                                </div>
                        </div>

                        {/* Adjusted Image */}
                        <div className="absolute top-[-68px] md:top-[-95px]  left-0 md:w-[78%] w-[78%] md:h-[100px] h-[70px] scale-x-[-1]">
                                <Image
                                        src="/top-right-corner-list.svg"
                                        alt="top-left-corner-shape.png"
                                        width={1000}
                                        height={500}
                                        className="w-full h-full" // Adjusted top value
                                />

                        </div>

                        <Image src='/left-corner.svg' alt='right-bottom.png' width={500} height={500}
                                className='absolute md:bottom-[-6rem] bottom-[-4.3rem] left-0 w-[30%] md:w-[30.5%] md:h-[100px] h-[70px] ' />
                </motion.div>
        );
};

export default HomePropertyTypes;