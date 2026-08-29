'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Send, CheckCircle2 } from 'lucide-react';

interface TelegramCardProps {
  userId: string;
  telegramChatId?: number | null;
  dict: any;
}

export const TelegramConnectCard: React.FC<TelegramCardProps> = ({
  userId,
  telegramChatId,
  dict,
}) => {
  const botUsername =
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME ||
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ||
    'SehatakMed_bot';

  const telegramDeepLink = `https://t.me/${botUsername}?start=${userId}`;

  return (
    <div className="bg-white border border-slate-300 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-cyan-500/10 text-cyan-600 flex items-center justify-center shrink-0 font-bold">
          <Send className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-base">{dict.settings?.telegramTitle}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{dict.settings?.telegramDesc}</p>
          {telegramChatId && (
            <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{dict.settings?.telegramConnected}</span>
            </span>
          )}
        </div>
      </div>

      <a href={telegramDeepLink} target="_blank" rel="noopener noreferrer" className="shrink-0">
        <Button variant="secondary" className="gap-2 bg-[#0088cc] hover:bg-[#0077b3] text-white">
          <Send className="w-4 h-4" />
          <span>{telegramChatId ? 'Reconnect Bot' : dict.settings?.telegramConnect}</span>
        </Button>
      </a>
    </div>
  );
};
