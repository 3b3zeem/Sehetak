import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { webpush } from '@/lib/push';
import { ApiResponse } from '@/types';

export async function GET() {
  try {
    const adminClient = createAdminClient();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    // 1. Check upcoming doctor appointments needing reminders
    const nowISO = new Date().toISOString();
    const { data: appointments } = await adminClient
      .from('doctor_appointments')
      .select('*, profiles(telegram_chat_id, locale)')
      .eq('notification_sent', false)
      .lte('appointment_date', new Date(Date.now() + 60 * 60 * 1000).toISOString());

    let appointmentsReminded = 0;
    if (appointments && appointments.length > 0) {
      for (const appt of appointments) {
        const isAr = appt.profiles?.locale === 'ar';
        const msgText = isAr
          ? `🩺 تذكير بموعد طبي: لديك موعد مع د. ${appt.doctor_name} (${appt.specialty || ''}) في ${new Date(appt.appointment_date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`
          : `🩺 Appointment Reminder: Visit with Dr. ${appt.doctor_name} (${appt.specialty || ''}) scheduled for ${new Date(appt.appointment_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

        // Send Telegram if connected
        if (appt.profiles?.telegram_chat_id && botToken) {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: appt.profiles.telegram_chat_id,
              text: msgText,
            }),
          });
        }

        // Send Web Push
        const { data: subs } = await adminClient
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', appt.user_id);

        if (subs) {
          for (const sub of subs) {
            try {
              await webpush.sendNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                JSON.stringify({ title: 'Doctor Appointment Reminder', body: msgText })
              );
            } catch (err) {
              console.error('Failed to send push notification', err);
            }
          }
        }

        // Mark notification sent
        await adminClient
          .from('doctor_appointments')
          .update({ notification_sent: true })
          .eq('id', appt.id);

        appointmentsReminded++;
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { appointmentsReminded },
      message: 'Background reminders evaluated and dispatched',
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, message: err.message || 'Cron error' },
      { status: 500 }
    );
  }
}
