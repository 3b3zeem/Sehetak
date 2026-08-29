import React from 'react';
import { getDictionary, Locale } from '@/lib/i18n';

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900">{dict.marketing?.termsTitle}</h1>
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-4 text-xs text-slate-600 leading-relaxed">
        <h3 className="text-sm font-bold text-slate-800">1. Medical Assistant Disclaimer</h3>
        <p>
          Sehatak is a software digital reminder assistant. It does not provide medical diagnosis, treatment recommendations, or replace professional healthcare provider advice.
        </p>

        <h3 className="text-sm font-bold text-slate-800">2. User Responsibilities</h3>
        <p>
          Users are responsible for ensuring dosage amounts, times, and doctor appointment instructions entered into the platform are accurate.
        </p>
      </div>
    </div>
  );
}
