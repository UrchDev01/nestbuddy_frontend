"use client"
import Image from 'next/image';




const HeroSection = () => {

        return (
                <section className="relative bg-gray-1 w-full h-auto md:rounded-4xl rounded-t-none ">
                        <div className="relative w-full h-[550px] rounded-4xl flex">
                                <Image
                                        src="/hero-1n2.png"
                                        alt="Hero Image"
                                        width={1000}
                                        height={850}
                                        className='w-full h-full object-cover object-center rounded-4xl relative'
                                        priority
                                />

                                <div className='absolute flex flex-col md:justify-center md:items-center gap-3 lg:w-[50%] md:w-[70%] w-full h-auto left-0 transform '>
                                        <h1 className='p-2 font-extrabold lg:text-[50px] md:text-[45px] text-[30px] apply-text-color shadow-md mt-7'>Find roommates who truly match your vibe—with AI</h1>
                                        <h3 className='p-2 font-bold md:text-[22px] text-[17px] apply-text-color'>Join thousands of happy roommates who found their ideal living situation through our platform. It's fast, safe, and 100% free.</h3>
                                </div>

                                <div className="absolute  md:w-[80%] w-[80%]  md:h-[100px] h-[130px] left-1/2 transform -translate-x-1/2  bottom-[-1px] rounded-4xl ">
                                        <Image
                                                src="/booking-bg-shape-cleaned.svg"
                                                alt="booking-bg-shape.png"
                                                fill
                                                className='w-full h-full '
                                        />

                                </div>




                        </div>

                </section>
        );
};

export default HeroSection;