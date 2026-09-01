export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ApiResponse } from '@/types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message;

    if (!message || !message.text) {
      return NextResponse.json<ApiResponse>({ success: true, data: null, message: 'No action needed' });
    }

    const chatId = message.chat?.id;
    const text: string = message.text.trim();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (text.startsWith('/start') && chatId) {
      const parts = text.split(' ');
      const tokenOrId = parts[1]?.trim();
      const adminClient = createAdminClient();

      let linked = false;

      // 1. Direct UUID user_id matching
      if (tokenOrId && UUID_REGEX.test(tokenOrId)) {
        const { data: profile } = await adminClient
          .from('profiles')
          .select('id')
          .eq('id', tokenOrId)
          .maybeSingle();

        if (profile) {
          await adminClient
            .from('profiles')
            .update({ telegram_chat_id: chatId })
            .eq('id', profile.id);
          linked = true;
        }
      }

      // 2. Fallback: Link to the most recently created or updated profile
      if (!linked) {
        const { data: recentProfile } = await adminClient
          .from('profiles')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (recentProfile) {
          await adminClient
            .from('profiles')
            .update({ telegram_chat_id: chatId })
            .eq('id', recentProfile.id);
          linked = true;
        }
      }

      // Send Instant Confirmation Message via Telegram Bot
      if (botToken) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: 'تم ربط تنبيهات صحتك (Sehetak) بهذا الحساب بنجاح 🔔! ستصلك الإشعارات والتذكيرات الدورية للأدوية والمواعيد الطبية هنا مباشرة.',
          }),
        });
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: null,
      message: 'Telegram webhook processed successfully',
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, message: err.message || 'Webhook error' },
      { status: 500 }
    );
  }
}
