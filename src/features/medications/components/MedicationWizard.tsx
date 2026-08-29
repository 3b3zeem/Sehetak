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
} from "lucide-react";

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
  const router = useRouter();
  const { addMedication, isAdding } = useMedications();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [name, setName] = useState("");
  const [medType, setMedType] = useState("pill");
  const [dosage, setDosage] = useState("");
  const [frequencyMode, setFrequencyMode] = useState("interval");
  const [intervalHours, setIntervalHours] = useState("8");
  const [startTime, setStartTime] = useState("08:00");
  const [mealAnchor, setMealAnchor] = useState("breakfast");
  const [mealOffsetMinutes, setMealOffsetMinutes] = useState("30");
  const [stockCount, setStockCount] = useState("20");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [notes, setNotes] = useState("");

  const handleNext = () => {
    if (step === 1 && (!name.trim() || !dosage.trim())) return;
    if (step < 3) setStep((s) => (s + 1) as any);
  };

  const handlePrev = () => {
    if (step > 1) setStep((s) => (s - 1) as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addMedication({
      name,
      med_type: medType as any,
      dosage,
      frequency_mode: frequencyMode as any,
      interval_hours:
        frequencyMode === "interval" ? parseInt(intervalHours, 10) : null,
      start_time: startTime,
      meal_anchor: frequencyMode === "meal_anchored" ? mealAnchor : null,
      meal_offset_minutes: parseInt(mealOffsetMinutes, 10),
      stock_count: parseInt(stockCount, 10),
      low_stock_threshold: parseInt(lowStockThreshold, 10),
      notes,
    });
    router.push(`/${locale}/dashboard/${username}/medications`);
  };

  const isRtl = locale === "ar";

  return (
    <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
      {/* Wizard Progress Bar */}
      <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
        <div
          className={`flex items-center gap-2 ${step >= 1 ? "text-[#008080] font-bold" : "text-slate-400"}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? "bg-[#008080] text-white" : "bg-slate-100 text-slate-500"}`}
          >
            1
          </div>
          <span className="text-xs hidden sm:inline">
            {dict.medications?.wizard?.step1}
          </span>
        </div>
        <div className="w-12 h-0.5 bg-slate-200"></div>
        <div
          className={`flex items-center gap-2 ${step >= 2 ? "text-[#008080] font-bold" : "text-slate-400"}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? "bg-[#008080] text-white" : "bg-slate-100 text-slate-500"}`}
          >
            2
          </div>
          <span className="text-xs hidden sm:inline">
            {dict.medications?.wizard?.step2}
          </span>
        </div>
        <div className="w-12 h-0.5 bg-slate-200"></div>
        <div
          className={`flex items-center gap-2 ${step >= 3 ? "text-[#008080] font-bold" : "text-slate-400"}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? "bg-[#008080] text-white" : "bg-slate-100 text-slate-500"}`}
          >
            3
          </div>
          <span className="text-xs hidden sm:inline">
            {dict.medications?.wizard?.step3}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-[#008080]" />
              <span>{dict.medications?.wizard?.step1}</span>
            </h3>

            <Input
              label={dict.medications?.wizard?.nameLabel}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={dict.medications?.wizard?.namePlaceholder}
            />

            <Select
              label={dict.medications?.wizard?.typeLabel}
              value={medType}
              onChange={(e) => setMedType(e.target.value)}
              options={[
                {
                  value: "pill",
                  label: dict.medications?.types?.pill || "Pill / Tablet",
                },
                {
                  value: "syrup",
                  label: dict.medications?.types?.syrup || "Syrup",
                },
                {
                  value: "injection",
                  label: dict.medications?.types?.injection || "Injection",
                },
                {
                  value: "drops",
                  label: dict.medications?.types?.drops || "Drops",
                },
                {
                  value: "inhaler",
                  label: dict.medications?.types?.inhaler || "Inhaler",
                },
                {
                  value: "ointment",
                  label: dict.medications?.types?.ointment || "Ointment",
                },
              ]}
            />

            <Input
              label={dict.medications?.wizard?.dosageLabel}
              required
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder={dict.medications?.wizard?.dosagePlaceholder}
            />
          </div>
        )}

        {/* Step 2: Frequency & Timing */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#008080]" />
              <span>{dict.medications?.wizard?.step2}</span>
            </h3>

            <Select
              label={dict.medications?.wizard?.frequencyLabel}
              value={frequencyMode}
              onChange={(e) => setFrequencyMode(e.target.value)}
              options={[
                {
                  value: "interval",
                  label: dict.medications?.modes?.interval || "Every X Hours",
                },
                {
                  value: "meal_anchored",
                  label:
                    dict.medications?.modes?.meal_anchored || "Meal-Anchored",
                },
                {
                  value: "custom_times",
                  label:
                    dict.medications?.modes?.custom_times ||
                    "Fixed Specific Time",
                },
              ]}
            />

            {frequencyMode === "interval" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={dict.medications?.wizard?.intervalLabel}
                  type="number"
                  min="1"
                  max="24"
                  value={intervalHours}
                  onChange={(e) => setIntervalHours(e.target.value)}
                />
                <Input
                  label={dict.medications?.wizard?.startTimeLabel}
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            )}

            {frequencyMode === "meal_anchored" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label={dict.medications?.wizard?.mealAnchorLabel}
                  value={mealAnchor}
                  onChange={(e) => setMealAnchor(e.target.value)}
                  options={[
                    {
                      value: "breakfast",
                      label: dict.dashboard?.breakfast || "Breakfast",
                    },
                    { value: "lunch", label: dict.dashboard?.lunch || "Lunch" },
                    {
                      value: "dinner",
                      label: dict.dashboard?.dinner || "Dinner",
                    },
                  ]}
                />
                <Input
                  label={dict.medications?.wizard?.mealOffsetLabel}
                  type="number"
                  value={mealOffsetMinutes}
                  onChange={(e) => setMealOffsetMinutes(e.target.value)}
                  helperText="Minutes after meal time"
                />
              </div>
            )}

            {frequencyMode === "custom_times" && (
              <Input
                label={dict.medications?.wizard?.startTimeLabel}
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            )}
          </div>
        )}

        {/* Step 3: Stock & Reminders */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>{dict.medications?.wizard?.step3}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={dict.medications?.wizard?.stockCountLabel}
                type="number"
                min="0"
                value={stockCount}
                onChange={(e) => setStockCount(e.target.value)}
              />
              <Input
                label={dict.medications?.wizard?.lowStockThresholdLabel}
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {dict.medications?.wizard?.notesLabel}
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-[#008080] focus:outline-none"
                placeholder="Take after meal, store in cool place..."
              />
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              className="gap-2"
            >
              {isRtl ? (
                <ArrowRight className="w-4 h-4" />
              ) : (
                <ArrowLeft className="w-4 h-4" />
              )}
              <span>{dict.medications?.wizard?.prevStep}</span>
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              disabled={step === 1 && (!name.trim() || !dosage.trim())}
              className="gap-2"
            >
              <span>{dict.medications?.wizard?.nextStep}</span>
              {isRtl ? (
                <ArrowLeft className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </Button>
          ) : (
            <Button type="submit" variant="primary" isLoading={isAdding}>
              {dict.medications?.wizard?.submitCreate}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
