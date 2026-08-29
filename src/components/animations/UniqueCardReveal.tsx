'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface UniqueCardRevealProps {
  children: React.ReactNode;
  variant?: 'flip' | 'slide-skew' | 'scale-bounce' | 'fade-blur';
  delay?: number;
  className?: string;
}

export const UniqueCardReveal: React.FC<UniqueCardRevealProps> = ({
  children,
  variant = 'scale-bounce',
  delay = 0.2,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (variant === 'flip') {
      gsap.fromTo(
        element,
        { opacity: 0, rotateX: -60, transformPerspective: 800 },
        { opacity: 1, rotateX: 0, duration: 0.9, delay, ease: 'power3.out' }
      );
    } else if (variant === 'slide-skew') {
      gsap.fromTo(
        element,
        { opacity: 0, x: -50, skewX: -6 },
        { opacity: 1, x: 0, skewX: 0, duration: 0.8, delay, ease: 'power2.out' }
      );
    } else if (variant === 'scale-bounce') {
      gsap.fromTo(
        element,
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 0.8, delay, ease: 'back.out(1.7)' }
      );
    } else if (variant === 'fade-blur') {
      gsap.fromTo(
        element,
        { opacity: 0, filter: 'blur(10px)', y: 20 },
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1, delay, ease: 'power3.out' }
      );
    }
  }, [variant, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};
