'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface MagneticCardProps {
  children: React.ReactNode;
  strength?: number;
  tiltStrength?: number;
  className?: string;
}

export const MagneticCard: React.FC<MagneticCardProps> = ({
  children,
  strength = 0.3,
  tiltStrength = 12,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const xTo = gsap.quickTo(element, 'x', { duration: 0.7, ease: 'power3.out' });
    const yTo = gsap.quickTo(element, 'y', { duration: 0.7, ease: 'power3.out' });
    const rotateXTo = gsap.quickTo(element, 'rotateX', { duration: 0.7, ease: 'power3.out' });
    const rotateYTo = gsap.quickTo(element, 'rotateY', { duration: 0.7, ease: 'power3.out' });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = element.getBoundingClientRect();
      
      const mouseX = clientX - (left + width / 2);
      const mouseY = clientY - (top + height / 2);

      const x = mouseX * strength;
      const y = mouseY * strength;

      const rotateX = (mouseY / (height / 2)) * -tiltStrength;
      const rotateY = (mouseX / (width / 2)) * tiltStrength;

      xTo(x);
      yTo(y);
      rotateXTo(rotateX);
      rotateYTo(rotateY);
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
      rotateXTo(0);
      rotateYTo(0);
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength, tiltStrength]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
};
