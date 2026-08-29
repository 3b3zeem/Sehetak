import React from 'react';
import { getDictionary, Locale } from '@/lib/i18n';
import { createClient } from '@/lib/supabase/server';
import { UserSettings } from '@/features/dashboard/components/UserSettings';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale, username } = await params;
  const currentLocale = locale as Locale;
  const dict = getDictionary(currentLocale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profileData = {
    id: user?.id || '00000000-0000-0000-0000-000000000002',
    username,
    full_name: user?.user_metadata?.full_name || username,
    email: user?.email || '',
    role: 'patient' as 'patient' | 'admin',
    breakfast_time: '08:00',
    lunch_time: '14:00',
    dinner_time: '20:00',
    telegram_chat_id: null as number | null,
    created_at: '',
  };

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      profileData = {
        id: profile.id,
        username: profile.username || username,
        full_name: profile.full_name || user.user_metadata?.full_name || profile.username,
        email: profile.email || user.email || '',
        role: profile.role || 'patient',
        breakfast_time: profile.breakfast_time || '08:00',
        lunch_time: profile.lunch_time || '14:00',
        dinner_time: profile.dinner_time || '20:00',
        telegram_chat_id: profile.telegram_chat_id,
        created_at: profile.created_at || '',
      };
    }
  }

  return (
    <div className="space-y-6">
      <UserSettings locale={currentLocale} dict={dict} user={profileData} />
    </div>
  );
}
