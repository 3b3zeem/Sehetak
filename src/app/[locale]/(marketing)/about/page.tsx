import React from 'react';
import { getDictionary, Locale } from '@/lib/i18n';
import { Pill, ShieldCheck, HeartPulse } from 'lucide-react';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#008080] text-white flex items-center justify-center mx-auto shadow-lg">
          <HeartPulse className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{dict.marketing?.aboutTitle}</h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">{dict.marketing?.aboutDesc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-3">
          <ShieldCheck className="w-8 h-8 text-[#008080]" />
          <h3 className="text-lg font-bold text-slate-900">Data Integrity & Privacy</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All user data, prescriptions, and health metrics are secured using Supabase Row Level Security (RLS) policies and encrypted server configurations.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-3">
          <Pill className="w-8 h-8 text-[#0077b6]" />
          <h3 className="text-lg font-bold text-slate-900">Adherence Excellence</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            By anchoring medications around daily meal times and sending multi-channel reminders, Sehatak dramatically improves chronic condition management.
          </p>
        </div>
      </div>
    </div>
  );
}
