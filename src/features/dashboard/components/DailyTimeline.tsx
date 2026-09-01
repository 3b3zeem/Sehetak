"use client";

import React, { useState } from "react";
import { useDailyTimeline } from "../hooks/useDailyTimeline";
import { useUpdateBaselineMeals } from "../hooks/useUpdateBaselineMeals";
import { useMealLogger } from "../hooks/useMealLogger";
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
  CheckCircle2,
  XCircle,
  Clock,
  Utensils,
  Award,
  Pill,
  Sliders,
  AlertTriangle,
  MessageSquare,
  Eye,
} from "lucide-react";
import { CountdownBadge } from "@/components/ui/CountdownBadge";

interface TimelineProps {
  locale: "en" | "ar";
  dict: any;
}

export const DailyTimeline: React.FC<TimelineProps> = ({ locale, dict }) => {
  const isAr = locale === "ar";
  const { doses, adherenceScore, isLoading, toggleDose } = useDailyTimeline();
  const { mealLogs, logMeal, isLogging, activeMealType } = useMealLogger();
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

  const openPharmacyWhatsApp = (medName: string, dosage: string, phone: string, stock: number) => {
    const rawPhone = phone.replace(/[^0-9]/g, "");
    if (!rawPhone) return;

    const message = isAr
      ? `مرحباً، أود إرسال طلب إعادة تعبئة لدواء: ${medName} (الجرعة: ${dosage}). الكمية المتبقية لدي حالياً: ${stock} حبات. يرجى تأكيد الطلب.`
      : `Hello, I would like to place a refill order for medication: ${medName} (Dosage: ${dosage}). Remaining stock: ${stock}. Please confirm.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${rawPhone}?text=${encoded}`, "_blank");
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

  // Identify unique low-stock medications for low-stock warning banners
  const lowStockMedsMap = new Map<string, typeof doses[0]>();
  doses.forEach((d) => {
    if (d.stock_count <= d.low_stock_threshold && !lowStockMedsMap.has(d.medication_id)) {
      lowStockMedsMap.set(d.medication_id, d);
    }
  });
  const lowStockMeds = Array.from(lowStockMedsMap.values());

  // Meal log status for today
  const hasLoggedBreakfast = mealLogs.some((m) => m.meal_type === "breakfast");
  const hasLoggedLunch = mealLogs.some((m) => m.meal_type === "lunch");
  const hasLoggedDinner = mealLogs.some((m) => m.meal_type === "dinner");

  return (
    <div className="space-y-8">
      {/* Low Stock Refill Warning Banners */}
      {lowStockMeds.length > 0 && (
        <div className="space-y-3">
          {lowStockMeds.map((med) => (
            <div
              key={med.medication_id}
              className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-950 text-sm sm:text-base flex items-center gap-2">
                    <span>
                      {isAr
                        ? `تنبيه: متبقي ${med.stock_count} حبات فقط من دواء ${med.medication_name}!`
                        : `Low Stock: Only ${med.stock_count} doses remaining for ${med.medication_name}!`}
                    </span>
                  </h4>
                  <p className="text-xs text-amber-800">
                    {isAr
                      ? "هل تريد إرسال طلب إعادة تعبئة إلى الصيدلية بنقرة واحدة الآن؟"
                      : "Would you like to send a 1-click refill request to your pharmacy now?"}
                  </p>
                </div>
              </div>

              {med.pharmacy_phone ? (
                <Button
                  size="sm"
                  onClick={() =>
                    openPharmacyWhatsApp(
                      med.medication_name,
                      med.dosage,
                      med.pharmacy_phone!,
                      med.stock_count
                    )
                  }
                  className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-4 py-2 text-xs shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>
                    {isAr
                      ? `طلب من ${med.pharmacy_name || "الصيدلية"} عبر الواتساب`
                      : `Order via WhatsApp (${med.pharmacy_name || "Pharmacy"})`}
                  </span>
                </Button>
              ) : (
                <span className="text-xs text-amber-800 italic bg-amber-100/60 px-3 py-1.5 rounded-lg border border-amber-200">
                  {isAr
                    ? "أضف رقم هاتف الصيدلية في قائمة الأدوية للطلب الفوري"
                    : "Add pharmacy phone number in medication settings for 1-click ordering"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 1. Header Component: Adherence & Meal Anchors */}
      <UniqueCardReveal variant="scale-bounce" delay={0.1}>
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm text-slate-900 space-y-4">
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-50/50 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Left Side: Adherence Score + Text */}
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
                      ? "ممتاز جداً! أنت على طريق المحافظة الكاملة على صحتك"
                      : "Excellent! You are maintaining high adherence"
                    : isAr
                      ? "تابع أخذ جرعاتك في مواعيدها لتنعم بصحة ممتازة"
                      : "Take your doses on time to stay healthy"}
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
                  className="text-xs text-[#008080] hover:underline font-bold flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 transition-transform active:scale-95 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{isAr ? "تعديل" : "Edit"}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                  {isAr ? "الإفطار" : "Breakfast"}: {breakfastTime}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-900 border border-cyan-200 font-bold">
                  {isAr ? "الغداء" : "Lunch"}: {lunchTime}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 font-bold">
                  {isAr ? "العشاء" : "Dinner"}: {dinnerTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </UniqueCardReveal>

      {/* Dynamic Meal Logger Bar (One-click meal confirmation for elderly) */}
      <UniqueCardReveal variant="slide-skew" delay={0.15}>
        <div className="bg-gradient-to-r from-teal-50/80 via-white to-slate-50 border border-teal-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Utensils className="w-4 h-4 text-[#008080]" />
              <span>
                {isAr
                  ? "تسجيل الوجبات الفوري (إعادة الجدولة المرنة)"
                  : "Dynamic Meal Logger (Flexible Schedule Shifter)"}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
              {isAr
                ? "تأكيد الوجبة الآن يعيد حساب مواعيد الأدویة المرتبطة بها تلقائياً"
                : "Confirming meal now dynamically recalculates meal-anchored doses"}
            </span>
          </div>

          <div className="flex items-center justify-start gap-3">
            <Button
              size="sm"
              variant={hasLoggedBreakfast ? "primary" : "outline"}
              enableMagnetic={false}
              isLoading={activeMealType === "breakfast"}
              disabled={isLogging}
              onClick={() => logMeal("breakfast")}
              className={`rounded-xl text-xs font-bold justify-center gap-2 py-2.5 transition-colors ${
                hasLoggedBreakfast
                  ? "bg-amber-600 hover:bg-amber-700 text-white border-transparent"
                  : "border-amber-200 hover:bg-amber-50 text-amber-900"
              }`}
            >
              {!activeMealType && <CheckCircle2 className="w-4 h-4" />}
              <span>
                {hasLoggedBreakfast
                  ? isAr ? "تم إفطار اليوم" : "Breakfast Logged"
                  : isAr ? "تناولت وجبة الإفطار الآن" : "I Ate Breakfast Now"}
              </span>
            </Button>

            <Button
              size="sm"
              variant={hasLoggedLunch ? "primary" : "outline"}
              enableMagnetic={false}
              isLoading={activeMealType === "lunch"}
              disabled={isLogging}
              onClick={() => logMeal("lunch")}
              className={`rounded-xl text-xs font-bold justify-center gap-2 py-2.5 transition-colors ${
                hasLoggedLunch
                  ? "bg-cyan-600 hover:bg-cyan-700 text-white border-transparent"
                  : "border-cyan-200 hover:bg-cyan-50 text-cyan-900"
              }`}
            >
              {!activeMealType && <CheckCircle2 className="w-4 h-4" />}
              <span>
                {hasLoggedLunch
                  ? isAr ? "تم غداء اليوم" : "Lunch Logged"
                  : isAr ? "تناولت وجبة الغداء الآن" : "I Ate Lunch Now"}
              </span>
            </Button>

            <Button
              size="sm"
              variant={hasLoggedDinner ? "primary" : "outline"}
              enableMagnetic={false}
              isLoading={activeMealType === "dinner"}
              disabled={isLogging}
              onClick={() => logMeal("dinner")}
              className={`rounded-xl text-xs font-bold justify-center gap-2 py-2.5 transition-colors ${
                hasLoggedDinner
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent"
                  : "border-indigo-200 hover:bg-indigo-50 text-indigo-900"
              }`}
            >
              {!activeMealType && <CheckCircle2 className="w-4 h-4" />}
              <span>
                {hasLoggedDinner
                  ? isAr ? "تم عشاء اليوم" : "Dinner Logged"
                  : isAr ? "تناولت وجبة العشاء الآن" : "I Ate Dinner Now"}
              </span>
            </Button>
          </div>
        </div>
      </UniqueCardReveal>

      {/* 2. Filter Tabs Bar Component */}
      <UniqueCardReveal variant="slide-skew" delay={0.2}>
        <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

              // Period tags
              let periodTag = isAr ? "جرعة مخصصة" : "Scheduled Dose";
              let tagColor = "bg-slate-100 text-slate-700 border-slate-200";

              if (hour >= 5 && hour < 12) {
                periodTag = isAr ? "فترة الصباح • الإفطار" : "Morning • Breakfast";
                tagColor = "bg-amber-50 text-amber-900 border-amber-200";
              } else if (hour >= 12 && hour < 17) {
                periodTag = isAr ? "فترة الظهيرة • الغداء" : "Afternoon • Lunch";
                tagColor = "bg-cyan-50 text-cyan-900 border-cyan-200";
              } else {
                periodTag = isAr ? "فترة المساء • العشاء" : "Evening • Dinner";
                tagColor = "bg-indigo-50 text-indigo-900 border-indigo-200";
              }

              const pillTraitsText = [d.pill_color, d.pill_shape, d.pill_size]
                .filter(Boolean)
                .join(" • ");

              return (
                <UniqueCardReveal
                  key={d.id}
                  variant="flip"
                  delay={0.1 + index * 0.05}
                >
                  <div
                    className={`rounded-2xl border p-4 transition-all duration-300 flex flex-col justify-between h-full space-y-3 ${
                      isTaken
                        ? "bg-emerald-50/60 border-emerald-200 shadow-2xs"
                        : isSkipped
                          ? "bg-slate-50 border-slate-200 opacity-60"
                          : "bg-white border-slate-200 hover:border-teal-400 hover:shadow-md hover:-translate-y-1"
                    }`}
                  >
                    {/* Header: Time & Badges */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-1 flex-wrap text-xs">
                        <span className="font-black text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                          <Clock className="w-3.5 h-3.5 text-[#008080]" />
                          <span>{timeStr}</span>
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${tagColor}`}
                        >
                          {periodTag}
                        </span>
                      </div>

                      {!isTaken && !isSkipped && (
                        <div className="pt-0.5">
                          <CountdownBadge
                            targetDate={d.scheduled_for}
                            locale={locale}
                            type="medication"
                          />
                        </div>
                      )}

                      {/* Medication Info & Visual Image */}
                      <div className="flex items-start gap-3 pt-1">
                        {d.image_url ? (
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={d.image_url}
                              alt={d.medication_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#008080] flex items-center justify-center font-bold shrink-0">
                            <Pill className="w-4 h-4" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <AnimatedTitle
                            as="h4"
                            delay={0.15 + index * 0.05}
                            className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5 flex-wrap leading-snug"
                          >
                            <span className="truncate">{d.medication_name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-teal-50 text-[#008080] font-bold border border-teal-100 shrink-0">
                              {d.dosage}
                            </span>
                          </AnimatedTitle>

                          {pillTraitsText && (
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200 w-fit">
                              <Eye className="w-3 h-3 text-[#008080]" />
                              <span className="truncate">
                                {isAr ? "الشكل:" : "Pill:"} {pillTraitsText}
                              </span>
                            </div>
                          )}

                          {d.notes && (
                            <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-2">
                              &quot;{d.notes}&quot;
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                      <Button
                        size="sm"
                        variant={isTaken ? "primary" : "outline"}
                        className={
                          isTaken
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs gap-1 px-3 py-1.5 flex-1 justify-center transition-all"
                            : "text-emerald-700 border-emerald-300 hover:bg-emerald-50 font-bold text-xs rounded-xl gap-1 px-3 py-1.5 flex-1 justify-center transition-all cursor-pointer"
                        }
                        onClick={() =>
                          toggleDose({
                            medication_id: d.medication_id,
                            scheduled_for: d.scheduled_for,
                            status: isTaken ? "pending" : "taken",
                          })
                        }
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {isTaken
                            ? isAr
                              ? "تم التناول"
                              : "Taken"
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
                            ? "bg-slate-200 text-slate-700 font-medium text-xs rounded-xl cursor-pointer p-1.5"
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer p-1.5"
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
              className="rounded-xl text-xs cursor-pointer"
            >
              {dict.common?.cancel || (isAr ? "إلغاء" : "Cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveMealTimes}
              className="rounded-xl text-xs font-bold bg-[#008080] hover:bg-[#006666] cursor-pointer"
            >
              {dict.common?.save || (isAr ? "حفظ التغييرات" : "Save Changes")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
