'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface IntervalSelectorProps {
  startTime: string;
  intervalHours: number;
  locale?: 'en' | 'ar';
  onIntervalSelect: (hours: number) => void;
}

export const IntervalSelector: React.FC<IntervalSelectorProps> = ({
  startTime,
  intervalHours,
  locale = 'ar',
  onIntervalSelect,
}) => {
  const isAr = locale === 'ar';
  const presets = [4, 6, 8, 12, 24];

  // Calculate dose times across 24h
  const calculateDoseTimes = () => {
    if (!startTime || !intervalHours || intervalHours <= 0) return [];
    const [h, m] = startTime.split(':').map(Number);
    const times: string[] = [];
    let currentH = h || 8;
    let currentM = m || 0;

    const count = Math.floor(24 / intervalHours);
    for (let i = 0; i < count; i++) {
      const period = currentH >= 12 ? (isAr ? 'م' : 'PM') : isAr ? 'ص' : 'AM';
      const formattedH = currentH % 12 === 0 ? 12 : currentH % 12;
      const formattedM = currentM < 10 ? `0${currentM}` : currentM;
      times.push(`${formattedH}:${formattedM} ${period}`);

      currentH = (currentH + intervalHours) % 24;
    }
    return times;
  };

  const doseTimes = calculateDoseTimes();

  return (
    <div className="space-y-3 p-4 bg-teal-50/50 border border-teal-100 rounded-xl">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#008080]" />
          <span>{isAr ? 'تحديد خيار سريع للفارق الزمني:' : 'Quick Interval Presets:'}</span>
        </label>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {presets.map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => onIntervalSelect(h)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              intervalHours === h
                ? 'bg-[#008080] text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-teal-300'
            }`}
          >
            {isAr ? `كل ${h} ساعات` : `Every ${h}h`}
          </button>
        ))}
      </div>

      {doseTimes.length > 0 && (
        <div className="pt-2 border-t border-teal-100/80">
          <span className="text-[11px] text-slate-500 font-medium block mb-1.5">
            {isAr ? 'مواعيد الجرعات المتوقعة اليوم:' : 'Calculated Dose Schedule Today:'}
          </span>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {doseTimes.map((t, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-white border border-teal-200 text-teal-900 font-extrabold rounded-md shadow-2xs"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IntervalSelector;
