import Link from 'next/link';

const groups = [
  {
    heading: 'Product',
    links: [
      { label: 'Find a Roommate', href: '/ai-roommate-finder' },
      { label: 'Find a Place', href: '/find-a-place' },
      { label: 'AI Compatibility', href: '/compatibility-quiz' },
      { label: 'How It Works', href: '/how-it-works' },
    ],
  },
  {
    heading: 'Company',
    links: [{ label: 'About Us', href: '/about' }],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms & Conditions', href: '/terms' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="nb-footer px-6 pb-8 pt-14 sm:px-10 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_2fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3b8cff] text-xl">⌂</span>
            <span className="text-xl font-bold tracking-tight text-white">
              NEST<span className="text-[#64a9ff]">BUDDY</span>
            </span>
          </Link>
          <p className="mt-5 max-w-[220px] text-sm leading-6 text-[#a9c0db]">
            Better roommates. Brighter futures.
          </p>
        </div>

        <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-5 gap-y-8">
          {groups.map((group) => (
            <div key={group.heading}>
              <h3 className="text-sm font-bold text-white">{group.heading}</h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-xs text-[#abc1db] transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div>
          <h3 className="text-sm font-bold text-white">Stay connected</h3>
          <p className="mt-4 text-xs leading-5 text-[#abc1db]">
            Newsletter sign-up is not available yet.
          </p>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-7xl border-t border-[#24466d] pt-6 text-xs text-[#7fa0c5]">
        © {new Date().getFullYear()} NestBuddy. All rights reserved.
      </div>
    </footer>
  );
}
