'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface FloatingBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const FloatingBadge: React.FC<FloatingBadgeProps> = ({ children, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const tween = gsap.to(element, {
      y: -5,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {children}
    </div>
  );
};
