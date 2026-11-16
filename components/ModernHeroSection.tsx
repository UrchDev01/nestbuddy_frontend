import Image from 'next/image';




const ModernHeroSection = () => {
        return (
                <section className="relative bg-gray-100">
                        <div className="relative w-full h-[500px]">
                                <Image
                                        src="/hero-1.webp"
                                        alt="Hero Image"
                                        fill
                                        className='w-full h-full object-cover'
                                />

                        </div>
                </section>
        );
};

export default ModernHeroSection; 