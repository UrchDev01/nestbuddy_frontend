import React from 'react';
import { motion } from 'framer-motion';
import { LuHeart } from "react-icons/lu";


const MatchingLoader = ({
        text = "Finding your perfect roommate..."
}: { text?: string }) => {
        return (
                <div
                        className="flex flex-col items-center justify-center min-h-64 py-12"
                        role="status"
                        aria-live="polite"
                        aria-label={text}
                >
                        {/* Animated Figures + Heart Connection */}
                        <div className="relative h-32 w-48 mb-8">
                                {/* Left Person */}
                                <motion.div
                                        animate={{
                                                x: [0, 68, 68, 0],
                                        }}
                                        transition={{
                                                duration: 3.2,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                        }}
                                        className="absolute left-4 bottom-6"
                                >
                                        <motion.div
                                                animate={{ y: [0, -8, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity }}
                                                className="h-20 w-14 rounded-t-full bg-gray-3 shadow-xl"
                                        >
                                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-gray-4 shadow-md" />
                                        </motion.div>
                                </motion.div>

                                {/* Right Person */}
                                <motion.div
                                        animate={{
                                                x: [0, -68, -68, 0],
                                        }}
                                        transition={{
                                                duration: 3.2,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                        }}
                                        className="absolute right-4 bottom-6"
                                >
                                        <motion.div
                                                animate={{ y: [0, -8, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                                                className="h-20 w-14 rounded-t-full bg-gray-3 shadow-xl"
                                        >
                                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-gray-4 shadow-md" />
                                        </motion.div>
                                </motion.div>

                                {/* Heart Pulse in the Middle */}
                                <motion.div
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{
                                                scale: [0, 1.4, 1],
                                                opacity: [0, 1, 1, 0]
                                        }}
                                        transition={{
                                                duration: 3.2,
                                                repeat: Infinity,
                                                times: [0, 0.4, 0.6, 1],
                                        }}
                                >
                                        <span className="text-5xl text-white-5"><LuHeart /></span>
                                </motion.div>
                        </div>

                        {/* Dynamic Text */}
                        <motion.p
                                key={text} // Re-animates when text changes
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="text-white-1 text-lg md:text-xl font-medium tracking-wide text-center max-w-md px-4"
                        >
                                {text}
                        </motion.p>

                        {/* Subtle typing indicator */}
                        <motion.div
                                className="mt-3 text-white-2 text-sm"
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 2, repeat: Infinity }}
                        >
                                Analyzing habits, schedules, and vibes
                                <span className="inline-block w-8 text-left">
                                        <motion.span
                                                animate={{ opacity: [1, 1, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                        >...</motion.span>
                                </span>
                        </motion.div>

                        {/* Screen reader only */}
                        <span className="sr-only">Matching in progress, please wait...</span>
                </div>
        );
};

export default MatchingLoader;