'use client';

import React, { useRef, useEffect } from 'react';
import { Pill, ShieldCheck, HeartPulse, Sparkles, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';

interface AboutAnimatedContentProps {
  dict: any;
}

export const AboutAnimatedContent: React.FC<AboutAnimatedContentProps> = ({ dict }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroIconRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Floating pulse animation for main Hero Icon
      if (heroIconRef.current) {
        gsap.to(heroIconRef.current, {
          y: -8,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
        });
      }

      // Staggered entrance for sections and cards
      gsap.from('.animate-item', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power3.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleCardMouseEnter = (index: number) => {
    const card = cardsRef.current[index];
    if (!card) return;

    gsap.to(card, {
      y: -6,
      boxShadow: '0 20px 25px -5px rgba(0, 128, 128, 0.1), 0 8px 10px -6px rgba(0, 128, 128, 0.05)',
      borderColor: 'rgba(0, 128, 128, 0.3)',
      duration: 0.3,
      ease: 'power2.out',
    });

    const icon = card.querySelector('.card-icon');
    if (icon) {
      gsap.to(icon, {
        scale: 1.15,
        rotate: 8,
        duration: 0.3,
        ease: 'back.out(2)',
      });
    }
  };

  const handleCardMouseLeave = (index: number) => {
    const card = cardsRef.current[index];
    if (!card) return;

    gsap.to(card, {
      y: 0,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      borderColor: '#e2e8f0',
      duration: 0.3,
      ease: 'power2.out',
    });

    const icon = card.querySelector('.card-icon');
    if (icon) {
      gsap.to(icon, {
        scale: 1,
        rotate: 0,
        duration: 0.3,
      });
    }
  };

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto space-y-10 py-8">
      {/* Header Section */}
      <div className="text-center space-y-4 animate-item">
        <div
          ref={heroIconRef}
          className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#008080] to-[#00a8a8] text-white flex items-center justify-center mx-auto shadow-xl shadow-[#008080]/20"
        >
          <HeartPulse className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {dict.marketing?.aboutTitle || 'About Sehetak'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          {dict.marketing?.aboutDesc ||
            'Empowering chronic care patients with meal-anchored medication routines, instant Telegram bot alerts, and comprehensive adherence insights.'}
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          ref={(el) => {
            if (el) cardsRef.current[0] = el;
          }}
          onMouseEnter={() => handleCardMouseEnter(0)}
          onMouseLeave={() => handleCardMouseLeave(0)}
          className="animate-item bg-white border border-slate-200 rounded-2xl p-8 shadow-sm transition-colors cursor-pointer space-y-4"
        >
          <div className="card-icon w-12 h-12 rounded-xl bg-teal-50 text-[#008080] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Data Integrity & Privacy</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            All user data, prescriptions, and health metrics are secured using Supabase Row Level Security (RLS) policies and encrypted server configurations.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#008080]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Bank-Grade Security Standards</span>
          </div>
        </div>

        <div
          ref={(el) => {
            if (el) cardsRef.current[1] = el;
          }}
          onMouseEnter={() => handleCardMouseEnter(1)}
          onMouseLeave={() => handleCardMouseLeave(1)}
          className="animate-item bg-white border border-slate-200 rounded-2xl p-8 shadow-sm transition-colors cursor-pointer space-y-4"
        >
          <div className="card-icon w-12 h-12 rounded-xl bg-sky-50 text-[#0077b6] flex items-center justify-center">
            <Pill className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Adherence Excellence</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            By anchoring medications around daily meal times and sending multi-channel reminders, Sehetak dramatically improves chronic condition management.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#0077b6]">
            <Sparkles className="w-4 h-4" />
            <span>Smart Meal Anchoring Logic</span>
          </div>
        </div>
      </div>
    </div>
  );
};
