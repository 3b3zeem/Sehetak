'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CountdownBadgeProps {
  targetDate: string | Date;
  locale?: 'en' | 'ar';
  type?: 'medication' | 'appointment';
  isPastOrTaken?: boolean;
}

export const CountdownBadge: React.FC<CountdownBadgeProps> = ({
  targetDate,
  locale = 'ar',
  type = 'medication',
  isPastOrTaken = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    days: number;
    isPast: boolean;
    isDueNow: boolean;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    days: 0,
    isPast: false,
    isDueNow: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        // Due now or past
        const isRecent = Math.abs(diff) < 15 * 60 * 1000; // within last 15 mins
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: !isRecent,
          isDueNow: isRecent,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false, isDueNow: false });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (isPastOrTaken) {
    return null;
  }

  if (timeLeft.isDueNow) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse shadow-sm">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>{locale === 'ar' ? 'حان الآن موعد الملاحظة!' : 'Due Right Now!'}</span>
      </div>
    );
  }

  if (timeLeft.isPast) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-500">
        <Clock className="w-3 h-3 text-slate-400" />
        <span>{locale === 'ar' ? 'انقضى الموعد' : 'Time elapsed'}</span>
      </div>
    );
  }

  // Formatting strings
  const pad = (n: number) => String(n).padStart(2, '0');

  let countdownText = '';
  if (timeLeft.days > 0) {
    countdownText =
      locale === 'ar'
        ? `متبقي ${timeLeft.days} يوم و ${timeLeft.hours} ساعة`
        : `In ${timeLeft.days}d ${timeLeft.hours}h`;
  } else {
    countdownText =
      locale === 'ar'
        ? `متبقي ${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`
        : `In ${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`;
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
        type === 'medication'
          ? 'bg-teal-50 text-[#008080] border border-teal-200/60'
          : 'bg-cyan-50 text-[#0077b6] border border-cyan-200/60'
      }`}
    >
      <Clock className="w-3.5 h-3.5 animate-spin-slow" />
      <span>{countdownText}</span>
    </div>
  );
};
