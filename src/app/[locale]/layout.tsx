import React from 'react';
import { notFound } from 'next/navigation';
import { getDictionary, Locale } from '@/lib/i18n';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CookieConsentBanner } from '@/components/feedback/CookieConsentBanner';
import { createClient } from '@/lib/supabase/server';

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

  return (
    <div lang={currentLocale} dir={currentLocale === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col">
      <Navbar locale={currentLocale} dict={dict} userProfile={userProfile} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer locale={currentLocale} dict={dict} />
      <CookieConsentBanner locale={currentLocale} />
    </div>
  );
}
