"use client";

import React from "react";
import {
  Send,
  Bell,
  CheckCircle2,
  Zap,
  ArrowRight,
} from "lucide-react";
import { FadeInView, AnimatedTitle } from "@/components/animations";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface NotificationShowcaseProps {
  locale: "en" | "ar";
  dict: any;
}

export const NotificationShowcaseSection: React.FC<
  NotificationShowcaseProps
> = ({ locale, dict }) => {
  const isAr = locale === "ar";

  return (
    <section className="space-y-12 py-10 bg-white text-slate-900 p-8 md:p-12 relative overflow-hidden border border-slate-200 shadow-xs">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#008080]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#008080]/10 text-[#008080] text-xs font-bold border border-[#008080]/20">
          <Zap className="w-4 h-4" />
          <span>{isAr ? "الميزة الأهم في صحتك" : "Sehetak Core Feature"}</span>
        </div>

        <AnimatedTitle
          as="h2"
          className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
        >
          {isAr
            ? "تنبيهات لحظية على التليجرام والمتصفح في وقت الجرعة بدقة"
            : "Instant Telegram & Web Push Alerts Exactly on Schedule"}
        </AnimatedTitle>

        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {isAr
            ? "صممنا نظام إشعارات مزدوج لضمان عدم تفويت أي جرعة دواء أو موعد طبيب، حتى لو كان الموقع مغلقاً على جهازك!"
            : "Engineered with a dual notification pipeline so you never miss a dose or doctor visit, even when the browser is closed!"}
        </p>
      </div>

      {/* Grid of Notification Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 max-w-5xl mx-auto">
        {/* Telegram Card */}
        <FadeInView delay={0.2} direction="up">
          <div className="bg-slate-50 border border-slate-200 p-8 space-y-6 flex flex-col justify-between hover:border-[#0088cc] hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-[#0088cc]/10 text-[#0088cc] flex items-center justify-center font-bold">
                  <Send className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-[#0088cc]/10 text-[#0088cc] text-xs font-bold border border-[#0088cc]/30">
                  {isAr ? "ربط بنقرة واحدة" : "1-Click Deep Link"}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                {isAr ? "📲 إشعارات بوت التليجرام" : "📲 Telegram Bot Alerts"}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr
                  ? "اشترك في بوت تليجرام صحتك بنقرة واحدة بدون كتابة أو إدخال بيانات. تصلك رسالة تنبيهية باسم الدواء والجرعة وميعاد الدكتور فوراً على تطبيق تليجرام."
                  : "Connect to Sehetak Telegram Bot with one click. Get instant chat messages containing your medication names, dosage amounts, and doctor appointments."}
              </p>

              <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-200 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0088cc]" />
                  <span>
                    {isAr
                      ? "تنبيه مباشر على الموبايل والكمبيوتر"
                      : "Direct mobile and desktop notifications"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0088cc]" />
                  <span>
                    {isAr
                      ? "دعم كامل للتوقيت المحلي بمصر"
                      : "Full support for Egyptian local timezone"}
                  </span>
                </li>
              </ul>
            </div>

            <a
              href="https://t.me/SehatakMed_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="pt-2"
            >
              <Button className="w-full bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold gap-2">
                <Send className="w-4 h-4" />
                <span>
                  {isAr ? "تجربة بوت التليجرام الآن" : "Try Telegram Bot Now"}
                </span>
              </Button>
            </a>
          </div>
        </FadeInView>

        {/* Web Push Card */}
        <FadeInView delay={0.35} direction="up">
          <div className="bg-slate-50 border border-slate-200 p-8 space-y-6 flex flex-col justify-between hover:border-[#008080] hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-[#008080]/10 text-[#008080] flex items-center justify-center font-bold">
                  <Bell className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-[#008080]/10 text-[#008080] text-xs font-bold border border-[#008080]/30">
                  {isAr ? "إشعارات المتصفح الحية" : "Service Worker Push"}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                {isAr
                  ? "🔔 إشعارات الويب (Web Push)"
                  : "🔔 Web Push Browser Alerts"}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr
                  ? "قم بتفعيل إشعارات المتصفح بنقرة واحدة ليصلك إشعار منبثق من متصفح جوجل كروم أو سفاري على الشاشة الرئيسية لجوالك أو جهازك دون الحاجة لفتح الموقع."
                  : "Enable browser push notifications to receive popup alerts on your phone or PC screen via Chrome or Safari even when the browser tab is closed."}
              </p>

              <ul className="space-y-2 text-slate-600 text-xs border-t border-slate-200 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#008080]" />
                  <span>
                    {isAr
                      ? "إشعار منبثق صوتي وبصري"
                      : "Visual & sound popup alert"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#008080]" />
                  <span>
                    {isAr
                      ? "يعمل خلف الكواليس وبصوت التنبيه"
                      : "Runs seamlessly in background"}
                  </span>
                </li>
              </ul>
            </div>

            <Link href={`/${locale}/login`} className="pt-2">
              <Button variant="primary" className="w-full font-bold gap-2">
                <Bell className="w-4 h-4" />
                <span>
                  {isAr ? "تسجيل الدخول والتفعيل" : "Log In & Activate"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </FadeInView>
      </div>

      {/* 3 Step Setup Guide */}
      <div className="pt-8 border-t border-slate-200 max-w-4xl mx-auto text-center space-y-6 relative z-10">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {isAr ? "خطوات التفعيل السريعة ⚡" : "3-Step Quick Activation ⚡"}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-700">
          <div className="bg-slate-50 p-4 border border-slate-200 space-y-1">
            <span className="font-extrabold text-[#008080] text-sm">1.</span>
            <p className="font-bold text-slate-900">
              {isAr ? "إنشاء حساب جديد" : "Create Account"}
            </p>
            <p className="text-slate-500">
              {isAr ? "سجل في صحتك مجاناً" : "Free sign-up in 10s"}
            </p>
          </div>

          <div className="bg-slate-50 p-4 border border-slate-200 space-y-1">
            <span className="font-extrabold text-[#0088cc] text-sm">2.</span>
            <p className="font-bold text-slate-900">
              {isAr ? "ربط التليجرام أو الويب" : "Connect Telegram / Push"}
            </p>
            <p className="text-slate-500">
              {isAr
                ? "نقرة واحدة في صفحة الإعدادات"
                : "1-click tap in Settings"}
            </p>
          </div>

          <div className="bg-slate-50 p-4 border border-slate-200 space-y-1">
            <span className="font-extrabold text-amber-600 text-sm">3.</span>
            <p className="font-bold text-slate-900">
              {isAr ? "استلام التنبيهات بدقة" : "Get Timely Alerts"}
            </p>
            <p className="text-slate-500">
              {isAr
                ? "تنبيهات فورية في دقيقة الجرعة"
                : "Exact minute dose alerts"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
