import React from 'react';
import { getDictionary, Locale } from '@/lib/i18n';

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900">{dict.marketing?.privacyTitle}</h1>
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-4 text-xs text-slate-600 leading-relaxed">
        <h3 className="text-sm font-bold text-slate-800">1. Data Collection & Privacy</h3>
        <p>
          We collect minimal information necessary to deliver medication schedules, Web Push notifications, and Telegram reminder alerts.
        </p>

        <h3 className="text-sm font-bold text-slate-800">2. Row Level Security & Encryption</h3>
        <p>
          Your medication logs and personal data are strictly isolated to your authenticated account using Row Level Security (RLS) policies.
        </p>
      </div>
    </div>
  );
}
