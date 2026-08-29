"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2 } from "lucide-react";
import { usePushManager } from "../hooks/usePushManager";

interface WebPushCardProps {
  dict: any;
  locale: "en" | "ar";
}

export const WebPushConnectCard: React.FC<WebPushCardProps> = ({
  dict,
  locale,
}) => {
  const { isSupported, isSubscribed, loading, subscribeToPush } =
    usePushManager();

  return (
    <div className="bg-white border border-slate-300 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 font-bold">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-base">
            {dict.settings?.webPushTitle ||
              (locale === "ar"
                ? "إشعارات المتصفح (Web Push)"
                : "Browser Push Notifications")}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            {dict.settings?.webPushDesc ||
              (locale === "ar"
                ? "تلقَّ إشعاراً فورياً على سطح المكتب أو الجوال من متصفح جوجل كروم عند موعد الدواء"
                : "Receive instant desktop and mobile browser alerts when medications are due")}
          </p>
          {isSubscribed && (
            <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {locale === "ar"
                  ? "مفعل على هذا الجهاز"
                  : "Active on this device"}
              </span>
            </span>
          )}
        </div>
      </div>

      <Button
        variant={isSubscribed ? "outline" : "primary"}
        disabled={!isSupported || loading || isSubscribed}
        onClick={subscribeToPush}
        className="shrink-0 gap-2 font-bold"
      >
        <Bell className="w-4 h-4" />
        <span>
          {isSubscribed
            ? locale === "ar"
              ? "الإشعارات مفعلة"
              : "Push Enabled"
            : loading
              ? locale === "ar"
                ? "جاري التفعيل..."
                : "Enabling..."
              : locale === "ar"
                ? "تفعيل إشعارات المتصفح"
                : "Enable Web Push"}
        </span>
      </Button>
    </div>
  );
};
