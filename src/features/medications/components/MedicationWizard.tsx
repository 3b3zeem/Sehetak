"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useMedications } from "../hooks/useMedications";
import {
  Pill,
  Clock,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Camera,
  Upload,
  Eye,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import IntervalSelector from "@/components/ui/IntervalSelector";

interface WizardProps {
  locale: "en" | "ar";
  dict: any;
  username: string;
}

export const MedicationWizard: React.FC<WizardProps> = ({
  locale,
  dict,
  username,
}) => {
  const isRtl = locale === "ar";
  const router = useRouter();
  const { addMedication, isAdding, uploadPhoto, isUploading } = useMedications();

  // Step Tracker (1: Basic & Visual, 2: Frequency & Schedule, 3: Stock & Pharmacy)
  const [step, setStep] = useState(1);

  // Step 1: Basic Info & Visual Attributes & Image
  const [name, setName] = useState("");
  const [medType, setMedType] = useState<any>("pill");
  const [dosage, setDosage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [pillColor, setPillColor] = useState("");
  const [pillShape, setPillShape] = useState("");
  const [pillSize, setPillSize] = useState("");

  // Step 2: Scheduling & Timing
  const [frequencyMode, setFrequencyMode] = useState<any>("interval");
  const [intervalHours, setIntervalHours] = useState("8");
  const [startTime, setStartTime] = useState("08:00");
  const [mealAnchor, setMealAnchor] = useState<any>("breakfast");
  const [mealOffsetMinutes, setMealOffsetMinutes] = useState("30");

  // Step 3: Stock & Pharmacy Info
  const [stockCount, setStockCount] = useState("30");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [pharmacyName, setPharmacyName] = useState("");
  const [pharmacyPhone, setPharmacyPhone] = useState("");
  const [notes, setNotes] = useState("");

  // Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadPhoto(file);
      setImageUrl(url);
      toast.success(
        locale === "ar"
          ? "تم رفع صورة علبة الدواء بنجاح"
          : "Medication photo uploaded successfully",
      );
    } catch {
      // Toast already shown in hook
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 3) return;

    try {
      await addMedication({
        name,
        med_type: medType,
        dosage,
        frequency_mode: frequencyMode,
        interval_hours:
          frequencyMode === "interval" ? parseInt(intervalHours, 10) : null,
        start_time: startTime,
        meal_anchor: frequencyMode === "meal_anchored" ? mealAnchor : null,
        meal_offset_minutes:
          frequencyMode === "meal_anchored"
            ? parseInt(mealOffsetMinutes, 10)
            : 30,
        stock_count: parseInt(stockCount, 10) || 0,
        low_stock_threshold: parseInt(lowStockThreshold, 10) || 5,
        pharmacy_name: pharmacyName.trim() || null,
        pharmacy_phone: pharmacyPhone.trim() || null,
        image_url: imageUrl || null,
        pill_color: pillColor.trim() || null,
        pill_shape: pillShape.trim() || null,
        pill_size: pillSize.trim() || null,
        notes: notes.trim() || null,
      });

      router.push(`/${locale}/dashboard/${username}/medications`);
    } catch {
      // Toast error handled inside hook
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      {/* Wizard Progress Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= 1
                ? "bg-[#008080] text-white"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            1
          </div>
          <span className="text-xs hidden sm:inline">
            {dict.medications?.wizard?.step1 ||
              (isRtl ? "بيانات الدواء والشكل" : "Basic & Visual Info")}
          </span>
        </div>
        <div className="w-12 h-0.5 bg-slate-200"></div>

        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= 2
                ? "bg-[#008080] text-white"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            2
          </div>
          <span className="text-xs hidden sm:inline">
            {dict.medications?.wizard?.step2 ||
              (isRtl ? "التكرار والمواعيد" : "Schedule & Timing")}
          </span>
        </div>
        <div className="w-12 h-0.5 bg-slate-200"></div>

        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= 3
                ? "bg-[#008080] text-white"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            3
          </div>
          <span className="text-xs hidden sm:inline">
            {dict.medications?.wizard?.step3 ||
              (isRtl ? "المخزون والصيدلية" : "Stock & Pharmacy")}
          </span>
        </div>
      </div>

      <form onSubmit={step === 3 ? handleSubmit : handleNext}>
        {/* STEP 1: Basic Info, Photo Upload, & Visual Traits */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-[#008080]" />
              <span>
                {dict.medications?.wizard?.step1 ||
                  (isRtl
                    ? "البيانات الأساسية وصورة الدواء"
                    : "Basic Info & Medication Photo")}
              </span>
            </h3>

            <Input
              label={
                dict.medications?.wizard?.nameLabel ||
                (isRtl ? "اسم الدواء" : "Medication Name")
              }
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                dict.medications?.wizard?.namePlaceholder ||
                (isRtl
                  ? "مثال: بنادول إكسترا 500 ملغ"
                  : "e.g. Panadol Extra 500mg")
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={
                  dict.medications?.wizard?.typeLabel ||
                  (isRtl ? "شكل الدواء" : "Medication Form")
                }
                value={medType}
                onChange={(e) => setMedType(e.target.value)}
                options={[
                  {
                    value: "pill",
                    label:
                      dict.medications?.types?.pill ||
                      (isRtl ? "أقراص / حبوب" : "Pill / Tablet"),
                  },
                  {
                    value: "syrup",
                    label:
                      dict.medications?.types?.syrup ||
                      (isRtl ? "شراب / سائل" : "Syrup / Liquid"),
                  },
                  {
                    value: "injection",
                    label:
                      dict.medications?.types?.injection ||
                      (isRtl ? "حقنة" : "Injection"),
                  },
                  {
                    value: "drops",
                    label:
                      dict.medications?.types?.drops ||
                      (isRtl ? "قطرة" : "Drops"),
                  },
                  {
                    value: "inhaler",
                    label:
                      dict.medications?.types?.inhaler ||
                      (isRtl ? "بخاخ" : "Inhaler"),
                  },
                  {
                    value: "ointment",
                    label:
                      dict.medications?.types?.ointment ||
                      (isRtl ? "مرهم / كريم" : "Ointment"),
                  },
                ]}
              />

              <Input
                label={
                  dict.medications?.wizard?.dosageLabel ||
                  (isRtl ? "الجرعة المقررة" : "Dosage Amount")
                }
                required
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder={
                  dict.medications?.wizard?.dosagePlaceholder ||
                  (isRtl ? "مثال: حبة واحدة / 10 مل" : "e.g. 1 Tablet")
                }
              />
            </div>

            {/* Photo Upload Section */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#008080]" />
                <span>
                  {isRtl
                    ? "تصوير أو رفع صورة علبة الدواء"
                    : "Upload / Capture Medication Box Photo"}
                </span>
              </label>

              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs">
                  <Upload className="w-4 h-4 text-[#008080]" />
                  <span>
                    {isUploading
                      ? isRtl
                        ? "جاري الرفع..."
                        : "Uploading..."
                      : isRtl
                        ? "فتح الكاميرا / اختيار صورة"
                        : "Choose File / Camera"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>

              {imageUrl && (
                <div className="mt-2 w-24 h-24 relative rounded-lg overflow-hidden border border-slate-300 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Medication Box"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Physical Pill Visual Identification Section */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#008080]" />
                <span>
                  {isRtl
                    ? "معرّف شكل الحبة البصري (كتابة نصية)"
                    : "Physical Pill Traits"}
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label={isRtl ? "لون الحبة" : "Pill Color"}
                  placeholder={
                    isRtl
                      ? "مثال: أبيض / أصفر وأحمر"
                      : "e.g. White / Red & Yellow"
                  }
                  value={pillColor}
                  onChange={(e) => setPillColor(e.target.value)}
                />
                <Input
                  label={isRtl ? "شكل الحبة" : "Pill Shape"}
                  placeholder={
                    isRtl ? "مثال: مدورة / كبسولة" : "e.g. Round / Capsule"
                  }
                  value={pillShape}
                  onChange={(e) => setPillShape(e.target.value)}
                />
                <Input
                  label={isRtl ? "حجم الحبة" : "Pill Size"}
                  placeholder={
                    isRtl ? "مثال: صغيرة / كبيرة" : "e.g. Small / Large"
                  }
                  value={pillSize}
                  onChange={(e) => setPillSize(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Scheduling & Timing */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#008080]" />
              <span>
                {dict.medications?.wizard?.step2 ||
                  (isRtl ? "التكرار والمواعيد" : "Frequency & Timing")}
              </span>
            </h3>

            <Select
              label={
                dict.medications?.wizard?.frequencyLabel ||
                (isRtl ? "نظام التكرار" : "Frequency Mode")
              }
              value={frequencyMode}
              onChange={(e) => setFrequencyMode(e.target.value)}
              options={[
                {
                  value: "interval",
                  label:
                    dict.medications?.modes?.interval ||
                    (isRtl ? "كل عدد معين من الساعات" : "Every X Hours"),
                },
                {
                  value: "meal_anchored",
                  label:
                    dict.medications?.modes?.meal_anchored ||
                    (isRtl ? "مرتبط بوجبة طعام" : "Meal-Anchored"),
                },
                {
                  value: "custom_times",
                  label:
                    dict.medications?.modes?.custom_times ||
                    (isRtl ? "وقت ثابت ومحدد" : "Fixed Specific Time"),
                },
              ]}
            />

            {frequencyMode === "interval" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={
                      dict.medications?.wizard?.intervalLabel ||
                      (isRtl ? "الفارق الزمني (بالساعات)" : "Interval (Hours)")
                    }
                    type="number"
                    min="1"
                    max="24"
                    value={intervalHours}
                    onChange={(e) => setIntervalHours(e.target.value)}
                  />
                  <Input
                    label={
                      dict.medications?.wizard?.startTimeLabel ||
                      (isRtl ? "وقت الجرعة الأولى" : "First Dose Time")
                    }
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>

                <IntervalSelector
                  startTime={startTime}
                  intervalHours={parseInt(intervalHours, 10) || 8}
                  locale={locale}
                  onIntervalSelect={(hours) =>
                    setIntervalHours(String(hours))
                  }
                />
              </>
            )}

            {frequencyMode === "meal_anchored" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label={
                    dict.medications?.wizard?.mealAnchorLabel ||
                    (isRtl ? "الوجبة المرتبطة" : "Anchor Meal")
                  }
                  value={mealAnchor}
                  onChange={(e) => setMealAnchor(e.target.value)}
                  options={[
                    {
                      value: "breakfast",
                      label:
                        dict.dashboard?.breakfast ||
                        (isRtl ? "الإفطار" : "Breakfast"),
                    },
                    {
                      value: "lunch",
                      label:
                        dict.dashboard?.lunch || (isRtl ? "الغداء" : "Lunch"),
                    },
                    {
                      value: "dinner",
                      label:
                        dict.dashboard?.dinner || (isRtl ? "العشاء" : "Dinner"),
                    },
                  ]}
                />
                <Input
                  label={
                    dict.medications?.wizard?.mealOffsetLabel ||
                    (isRtl
                      ? "الفارق عن الوجبة (بالدقائق)"
                      : "Meal Offset (Minutes)")
                  }
                  type="number"
                  value={mealOffsetMinutes}
                  onChange={(e) => setMealOffsetMinutes(e.target.value)}
                  helperText={
                    isRtl
                      ? "عدد الدقائق بعد موعد الوجبة"
                      : "Minutes after meal time"
                  }
                />
              </div>
            )}

            {frequencyMode === "custom_times" && (
              <Input
                label={
                  dict.medications?.wizard?.startTimeLabel ||
                  (isRtl ? "وقت الجرعة" : "Dose Time")
                }
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            )}
          </div>
        )}

        {/* STEP 3: Stock & Pharmacy Info */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>
                {dict.medications?.wizard?.step3 ||
                  (isRtl
                    ? "المخزون والتواصل مع الصيدلية"
                    : "Stock & Pharmacy Order")}
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={
                  dict.medications?.wizard?.stockCountLabel ||
                  (isRtl
                    ? "المخزون الحالي (عدد الحبات)"
                    : "Current Stock Count")
                }
                type="number"
                min="0"
                value={stockCount}
                onChange={(e) => setStockCount(e.target.value)}
              />
              <Input
                label={
                  dict.medications?.wizard?.lowStockThresholdLabel ||
                  (isRtl ? "حد التنبيه لنقص المخزون" : "Low Stock Threshold")
                }
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
              />
            </div>

            {/* Pharmacy Contact Information for 1-Click WhatsApp Refills */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Store className="w-4 h-4 text-[#008080]" />
                <span>
                  {isRtl
                    ? "بيانات الصيدلية لإعادة الطلب عبر الواتساب"
                    : "Pharmacy Details for 1-Click WhatsApp Refill"}
                </span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label={isRtl ? "اسم الصيدلية" : "Pharmacy Name"}
                  placeholder={
                    isRtl ? "مثال: صيدلية العزبي" : "e.g. Local Pharmacy"
                  }
                  value={pharmacyName}
                  onChange={(e) => setPharmacyName(e.target.value)}
                />
                <Input
                  label={
                    isRtl
                      ? "رقم الهاتف / الواتساب"
                      : "Pharmacy Phone / WhatsApp"
                  }
                  placeholder={
                    isRtl ? "مثال: 01001234567" : "e.g. 01001234567"
                  }
                  value={pharmacyPhone}
                  onChange={(e) =>
                    setPharmacyPhone(
                      e.target.value.replace(/\D/g, "").slice(0, 11)
                    )
                  }
                  maxLength={11}
                  error={
                    pharmacyPhone && !/^01[0125]\d{8}$/.test(pharmacyPhone)
                      ? isRtl
                        ? "يجب أن يتكون الرقم من 11 رقم ويبدأ بـ 010 أو 011 أو 012 أو 015"
                        : "Must be 11 digits starting with 010, 011, 012, or 015"
                      : undefined
                  }
                  helperText={
                    !pharmacyPhone
                      ? isRtl
                        ? "رقم مصري مكون من 11 رقم (010, 011, 012, 015)"
                        : "11-digit Egyptian number (010, 011, 012, 015)"
                      : undefined
                  }
                />

              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {dict.medications?.wizard?.notesLabel ||
                  (isRtl ? "تعليمات وملاحظات خاصة" : "Special Notes")}
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-[#008080] focus:outline-none"
                placeholder={
                  isRtl
                    ? "أخذه بعد الطعام مع ماء وفير..."
                    : "Take after meals with plenty of water..."
                }
              />
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              className="gap-2 cursor-pointer"
            >
              {isRtl ? (
                <ArrowRight className="w-4 h-4" />
              ) : (
                <ArrowLeft className="w-4 h-4" />
              )}
              <span>
                {dict.medications?.wizard?.prevStep ||
                  (isRtl ? "الخطوة السابقة" : "Previous")}
              </span>
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              type="submit"
              variant="primary"
              disabled={step === 1 && (!name.trim() || !dosage.trim())}
              className="gap-2 cursor-pointer"
            >
              <span>
                {dict.medications?.wizard?.nextStep ||
                  (isRtl ? "الخطوة التالية" : "Next")}
              </span>
              {isRtl ? (
                <ArrowLeft className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              isLoading={isAdding}
              className="cursor-pointer"
            >
              {dict.medications?.wizard?.submitCreate ||
                (isRtl ? "حفظ الدواء" : "Save Medication")}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
