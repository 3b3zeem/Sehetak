import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { Database } from '@/types/database.types';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Extract locale from path
  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0] === 'ar' || segments[0] === 'en' ? segments[0] : 'en';

  // Check path patterns
  const isAuthPage = pathname.includes('/login') || pathname.includes('/register');
  const isDashboardPage = pathname.includes('/dashboard');
  const isAdminPage = pathname.includes('/dashboard/admin');

  if (user) {
    // Fetch profile for role and username
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, role')
      .eq('id', user.id)
      .single();

    const username = profile?.username || user.email?.split('@')[0] || 'patient';
    const role = profile?.role || 'patient';

    // If user is authenticated and visiting auth pages, redirect to dashboard
    if (isAuthPage) {
      const targetUrl = new URL(`/${locale}/dashboard/${username}`, request.url);
      return NextResponse.redirect(targetUrl);
    }

    // Admin Page Guard
    if (isAdminPage && role !== 'admin') {
      const redirectUrl = new URL(`/${locale}/dashboard/${username}?error=unauthorized`, request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Dynamic Patient Dashboard Guard ([username] check)
    if (isDashboardPage && !isAdminPage) {
      // Find segment after /dashboard/
      const dashIndex = segments.indexOf('dashboard');
      if (dashIndex !== -1 && segments[dashIndex + 1]) {
        const urlUsername = segments[dashIndex + 1];
        if (urlUsername !== username) {
          // Replace mismatched username with the logged in user's username
          segments[dashIndex + 1] = username;
          const correctedPath = `/${segments.join('/')}`;
          return NextResponse.redirect(new URL(correctedPath, request.url));
        }
      }
    }
  } else {
    // Unauthenticated user trying to access protected dashboard routes
    if (isDashboardPage) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}
