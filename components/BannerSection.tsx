import Image from "next/image";

interface BannerSectionProps {
        bannerImage: string;
        alt?: string;
}

const BannerSection = ({ bannerImage, alt = "Banner" }: BannerSectionProps) => {
        return (
                <div className="bg-gray-1 w-full md:h-[300px] h-[200px] relative rounded-4xl">
                        <Image
                                src={bannerImage}
                                alt={alt}
                                width={1000}
                                height={850}
                                className="w-full  h-full object-cover object-center md:rounded-4xl rounded-b-4xl"
                        />
                        <Image
                                src="/footer-bg-shape.svg"
                                alt="Shape"
                                width={500}
                                height={500}
                                className="absolute bottom-0 right-0 left-1/2 transform -translate-x-1/2 lg:h-[100px] h-[80px] lg:w-[45%] md:w-[55%] w-[70%]"
                        />
                </div>
        );
};

export default BannerSection;