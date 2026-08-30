'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  exact?: boolean;
}

export const NavLink: React.FC<NavLinkProps> = ({
  href,
  children,
  icon,
  className = '',
  exact = false,
}) => {
  const pathname = usePathname();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const blobRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  // Strict route match check
  const isActive = exact
    ? pathname === href
    : pathname === href || (href !== '/' && (pathname.startsWith(`${href}/`) || pathname === href));

  // Active state animation
  useEffect(() => {
    if (!blobRef.current || !textRef.current || !linkRef.current) return;

    if (isActive) {
      gsap.to(blobRef.current, {
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        backgroundColor: '#008080',
        boxShadow: '0 4px 14px rgba(0, 128, 128, 0.25)',
        duration: 0.35,
        ease: 'elastic.out(1, 0.6)',
      });
      gsap.to(textRef.current, {
        color: '#ffffff',
        fontWeight: '700',
        duration: 0.25,
      });
      if (iconRef.current) {
        gsap.to(iconRef.current, {
          color: '#ffffff',
          scale: 1.15,
          duration: 0.25,
        });
      }
    } else {
      gsap.to(blobRef.current, {
        scaleX: 0,
        scaleY: 0,
        opacity: 0,
        backgroundColor: '#008080',
        boxShadow: '0 0 0px transparent',
        duration: 0.25,
        ease: 'power2.inOut',
      });
      gsap.to(textRef.current, {
        color: '#475569', // slate-600
        fontWeight: '500',
        duration: 0.25,
      });
      if (iconRef.current) {
        gsap.to(iconRef.current, {
          color: '#64748b',
          scale: 1,
          duration: 0.25,
        });
      }
    }
  }, [isActive]);

  const handleMouseEnter = () => {
    if (!linkRef.current) return;

    // Liquid Expansion: Central Droplet -> Stretched Capsule
    if (blobRef.current && !isActive) {
      gsap.timeline()
        .fromTo(
          blobRef.current,
          { scaleX: 0.1, scaleY: 0.4, opacity: 0.9 },
          { scaleX: 1.15, scaleY: 0.85, opacity: 1, duration: 0.2, ease: 'power2.out' }
        )
        .to(blobRef.current, {
          scaleX: 1,
          scaleY: 1,
          backgroundColor: 'rgba(0, 128, 128, 0.1)',
          duration: 0.35,
          ease: 'elastic.out(1.2, 0.4)',
        });
    }

    if (iconRef.current) {
      gsap.to(iconRef.current, {
        color: isActive ? '#ffffff' : '#008080',
        scale: 1.2,
        rotate: -6,
        duration: 0.25,
        ease: 'back.out(2)',
      });
    }

    if (!isActive && textRef.current) {
      gsap.to(textRef.current, {
        color: '#008080',
        duration: 0.2,
      });
    }
  };

  const handleMouseLeave = () => {
    if (!linkRef.current) return;

    if (iconRef.current) {
      gsap.to(iconRef.current, {
        color: isActive ? '#ffffff' : '#64748b',
        scale: isActive ? 1.15 : 1,
        rotate: 0,
        duration: 0.25,
      });
    }

    if (!isActive) {
      if (blobRef.current) {
        gsap.to(blobRef.current, {
          scaleX: 0,
          scaleY: 0,
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in',
        });
      }
      if (textRef.current) {
        gsap.to(textRef.current, {
          color: '#475569',
          duration: 0.2,
        });
      }
    }
  };

  return (
    <>
      {/* High Performance SVG Gooey Filter */}
      <svg className="hidden absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="gooey-capsule-filter">
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

      <Link
        ref={linkRef}
        href={href}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer group ${className}`}
      >
        {/* Gooey Liquid Capsule Layer */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl"
          style={{ filter: 'url(#gooey-capsule-filter)' }}
        >
          <span
            ref={blobRef}
            className="absolute inset-0 rounded-xl bg-[#008080] opacity-0 scale-0 origin-center transition-none"
          />
        </div>

        {/* Icon */}
        {icon && (
          <span ref={iconRef} className="relative z-10 inline-flex items-center text-slate-500 transition-colors">
            {icon}
          </span>
        )}

        {/* Text Label */}
        <span ref={textRef} className="relative z-10 text-slate-600 transition-colors">
          {children}
        </span>
      </Link>
    </>
  );
};
