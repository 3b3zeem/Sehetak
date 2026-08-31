"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";

interface UniqueCardRevealProps {
  children: React.ReactNode;
  variant?:
    | "flip"
    | "slide-skew"
    | "scale-bounce"
    | "fade-blur"
    | "elastic-drop"
    | "slide-right";
  delay?: number;
  className?: string;
}

export const UniqueCardReveal: React.FC<UniqueCardRevealProps> = ({
  children,
  variant = "scale-bounce",
  delay = 0.1,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (variant === "flip") {
              gsap.fromTo(
                element,
                {
                  opacity: 0,
                  rotateX: -90,
                  y: -40,
                  transformPerspective: 1000,
                  transformOrigin: "center top",
                },
                {
                  opacity: 1,
                  rotateX: 0,
                  y: 0,
                  duration: 0.85,
                  delay,
                  ease: "back.out(1.4)",
                  clearProps: "transform",
                },
              );
            } else if (variant === "slide-skew") {
              gsap.fromTo(
                element,
                { opacity: 0, x: -100, skewX: -15, scale: 0.9 },
                {
                  opacity: 1,
                  x: 0,
                  skewX: 0,
                  scale: 1,
                  duration: 0.8,
                  delay,
                  ease: "power3.out",
                  clearProps: "transform",
                },
              );
            } else if (variant === "scale-bounce") {
              gsap.fromTo(
                element,
                { opacity: 0, scale: 0.65, y: 35 },
                {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  duration: 0.85,
                  delay,
                  ease: "back.out(2.2)",
                  clearProps: "transform",
                },
              );
            } else if (variant === "elastic-drop") {
              gsap.fromTo(
                element,
                { opacity: 0, y: -70, scale: 0.9 },
                {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.9,
                  delay,
                  ease: "bounce.out",
                  clearProps: "transform",
                },
              );
            } else if (variant === "slide-right") {
              gsap.fromTo(
                element,
                { opacity: 0, x: 100, rotate: 4 },
                {
                  opacity: 1,
                  x: 0,
                  rotate: 0,
                  duration: 0.8,
                  delay,
                  ease: "power2.out",
                  clearProps: "transform",
                },
              );
            } else if (variant === "fade-blur") {
              gsap.fromTo(
                element,
                { opacity: 0, filter: "blur(16px)", y: 40, scale: 0.92 },
                {
                  opacity: 1,
                  filter: "blur(0px)",
                  y: 0,
                  scale: 1,
                  duration: 0.9,
                  delay,
                  ease: "power3.out",
                  clearProps: "transform,filter",
                },
              );
            }
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [variant, delay]);

  return (
    <div ref={ref} className={`opacity-0 ${className}`}>
      {children}
    </div>
  );
};
