import Image from 'next/image'
import { FaUserCircle, FaQuestionCircle, FaSearch, FaComments, FaHome } from 'react-icons/fa';
import { motion } from 'framer-motion';

const steps = [
        {
                title: 'Create Your Profile',
                description: 'Sign up and create your detailed profile with preferences, lifestyle, and budget.',
                icon: <FaUserCircle size={40} className="text-blue-500" />,
        },
        {
                title: 'Answer Compatibility Questions',
                description: 'Answer roommate compatibility questions.',
                icon: <FaQuestionCircle size={40} className="text-green-500" />,
        },
        {
                title: 'Find Matches',
                description: 'Browse through potential roommates and properties that match your criteria.',
                icon: <FaSearch size={40} className="text-yellow-500" />,
        },
        {
                title: 'Connect & Chat',
                description: 'Message potential roommates to get to know them better before making decisions.',
                icon: <FaComments size={40} className="text-purple-500" />,
        },
        {
                title: 'Move In Together',
                description: 'Finalize details, sign agreements, and start your new living arrangement.',
                icon: <FaHome size={40} className="text-red-500" />,
        },
];

const HowItWorks: React.FC = () => {
        return (
                <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{
                                duration: 0.8,
                                ease: "easeOut"
                        }}
                        className="flex flex-col items-center gap-8 md:mt-[7rem] mt-[5rem] p-8  bg-gray-1 rounded-tl-4xl rounded-bl-4xl relative">

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ">
                                {steps.map((step, index) => (
                                        <div
                                                key={index}
                                                className="flex flex-col items-center text-center p-4  rounded-4xl bg-white-1 cursor-pointer hover:scale-110 duration-300"
                                        >
                                                <div className="mb-4">{step.icon}</div>
                                                <h3 className="text-xl font-semibold text-gray-700">{step.title}</h3>
                                                <p className="text-gray-600">{step.description}</p>
                                        </div>
                                ))}
                        </div>


                        <Image src='/top-right-corner-list.svg' alt='top-right-corner-list.png' width={500} height={500}
                                className='absolute md:top-[-6.1rem] top-[-4.3rem] right-0 w-[76%] md:w-[76.7%] md:h-[100px] h-[70px]' />

                        <div className='flex items-center justify-between w-[70%] px-4 py-2 absolute z-50 md:top-[-6.1rem] top-[-4.3rem] right-0'>
                                <div className='flex flex-col gap-3 text-black-1'>
                                        <div className='flex gap-2 justify-start items-center'>
                                                <div className='w-[7px] h-[7px] rounded-full bg-white-1'>
                                                </div>
                                                <h3 className='font-semibold md:text-md text-[12px] text-white-1'>Steps</h3>
                                        </div>

                                        <h1 className='lg:text-[30px] md:text-[23px] text-[16px] font-bold text-white-1'>How It Works</h1>
                                </div>
                        </div>

                        <Image src='/right-corner.svg' alt='right-corner.png' width={500} height={500}
                                className='absolute md:bottom-[-5.8rem] bottom-[-4.3rem] right-0 w-[30%] md:w-[30.5%] md:h-[100px] h-[70px]' />
                </motion.div>
        );
};

export default HowItWorks;