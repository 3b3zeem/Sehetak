import React from 'react';
import { getDictionary, Locale } from '@/lib/i18n';
import { AdminAppointments } from '@/features/admin/components/AdminAppointments';

export default async function AdminAppointmentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const dict = getDictionary(currentLocale);

  return <AdminAppointments locale={currentLocale} dict={dict} />;
}
