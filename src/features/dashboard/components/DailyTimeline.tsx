"use client";

import React, { useState } from "react";
import { useDailyTimeline } from "../hooks/useDailyTimeline";
import { useUpdateBaselineMeals } from "../hooks/useUpdateBaselineMeals";
import { useMealOffsetStore } from "@/stores/useMealOffsetStore";
import { CardSkeleton } from "@/components/feedback/skeletons";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import {
  AdherenceRing,
  UniqueCardReveal,
  FloatingBadge,
} from "@/components/animations";
import { toast } from "sonner";
import {
  Sun,
  Sunset,
  Moon,
  CheckCircle2,
  XCircle,
  Clock,
  Utensils,
  Award,
} from "lucide-react";

interface TimelineProps {
  locale: "en" | "ar";
  dict: any;
}

export const DailyTimeline: React.FC<TimelineProps> = ({ locale, dict }) => {
  const { doses, adherenceScore, isLoading, toggleDose } = useDailyTimeline();
  const { breakfastTime, lunchTime, dinnerTime, setMealTimes } =
    useMealOffsetStore();

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [bTime, setBTime] = useState(breakfastTime);
  const [lTime, setLTime] = useState(lunchTime);
  const [dTime, setDTime] = useState(dinnerTime);

  const updateMealsMutation = useUpdateBaselineMeals(dict.common?.success || "Meal times updated");

  const handleSaveMealTimes = () => {
    setMealTimes({ breakfastTime: bTime, lunchTime: lTime, dinnerTime: dTime });
    updateMealsMutation.mutate({
      breakfast_time: bTime,
      lunch_time: lTime,
      dinner_time: dTime,
    });
    setIsShiftModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  // Filter doses into Morning (00:00 - 11:59), Afternoon (12:00 - 16:59), Evening (17:00 - 23:59)
  const morningDoses = doses.filter((d) => {
    const h = new Date(d.scheduled_for).getHours();
    return h >= 0 && h < 12;
  });

  const afternoonDoses = doses.filter((d) => {
    const h = new Date(d.scheduled_for).getHours();
    return h >= 12 && h < 17;
  });

  const eveningDoses = doses.filter((d) => {
    const h = new Date(d.scheduled_for).getHours();
    return h >= 17;
  });

  const renderDoseList = (
    doseList: typeof doses,
    sectionTitle: string,
    SectionIcon: any,
    bgAccent: string,
    animationVariant: "flip" | "slide-skew" | "fade-blur",
  ) => (
    <UniqueCardReveal variant={animationVariant} delay={0.2}>
      <div className="bg-white border border-slate-300 p-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 ${bgAccent} flex items-center justify-center font-bold`}
            >
              <SectionIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {sectionTitle}
              </h3>
              <span className="text-xs text-slate-500">
                {locale === "ar"
                  ? `${doseList.length} أدوية مسجلة`
                  : `${doseList.length} medications scheduled`}
              </span>
            </div>
          </div>
        </div>

        {doseList.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center italic">
            {dict.dashboard?.noDosesScheduled}
          </p>
        ) : (
          <div className="space-y-3">
            {doseList.map((d) => {
              const timeStr = new Date(d.scheduled_for).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              const isTaken = d.status === "taken";
              const isSkipped = d.status === "skipped";

              return (
                <div
                  key={d.id}
                  className={`p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isTaken
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                      : isSkipped
                        ? "bg-slate-100 border-slate-300 text-slate-500 opacity-70"
                        : "bg-white border-slate-300 text-slate-900 hover:border-[#008080]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-100 text-slate-700 font-semibold text-xs shrink-0 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{timeStr}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{d.medication_name}</h4>
                      <span className="text-xs text-slate-500 capitalize">
                        {d.med_type} • {d.dosage}
                      </span>
                      {d.notes && (
                        <p className="text-xs text-slate-500 mt-1 italic">
                          &quot;{d.notes}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dose Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant={isTaken ? "primary" : "outline"}
                      className={
                        isTaken
                          ? "bg-emerald-600 text-white border-none"
                          : "text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                      }
                      onClick={() =>
                        toggleDose({
                          medication_id: d.medication_id,
                          scheduled_for: d.scheduled_for,
                          status: isTaken ? "pending" : "taken",
                        })
                      }
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      <span>
                        {isTaken
                          ? dict.dashboard?.statusTaken
                          : dict.dashboard?.markTaken}
                      </span>
                    </Button>

                    <Button
                      size="sm"
                      variant={isSkipped ? "secondary" : "ghost"}
                      className={
                        isSkipped
                          ? "bg-slate-300 text-slate-800"
                          : "text-slate-500 hover:text-slate-800"
                      }
                      onClick={() =>
                        toggleDose({
                          medication_id: d.medication_id,
                          scheduled_for: d.scheduled_for,
                          status: isSkipped ? "pending" : "skipped",
                        })
                      }
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </UniqueCardReveal>
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: Adherence Metric & Meal Anchors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Adherence Ring Card */}
        <UniqueCardReveal variant="scale-bounce" delay={0.1}>
          <div className="bg-white border border-slate-300 p-6 flex items-center gap-6">
            <AdherenceRing percentage={adherenceScore} />

            <div>
              <FloatingBadge>
                <div className="flex items-center gap-1.5 text-[#008080] font-bold text-xs mb-1">
                  <Award className="w-4 h-4" />
                  <span>{dict.dashboard?.adherenceScore}</span>
                </div>
              </FloatingBadge>
              <h4 className="text-xl font-extrabold text-slate-900">
                {doses.filter((d) => d.status === "taken").length} /{" "}
                {doses.length}
              </h4>
              <span className="text-xs text-slate-500">
                {dict.dashboard?.dosesTaken}
              </span>
            </div>
          </div>
        </UniqueCardReveal>

        {/* Dynamic Meal Anchors Control Card */}
        <UniqueCardReveal
          variant="fade-blur"
          delay={0.25}
          className="md:col-span-2"
        >
          <div className="bg-white border border-slate-300 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 h-full">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Utensils className="w-5 h-5 text-[#008080]" />
                <span>{dict.dashboard?.mealAnchors}</span>
              </div>
              <p className="text-xs text-slate-500">
                Meal-anchored medications automatically adapt to today&apos;s
                shift times.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <span className="px-2.5 py-1 bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-300">
                  {dict.dashboard?.breakfast}: {breakfastTime}
                </span>
                <span className="px-2.5 py-1 bg-cyan-50 text-cyan-900 text-xs font-semibold border border-cyan-300">
                  {dict.dashboard?.lunch}: {lunchTime}
                </span>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-900 text-xs font-semibold border border-indigo-300">
                  {dict.dashboard?.dinner}: {dinnerTime}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShiftModalOpen(true)}
              className="gap-2 shrink-0"
            >
              <Utensils className="w-4 h-4 text-[#008080]" />
              <span>{dict.dashboard?.shiftMeal}</span>
            </Button>
          </div>
        </UniqueCardReveal>
      </div>

      {/* Timeline Sections with Distinct Animation Variants */}
      <div className="space-y-6">
        {renderDoseList(
          morningDoses,
          dict.dashboard?.morning || "Morning Schedule",
          Sun,
          "bg-amber-100 text-amber-800",
          "flip",
        )}
        {renderDoseList(
          afternoonDoses,
          dict.dashboard?.afternoon || "Afternoon Schedule",
          Sunset,
          "bg-cyan-100 text-cyan-800",
          "slide-skew",
        )}
        {renderDoseList(
          eveningDoses,
          dict.dashboard?.evening || "Evening Schedule",
          Moon,
          "bg-indigo-100 text-indigo-800",
          "fade-blur",
        )}
      </div>

      {/* Meal Shift Modal */}
      <Modal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        title={dict.dashboard?.shiftMeal || "Shift Meal Time"}
      >
        <div className="space-y-4">
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
          <div className="pt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsShiftModalOpen(false)}
            >
              {dict.common?.cancel}
            </Button>
            <Button variant="primary" onClick={handleSaveMealTimes}>
              {dict.common?.save}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
