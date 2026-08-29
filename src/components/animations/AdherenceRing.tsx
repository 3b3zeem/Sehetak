'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface AdherenceRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export const AdherenceRing: React.FC<AdherenceRingProps> = ({
  percentage,
  size = 80,
  strokeWidth = 7,
}) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;

    const offset = circumference - (percentage / 100) * circumference;

    gsap.fromTo(
      circle,
      { strokeDashoffset: circumference },
      {
        strokeDashoffset: offset,
        duration: 1.6,
        ease: 'power3.out',
      }
    );

    if (textRef.current) {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: percentage,
        duration: 1.6,
        ease: 'power3.out',
        onUpdate: () => {
          if (textRef.current) {
            textRef.current.innerText = `${Math.round(obj.val)}%`;
          }
        },
      });
    }
  }, [percentage, circumference]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#008080"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="square"
        />
      </svg>
      <span ref={textRef} className="absolute text-sm font-extrabold text-slate-900">
        0%
      </span>
    </div>
  );
};
