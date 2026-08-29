import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { webpush } from '@/lib/push';
import { ApiResponse } from '@/types';

// In-memory cache to prevent duplicate dispatches within 4 minutes
const recentDispatches = new Map<string, number>();

export async function GET() {
  try {
    const adminClient = createAdminClient();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    const now = new Date();

    // Get current HH:mm in local Egypt time (Africa/Cairo)
    const currentLocalTimeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Africa/Cairo',
    });

    const [currH, currM] = currentLocalTimeStr.split(':').map(Number);
    const currentMinutesSinceMidnight = currH * 60 + currM;

    let medicationsReminded = 0;
    let appointmentsReminded = 0;

    // 1. Check active medications matching current local time window
    const { data: activeMeds } = await adminClient
      .from('medications')
      .select('*, profiles(telegram_chat_id, locale)')
      .eq('is_active', true);

    if (activeMeds && activeMeds.length > 0) {
      for (const med of activeMeds) {
        if (!med.start_time) continue;

        const [medH, medM] = med.start_time.split(':').map(Number);
        const medMinutesSinceMidnight = medH * 60 + medM;

        // Trigger if current time is within [start_time, start_time + 4 minutes]
        const diffMinutes = currentMinutesSinceMidnight - medMinutesSinceMidnight;

        if (diffMinutes >= 0 && diffMinutes <= 4) {
          const dispatchKey = `${med.id}_${med.start_time.substring(0, 5)}`;
          const lastSent = recentDispatches.get(dispatchKey);

          // Skip if dispatched within the last 4 minutes
          if (lastSent && Date.now() - lastSent < 4 * 60 * 1000) {
            continue;
          }

          recentDispatches.set(dispatchKey, Date.now());

          const isAr = med.profiles?.locale !== 'en';
          const msgText = isAr
            ? `🔔 تذكير دواء: حان الآن موعد تناول دواء ${med.name} (${med.dosage || 'جرعة 1'})`
            : `🔔 Medication Reminder: It is time to take your medication ${med.name} (${med.dosage || '1 dose'})`;

          // Send Telegram alert if connected
          if (med.profiles?.telegram_chat_id && botToken) {
            try {
              await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: med.profiles.telegram_chat_id,
                  text: msgText,
                }),
              });
            } catch (err) {
              console.error('Failed to send Telegram medication reminder', err);
            }
          }

          // Send Web Push notification if subscribed
          const { data: subs } = await adminClient
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', med.user_id);

          if (subs) {
            for (const sub of subs) {
              try {
                await webpush.sendNotification(
                  { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                  JSON.stringify({
                    title: isAr ? 'صحتك - تذكير الدواء' : 'Sehatak Medication Reminder',
                    body: msgText,
                    icon: '/icon.png',
                    url: '/',
                  })
                );
              } catch (err) {
                console.error('Failed to send Web Push medication notification', err);
              }
            }
          }

          medicationsReminded++;
        }
      }
    }

    // 2. Check upcoming doctor appointments needing reminders
    const { data: appointments } = await adminClient
      .from('doctor_appointments')
      .select('*, profiles(telegram_chat_id, locale)')
      .eq('notification_sent', false)
      .lte('appointment_date', new Date(Date.now() + 60 * 60 * 1000).toISOString());

    if (appointments && appointments.length > 0) {
      for (const appt of appointments) {
        const isAr = appt.profiles?.locale !== 'en';
        const msgText = isAr
          ? `🩺 تذكير بموعد طبي: لديك موعد مع د. ${appt.doctor_name} (${appt.specialty || ''}) في ${new Date(appt.appointment_date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`
          : `🩺 Appointment Reminder: Visit with Dr. ${appt.doctor_name} (${appt.specialty || ''}) scheduled for ${new Date(appt.appointment_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

        // Send Telegram
        if (appt.profiles?.telegram_chat_id && botToken) {
          try {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: appt.profiles.telegram_chat_id,
                text: msgText,
              }),
            });
          } catch (err) {
            console.error('Failed to send Telegram appointment reminder', err);
          }
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
                JSON.stringify({
                  title: isAr ? 'صحتك - موعد طبي' : 'Doctor Appointment Reminder',
                  body: msgText,
                  icon: '/icon.png',
                  url: '/',
                })
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
      data: { medicationsReminded, appointmentsReminded, currentTime: currentLocalTimeStr },
      message: 'Background reminders evaluated and dispatched successfully',
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, message: err.message || 'Cron error' },
      { status: 500 }
    );
  }
}
