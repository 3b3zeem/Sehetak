import React from 'react';
import { getDictionary, Locale } from '@/lib/i18n';
import { MedicationCabinet } from '@/features/medications';

export default async function MedicationsPage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale, username } = await params;
  const currentLocale = locale as Locale;
  const dict = getDictionary(currentLocale);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">{dict.medications?.title}</h1>
        <p className="text-xs text-slate-500 mt-1">Manage and track your active medication cabinet</p>
      </div>

      <MedicationCabinet locale={currentLocale} dict={dict} username={username} />
    </div>
  );
}
