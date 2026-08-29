'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  delay = 0.2,
  direction = 'up',
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let x = 0;
    let y = 0;
    if (direction === 'up') y = 30;
    if (direction === 'down') y = -30;
    if (direction === 'left') x = 30;
    if (direction === 'right') x = -30;

    gsap.fromTo(
      element,
      {
        opacity: 0,
        x,
        y,
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.8,
        delay,
        ease: 'power3.out',
      }
    );
  }, [delay, direction]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};
