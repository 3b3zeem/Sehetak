import React from 'react';
import { getDictionary, Locale } from '@/lib/i18n';
import { LoginForm } from '@/features/auth';

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const dict = getDictionary(currentLocale);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10">
      <LoginForm locale={currentLocale} dict={dict} />
    </div>
  );
}
