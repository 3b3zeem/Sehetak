"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw, CheckCircle2 } from "lucide-react";
import { MedicationRow } from "@/types";
import { useMedications } from "../hooks/useMedications";
import { toast } from "sonner";

interface ShiftScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  medication: MedicationRow | null;
  locale: "en" | "ar";
}

export const ShiftScheduleModal: React.FC<ShiftScheduleModalProps> = ({
  isOpen,
  onClose,
  medication,
  locale = "ar",
}) => {
  const { updateMedication, isUpdating } = useMedications();
  const isAr = locale === "ar";

  const getCurrentFormattedTime = () => {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, "0");
    const m = now.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const [customTime, setCustomTime] = useState(getCurrentFormattedTime());

  if (!medication) return null;

  const handleShiftToNow = async () => {
    const nowTimeStr = getCurrentFormattedTime();

    await updateMedication({
      id: medication.id,
      data: {
        start_time: nowTimeStr,
      },
    });

    toast.success(
      isAr
        ? `تم تعديل جدول ${medication.name} ليبدأ من الآن (${nowTimeStr}) كل ${medication.interval_hours || 8} ساعات!`
        : `Updated ${medication.name} schedule starting from NOW (${nowTimeStr}) every ${medication.interval_hours || 8} hours!`
    );

    onClose();
  };

  const handleShiftToCustomTime = async () => {
    await updateMedication({
      id: medication.id,
      data: {
        start_time: customTime,
      },
    });

    toast.success(
      isAr
        ? `تم تعديل جدول ${medication.name} ليبدأ من (${customTime})!`
        : `Updated ${medication.name} schedule starting from (${customTime})!`
    );

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAr ? "⏰ تعديل الجدول من الآن (Rolling Smart Timer)" : "⏰ Rolling Smart Timer"}
    >
      <div className="space-y-4 pt-2">
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
          <div className="flex items-center gap-2 text-[#008080] font-bold text-sm mb-1">
            <RefreshCw className="w-4 h-4" />
            <span>{medication.name}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {isAr
              ? `هل أخذت الجرعة الآن في غير موعدها المعتاد؟ تتيح لك هذه الخاصة تعديل مواعيد الجرعات القادمة لتكون كل (${medication.interval_hours || 8} ساعات) تلقائياً بدءاً من لحظة تناولها!`
              : `Did you take your dose right now at an adjusted time? This shifts your upcoming doses to trigger every (${medication.interval_hours || 8} hours) starting from this moment!`}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {/* Quick Option 1: Shift to Current Moment */}
          <Button
            type="button"
            variant="primary"
            onClick={handleShiftToNow}
            isLoading={isUpdating}
            className="w-full bg-[#008080] hover:bg-[#006666] flex items-center justify-center gap-2 py-3"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isAr
                ? `أخذتها الآن (${getCurrentFormattedTime()}) واستكمال باقي المواعيد`
                : `Took it NOW (${getCurrentFormattedTime()}) & Shift Future Doses`}
            </span>
          </Button>

          {/* Option 2: Custom Picked Time */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              {isAr ? "أو حدد وقت تناول الجرعة الفعلي:" : "Or select actual dose time:"}
            </label>

            <div className="flex items-center gap-2">
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:outline-none"
              />

              <Button
                type="button"
                variant="outline"
                onClick={handleShiftToCustomTime}
                isLoading={isUpdating}
                className="text-xs py-1.5"
              >
                {isAr ? "تطبيق من هذا الوقت" : "Apply Custom Time"}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose}>
            {isAr ? "إلغاء" : "Cancel"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
