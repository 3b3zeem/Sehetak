import React from 'react';
import { getDictionary, Locale } from '@/lib/i18n';
import { Metadata } from 'next';
import { FileText, AlertCircle, CheckCircle2, BellRing, RefreshCw } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: isAr ? 'شروط الخدمة | صحتك sehetak' : 'Terms of Service | Sehetak',
    description: isAr
      ? 'القواعد والشروط المنظمة لاستخدام منصة صحتك الرقمية لإدارة الأدوية.'
      : 'Terms and conditions governing the use of Sehetak medication management platform.',
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);
  const t = dict.terms || {};

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#0077b6] flex items-center justify-center mx-auto border border-sky-100 shadow-sm">
          <FileText className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.title || 'Terms of Service'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          {t.subtitle || 'Guidelines and rules governing the use of the Sehetak digital platform'}
        </p>
      </div>

      {/* Terms Card Items Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8">
        <div className="flex gap-4 items-start">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0 mt-1">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900">
              {t.section1Title || '1. Medical Assistant Disclaimer'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t.section1Desc ||
                'Sehetak is a digital software reminder assistant. It does not provide medical diagnosis, treatment recommendations, or replace professional healthcare provider advice.'}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex gap-4 items-start">
          <div className="p-2.5 rounded-xl bg-teal-50 text-[#008080] shrink-0 mt-1">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900">
              {t.section2Title || '2. User Responsibilities'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t.section2Desc ||
                'Users are responsible for ensuring dosage amounts, times, and doctor appointment instructions entered into the platform are accurate.'}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex gap-4 items-start">
          <div className="p-2.5 rounded-xl bg-sky-50 text-[#0077b6] shrink-0 mt-1">
            <BellRing className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900">
              {t.section3Title || '3. Notification & Alert Services'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t.section3Desc ||
                'Delivery of Telegram alerts and Web Push notifications depends on your active device internet connectivity and granted browser permissions.'}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex gap-4 items-start">
          <div className="p-2.5 rounded-xl bg-[#008080]/10 text-[#008080] shrink-0 mt-1">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900">
              {t.section4Title || '4. Platform Updates & Terms Modifications'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t.section4Desc ||
                'We reserve the right to refine service terms and introduce enhanced features to elevate user health management and compliance.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
