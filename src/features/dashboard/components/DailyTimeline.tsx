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
  AnimatedTitle,
  FloatingBadge,
} from "@/components/animations";
import {
  Sun,
  Sunset,
  Moon,
  CheckCircle2,
  XCircle,
  Clock,
  Utensils,
  Award,
  Sparkles,
  Pill,
  Sliders,
} from "lucide-react";
import { CountdownBadge } from "@/components/ui/CountdownBadge";

interface TimelineProps {
  locale: "en" | "ar";
  dict: any;
}

export const DailyTimeline: React.FC<TimelineProps> = ({ locale, dict }) => {
  const isAr = locale === "ar";
  const { doses, adherenceScore, isLoading, toggleDose } = useDailyTimeline();
  const { breakfastTime, lunchTime, dinnerTime, setMealTimes } =
    useMealOffsetStore();

  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "taken">(
    "all",
  );
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [bTime, setBTime] = useState(breakfastTime);
  const [lTime, setLTime] = useState(lunchTime);
  const [dTime, setDTime] = useState(dinnerTime);

  const updateMealsMutation = useUpdateBaselineMeals(
    dict.common?.success || "Meal times updated",
  );

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

  // Filter doses based on active tab
  const filteredDoses = doses.filter((d) => {
    if (activeFilter === "pending") return d.status !== "taken";
    if (activeFilter === "taken") return d.status === "taken";
    return true;
  });

  // Sort doses chronologically
  const sortedDoses = [...filteredDoses].sort(
    (a, b) =>
      new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime(),
  );

  const takenCount = doses.filter((d) => d.status === "taken").length;
  const pendingCount = doses.filter((d) => d.status !== "taken").length;

  return (
    <div className="space-y-8">
      {/* 1. Header Component: Bounce & Scale Animation */}
      <UniqueCardReveal variant="scale-bounce" delay={0.1}>
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm text-slate-900 space-y-4">
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-50/50 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Left Side: Adherence Score + Animated Text */}
            <div className="flex items-center gap-6">
              <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100 shadow-2xs">
                <AdherenceRing percentage={adherenceScore} />
              </div>

              <div className="space-y-1.5">
                <FloatingBadge>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#008080] border border-teal-100 text-xs font-bold">
                    <Award className="w-3.5 h-3.5 text-[#008080]" />
                    <span>
                      {dict.dashboard?.adherenceScore ||
                        (isAr ? "مستوى الالتزام اليومي" : "Daily Adherence")}
                    </span>
                  </div>
                </FloatingBadge>

                <AnimatedTitle
                  as="h3"
                  delay={0.25}
                  className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight"
                >
                  {takenCount}{" "}
                  <span className="text-sm font-normal text-slate-400">
                    / {doses.length} {isAr ? "جرعات" : "doses"}
                  </span>
                </AnimatedTitle>

                <p className="text-xs text-slate-500">
                  {adherenceScore >= 80
                    ? isAr
                      ? "ممتاز جداً! أنت على طريق المحافظة الكاملة على صحتك 🌟"
                      : "Excellent! You are maintaining high adherence 🌟"
                    : isAr
                      ? "تابع أخذ جرعاتك في مواعيدها لتنعم بصحة ممتازة 💙"
                      : "Take your doses on time to stay healthy 💙"}
                </p>
              </div>
            </div>

            {/* Right Side: Quick Meal Anchors Summary */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-3 w-full md:w-auto">
              <div className="flex items-center justify-between gap-3 text-xs font-bold">
                <div className="flex items-center gap-2 text-slate-900">
                  <Utensils className="w-4 h-4 text-[#008080]" />
                  <span>
                    {dict.dashboard?.mealAnchors ||
                      (isAr ? "مواعيد الوجبات اليوم" : "Meal Times")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShiftModalOpen(true)}
                  className="text-xs text-[#008080] hover:underline font-bold flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 transition-transform active:scale-95"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{isAr ? "تعديل" : "Edit"}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-bold hover:scale-105 transition-transform">
                  🌅 {breakfastTime}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-900 border border-cyan-200 font-bold hover:scale-105 transition-transform">
                  ☀️ {lunchTime}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 font-bold hover:scale-105 transition-transform">
                  🌙 {dinnerTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </UniqueCardReveal>

      {/* 2. Filter Tabs Bar Component: Skew Slide Animation */}
      <UniqueCardReveal variant="slide-skew" delay={0.2}>
        <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === "all"
                  ? "bg-[#008080] text-white shadow-sm scale-105"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {isAr
                ? `كل الأدوية (${doses.length})`
                : `All Doses (${doses.length})`}
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("pending")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === "pending"
                  ? "bg-[#008080] text-white shadow-sm scale-105"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {isAr
                ? `قيد الانتظار (${pendingCount})`
                : `Pending (${pendingCount})`}
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("taken")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === "taken"
                  ? "bg-emerald-600 text-white shadow-sm scale-105"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {isAr ? `تم التناول (${takenCount})` : `Taken (${takenCount})`}
            </button>
          </div>

          <div className="text-xs text-slate-400 hidden sm:flex items-center gap-1 font-medium px-3">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {isAr ? "مرتب تصاعدياً حسب الوقت" : "Ordered chronologically"}
            </span>
          </div>
        </div>
      </UniqueCardReveal>

      {/* 3. Timeline Container with Staggered Animations for Each Medication Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {sortedDoses.length === 0 ? (
          <UniqueCardReveal variant="fade-blur" delay={0.1}>
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#008080] flex items-center justify-center mx-auto font-bold animate-bounce">
                <Pill className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                {isAr
                  ? "لا توجد أدوية مطابقة لهذا الفلتر"
                  : "No medication doses match this filter"}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isAr
                  ? 'اختر "كل الأدوية" لعرض جدول اليوم الكامل.'
                  : "Select 'All Doses' to view the full day timeline."}
              </p>
            </div>
          </UniqueCardReveal>
        ) : (
          <div className="relative border-r-2 sm:border-r-3 border-teal-100 pr-6 sm:pr-8 space-y-8">
            {sortedDoses.map((d, index) => {
              const doseDate = new Date(d.scheduled_for);
              const hour = doseDate.getHours();
              const timeStr = doseDate.toLocaleTimeString(
                isAr ? "ar-EG" : "en-US",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                },
              );

              const isTaken = d.status === "taken";
              const isSkipped = d.status === "skipped";

              // Distinct animation variant for each period
              let animVariant:
                | "flip"
                | "slide-skew"
                | "fade-blur"
                | "slide-right"
                | "elastic-drop" = "flip";
              let periodTag = isAr ? "جرعة مخصصة" : "Scheduled Dose";
              let tagColor = "bg-slate-100 text-slate-700 border-slate-200";

              if (hour >= 5 && hour < 12) {
                periodTag = isAr
                  ? "فترة الصباح • الإفطار 🍳"
                  : "Morning • Breakfast 🍳";
                tagColor = "bg-amber-50 text-amber-900 border-amber-200";
                animVariant = "flip";
              } else if (hour >= 12 && hour < 17) {
                periodTag = isAr
                  ? "فترة الظهيرة • الغداء 🍲"
                  : "Afternoon • Lunch 🍲";
                tagColor = "bg-cyan-50 text-cyan-900 border-cyan-200";
                animVariant = "slide-skew";
              } else {
                periodTag = isAr
                  ? "فترة المساء • العشاء 🥗"
                  : "Evening • Dinner 🥗";
                tagColor = "bg-indigo-50 text-indigo-900 border-indigo-200";
                animVariant = "slide-right";
              }

              return (
                <UniqueCardReveal
                  key={d.id}
                  variant={animVariant}
                  delay={0.1 + index * 0.08}
                >
                  <div className="relative group">
                    {/* Timeline Node Marker with Pulse Effect */}
                    <div
                      className={`absolute -right-[33px] sm:-right-[41px] top-4 w-5 h-5 rounded-full border-4 transition-all duration-300 ${
                        isTaken
                          ? "bg-emerald-500 border-emerald-200 ring-4 ring-emerald-50"
                          : isSkipped
                            ? "bg-slate-400 border-slate-200"
                            : "bg-[#008080] border-teal-100 ring-4 ring-teal-50 group-hover:scale-125"
                      }`}
                    />

                    {/* Vertical Timeline Card with Hover Elevation Micro-Animation */}
                    <div
                      className={`rounded-2xl border p-5 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        isTaken
                          ? "bg-emerald-50/60 border-emerald-200 shadow-2xs"
                          : isSkipped
                            ? "bg-slate-50 border-slate-200 opacity-60"
                            : "bg-white border-slate-200 hover:border-teal-400 hover:shadow-md hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Time & Period Badge */}
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="font-black text-slate-900 text-sm bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
                            <Clock className="w-4 h-4 text-[#008080]" />
                            <span>{timeStr}</span>
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${tagColor}`}
                          >
                            {periodTag}
                          </span>

                          {!isTaken && !isSkipped && (
                            <CountdownBadge
                              targetDate={d.scheduled_for}
                              locale={locale}
                              type="medication"
                            />
                          )}
                        </div>

                        {/* Title & Micro Text */}
                        <div>
                          <AnimatedTitle
                            as="h4"
                            delay={0.15 + index * 0.05}
                            className="font-extrabold text-base text-slate-900 flex items-center gap-2"
                          >
                            <span>{d.medication_name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-md bg-teal-50 text-[#008080] font-bold border border-teal-100">
                              {d.dosage}
                            </span>
                          </AnimatedTitle>
                          {d.notes && (
                            <p className="text-xs text-slate-500 italic mt-0.5">
                              &quot;{d.notes}&quot;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Button Micro-Animations */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <Button
                          size="sm"
                          variant={isTaken ? "primary" : "outline"}
                          className={
                            isTaken
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs gap-1.5 px-4 active:scale-95 transition-transform"
                              : "text-emerald-700 border-emerald-300 hover:bg-emerald-50 font-bold text-xs rounded-xl gap-1.5 px-4 active:scale-95 transition-transform"
                          }
                          onClick={() =>
                            toggleDose({
                              medication_id: d.medication_id,
                              scheduled_for: d.scheduled_for,
                              status: isTaken ? "pending" : "taken",
                            })
                          }
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            {isTaken
                              ? isAr
                                ? "تم أخذ الجرعة ✅"
                                : "Taken ✅"
                              : isAr
                                ? "تأكيد التناول"
                                : "Mark Taken"}
                          </span>
                        </Button>

                        <Button
                          size="sm"
                          variant={isSkipped ? "secondary" : "ghost"}
                          className={
                            isSkipped
                              ? "bg-slate-200 text-slate-700 font-medium text-xs rounded-xl"
                              : "text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
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
                  </div>
                </UniqueCardReveal>
              );
            })}
          </div>
        )}
      </div>

      {/* Meal Shift Modal */}
      <Modal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        title={
          dict.dashboard?.shiftMeal ||
          (isAr ? "تعديل مواعيد الوجبات الأساسية" : "Adjust Meal Times")
        }
      >
        <div className="space-y-4 pt-2">
          <Input
            label={
              dict.dashboard?.breakfast ||
              (isAr ? "موعد الإفطار" : "Breakfast Time")
            }
            type="time"
            value={bTime}
            onChange={(e) => setBTime(e.target.value)}
          />
          <Input
            label={
              dict.dashboard?.lunch || (isAr ? "موعد الغداء" : "Lunch Time")
            }
            type="time"
            value={lTime}
            onChange={(e) => setLTime(e.target.value)}
          />
          <Input
            label={
              dict.dashboard?.dinner || (isAr ? "موعد العشاء" : "Dinner Time")
            }
            type="time"
            value={dTime}
            onChange={(e) => setDTime(e.target.value)}
          />
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setIsShiftModalOpen(false)}
              className="rounded-xl text-xs"
            >
              {dict.common?.cancel || (isAr ? "إلغاء" : "Cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveMealTimes}
              className="rounded-xl text-xs font-bold bg-[#008080] hover:bg-[#006666]"
            >
              {dict.common?.save || (isAr ? "حفظ التغييرات" : "Save Changes")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
