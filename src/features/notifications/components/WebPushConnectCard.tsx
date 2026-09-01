"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, RefreshCw, Loader2 } from "lucide-react";
import { usePushManager } from "../hooks/usePushManager";

interface WebPushCardProps {
  dict?: any;
  locale?: "en" | "ar";
}

export const WebPushConnectCard: React.FC<WebPushCardProps> = ({
  dict,
  locale = "ar",
}) => {
  const isAr = locale === "ar";
  const { isSupported, isSubscribed, loading, subscribeToPush } =
    usePushManager();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs hover:border-cyan-300 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-bold">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-extrabold text-slate-900 text-base">
            {dict?.settings?.webPushTitle ||
              (isAr
                ? "إشعارات المتصفح (Web Push Alerts)"
                : "Browser Push Notifications")}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5 max-w-md leading-relaxed">
            {dict?.settings?.webPushDesc ||
              (isAr
                ? "تلقَّ إشعاراً فورياً على سطح المكتب أو الجوال من متصفحك مباشرة عند موعد الجرعات."
                : "Receive instant desktop and mobile browser alerts when medications are due.")}
          </p>
          {isSubscribed && (
            <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-300 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {isAr ? "الإشعارات مفعلة ومربوطة بحسابك" : "Active & Linked to Account"}
              </span>
            </span>
          )}
        </div>
      </div>

      {isSubscribed ? (
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded-xl border border-emerald-300 flex items-center gap-2 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isAr ? "المتصفح مفعل ومتصل" : "Browser Active"}</span>
          </div>
          <button
            type="button"
            onClick={subscribeToPush}
            disabled={loading}
            className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 underline flex items-center gap-1 transition-colors"
            title={isAr ? "تحديث وتأكيد ربط الإشعارات بحسابك" : "Re-sync Push Token"}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            <span>{isAr ? "تحديث الربط" : "Re-sync"}</span>
          </button>
        </div>
      ) : (
        <Button
          onClick={subscribeToPush}
          disabled={!isSupported || loading}
          variant="primary"
          className="shrink-0 gap-2 font-bold rounded-xl px-5 py-2.5 transition-all shadow-xs active:scale-95"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
          <span>
            {loading
              ? isAr
                ? "جاري التفعيل..."
                : "Enabling..."
              : isAr
                ? "تفعيل إشعارات المتصفح"
                : "Enable Web Push"}
          </span>
        </Button>
      )}
    </div>
  );
};
