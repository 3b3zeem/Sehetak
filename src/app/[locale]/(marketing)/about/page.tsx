import React from 'react';
import { getDictionary, Locale } from '@/lib/i18n';
import { AboutAnimatedContent } from '@/features/marketing/components/AboutAnimatedContent';
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: isAr ? 'عن صحتك | sehetak' : 'About Us | sehetak',
    description: isAr
      ? 'تعرف على منصة صحتك sehetak ورسالتنا لتنظيم الأدوية وضمان الالتزام العلاجي عبر حلول تكنولوجية مبتكرة.'
      : 'Discover sehetak medical SaaS mission to revolutionize medication compliance with intelligent scheduling.',
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);

  return <AboutAnimatedContent dict={dict} />;
}
