"use client";

import React from "react";
import Link from "next/link";
import { DailyTimeline } from "./DailyTimeline";
import {
  Pill,
  ArrowRight,
  UserCheck,
  Sun,
  SunMedium,
  Moon,
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface HomeScheduleSectionProps {
  locale: "en" | "ar";
  dict: any;
}

export const HomeScheduleSection: React.FC<HomeScheduleSectionProps> = ({
  locale,
  dict,
}) => {
  const supabase = createClient();

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["authenticated-home-user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return profile;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto bg-white border border-slate-300 p-8 animate-pulse text-center text-slate-400">
        Loading schedule...
      </div>
    );
  }

  const botUsername =
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME ||
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ||
    "SehatakMed_bot";

  // Logged-in view: Render REAL live user DailyTimeline with Telegram notice banner
  if (userProfile) {
    const telegramDeepLink = `https://t.me/${botUsername}?start=${userProfile.id}`;

    return (
      <section className="max-w-5xl mx-auto space-y-4">
        {/* User Greeting Bar */}
        <div className="bg-emerald-50 border border-emerald-300 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 text-white flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-950 text-base">
                {locale === "ar"
                  ? `أهلاً بك مجدداً، ${userProfile.full_name || userProfile.username}`
                  : `Welcome back, ${userProfile.full_name || userProfile.username}`}
              </h3>
              <span className="text-xs text-emerald-700">
                {locale === "ar"
                  ? "جدولك اليومي المباشر يعرض أدويتك الحقيقية ومواعيدها المسجلة"
                  : "Your live daily schedule with real medications and meal anchors"}
              </span>
            </div>
          </div>

          <Link href={`/${locale}/dashboard/${userProfile.username}`}>
            <Button size="sm" variant="primary" className="gap-2">
              <span>
                {locale === "ar" ? "فتح لوحة التحكم" : "Open Dashboard"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Telegram Bot Notification Activation Banner */}
        {!userProfile.telegram_chat_id ? (
          <div className="bg-cyan-50 border border-cyan-300 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-cyan-600 text-white flex items-center justify-center shrink-0 font-bold">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-cyan-950 text-sm flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-cyan-700" />
                  <span>
                    {locale === "ar"
                      ? "تفعيل تنبيهات الأدوية الفورية عبر تليجرام"
                      : "Enable Instant Telegram Medication Reminders"}
                  </span>
                </h4>
                <p className="text-xs text-cyan-800 mt-0.5">
                  {locale === "ar"
                    ? "لتصلك تنبيهات الجرعات في أوقاتها مباشرة على هاتفك، اضغط لتنشيط بوت تليجرام بنقرة واحدة."
                    : "To receive instant medication reminder alerts directly on your phone, click to activate the Telegram bot."}
                </p>
              </div>
            </div>

            <a
              href={telegramDeepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 w-full sm:w-auto"
            >
              <Button
                size="sm"
                className="w-full sm:w-auto gap-2 bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold"
              >
                <Send className="w-4 h-4" />
                <span>
                  {locale === "ar"
                    ? "ربط التليجرام الآن"
                    : "Connect Telegram Now"}
                </span>
              </Button>
            </a>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-300 p-3 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">
                {locale === "ar"
                  ? "تنبيهات بوت تليجرام مفعلة بنجاح لهذا الحساب"
                  : "Telegram bot notifications active for this account"}
              </span>
            </div>
            <Link
              href={`/${locale}/dashboard/${userProfile.username}/settings`}
              className="text-[#008080] font-bold hover:underline"
            >
              {locale === "ar" ? "إدارة الإعدادات" : "Manage Settings"}
            </Link>
          </div>
        )}

        {/* Real Live Daily Timeline Component */}
        <DailyTimeline locale={locale} dict={dict} />
      </section>
    );
  }

  // Not logged-in view: Interactive demo preview
  return (
    <section className="max-w-5xl mx-auto bg-white border border-slate-300 p-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#008080] text-white flex items-center justify-center font-bold">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              Daily Schedule Demo
            </h3>
            <span className="text-xs text-slate-500">
              Live preview of Sehatak dynamic timelines
            </span>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
          92% Adherence
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-amber-50 border border-amber-300 p-5 space-y-3">
          <div className="flex items-center justify-between font-bold text-amber-900 text-sm">
            <span className="flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-600" />
              <span>Morning (08:30 AM)</span>
            </span>
            <span className="text-xs bg-amber-200/80 px-2 py-0.5 border border-amber-400">
              Post-Breakfast
            </span>
          </div>
          <div className="bg-white p-3 border border-amber-200">
            <span className="font-bold text-slate-900 text-sm block">
              Glucophage 850mg
            </span>
            <span className="text-xs text-slate-500">
              1 Tablet • Meal-anchored
            </span>
          </div>
        </div>

        <div className="bg-cyan-50 border border-cyan-300 p-5 space-y-3">
          <div className="flex items-center justify-between font-bold text-cyan-900 text-sm">
            <span className="flex items-center gap-1.5">
              <SunMedium className="w-4 h-4 text-cyan-600" />
              <span>Afternoon (02:30 PM)</span>
            </span>
            <span className="text-xs bg-cyan-200/80 px-2 py-0.5 border border-cyan-400">
              Post-Lunch
            </span>
          </div>
          <div className="bg-white p-3 border border-cyan-200">
            <span className="font-bold text-slate-900 text-sm block">
              Panadol Extra
            </span>
            <span className="text-xs text-slate-500">
              500mg • Every 8 hours
            </span>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-300 p-5 space-y-3">
          <div className="flex items-center justify-between font-bold text-indigo-900 text-sm">
            <span className="flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-indigo-600" />
              <span>Evening (09:00 PM)</span>
            </span>
            <span className="text-xs bg-indigo-200/80 px-2 py-0.5 border border-indigo-400">
              Post-Dinner
            </span>
          </div>
          <div className="bg-white p-3 border border-indigo-200">
            <span className="font-bold text-slate-900 text-sm block">
              Ventolin Inhaler
            </span>
            <span className="text-xs text-slate-500">2 Puffs • As needed</span>
          </div>
        </div>
      </div>
    </section>
  );
};
