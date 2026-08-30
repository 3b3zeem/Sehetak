import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ApiResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message;

    if (!message || !message.text) {
      return NextResponse.json<ApiResponse>({ success: true, data: null, message: 'No action needed' });
    }

    const chatId = message.chat?.id;
    const text: string = message.text.trim();

    // Check if start command contains userId payload
    // Example command: /start 00000000-0000-0000-0000-000000000002
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      const userId = parts[1];

      if (userId && chatId) {
        const adminClient = createAdminClient();

        // Update profile telegram_chat_id
        const { error } = await adminClient
          .from('profiles')
          .update({ telegram_chat_id: chatId })
          .eq('id', userId);

        if (!error) {
          // Send Telegram confirmation message
          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          if (botToken) {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: 'Your Sehetak (صحتك) account has been successfully linked! You will now receive automated medication reminders right here.',
              }),
            });
          }
        }
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: null,
      message: 'Telegram webhook processed',
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, message: err.message || 'Webhook error' },
      { status: 500 }
    );
  }
}
