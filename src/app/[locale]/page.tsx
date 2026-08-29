import React from 'react';
import Link from 'next/link';
import { getDictionary, Locale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { AnimatedTitle, FadeInView } from '@/components/animations';
import { HomeScheduleSection } from '@/features/dashboard/components/HomeScheduleSection';
import { Utensils, Send, ShieldCheck, Clock, ArrowRight } from 'lucide-react';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const dict = getDictionary(currentLocale);

  return (
    <div className="space-y-20 py-8">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-10">
        <FadeInView delay={0.1} direction="down">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#008080]/10 text-[#008080] text-xs font-bold border border-[#008080]/20">
            <ShieldCheck className="w-4 h-4" />
            <span>Bilingual Medical SaaS • English & Arabic</span>
          </div>
        </FadeInView>

        <AnimatedTitle as="h1" delay={0.2} className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {dict.marketing?.heroTitle}
        </AnimatedTitle>

        <FadeInView delay={0.35}>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {dict.marketing?.heroSubtitle}
          </p>
        </FadeInView>

        <FadeInView delay={0.5}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href={`/${locale}/register`}>
              <Button size="lg" variant="primary" className="w-full sm:w-auto gap-2">
                <span>{dict.marketing?.ctaStart}</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href={`/${locale}/about`}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                {dict.marketing?.ctaLearn}
              </Button>
            </Link>
          </div>
        </FadeInView>
      </section>

      {/* Dynamic Schedule Section: Real User Timeline if Logged in, else Demo Preview */}
      <FadeInView delay={0.6}>
        <HomeScheduleSection locale={currentLocale} dict={dict} />
      </FadeInView>

      {/* Feature Grid ("Designed for Complete Adherence") */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <AnimatedTitle as="h2" className="text-3xl font-extrabold text-slate-900">
            {dict.marketing?.featuresTitle}
          </AnimatedTitle>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            Built with medical precision to ensure high adherence and zero missed doses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FadeInView delay={0.2} direction="up">
            <div className="bg-white border border-slate-300 p-8 space-y-4 h-full">
              <div className="w-12 h-12 bg-[#008080]/10 text-[#008080] flex items-center justify-center font-bold">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{dict.marketing?.feature1Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{dict.marketing?.feature1Desc}</p>
            </div>
          </FadeInView>

          <FadeInView delay={0.35} direction="up">
            <div className="bg-white border border-slate-300 p-8 space-y-4 h-full">
              <div className="w-12 h-12 bg-[#0077b6]/10 text-[#0077b6] flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{dict.marketing?.feature2Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{dict.marketing?.feature2Desc}</p>
            </div>
          </FadeInView>

          <FadeInView delay={0.5} direction="up">
            <div className="bg-white border border-slate-300 p-8 space-y-4 h-full">
              <div className="w-12 h-12 bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{dict.marketing?.feature3Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{dict.marketing?.feature3Desc}</p>
            </div>
          </FadeInView>
        </div>
      </section>
    </div>
  );
}
