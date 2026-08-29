import React from 'react';
import { getDictionary, Locale } from '@/lib/i18n';
import { AdminUsers } from '@/features/admin/components/AdminUsers';

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const dict = getDictionary(currentLocale);

  return <AdminUsers locale={currentLocale} dict={dict} />;
}
