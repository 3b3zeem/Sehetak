import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { webpush } from "@/lib/push";
import { ApiResponse } from "@/types";

// In-memory cache to prevent duplicate dispatches within 10 minutes
const recentDispatches = new Map<string, number>();

export async function GET() {
  try {
    const adminClient = createAdminClient();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    const now = new Date();
    const nowMs = now.getTime();

    // Get current HH:mm in local Egypt time (Africa/Cairo)
    const currentLocalTimeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Africa/Cairo",
    });

    const [currH, currM] = currentLocalTimeStr.split(":").map(Number);
    const currentMinutesSinceMidnight = currH * 60 + currM;

    let medicationsReminded = 0;
    let appointmentsReminded = 0;

    // 1. Check active medications matching current local time window
    const { data: activeMeds } = await adminClient
      .from("medications")
      .select("*, profiles(telegram_chat_id, locale)")
      .eq("is_active", true);

    if (activeMeds && activeMeds.length > 0) {
      for (const med of activeMeds) {
        if (!med.start_time) continue;

        const [medH, medM] = med.start_time.split(":").map(Number);
        const medMinutesSinceMidnight = medH * 60 + medM;

        // Trigger if current time is within [start_time, start_time + 2 minutes]
        const diffMinutes =
          currentMinutesSinceMidnight - medMinutesSinceMidnight;

        if (diffMinutes >= 0 && diffMinutes <= 2) {
          const dispatchKey = `med_${med.id}_${med.start_time.substring(0, 5)}_${now.toISOString().substring(0, 10)}`;
          const lastSent = recentDispatches.get(dispatchKey);

          // Skip if dispatched today for this exact window
          if (lastSent && nowMs - lastSent < 10 * 60 * 1000) {
            continue;
          }

          recentDispatches.set(dispatchKey, nowMs);

          const isAr = med.profiles?.locale !== "en";
          const msgText = isAr
            ? `🔔 تذكير دواء: حان الآن موعد تناول دواء ${med.name} (${med.dosage || "جرعة 1"})`
            : `🔔 Medication Reminder: It is time to take your medication ${med.name} (${med.dosage || "1 dose"})`;

          // Send Telegram alert if connected
          if (med.profiles?.telegram_chat_id && botToken) {
            try {
              await fetch(
                `https://api.telegram.org/bot${botToken}/sendMessage`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    chat_id: med.profiles.telegram_chat_id,
                    text: msgText,
                  }),
                },
              );
            } catch (err) {
              console.error("Failed to send Telegram medication reminder", err);
            }
          }

          // Send Web Push notification if subscribed
          const { data: subs } = await adminClient
            .from("push_subscriptions")
            .select("*")
            .eq("user_id", med.user_id);

          if (subs) {
            for (const sub of subs) {
              try {
                await webpush.sendNotification(
                  {
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth },
                  },
                  JSON.stringify({
                    title: isAr
                      ? "صحتك - تذكير الدواء"
                      : "Sehetak Medication Reminder",
                    body: msgText,
                    icon: "/icon.png",
                    url: "/",
                  }),
                );
              } catch (err) {
                console.error(
                  "Failed to send Web Push medication notification",
                  err,
                );
              }
            }
          }

          medicationsReminded++;
        }
      }
    }

    // 2. Check unsent doctor appointments
    const { data: appointments } = await adminClient
      .from("doctor_appointments")
      .select("*, profiles(telegram_chat_id, locale)")
      .eq("notification_sent", false);

    if (appointments && appointments.length > 0) {
      for (const appt of appointments) {
        const apptTime = new Date(appt.appointment_date).getTime();
        const remindMinutes = appt.remind_before_minutes || 30;
        const remindTimeStart = apptTime - remindMinutes * 60 * 1000;
        const remindTimeEnd = apptTime + 5 * 60 * 1000; // allow up to 5 min past appointment start

        // If the appointment time has already passed (> 5 minutes ago), mark as sent without sending expired notification
        if (nowMs > remindTimeEnd) {
          await adminClient
            .from("doctor_appointments")
            .update({ notification_sent: true })
            .eq("id", appt.id);
          continue;
        }

        // Only dispatch if current time is within designated reminder window: [appt_time - remind_minutes, appt_time + 5min]
        if (nowMs >= remindTimeStart && nowMs <= remindTimeEnd) {
          const isAr = appt.profiles?.locale !== "en";
          const apptTimeFormatted = new Date(
            appt.appointment_date,
          ).toLocaleTimeString(isAr ? "ar-EG" : "en-US", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Africa/Cairo",
          });

          const msgText = isAr
            ? `🩺 تذكير بموعد طبي: موعدك مع د. ${appt.doctor_name} (${appt.specialty || "طبيب"}) القادم الساعة ${apptTimeFormatted} (تنبيه قبل الموعد بـ ${remindMinutes} دقيقة)`
            : `🩺 Doctor Appointment Reminder: Visit with Dr. ${appt.doctor_name} (${appt.specialty || "Doctor"}) at ${apptTimeFormatted} (Reminder ${remindMinutes}m before)`;

          // Send Telegram
          if (appt.profiles?.telegram_chat_id && botToken) {
            try {
              await fetch(
                `https://api.telegram.org/bot${botToken}/sendMessage`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    chat_id: appt.profiles.telegram_chat_id,
                    text: msgText,
                  }),
                },
              );
            } catch (err) {
              console.error(
                "Failed to send Telegram appointment reminder",
                err,
              );
            }
          }

          // Send Web Push
          const { data: subs } = await adminClient
            .from("push_subscriptions")
            .select("*")
            .eq("user_id", appt.user_id);

          if (subs) {
            for (const sub of subs) {
              try {
                await webpush.sendNotification(
                  {
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth },
                  },
                  JSON.stringify({
                    title: isAr
                      ? "صحتك - موعد طبي"
                      : "Doctor Appointment Reminder",
                    body: msgText,
                    icon: "/icon.png",
                    url: "/",
                  }),
                );
              } catch (err) {
                console.error("Failed to send push notification", err);
              }
            }
          }

          // Mark notification as sent so it never triggers again
          await adminClient
            .from("doctor_appointments")
            .update({ notification_sent: true })
            .eq("id", appt.id);

          appointmentsReminded++;
        }
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        medicationsReminded,
        appointmentsReminded,
        currentTime: currentLocalTimeStr,
      },
      message: "Background reminders evaluated and dispatched successfully",
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, message: err.message || "Cron error" },
      { status: 500 },
    );
  }
}
