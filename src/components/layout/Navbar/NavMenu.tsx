'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Info, Mail, User, Shield } from 'lucide-react';
import gsap from 'gsap';

interface NavMenuProps {
  locale: 'en' | 'ar';
  dict: any;
  userProfile?: { username: string; role: 'patient' | 'admin' } | null;
  dashboardPath: string;
}

export const NavMenu: React.FC<NavMenuProps> = ({
  locale,
  dict,
  userProfile,
  dashboardPath,
}) => {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);
  const activeLinkRef = useRef<HTMLAnchorElement | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Link definitions
  const links = [
    { href: `/${locale}`, label: dict.nav?.home, icon: <Home className="w-4 h-4" />, exact: true },
    { href: `/${locale}/about`, label: dict.nav?.about, icon: <Info className="w-4 h-4" /> },
    { href: `/${locale}/contact`, label: dict.nav?.contact, icon: <Mail className="w-4 h-4" /> },
  ];

  if (userProfile) {
    links.push({
      href: dashboardPath,
      label: dict.nav?.dashboard,
      icon: <User className="w-4 h-4" />,
      exact: false,
    });
    if (userProfile.role === 'admin') {
      links.push({
        href: `/${locale}/dashboard/admin`,
        label: dict.nav?.admin,
        icon: <Shield className="w-4 h-4" />,
        exact: false,
      });
    }
  }

  // Helper to check active route cleanly
  const checkIsActive = (linkHref: string, isExact?: boolean) => {
    const cleanPath = pathname.replace(/\/$/, '');
    const cleanHref = linkHref.replace(/\/$/, '');

    if (isExact || cleanHref === `/${locale}`) {
      return cleanPath === cleanHref;
    }
    return cleanPath === cleanHref || cleanPath.startsWith(`${cleanHref}/`);
  };

  // Move blob helper
  const moveBlobTo = (targetEl: HTMLElement, isHover = false) => {
    if (!navRef.current || !blobRef.current) return;

    const navRect = navRef.current.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    const leftOffset = targetRect.left - navRect.left;
    const width = targetRect.width;

    gsap.to(blobRef.current, {
      left: leftOffset,
      width: width,
      opacity: 1,
      duration: isHover ? 0.3 : 0.45,
      ease: isHover ? 'power2.out' : 'elastic.out(1, 0.65)',
    });
  };

  // Sync active blob on pathname change
  useEffect(() => {
    if (!navRef.current || !blobRef.current) return;

    const linksElements = navRef.current.querySelectorAll<HTMLAnchorElement>('a[data-navlink]');
    let foundActiveEl: HTMLAnchorElement | null = null;

    linksElements.forEach((linkEl, idx) => {
      const linkObj = links[idx];
      if (linkObj && checkIsActive(linkObj.href, linkObj.exact)) {
        foundActiveEl = linkEl;
      }
    });

    if (foundActiveEl) {
      activeLinkRef.current = foundActiveEl;
      moveBlobTo(foundActiveEl, false);
    } else {
      activeLinkRef.current = null;
      gsap.to(blobRef.current, {
        opacity: 0,
        duration: 0.25,
      });
    }
  }, [pathname, links.length]);

  const handleMouseEnterLink = (e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    setHoverIndex(index);
    moveBlobTo(e.currentTarget, true);
  };

  const handleMouseLeaveNav = () => {
    setHoverIndex(null);
    if (activeLinkRef.current) {
      moveBlobTo(activeLinkRef.current, false);
    } else if (blobRef.current) {
      gsap.to(blobRef.current, {
        opacity: 0,
        duration: 0.25,
      });
    }
  };

  return (
    <>
      {/* High Performance SVG Gooey Filter */}
      <svg className="hidden absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="gooey-shared-blob-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -6"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <nav
        ref={navRef}
        onMouseLeave={handleMouseLeaveNav}
        className="relative hidden md:flex items-center p-1"
      >
        {/* SVG Gooey Layer Container */}
        <div
          className="absolute inset-0 pointer-events-none overflow-visible"
          style={{ filter: 'url(#gooey-shared-blob-filter)' }}
        >
          {/* Shared Sliding Liquid Blob */}
          <div
            ref={blobRef}
            className="absolute top-1 bottom-1 rounded-lg bg-[#008080] opacity-0 pointer-events-none shadow-sm"
          />
        </div>

        {/* Links List */}
        {links.map((link, idx) => {
          const isActive = checkIsActive(link.href, link.exact);
          const isHovered = hoverIndex === idx;

          // Link styling:
          // 1. Hovered by blob -> white text
          // 2. No hover anywhere and active -> white text (blob is on it)
          // 3. Hovering another link, but this is active -> bold teal text & active underline dot!
          let textClass = 'text-slate-600 hover:text-slate-900';
          if (isHovered) {
            textClass = 'text-white font-bold';
          } else if (hoverIndex === null && isActive) {
            textClass = 'text-white font-bold';
          } else if (hoverIndex !== null && isActive) {
            textClass = 'text-[#008080] font-bold';
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              data-navlink="true"
              onMouseEnter={(e) => handleMouseEnterLink(e, idx)}
              className={`relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer ${textClass}`}
            >
              <span className="inline-flex items-center transition-colors">
                {link.icon}
              </span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
