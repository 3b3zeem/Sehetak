import React from 'react';
import { getDictionary, Locale } from '@/lib/i18n';
import { ForgotPasswordForm } from '@/features/auth';
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: isAr ? 'استعادة كلمة المرور | صحتك sehetak' : 'Forgot Password | Sehetak',
    description: isAr
      ? 'استعد كلمة المرور الخاصة بحسابك في منصة صحتك عبر البريد الإلكتروني.'
      : 'Reset your Sehetak account password via email.',
  };
}

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale = (locale as Locale) || 'en';
  const dict = getDictionary(currentLocale);

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <ForgotPasswordForm locale={currentLocale} dict={dict} />
    </div>
  );
}
