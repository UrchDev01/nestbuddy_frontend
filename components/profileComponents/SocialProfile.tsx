'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  FiShare2, 
  FiExternalLink, 
  FiPlus, 
  FiShield 
} from 'react-icons/fi';
import { 
  FaFacebook, 
  FaInstagram, 
  FaLinkedin, 
  FaTwitter 
} from 'react-icons/fa';
import { SocialProfileProps } from '@/types';

const SocialProfile: React.FC<SocialProfileProps> = ({ 
  facebook, 
  twitter, 
  instagram, 
  linkedin 
}) => {
  const router = useRouter();

  const handleLinkSocials = () => {
    router.push('/profile-update/basic');
  };

  const socialsList = [
    {
      name: 'Instagram',
      url: instagram,
      icon: <FaInstagram className="text-pink-600 text-lg" />,
      colorBg: 'bg-pink-50',
    },
    {
      name: 'LinkedIn',
      url: linkedin,
      icon: <FaLinkedin className="text-sky-700 text-lg" />,
      colorBg: 'bg-sky-50',
    },
    {
      name: 'Facebook',
      url: facebook,
      icon: <FaFacebook className="text-blue-600 text-lg" />,
      colorBg: 'bg-blue-50',
    },
    {
      name: 'X (Twitter)',
      url: twitter,
      icon: <FaTwitter className="text-slate-800 text-lg" />,
      colorBg: 'bg-slate-100',
    },
  ].filter((item) => Boolean(item.url));

  const hasAnySocial = socialsList.length > 0;

  return (
    <div className="rounded-2xl border border-[#dfeeff] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#2879ef]">
            <FiShare2 className="text-base" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Socials</h3>
        </div>
      </div>

      {!hasAnySocial ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-800">
            No social profiles linked
          </p>
          <p className="text-xs leading-relaxed text-slate-500">
            Connect your social media accounts to help others get to know you better.
          </p>
          <button
            type="button"
            onClick={handleLinkSocials}
            className="w-full rounded-xl border border-blue-200 bg-blue-50/70 py-2.5 text-xs font-bold text-[#1f6fdd] transition hover:bg-blue-100/70 hover:text-[#185dc2] active:scale-98"
          >
            Link social profiles
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {socialsList.map((item) => (
            <a
              key={item.name}
              href={item.url!}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-xl border border-slate-200/80 p-2.5 transition hover:border-blue-200 hover:bg-blue-50/30"
            >
              <div className="flex items-center gap-2.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.colorBg}`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{item.name}</p>
                  <p className="max-w-[170px] truncate text-[11px] text-slate-400">
                    {item.url}
                  </p>
                </div>
              </div>
              <FiExternalLink className="text-xs text-slate-400 group-hover:text-[#2879ef]" />
            </a>
          ))}

          <button
            type="button"
            onClick={handleLinkSocials}
            className="mt-2 w-full text-center text-xs font-semibold text-[#1f6fdd] hover:underline"
          >
            Edit social links
          </button>
        </div>
      )}
    </div>
  );
};

export default SocialProfile;