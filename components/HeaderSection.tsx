import Image from "next/image";

interface HeaderSectionProps {
        title: string;
        titleClassName?: string;
}

const HeaderSection = ({ title, titleClassName = "text-[3rem] font-dmSerif font-bold text-white-1" }: HeaderSectionProps) => {
        return (
                <>
                        <Image
                                src="/footer-bg-main.png"
                                alt="Shape"
                                width={1000}
                                height={1000}
                                className="w-[44%] h-[100px] object-cover absolute top-[-100px] left-1/2 transform -translate-x-1/2"
                        />
                        <div className="w-[44%] text-center flex justify-center items-center h-[100px] absolute z-50 top-[-100px] left-1/2 transform -translate-x-1/2">
                                <h1 className={titleClassName}>{title}</h1>
                        </div>
                        <Image
                                src="/footer-bg-shape.png"
                                alt="right-corner.png"
                                width={500}
                                height={500}
                                className="absolute bottom-0 right-0 left-1/2 transform -translate-x-1/2 h-[100px] w-[600px]"
                        />
                </>
        );
};

export default HeaderSection;