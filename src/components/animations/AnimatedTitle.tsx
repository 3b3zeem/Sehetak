'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface AnimatedTitleProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div' | 'span';
  className?: string;
  delay?: number;
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({
  children,
  as: Tag = 'h2',
  className = '',
  delay = 0.1,
}) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resetElement = () => {
      gsap.set(element, { opacity: 0, y: 25, rotateX: -30, filter: 'blur(8px)' });
    };

    const animateIn = () => {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          y: 25,
          rotateX: -30,
          filter: 'blur(8px)',
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          filter: 'blur(0px)',
          duration: 0.75,
          delay,
          ease: 'power3.out',
        }
      );
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateIn();
          } else {
            resetElement();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [delay]);

  return (
    <Tag ref={ref as any} className={className}>
      {children}
    </Tag>
  );
};
