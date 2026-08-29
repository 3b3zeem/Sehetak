import React from 'react';
import { getDictionary, Locale } from '@/lib/i18n';
import { DailyTimeline } from '@/features/dashboard';

export default async function PatientDashboardPage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale, username } = await params;
  const currentLocale = locale as Locale;
  const dict = getDictionary(currentLocale);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {dict.dashboard?.welcomeGreeting}, @{username}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">{dict.dashboard?.todayOverview}</p>
        </div>
      </div>

      <DailyTimeline locale={currentLocale} dict={dict} />
    </div>
  );
}
