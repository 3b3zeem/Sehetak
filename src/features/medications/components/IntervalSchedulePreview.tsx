"use client";

import React from "react";
import { Sun, Sunset, Moon, Sparkles, ShieldAlert, Clock } from "lucide-react";

interface IntervalSchedulePreviewProps {
  startTime: string; // e.g. "08:00"
  intervalHours: number; // e.g. 8
  locale: "en" | "ar";
  onIntervalSelect?: (hours: number) => void;
  avoidSleep?: boolean;
  onAvoidSleepToggle?: (val: boolean) => void;
}

export const IntervalSchedulePreview: React.FC<
  IntervalSchedulePreviewProps
> = ({
  startTime = "08:00",
  intervalHours = 8,
  locale = "ar",
  onIntervalSelect,
  avoidSleep = false,
  onAvoidSleepToggle,
}) => {
  const isAr = locale === "ar";

  // Calculate doses for the 24-hour cycle
  const calculateDoses = () => {
    if (!startTime || !intervalHours || intervalHours <= 0) return [];

    const [startH, startM] = startTime.split(":").map(Number);
    const count = Math.min(24, Math.floor(24 / intervalHours));
    const doses = [];

    for (let i = 0; i < count; i++) {
      let totalMinutes =
        (startH * 60 + (startM || 0) + i * intervalHours * 60) % (24 * 60);

      let h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;

      // Check if dose lands in sleep window (12 AM - 6 AM)
      const isSleepWindow = h >= 0 && h < 6;

      const h12 = h % 12 === 0 ? 12 : h % 12;
      const ampm = h >= 12 ? (isAr ? "م" : "PM") : isAr ? "ص" : "AM";
      const formatted = `${h12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;

      let icon = Sun;
      let timeLabel = isAr ? "صباحاً" : "Morning";

      if (h >= 5 && h < 12) {
        icon = Sun;
        timeLabel = isAr ? "صباحاً" : "Morning";
      } else if (h >= 12 && h < 17) {
        icon = Sun;
        timeLabel = isAr ? "عصراً" : "Afternoon";
      } else if (h >= 17 && h < 22) {
        icon = Sunset;
        timeLabel = isAr ? "مساءً" : "Evening";
      } else {
        icon = Moon;
        timeLabel = isAr ? "ليلاً (وقت النوم)" : "Night (Sleep Window)";
      }

      doses.push({
        doseIndex: i + 1,
        time24: `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
        formatted,
        icon,
        timeLabel,
        isSleepWindow,
      });
    }

    return doses;
  };

  const doses = calculateDoses();
  const hasSleepConflicts = doses.some((d) => d.isSleepWindow);

  const presets = [
    { hours: 12, label: isAr ? "كل 12 ساعة (مرتين)" : "Every 12h (2x)" },
    { hours: 8, label: isAr ? "كل 8 ساعات (3 مرات)" : "Every 8h (3x)" },
    { hours: 6, label: isAr ? "كل 6 ساعات (4 مرات)" : "Every 6h (4x)" },
    { hours: 4, label: isAr ? "كل 4 ساعات (6 مرات)" : "Every 4h (6x)" },
  ];

  return (
    <div className="space-y-4 my-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
      {/* Preset Quick Chips */}
      {onIntervalSelect && (
        <div>
          <label className="text-xs font-semibold text-slate-700 mb-2 block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#008080]" />
            <span>
              {isAr ? "اختيارات سريعة للتكرار:" : "Quick Interval Presets:"}
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.hours}
                type="button"
                onClick={() => onIntervalSelect(p.hours)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  intervalHours === p.hours
                    ? "bg-[#008080] text-white border-[#008080] shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:border-[#008080] hover:text-[#008080]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live Daily Timeline Preview Header */}
      <div className="border-t border-slate-200 pt-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#008080]" />
            <span className="text-xs font-bold text-slate-900">
              {isAr
                ? "المعاينة الحية لجدول الجرعات اليومي:"
                : "Live Daily Schedule Preview:"}
            </span>
          </div>
          <span className="text-xs font-semibold text-[#008080] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            {doses.length} {isAr ? "جرعات يومياً" : "doses/day"}
          </span>
        </div>

        {/* Unified Clean Dose Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {doses.map((dose) => {
            const IconComponent = dose.icon;
            return (
              <div
                key={dose.doseIndex}
                className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                  dose.isSleepWindow
                    ? "bg-amber-50/50 border-amber-300 text-slate-800"
                    : "bg-white border-slate-200 text-slate-800 hover:border-[#008080]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                      dose.isSleepWindow
                        ? "bg-amber-100 text-amber-700"
                        : "bg-teal-50 text-[#008080]"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {dose.formatted}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {dose.timeLabel}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    dose.isSleepWindow
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-teal-50 text-[#008080] border-teal-200"
                  }`}
                >
                  #{dose.doseIndex}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sleep Protection Guard Notification */}
      {hasSleepConflicts && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 space-y-2">
          <div className="flex items-start gap-2 text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">
                {isAr
                  ? "تنبيه حارس النوم (Sleep Protection Guard):"
                  : "Sleep Protection Alert:"}
              </span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                {isAr
                  ? "توجد جرعة مقترحة في وقت النوم (بين 12 منتصف الليل و 6 صباحاً). يمكنك تغيير وقت البداية لضبط الجدول دون إيقاظك من النوم."
                  : "A dose falls during sleep hours (12 AM - 6 AM). Consider adjusting the start time."}
              </p>
            </div>
          </div>

          {onAvoidSleepToggle && (
            <label className="flex items-center gap-2 pt-1 text-xs font-semibold text-amber-900 cursor-pointer">
              <input
                type="checkbox"
                checked={avoidSleep}
                onChange={(e) => onAvoidSleepToggle(e.target.checked)}
                className="w-4 h-4 text-[#008080] rounded border-slate-300 focus:ring-[#008080]"
              />
              <span>
                {isAr
                  ? "تعديل التوزيع تلقائياً لتجنب ساعات النوم"
                  : "Adjust schedule to avoid waking up at night"}
              </span>
            </label>
          )}
        </div>
      )}
    </div>
  );
};
