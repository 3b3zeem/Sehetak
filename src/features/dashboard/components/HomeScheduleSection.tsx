"use client";

import React from "react";
import { DailyTimeline } from "./DailyTimeline";
import { TelegramConnectCard } from "@/features/notifications/components/TelegramConnectCard";
import { WebPushConnectCard } from "@/features/notifications/components/WebPushConnectCard";
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
          {isAr ? "جاري تحميل جدول الأدوية التفاعلي..." : "Loading interactive schedule..."}
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Notifications Connection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TelegramConnectCard
          userId={userProfile?.id}
          telegramChatId={userProfile?.telegram_chat_id}
          dict={dict}
          locale={locale}
        />
        <WebPushConnectCard dict={dict} locale={locale} />
      </div>

      {/* Real Live Interactive Daily Timeline */}
      <DailyTimeline locale={locale} dict={dict} />
    </section>
  );
};
