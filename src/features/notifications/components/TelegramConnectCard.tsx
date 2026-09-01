'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, CheckCircle2, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface TelegramCardProps {
  userId?: string | null;
  telegramChatId?: number | null;
  dict?: any;
  locale?: 'en' | 'ar';
}

export const TelegramConnectCard: React.FC<TelegramCardProps> = ({
  userId,
  telegramChatId: initialChatId,
  dict,
  locale = 'ar',
}) => {
  const isAr = locale === 'ar';

  const { data: statusData } = useQuery({
    queryKey: ['telegram-status', userId],
    refetchInterval: 5000,
    queryFn: async () => {
      const res = await fetch('/api/telegram/status');
      const json = await res.json();
      return json.data as { isConnected: boolean; chatId: number | null } | null;
    },
  });

  const isConnected = !!initialChatId || !!statusData?.isConnected;

  const handleConnectTelegram = () => {
    const botUsername =
      process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME ||
      process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ||
      'SehatakMed_bot';
    window.open(`https://t.me/${botUsername}?start=${userId || 'user'}`, '_blank');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs hover:border-cyan-300 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 font-bold">
          <Send className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-extrabold text-slate-900 text-base">
            {dict?.settings?.telegramTitle || (isAr ? 'تنبيهات التليجرام (Telegram Alerts)' : 'Telegram Notifications')}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5 max-w-md leading-relaxed">
            {dict?.settings?.telegramDesc || (isAr ? 'استلم تذكيرات بالجرعات والمواعيد مباشرة على تطبيق التليجرام بنقرة واحدة وبدون كلمة سر.' : 'Receive medication reminders instantly on Telegram with 1-click.')}
          </p>
          {isConnected && (
            <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-300 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{dict?.settings?.telegramConnected || (isAr ? 'البوت متصل ومفعل' : 'Bot Connected')}</span>
            </span>
          )}
        </div>
      </div>

      {isConnected ? (
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded-xl border border-emerald-300 flex items-center gap-2 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isAr ? 'التليجرام مفعل ومتصل' : 'Telegram Active'}</span>
          </div>
          <button
            type="button"
            onClick={handleConnectTelegram}
            className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 underline flex items-center gap-1 transition-colors"
            title={isAr ? 'إعادة ربط البوت بحساب آخر' : 'Reconnect Bot'}
          >
            <RefreshCw className="w-3 h-3" />
            <span>{isAr ? 'إعادة الربط' : 'Reconnect'}</span>
          </button>
        </div>
      ) : (
        <Button
          onClick={handleConnectTelegram}
          variant="secondary"
          className="shrink-0 gap-2 bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold rounded-xl px-5 py-2.5 transition-all shadow-xs active:scale-95"
        >
          <Send className="w-4 h-4" />
          <span>
            {dict?.settings?.telegramConnect || (isAr ? 'ربط التليجرام فوراً' : 'Connect Telegram')}
          </span>
        </Button>
      )}
    </div>
  );
};
