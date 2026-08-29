'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';

interface MobileLinkProps {
  href: string;
  icon: any;
  label: string;
  variant?: 'default' | 'primary' | 'amber' | 'danger';
  onClose?: () => void;
}

export const MobileLink: React.FC<MobileLinkProps> = ({
  href,
  icon: Icon,
  label,
  variant = 'default',
  onClose,
}) => {
  const isDanger = variant === 'danger';
  const isPrimary = variant === 'primary';
  const isAmber = variant === 'amber';
  const linkRef = useRef<HTMLAnchorElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = () => {
    if (linkRef.current) {
      gsap.to(linkRef.current, {
        x: 4,
        scale: 1.01,
        duration: 0.2,
        ease: 'power2.out',
      });
    }
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        rotate: 15,
        scale: 1.2,
        duration: 0.2,
        ease: 'back.out(2)',
      });
    }
  };

  const handleMouseLeave = () => {
    if (linkRef.current) {
      gsap.to(linkRef.current, {
        x: 0,
        scale: 1,
        duration: 0.2,
        ease: 'power2.out',
      });
    }
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        rotate: 0,
        scale: 1,
        duration: 0.2,
      });
    }
  };

  return (
    <Link
      ref={linkRef}
      href={href}
      onClick={() => onClose?.()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`flex items-center gap-2.5 p-2.5 border transition-colors ${
        isPrimary
          ? 'bg-[#008080]/10 border-[#008080]/30 text-[#008080] font-bold hover:bg-[#008080]/20'
          : isAmber
          ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold hover:bg-amber-100'
          : isDanger
          ? 'bg-red-50 border-red-200 text-red-700 font-bold hover:bg-red-100'
          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-[#008080]'
      }`}
    >
      <span ref={iconRef} className="inline-flex items-center">
        <Icon className="w-4 h-4 shrink-0" />
      </span>
      <span>{label}</span>
    </Link>
  );
};