import React, { Suspense } from 'react';
import { getDictionary, Locale } from '@/lib/i18n';
import { ResetPasswordForm } from '@/features/auth';
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: isAr ? 'تعيين كلمة المرور الجديدة | صحتك sehetak' : 'Reset Password | Sehetak',
    description: isAr
      ? 'أدخل كود الاستعادة وكلمة المرور الجديدة لحسابك في صحتك.'
      : 'Enter your reset token and new password for your Sehetak account.',
  };
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale = (locale as Locale) || 'en';
  const dict = getDictionary(currentLocale);

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <Suspense fallback={<div className="text-xs text-slate-400">Loading...</div>}>
        <ResetPasswordForm locale={currentLocale} dict={dict} />
      </Suspense>
    </div>
  );
}
