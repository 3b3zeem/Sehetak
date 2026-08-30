import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const locale = requestUrl.searchParams.get('locale') || 'en';

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/${locale}/login?error=no_code`);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      console.error('Auth code exchange error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/${locale}/login?error=auth_failed`);
    }

    const userId = data.user.id;
    let username = '';

    // Check existing profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, role')
      .eq('id', userId)
      .single();

    if (profile?.role === 'admin') {
      return NextResponse.redirect(`${requestUrl.origin}/${locale}/dashboard/admin`);
    }

    if (profile?.username) {
      username = profile.username;
    } else {
      // First time Google login: create profile safely
      const rawName =
        data.user.user_metadata?.full_name ||
        data.user.email?.split('@')[0] ||
        'patient';

      const baseUsername = rawName
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .slice(0, 15);

      username = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;

      // Try creating via admin client if available, else standard client
      try {
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
          const adminClient = createAdminClient();
          await adminClient.from('profiles').insert({
            id: userId,
            username,
            full_name: data.user.user_metadata?.full_name || rawName,
            email: data.user.email,
            role: 'patient',
            locale,
          });
        } else {
          await supabase.from('profiles').insert({
            id: userId,
            username,
            full_name: data.user.user_metadata?.full_name || rawName,
            email: data.user.email,
            role: 'patient',
            locale,
          });
        }
      } catch (insertErr) {
        console.error('Profile insertion warning:', insertErr);
      }
    }

    return NextResponse.redirect(`${requestUrl.origin}/${locale}/dashboard/${username}`);
  } catch (err: any) {
    console.error('OAuth Callback Exception:', err);
    return NextResponse.redirect(`${requestUrl.origin}/${locale}/login?error=server_error`);
  }
}
