import React from 'react';
import { getDictionary, Locale } from '@/lib/i18n';
import { Metadata } from 'next';
import { ShieldCheck, Lock, EyeOff, UserCheck } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: isAr ? 'سياسة الخصوصية | صحتك sehetak' : 'Privacy Policy | Sehetak',
    description: isAr
      ? 'تعرف على كيفية حماية وتشفير بياناتك الطبية والشخصية في منصة صحتك.'
      : 'Learn how your medical and personal data is encrypted and protected on Sehetak.',
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);
  const t = dict.privacy || {};

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#008080] flex items-center justify-center mx-auto border border-teal-100 shadow-sm">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.title || 'Privacy Policy'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          {t.subtitle || 'How we safeguard your medical & personal data on Sehetak'}
        </p>
      </div>

      {/* Policy Card Items Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8">
        <div className="flex gap-4 items-start">
          <div className="p-2.5 rounded-xl bg-teal-50 text-[#008080] shrink-0 mt-1">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900">
              {t.section1Title || '1. Data Collection & Purpose'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t.section1Desc ||
                'We collect minimal information necessary to deliver medication schedules, Web Push notifications, and Telegram reminder alerts.'}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex gap-4 items-start">
          <div className="p-2.5 rounded-xl bg-sky-50 text-[#0077b6] shrink-0 mt-1">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900">
              {t.section2Title || '2. Data Security & Row Level Security (RLS)'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t.section2Desc ||
                'Your medication logs, prescriptions, and health metrics are strictly isolated using Row Level Security (RLS) policies on encrypted Supabase servers.'}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex gap-4 items-start">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0 mt-1">
            <EyeOff className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900">
              {t.section3Title || '3. Third-Party Non-Disclosure'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t.section3Desc ||
                'We never sell, rent, or monetize your health data with commercial entities or advertisers. Notifications are strictly for platform functionality.'}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex gap-4 items-start">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 mt-1">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900">
              {t.section4Title || '4. User Rights & Data Control'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t.section4Desc ||
                'You retain full ownership of your data and can update or permanently delete your account and medication logs at any time from Settings.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
