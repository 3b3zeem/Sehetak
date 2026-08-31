"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DailyTimeline } from "./DailyTimeline";
import {
  Pill,
  ArrowRight,
  Sun,
  SunMedium,
  Moon,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Utensils,
  ChevronLeft,
  ChevronRight,
  Sliders,
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
  const isAr = locale === "ar";
  const supabase = createClient();

  // Interactive Meal Shift Offset State for Demo Preview
  const [mealShiftMinutes, setMealShiftMinutes] = useState(0);

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
      <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400 space-y-3 shadow-sm">
        <div className="w-10 h-10 border-4 border-[#008080] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold">
          {isAr ? "جاري تحميل جدول الأدویة..." : "Loading schedule..."}
        </p>
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
      <section className="space-y-6">
        {/* Telegram Bot Notification Activation Banner */}
        {!userProfile.telegram_chat_id ? (
          <div className="bg-gradient-to-r from-[#0088cc]/10 via-cyan-50 to-[#0077b6]/10 border border-[#0088cc]/30 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#0088cc] text-white flex items-center justify-center shrink-0 font-bold shadow-md shadow-[#0088cc]/20">
                <Send className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#0088cc]" />
                  <span>
                    {isAr
                      ? "تفعيل تنبيهات الأدوية الفورية عبر تليجرام"
                      : "Enable Instant Telegram Medication Reminders"}
                  </span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isAr
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
                className="w-full sm:w-auto gap-2 bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold rounded-xl px-5 py-2.5 shadow-md shadow-[#0088cc]/20"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isAr ? "ربط التليجرام الآن 🚀" : "Connect Telegram Now 🚀"}
                </span>
              </Button>
            </a>
          </div>
        ) : (
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-950 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold block">
                  {isAr
                    ? "تنبيهات بوت تليجرام مفعّلة بنجاح"
                    : "Telegram Bot Reminders Active"}
                </span>
                <span className="text-[11px] text-emerald-700">
                  {isAr
                    ? "تصلك التنبيهات الفورية على هاتفك في مواعيدها المحددة."
                    : "You will receive instant alerts on your phone right on schedule."}
                </span>
              </div>
            </div>
            <Link
              href={`/${locale}/dashboard/${userProfile.username}/settings`}
              className="text-[#008080] font-bold hover:underline bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs"
            >
              {isAr ? "إدارة الإعدادات" : "Manage Settings"}
            </Link>
          </div>
        )}

        {/* Real Live Daily Timeline Component */}
        <DailyTimeline locale={locale} dict={dict} />
      </section>
    );
  }

  // Helper to format time with dynamic meal offset
  const getShiftedTime = (baseHour: number, baseMinute: number) => {
    const totalMinutes = baseHour * 60 + baseMinute + mealShiftMinutes;
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    const period = hours >= 12 ? (isAr ? "م" : "PM") : isAr ? "ص" : "AM";
    const formattedHour = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMin = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHour}:${formattedMin} ${period}`;
  };

  // Not logged-in view: Redesigned Interactive Demo Preview
  return (
    <section className="max-w-5xl mx-auto bg-gradient-to-b from-white via-slate-50/50 to-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Demo Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#008080] text-white flex items-center justify-center font-bold shadow-md shadow-teal-900/10">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-[#008080] text-[11px] font-bold border border-teal-100 mb-1">
              <Sparkles className="w-3 h-3" />
              <span>
                {isAr
                  ? "جدول ذكي مرتبط بالوجبات"
                  : "Meal-Anchored Dynamic Schedule"}
              </span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
              {isAr
                ? "معاينة جدول الأدویة اليومي"
                : "Daily Medication Timeline Preview"}
            </h3>
          </div>
        </div>

        {/* Adherence Rate Metric Card */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-2xs self-stretch sm:self-auto justify-between">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">
              {isAr ? "التزامك اليومي" : "Daily Adherence"}
            </div>
            <div className="text-lg font-black text-emerald-600">94%</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Interactive Feature Highlight: Dynamic Meal Offset Simulator */}
      <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-700">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-4 h-4 text-[#008080] shrink-0" />
          <span>
            <strong className="text-slate-900 font-bold">
              {isAr ? "تجربة التعديل الديناميكي:" : "Dynamic Shift Demo:"}
            </strong>{" "}
            {isAr
              ? "غير وقت الإفطار اليوم لتشاهد كيف تتعدل مواعيد الأدویة المرتبطة بها تلقائياً!"
              : "Shift your breakfast time to see medication schedules dynamically adjust!"}
          </span>
        </div>

        {/* Shift Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => setMealShiftMinutes((prev) => Math.max(-60, prev - 30))}
            className="px-2.5 py-1 bg-white hover:bg-teal-100 text-[#008080] font-bold rounded-lg border border-teal-200 transition-colors"
          >
            -30 {isAr ? "دقيقة" : "min"}
          </button>
          <span className="px-2 py-1 font-mono font-bold text-slate-900 bg-white rounded-lg border border-slate-200 text-xs">
            {mealShiftMinutes === 0
              ? isAr
                ? "الوقت الطبيعي"
                : "Standard"
              : `${mealShiftMinutes > 0 ? "+" : ""}${mealShiftMinutes} ${isAr ? "د" : "m"}`}
          </span>
          <button
            type="button"
            onClick={() => setMealShiftMinutes((prev) => Math.min(120, prev + 30))}
            className="px-2.5 py-1 bg-white hover:bg-teal-100 text-[#008080] font-bold rounded-lg border border-teal-200 transition-colors"
          >
            +30 {isAr ? "دقيقة" : "min"}
          </button>
        </div>
      </div>

      {/* 3 Schedule Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Morning Slot */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">
                  {isAr ? "الصباح" : "Morning"}
                </h4>
                <div className="text-xs text-amber-700 font-extrabold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{getShiftedTime(8, 30)}</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
              {isAr ? "بعد الإفطار" : "Post-Breakfast"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">
                {isAr ? "جلوكوفاج 850mg" : "Glucophage 850mg"}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                {isAr ? "تم تناولها ✅" : "Taken ✅"}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Utensils className="w-3 h-3 text-slate-400" />
              <span>{isAr ? "1 حبة • مرتبط بالإفطار" : "1 Tablet • Meal-anchored"}</span>
            </p>
          </div>
        </div>

        {/* Afternoon Slot */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs hover:border-cyan-300 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                <SunMedium className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">
                  {isAr ? "الظهيرة" : "Afternoon"}
                </h4>
                <div className="text-xs text-cyan-700 font-extrabold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{getShiftedTime(14, 30)}</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] bg-cyan-50 text-cyan-800 font-bold px-2 py-0.5 rounded-full border border-cyan-200">
              {isAr ? "بعد الغداء" : "Post-Lunch"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">
                {isAr ? "أملوديبين (دواء الضغط)" : "Amlodipine 5mg"}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                {isAr ? "تم تناولها ✅" : "Taken ✅"}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Utensils className="w-3 h-3 text-slate-400" />
              <span>{isAr ? "5mg • مرتبط بالغداء" : "5mg • Meal-anchored"}</span>
            </p>
          </div>
        </div>

        {/* Evening Slot */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">
                  {isAr ? "المساء" : "Evening"}
                </h4>
                <div className="text-xs text-indigo-700 font-extrabold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{getShiftedTime(21, 0)}</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] bg-indigo-50 text-indigo-800 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
              {isAr ? "بعد العشاء" : "Post-Dinner"}
            </span>
          </div>
        </div>
      </div>

      {/* CTA Footer inside Section */}
      <div className="pt-2 text-center">
        <Link href={`/${locale}/register`}>
          <Button
            size="lg"
            className="gap-2 bg-[#008080] hover:bg-[#006666] text-white font-bold rounded-xl shadow-md px-6"
          >
            <span>
              {isAr
                ? "أنشئ جدول أدويتك التفاعلي مجاناً الآن"
                : "Create Your Free Interactive Schedule"}
            </span>
            <ArrowRight className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
          </Button>
        </Link>
      </div>
    </section>
  );
};
