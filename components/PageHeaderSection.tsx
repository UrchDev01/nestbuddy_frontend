import Image from "next/image";

interface PageHeaderSectionProps {
        title: string;
}

const PageHeaderSection = ({ title }: PageHeaderSectionProps) => {
        return (
                <>
                        <Image
                                src="/footer-bg-main.svg"
                                alt="Shape"
                                width={1000}
                                height={1000}
                                className="lg:w-[43%] md:w-[52%] w-[66%] lg:h-[100px] h-[80px] absolute lg:top-[-100px] top-[-80px] left-1/2 transform -translate-x-1/2"
                        />
                        <div className="lg:w-[43%] md:w-[52%] w-[66%] text-center flex justify-center items-center lg:h-[110px] h-[80px]  absolute z-20 lg:top-[-100px] top-[-80px] left-1/2 transform -translate-x-1/2">
                                <h1 className="md:text-[2.3rem] text-[1.8rem] font-montserrat font-bold text-white-1 text-wrap">{title}</h1>
                        </div>
                        <Image
                                src="/footer-bg-shape.svg"
                                alt="right-corner.png"
                                width={500}
                                height={500}
                                className="absolute bottom-0 right-0 left-1/2 transform -translate-x-1/2 md:h-[100px] h-[70px] w-[45%]"
                        />
                </>
        );
};

export default PageHeaderSection;