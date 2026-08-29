import React from 'react';
import { getDictionary, Locale } from '@/lib/i18n';
import { AdminMedications } from '@/features/admin/components/AdminMedications';

export default async function AdminMedicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const dict = getDictionary(currentLocale);

  return <AdminMedications locale={currentLocale} dict={dict} />;
}
