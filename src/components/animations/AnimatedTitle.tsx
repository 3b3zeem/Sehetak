'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface AnimatedTitleProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
  className?: string;
  delay?: number;
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({
  children,
  as: Tag = 'h2',
  className = '',
  delay = 0.1,
}) => {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    gsap.fromTo(
      element,
      {
        opacity: 0,
        y: 28,
        filter: 'blur(4px)',
      },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.9,
        delay,
        ease: 'power3.out',
      }
    );
  }, [delay]);

  return (
    <Tag ref={ref as any} className={className}>
      {children}
    </Tag>
  );
};
