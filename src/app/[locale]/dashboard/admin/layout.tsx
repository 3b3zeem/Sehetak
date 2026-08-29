import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDictionary, Locale } from '@/lib/i18n';
import { AdminSidebar } from '@/components/layout/admin-sidebar';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const dict = getDictionary(currentLocale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${currentLocale}/login`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    const ownUsername = profile?.username || user.email?.split('@')[0] || 'patient';
    redirect(`/${currentLocale}/dashboard/${ownUsername}?error=forbidden`);
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start py-4">
      <AdminSidebar locale={currentLocale} dict={dict} />
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
}
