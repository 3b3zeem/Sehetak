import { NextResponse } from 'next/server';
import {
  getSehetakResetPasswordEmailHtml,
  getSehetakUniversalBilingualResetPasswordEmail,
} from '@/lib/email/templates';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'ar';
  const type = searchParams.get('type') || 'universal';

  let html = '';
  if (type === 'universal') {
    html = getSehetakUniversalBilingualResetPasswordEmail();
  } else {
    html = getSehetakResetPasswordEmailHtml(lang as 'ar' | 'en');
  }

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
