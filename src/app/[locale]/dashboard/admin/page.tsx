import React from 'react';
import { getDictionary, Locale } from '@/lib/i18n';
import { AdminOverview } from '@/features/admin/components/AdminOverview';

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const dict = getDictionary(currentLocale);

  return <AdminOverview locale={currentLocale} dict={dict} />;
}
