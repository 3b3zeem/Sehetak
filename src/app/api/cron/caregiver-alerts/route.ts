import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { webpush } from '@/lib/push';

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient();

    // Threshold for missed dose alerts (e.g. 20 minutes past scheduled time)
    const alertDelayMinutes = 20;
    const cutoffTime = new Date(Date.now() - alertDelayMinutes * 60 * 1000).toISOString();

    // 1. Fetch pending medication logs that reached cutoff and haven't notified caregiver yet
    const { data: missedLogs, error: logError } = await supabase
      .from('medication_logs')
      .select(`
        id,
        scheduled_for,
        user_id,
        medications ( name, dosage ),
        profiles:user_id ( full_name, locale )
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', cutoffTime)
      .is('caregiver_notified_at', null);

    if (logError) {
      return NextResponse.json({ success: false, message: logError.message }, { status: 500 });
    }

    if (!missedLogs || missedLogs.length === 0) {
      return NextResponse.json({ success: true, processed: 0, message: 'No pending caregiver alerts' });
    }

    let notificationsSent = 0;

    for (const log of missedLogs) {
      if (!log.user_id) continue;
      const patientId = log.user_id;
      const patientName = (log.profiles as any)?.full_name || 'Relative';
      const medName = (log.medications as any)?.name || 'Medication';
      const dosage = (log.medications as any)?.dosage || '';

      // 2. Fetch active caregivers linked to this patient
      const { data: links } = await supabase
        .from('caregiver_links')
        .select(`
          caregiver_id,
          notify_push,
          notify_telegram,
          patient_label,
          profiles:caregiver_id ( telegram_chat_id, locale )
        `)
        .eq('patient_id', patientId)
        .eq('status', 'active');

      if (links && links.length > 0) {
        for (const link of links) {
          const caregiverId = link.caregiver_id;
          if (!caregiverId) continue;

          const caregiverLocale = (link.profiles as any)?.locale || 'ar';
          const isAr = caregiverLocale === 'ar';

          const pushTitle = isAr
            ? `⚠️ تنبيه رعاية: ${patientName}`
            : `⚠️ Caregiver Alert: ${patientName}`;
          
          const pushBody = isAr
            ? `تأخر عن تناول ${medName} (${dosage}) لموعد ${new Date(log.scheduled_for).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}.`
            : `Late taking ${medName} (${dosage}) scheduled for ${new Date(log.scheduled_for).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.`;

          const telegramMessage = isAr
            ? `⚠️ *تنبيه رعاية عائلية من صحتك*\n\nتأخر *${patientName}* عن تناول دواء *${medName}* (${dosage}) والمحدد في موعد ${new Date(log.scheduled_for).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}.\n\nيرجى الاطمئنان والتواصل معه.`
            : `⚠️ *Sehetak Family Caregiver Alert*\n\n*${patientName}* is late taking their medication *${medName}* (${dosage}) scheduled at ${new Date(log.scheduled_for).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.\n\nPlease check in on them.`;

          // A. Send Web Push Notification if subscribed
          if (link.notify_push) {
            const { data: pushSubs } = await supabase
              .from('push_subscriptions')
              .select('*')
              .eq('user_id', caregiverId);

            if (pushSubs && pushSubs.length > 0) {
              const payload = JSON.stringify({
                title: pushTitle,
                body: pushBody,
                icon: '/icon.png',
                url: `/${caregiverLocale}/dashboard/caregiver`,
              });

              for (const sub of pushSubs) {
                try {
                  await webpush.sendNotification(
                    {
                      endpoint: sub.endpoint,
                      keys: { p256dh: sub.p256dh, auth: sub.auth },
                    },
                    payload
                  );
                  notificationsSent++;
                } catch (pushErr) {
                  console.error('Error sending push to caregiver:', pushErr);
                }
              }
            }
          }

          // B. Send Telegram notification if linked
          const telegramChatId = (link.profiles as any)?.telegram_chat_id;
          if (link.notify_telegram && telegramChatId && process.env.TELEGRAM_BOT_TOKEN) {
            try {
              await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: telegramChatId,
                  text: telegramMessage,
                  parse_mode: 'Markdown',
                }),
              });
              notificationsSent++;
            } catch (tgErr) {
              console.error('Telegram notification error:', tgErr);
            }
          }
        }
      }

      // Mark caregiver_notified_at to prevent redundant notification dispatches
      await supabase
        .from('medication_logs')
        .update({ caregiver_notified_at: new Date().toISOString() })
        .eq('id', log.id);
    }

    return NextResponse.json({
      success: true,
      processed: missedLogs.length,
      notificationsSent,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
