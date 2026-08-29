import React from 'react';
import { getDictionary, Locale } from '@/lib/i18n';
import { MedicationWizard } from '@/features/medications';

export default async function NewMedicationPage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale, username } = await params;
  const currentLocale = locale as Locale;
  const dict = getDictionary(currentLocale);

  return (
    <div className="py-6 space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">{dict.medications?.addNew}</h1>
        <p className="text-xs text-slate-500">
          Follow the 3-step wizard to setup your medication schedules and stock notifications
        </p>
      </div>

      <MedicationWizard locale={currentLocale} dict={dict} username={username} />
    </div>
  );
}
