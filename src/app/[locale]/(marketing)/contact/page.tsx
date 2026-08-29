import React from 'react';
import { getDictionary, Locale } from '@/lib/i18n';
import { ContactAnimatedContent } from '@/features/marketing/components/ContactAnimatedContent';
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: isAr ? 'تواصل معنا | sehetak' : 'Contact Us | sehetak',
    description: isAr
      ? 'تواصل مع فريق منصة صحتك sehetak للاستفسارات والدعم الفني وتلقي المساعدة بشأن التنبيهات الطبية.'
      : 'Get in touch with the sehetak medical support team for any inquiries or technical assistance.',
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);

  return <ContactAnimatedContent dict={dict} />;
}
