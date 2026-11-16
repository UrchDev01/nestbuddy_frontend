import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageCircle, MapPin, ShieldCheck } from 'lucide-react';
import { homeProfileProps } from '@/types';

interface HomeRoommateCardProps extends homeProfileProps { }

const HomeRoommateCard: React.FC<HomeRoommateCardProps> = ({
        profile_image,
        preferred_city,
        gender,
        age,
        id,
        user,
}) => {
        const isVerified = user?.is_verified;
        const firstName = user?.first_name || 'User';
        const userType = user?.user_type || 'Roommate';

        return (
                <Link
                        href={`/roommates/${user.slug}/compatibility`}
                        className="group relative block md:w-[295px]   shrink-0 w-full  overflow-hidden rounded-2xl bg-white-1 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                >
                        {/* Image Container */}
                        <div className="relative aspect-[4/5] overflow-hidden">
                                <Image
                                        src={profile_image || '/images/placeholder-user.jpg'}
                                        alt={firstName}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                                {/* Verified Badge */}
                                {isVerified && (
                                        <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1.5 text-white-1 shadow-lg">
                                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                                <span className="text-xs font-medium">Verified</span>
                                        </div>
                                )}

                                {/* User Type Badge */}
                                <div className="absolute top-4 right-4 rounded-full bg-black/40 backdrop-blur-md px-3 py-1.5">
                                        <span className="text-xs font-medium text-white-1">{userType}</span>
                                </div>

                                {/* Bottom Info */}
                                <div className="absolute bottom-0 left-0 right-0 p-5 text-white-1">
                                        <h3 className="text-2xl font-bold tracking-tight">{firstName}, {age}</h3>
                                        <div className="mt-1 flex items-center gap-4 text-sm opacity-90">
                                                <span className="capitalize">{gender}</span>
                                                <span className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {preferred_city}
                                                </span>
                                        </div>
                                </div>

                                {/* Floating Action Buttons */}
                                <div className="absolute bottom-4 right-4 flex flex-col gap-3">
                                        <button className="rounded-full bg-white/20 p-3 backdrop-blur-md transition-all hover:bg-white/30 hover:scale-110">
                                                <MessageCircle className="w-5 h-5 text-white-1" />
                                        </button>
                                        <button className="rounded-full bg-white/20 p-3 backdrop-blur-md transition-all hover:bg-rose-500/80 hover:scale-110">
                                                <Heart className="w-5 h-5 text-white-1" />
                                        </button>
                                </div>
                        </div>
                </Link>
        );
};

export default HomeRoommateCard;