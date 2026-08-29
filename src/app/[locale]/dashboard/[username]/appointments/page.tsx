import React from 'react';
import { getDictionary, Locale } from '@/lib/i18n';
import { DoctorAppointments } from '@/features/appointments';

export default async function AppointmentsPage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const dict = getDictionary(currentLocale);

  return (
    <div className="space-y-6">
      <DoctorAppointments locale={currentLocale} dict={dict} />
    </div>
  );
}
