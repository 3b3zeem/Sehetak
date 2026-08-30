"use client";

import React, { useState } from "react";
import { TelegramConnectCard, WebPushConnectCard } from "@/features/notifications";
import { useUpdateBaselineMeals } from "../hooks/useUpdateBaselineMeals";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Utensils,
  User,
  Mail,
  Shield,
  CheckCircle2,
} from "lucide-react";

interface SettingsProps {
  locale: "en" | "ar";
  dict: any;
  user: {
    id: string;
    username: string;
    full_name?: string | null;
    email?: string | null;
    role?: "patient" | "admin";
    breakfast_time?: string | null;
    lunch_time?: string | null;
    dinner_time?: string | null;
    telegram_chat_id?: number | null;
    created_at?: string;
  };
}

export const UserSettings: React.FC<SettingsProps> = ({
  locale,
  dict,
  user,
}) => {
  const [bTime, setBTime] = useState(user.breakfast_time || "08:00");
  const [lTime, setLTime] = useState(user.lunch_time || "14:00");
  const [dTime, setDTime] = useState(user.dinner_time || "20:00");
  const updateMealsMutation = useUpdateBaselineMeals(
    dict.common?.success || "Baseline meal times saved",
  );

  const handleSaveBaselineMeals = (e: React.FormEvent) => {
    e.preventDefault();
    updateMealsMutation.mutate({
      breakfast_time: bTime,
      lunch_time: lTime,
      dinner_time: dTime,
    });
  };

  return (
    <div className="space-y-6">
      {/* Settings Title Header */}
      <div className="bg-white border border-slate-300 p-6">
        <h2 className="text-xl font-extrabold text-slate-900">
          {dict.settings?.title || "Account Settings"}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {locale === "ar"
            ? "إدارة حسابك الشخصي، مواعيد الوجبات الأساسية، وقنوات التنبيهات"
            : "Configure your profile details, default meal anchors, and alert notifications"}
        </p>
      </div>

      {/* 0. Account Profile & Identity Card */}
      <div className="bg-white border border-slate-300 p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="w-10 h-10 bg-[#008080] text-white flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {locale === "ar"
                ? "معلومات الملف الشخصي"
                : "User Identity & Account Details"}
            </h3>
            <p className="text-xs text-slate-500">
              {locale === "ar"
                ? "البيانات الشخصية المسجلة لدى منصة صحتك"
                : "Verified account information"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#008080]" />
              <span>{locale === "ar" ? "الاسم الكامل" : "Full Name"}</span>
            </span>
            <p className="font-bold text-slate-900 text-sm">
              {user.full_name || user.username}
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-[#008080]" />
              <span>
                {locale === "ar" ? "البريد الإلكتروني" : "Email Address"}
              </span>
            </span>
            <p className="font-bold text-slate-900 text-sm truncate">
              {user.email || "Not provided"}
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#008080]" />
              <span>{locale === "ar" ? "اسم المستخدم" : "Username"}</span>
            </span>
            <p className="font-bold text-slate-900 text-sm">{user.username}</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>{locale === "ar" ? "نوع الحساب" : "Account Role"}</span>
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 text-xs font-bold border ${
                  user.role === "admin"
                    ? "bg-amber-100 text-amber-800 border-amber-300"
                    : "bg-emerald-100 text-emerald-800 border-emerald-300"
                }`}
              >
                {user.role === "admin" ? "Administrator" : "Patient"}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Active</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Baseline Meal Anchors */}
      <div className="bg-white border border-slate-300 p-6">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6">
          <div className="w-10 h-10 bg-[#008080]/10 text-[#008080] flex items-center justify-center font-bold">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {dict.settings?.baselineMealsTitle}
            </h3>
            <p className="text-xs text-slate-500">
              {dict.settings?.baselineMealsDesc}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveBaselineMeals} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label={dict.dashboard?.breakfast}
              type="time"
              value={bTime}
              onChange={(e) => setBTime(e.target.value)}
            />
            <Input
              label={dict.dashboard?.lunch}
              type="time"
              value={lTime}
              onChange={(e) => setLTime(e.target.value)}
            />
            <Input
              label={dict.dashboard?.dinner}
              type="time"
              value={dTime}
              onChange={(e) => setDTime(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={updateMealsMutation.isPending}
            >
              {dict.settings?.saveMeals}
            </Button>
          </div>
        </form>
      </div>

      {/* 2. Telegram Integration Card */}
      <TelegramConnectCard
        userId={user.id}
        telegramChatId={user.telegram_chat_id}
        dict={dict}
      />

      {/* 3. Web Push Toggle */}
      <WebPushConnectCard dict={dict} locale={locale} />
    </div>
  );
};
