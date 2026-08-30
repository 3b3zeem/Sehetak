"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMedications } from "../hooks/useMedications";
import { CardSkeleton } from "@/components/feedback/skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import {
  Plus,
  Search,
  Pill,
  Trash2,
  Pencil,
  AlertTriangle,
  Clock,
  Save,
} from "lucide-react";
import { MedicationRow } from "@/types";
import { CountdownBadge } from "@/components/ui/CountdownBadge";

interface CabinetProps {
  locale: "en" | "ar";
  dict: any;
  username: string;
}

export const MedicationCabinet: React.FC<CabinetProps> = ({
  locale,
  dict,
  username,
}) => {
  const {
    medications,
    isLoading,
    deleteMedication,
    updateMedication,
    isUpdating,
  } = useMedications();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMed, setEditingMed] = useState<MedicationRow | null>(null);

  // Edit form local state
  const [editName, setEditName] = useState("");
  const [editDosage, setEditDosage] = useState("");
  const [editType, setEditType] = useState("pill");
  const [editFrequencyMode, setEditFrequencyMode] = useState("interval");
  const [editStartTime, setEditStartTime] = useState("08:00");
  const [editIntervalHours, setEditIntervalHours] = useState("8");
  const [editMealAnchor, setEditMealAnchor] = useState("breakfast");
  const [editMealOffset, setEditMealOffset] = useState("30");
  const [editStock, setEditStock] = useState(20);
  const [editThreshold, setEditThreshold] = useState(5);
  const [editNotes, setEditNotes] = useState("");

  const filtered = medications.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOpenEditModal = (med: MedicationRow) => {
    setEditingMed(med);
    setEditName(med.name);
    setEditDosage(med.dosage);
    setEditType(med.med_type || "pill");
    setEditFrequencyMode(med.frequency_mode || "interval");
    setEditStartTime(med.start_time || "08:00");
    setEditIntervalHours(String(med.interval_hours || 8));
    setEditMealAnchor(med.meal_anchor || "breakfast");
    setEditMealOffset(String(med.meal_offset_minutes || 30));
    setEditStock(med.stock_count);
    setEditThreshold(med.low_stock_threshold);
    setEditNotes(med.notes || "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMed) return;

    await updateMedication({
      id: editingMed.id,
      data: {
        name: editName,
        dosage: editDosage,
        med_type: editType as any,
        frequency_mode: editFrequencyMode as any,
        start_time: editStartTime,
        interval_hours:
          editFrequencyMode === "interval"
            ? parseInt(editIntervalHours, 10)
            : null,
        meal_anchor:
          editFrequencyMode === "meal_anchored" ? editMealAnchor : null,
        meal_offset_minutes: parseInt(editMealOffset, 10),
        stock_count: Number(editStock),
        low_stock_threshold: Number(editThreshold),
        notes: editNotes,
      },
    });

    setEditingMed(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 w-full max-w-sm animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-300 p-6">
        <div className="w-full sm:w-72 relative">
          <Input
            placeholder={
              dict.medications?.searchPlaceholder || "Search medications..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
        </div>

        <Link href={`/${locale}/dashboard/${username}/medications/new`}>
          <Button variant="primary" className="gap-2">
            <Plus className="w-4 h-4" />
            <span>{dict.medications?.addNew || "Add Medication"}</span>
          </Button>
        </Link>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 p-12 text-center text-slate-500">
          <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-700">
            {dict.medications?.emptyState}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((med) => {
            const isLowStock = med.stock_count <= med.low_stock_threshold;
            const medTypeLocalized =
              dict.medications?.types?.[med.med_type] || med.med_type;
            const freqModeLocalized =
              dict.medications?.modes?.[med.frequency_mode] ||
              med.frequency_mode;

            // Compute next dose target date for countdown timer
            const getMedNextScheduledDate = (startTimeStr?: string | null) => {
              if (!startTimeStr) return new Date().toISOString();
              const parts = startTimeStr.split(":").map(Number);
              const h = parts[0] || 0;
              const m = parts[1] || 0;
              const target = new Date();
              target.setHours(h, m, 0, 0);
              if (target.getTime() < Date.now() - 15 * 60 * 1000) {
                target.setDate(target.getDate() + 1);
              }
              return target.toISOString();
            };

            const nextDoseTargetDate = getMedNextScheduledDate(med.start_time);

            return (
              <div
                key={med.id}
                className="bg-white border border-slate-300 p-6 hover:border-[#008080] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#008080]/10 text-[#008080] flex items-center justify-center font-bold">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">
                          {med.name}
                        </h4>
                        <span className="text-xs text-slate-500 capitalize">
                          {medTypeLocalized} • {med.dosage}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEditModal(med)}
                        className="text-slate-400 hover:text-[#008080] p-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
                        title={
                          locale === "ar" ? "تعديل الدواء" : "Edit medication"
                        }
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteMedication(med.id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 transition-colors cursor-pointer"
                        title={
                          locale === "ar" ? "حذف الدواء" : "Delete medication"
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 mt-4 border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {locale === "ar" ? "الموعد المجدول" : "Scheduled Time"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {med.start_time || "08:00"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {locale === "ar" ? "الموعد المتبقي" : "Next Dose"}
                      </span>

                      <CountdownBadge
                        targetDate={nextDoseTargetDate}
                        locale={locale}
                        type="medication"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">
                        {locale === "ar" ? "نظام التكرار" : "Frequency"}
                      </span>
                      <span className="font-semibold text-slate-800 capitalize">
                        {freqModeLocalized}
                      </span>
                    </div>

                    {isLowStock && (
                      <div className="mt-3 p-2.5 bg-amber-50 border border-amber-300 text-amber-800 font-medium flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          {dict.dashboard?.lowStockWarning ||
                            (locale === "ar"
                              ? "تنبيه نقص المخزون!"
                              : "Low Stock Alert!")}{" "}
                          ({med.stock_count}{" "}
                          {locale === "ar" ? "متبقية" : "remaining"})
                        </span>
                      </div>
                    )}

                    {med.notes && (
                      <p className="mt-2 text-slate-500 italic bg-slate-50 p-2 border border-slate-200">
                        &quot;{med.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {locale === "ar" ? "المخزون:" : "Stock:"}{" "}
                    <strong
                      className={
                        isLowStock ? "text-amber-600" : "text-slate-800"
                      }
                    >
                      {med.stock_count}
                    </strong>
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold border border-emerald-300">
                    {locale === "ar" ? "نشط" : "Active"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comprehensive Edit Medication Modal */}
      {editingMed && (
        <Modal
          isOpen={!!editingMed}
          onClose={() => setEditingMed(null)}
          title={
            locale === "ar"
              ? "تعديل بيانات الدواء والمواعيد"
              : "Edit Medication & Schedule Details"
          }
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            <Input
              label={
                dict.medications?.wizard?.nameLabel ||
                (locale === "ar" ? "اسم الدواء" : "Medication Name")
              }
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={
                  dict.medications?.wizard?.dosageLabel ||
                  (locale === "ar" ? "الجرعة" : "Dosage Amount")
                }
                value={editDosage}
                onChange={(e) => setEditDosage(e.target.value)}
                required
              />

              <Select
                label={
                  dict.medications?.wizard?.typeLabel ||
                  (locale === "ar" ? "شكل الدواء" : "Form / Type")
                }
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                options={[
                  {
                    value: "pill",
                    label:
                      dict.medications?.types?.pill ||
                      (locale === "ar" ? "أقراص / حبوب" : "Pill / Tablet"),
                  },
                  {
                    value: "syrup",
                    label:
                      dict.medications?.types?.syrup ||
                      (locale === "ar" ? "شراب / سائل" : "Syrup / Liquid"),
                  },
                  {
                    value: "inhaler",
                    label:
                      dict.medications?.types?.inhaler ||
                      (locale === "ar" ? "بخاخ" : "Inhaler"),
                  },
                  {
                    value: "injection",
                    label:
                      dict.medications?.types?.injection ||
                      (locale === "ar" ? "حقنة" : "Injection"),
                  },
                  {
                    value: "drops",
                    label:
                      dict.medications?.types?.drops ||
                      (locale === "ar" ? "قطرة" : "Drops"),
                  },
                ]}
              />
            </div>

            {/* Time & Frequency Section */}
            <div className="p-4 bg-slate-50 border border-slate-200 space-y-4">
              <Select
                label={
                  dict.medications?.wizard?.frequencyLabel ||
                  (locale === "ar"
                    ? "نظام التكرار والمواعيد"
                    : "Frequency Schedule")
                }
                value={editFrequencyMode}
                onChange={(e) => setEditFrequencyMode(e.target.value)}
                options={[
                  {
                    value: "interval",
                    label:
                      dict.medications?.modes?.interval ||
                      (locale === "ar"
                        ? "كل عدد معين من الساعات"
                        : "Every X Hours"),
                  },
                  {
                    value: "meal_anchored",
                    label:
                      dict.medications?.modes?.meal_anchored ||
                      (locale === "ar" ? "مرتبط بوجبة طعام" : "Meal-Anchored"),
                  },
                  {
                    value: "custom_times",
                    label:
                      dict.medications?.modes?.custom_times ||
                      (locale === "ar"
                        ? "وقت ثابت ومحدد"
                        : "Fixed Specific Time"),
                  },
                ]}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={
                    dict.medications?.wizard?.startTimeLabel ||
                    (locale === "ar" ? "وقت الجرعة" : "Medication Time")
                  }
                  type="time"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                  required
                />

                {editFrequencyMode === "interval" && (
                  <Input
                    label={
                      dict.medications?.wizard?.intervalLabel ||
                      (locale === "ar"
                        ? "الفارق الزمني (بالساعات)"
                        : "Interval (Hours)")
                    }
                    type="number"
                    min="1"
                    max="24"
                    value={editIntervalHours}
                    onChange={(e) => setEditIntervalHours(e.target.value)}
                  />
                )}

                {editFrequencyMode === "meal_anchored" && (
                  <Select
                    label={
                      dict.medications?.wizard?.mealAnchorLabel ||
                      (locale === "ar" ? "الوجبة المرتبطة" : "Anchor Meal")
                    }
                    value={editMealAnchor}
                    onChange={(e) => setEditMealAnchor(e.target.value)}
                    options={[
                      {
                        value: "breakfast",
                        label:
                          dict.dashboard?.breakfast ||
                          (locale === "ar" ? "الإفطار" : "Breakfast"),
                      },
                      {
                        value: "lunch",
                        label:
                          dict.dashboard?.lunch ||
                          (locale === "ar" ? "الغداء" : "Lunch"),
                      },
                      {
                        value: "dinner",
                        label:
                          dict.dashboard?.dinner ||
                          (locale === "ar" ? "العشاء" : "Dinner"),
                      },
                    ]}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={
                  dict.medications?.wizard?.stockCountLabel ||
                  (locale === "ar" ? "المخزون الحالي" : "Stock Count")
                }
                type="number"
                value={editStock}
                onChange={(e) => setEditStock(Number(e.target.value))}
              />

              <Input
                label={
                  dict.medications?.wizard?.lowStockThresholdLabel ||
                  (locale === "ar"
                    ? "حد التنبيه لنقص المخزون"
                    : "Low Stock Threshold")
                }
                type="number"
                value={editThreshold}
                onChange={(e) => setEditThreshold(Number(e.target.value))}
              />
            </div>

            <Input
              label={
                dict.medications?.wizard?.notesLabel ||
                (locale === "ar"
                  ? "ملاحظات وتعليمات خاصة"
                  : "Special Instructions")
              }
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingMed(null)}
              >
                {dict.common?.cancel || (locale === "ar" ? "إلغاء" : "Cancel")}
              </Button>

              <Button
                type="submit"
                variant="primary"
                isLoading={isUpdating}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                <span>
                  {dict.common?.save ||
                    (locale === "ar" ? "حفظ التغييرات" : "Save Changes")}
                </span>
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
