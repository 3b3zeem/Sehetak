export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ApiResponse } from '@/types';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: { isConnected: false, chatId: null },
        message: 'Unauthenticated',
      });
    }

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('telegram_chat_id')
      .eq('id', user.id)
      .maybeSingle();

    const telegramChatId = profile?.telegram_chat_id || null;

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        isConnected: !!telegramChatId,
        chatId: telegramChatId,
      },
      message: 'Telegram status fetched',
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, message: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
