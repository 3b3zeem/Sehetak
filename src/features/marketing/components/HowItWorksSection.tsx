'use client';

import React from 'react';
import { Utensils, Users, BellRing, ArrowRight, CheckCircle2 } from 'lucide-react';
import { FadeInView, AnimatedTitle } from '@/components/animations';

interface HowItWorksSectionProps {
  locale: string;
  dict: any;
}

export function HowItWorksSection({ locale, dict }: HowItWorksSectionProps) {
  const isAr = locale === 'ar';
  const m = dict?.marketing || {};

  const steps = [
    {
      stepNumber: '01',
      icon: Utensils,
      title: m.step1Title || (isAr ? '1. أدويتك ومواعيد وجباتك' : '1. Medications & Meal Anchors'),
      description:
        m.step1Desc ||
        (isAr
          ? 'سجل أدوية الضغط أو السكر وربطها بأوقات الإفطار والغداء، ليتعدل الموعد تلقائياً عند تغيير وقت وجبتك.'
          : 'Register blood pressure or diabetes medications anchored to meal times for automatic dynamic shifting.'),
      accentColor: 'from-[#008080] to-[#00A896]',
      badgeText: isAr ? 'جدولة مرنة بالوجبة' : 'Meal-Anchored',
    },
    {
      stepNumber: '02',
      icon: Users,
      title: m.step2Title || (isAr ? '2. شارك كود الربط العائلي' : '2. Share Family Invite Code'),
      description:
        m.step2Desc ||
        (isAr
          ? 'ولّد كود ربط مكون من 6 أرقام وشاركه مع ابنك أو مرافقك في ثوانٍ لمتابعة التزامك وحمايتك.'
          : 'Generate a 6-character code and share it with your son or caregiver to oversee your schedule in seconds.'),
      accentColor: 'from-[#0077B6] to-[#023E8A]',
      badgeText: isAr ? 'رعاية الأقارب' : 'Caregiver Sync',
    },
    {
      stepNumber: '03',
      icon: BellRing,
      title: m.step3Title || (isAr ? '3. تنبيهات فورية وتذكير حنون' : '3. Instant Alerts & Warm Nudges'),
      description:
        m.step3Desc ||
        (isAr
          ? 'تصل التنبيهات عبر تليجرام ومتصفح الهاتف بدون فتح التطبيق، وتُرسل تنبيهات إغفال للمرافق إذا تأخرت 20 دقيقة.'
          : 'Receive alerts via Telegram and Web Push even when closed, with missed-dose alerts sent to caregivers.'),
      accentColor: 'from-cyan-500 to-[#008080]',
      badgeText: isAr ? 'تليجرام و Push' : 'Telegram & Web Push',
    },
  ];

  return (
    <section className="space-y-12 py-6 relative">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 text-[#008080] text-xs font-bold border border-teal-100 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-[#008080]" />
          <span>{isAr ? 'خطوات بسيطة ونتائج ملموسة' : 'Simple Steps • High Adherence'}</span>
        </div>

        <AnimatedTitle as="h2" className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {m.howItWorksTitle || (isAr ? 'كيف تعمل منصة "صحتك" في 3 خطوات بسيطة؟' : 'How Sehetak Works in 3 Simple Steps')}
        </AnimatedTitle>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {m.howItWorksSubtitle ||
            (isAr
              ? 'نظام طبي متكامل يجمع بين البساطة لكبار السن والذكاء في التنبيهات للأبناء والمرافقين.'
              : 'A medical system combining simplicity for elderly users with smart background reminders for caregivers.')}
        </p>
      </div>

      {/* 3 Step Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;

          return (
            <FadeInView key={idx} delay={0.2 + idx * 0.15} direction="up">
              <div className="h-full bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-300 relative space-y-6 flex flex-col justify-between group overflow-hidden">
                
                {/* Step Number Background Glow */}
                <div className="absolute top-4 right-4 text-6xl font-black text-slate-100 select-none group-hover:text-teal-50/80 transition-colors pointer-events-none">
                  {step.stepNumber}
                </div>

                <div className="space-y-5 relative z-10">
                  {/* Icon Badge */}
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${step.accentColor} text-white flex items-center justify-center font-bold shadow-md shadow-teal-900/10 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Badge Text */}
                  <div className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-bold text-[11px]">
                    {step.badgeText}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Card Footer Decorator */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#008080] relative z-10">
                  <span>{isAr ? `الخطوة ${step.stepNumber}` : `Step ${step.stepNumber}`}</span>
                  <ArrowRight className={`w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 ${isAr ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </FadeInView>
          );
        })}
      </div>
    </section>
  );
}
