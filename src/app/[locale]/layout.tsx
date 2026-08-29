import React from 'react';
import { notFound } from 'next/navigation';
import { getDictionary, Locale } from '@/lib/i18n';
import { Footer } from '@/components/layout/footer';
import { CookieConsentBanner } from '@/components/feedback/CookieConsentBanner';
import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar/navbar';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';

  return {
    title: isAr
      ? 'Sehatak - صحتك | المنصة الذكية لإدارة الأدوية والمواعيد'
      : 'Sehatak - Smart Medication & Health Companion',
    description: isAr
      ? 'تابع جدول أدوية اليوم والتذكيرات المباشرة عبر التليجرام وإشعارات المتصفح لتنظيم حياتك وصحتك.'
      : 'Track your daily medications, receive automated Telegram & browser reminders, and manage doctor appointments effortlessly.',
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ar: '/ar',
        en: '/en',
      },
    },
    openGraph: {
      title: isAr ? 'sehetak - صحتك' : 'sehetak Medical Platform',
      description: isAr
        ? 'المنصة الذكية لإدارة الأدوية والمواعيد الطبية والتنبيهات المباشرة'
        : 'Smart meal-anchored medication companion with instant Telegram bot reminders.',
      url: `/${locale}`,
      siteName: 'sehetak',
      images: [{ url: '/og-image.svg', width: 1200, height: 630 }],
      locale: isAr ? 'ar_EG' : 'en_US',
      type: 'website',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (locale !== 'en' && locale !== 'ar') {
    notFound();
  }

  const currentLocale = locale as Locale;
  const dict = getDictionary(currentLocale);

  // Check auth user profile
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userProfile: { username: string; role: 'patient' | 'admin' } | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, role')
      .eq('id', user.id)
      .single();

    userProfile = {
      username: profile?.username || user.email?.split('@')[0] || 'patient',
      role: profile?.role || 'patient',
    };
  }

  // Schema.org Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: currentLocale === 'ar' ? 'صحتك - Sehatak' : 'Sehatak Medical App',
    description:
      currentLocale === 'ar'
        ? 'منصة ذكية لإدارة الأدوية والتذكير التلقائي بمواعيد الجرعات'
        : 'Smart medication schedule & compliance management platform',
    image: '/logo.png',
    inLanguage: currentLocale,
    aspect: ['Diagnosis', 'Prevention', 'Treatment'],
  };

  return (
    <div lang={currentLocale} dir={currentLocale === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar locale={currentLocale} dict={dict} userProfile={userProfile} />
      <main className="flex-1 w-full px-4 sm:px-8 py-8">
        {children}
      </main>
      <Footer locale={currentLocale} dict={dict} />
      <CookieConsentBanner locale={currentLocale} />
    </div>
  );
}
