"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMedications } from "../hooks/useMedications";
import { CardSkeleton } from "@/components/feedback/skeletons";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CountdownBadge } from "@/components/ui/CountdownBadge";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import { MedicationRow } from "@/types";
import {
  Pill,
  Plus,
  Search,
  Edit2,
  Trash2,
  Clock,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  Camera,
  Upload,
  Eye,
  Store,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import IntervalSelector from "@/components/ui/IntervalSelector";

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
    updateMedication,
    deleteMedication,
    uploadPhoto,
    isUploading,
  } = useMedications();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMed, setEditingMed] = useState<MedicationRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [shiftMed, setShiftMed] = useState<MedicationRow | null>(null);

  // Edit form local state
  const [editName, setEditName] = useState("");
  const [editDosage, setEditDosage] = useState("");
  const [editStockCount, setEditStockCount] = useState("0");
  const [editLowStockThreshold, setEditLowStockThreshold] = useState("5");
  const [editFrequencyMode, setEditFrequencyMode] = useState<any>("interval");
  const [editIntervalHours, setEditIntervalHours] = useState("8");
  const [editStartTime, setEditStartTime] = useState("08:00");
  const [editMealAnchor, setEditMealAnchor] = useState<any>("breakfast");
  const [editMealOffsetMinutes, setEditMealOffsetMinutes] = useState("30");
  const [editPharmacyName, setEditPharmacyName] = useState("");
  const [editPharmacyPhone, setEditPharmacyPhone] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editPillColor, setEditPillColor] = useState("");
  const [editPillShape, setEditPillShape] = useState("");
  const [editPillSize, setEditPillSize] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const handleOpenEdit = (med: MedicationRow) => {
    setEditingMed(med);
    setEditName(med.name);
    setEditDosage(med.dosage);
    setEditStockCount(String(med.stock_count));
    setEditLowStockThreshold(String(med.low_stock_threshold));
    const rawMode = med.frequency_mode as string;
    const mode = rawMode === "specific_time" ? "custom_times" : (rawMode || "interval");
    setEditFrequencyMode(mode);
    setEditIntervalHours(String(med.interval_hours || 8));
    setEditStartTime(med.start_time || "08:00");
    setEditMealAnchor(med.meal_anchor || "breakfast");
    setEditMealOffsetMinutes(String(med.meal_offset_minutes || 30));
    setEditPharmacyName(med.pharmacy_name || "");
    setEditPharmacyPhone(med.pharmacy_phone || "");
    setEditImageUrl(med.image_url || "");
    setEditPillColor(med.pill_color || "");
    setEditPillShape(med.pill_shape || "");
    setEditPillSize(med.pill_size || "");
    setEditNotes(med.notes || "");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadPhoto(file);
      setEditImageUrl(url);
      toast.success(
        locale === "ar"
          ? "تم تحديث صورة علبة الدواء"
          : "Medication photo updated",
      );
    } catch {
      // Toast shown in hook
    }
  };

  const handleSaveEdit = async () => {
    if (!editingMed) return;

    try {
      await updateMedication({
        id: editingMed.id,
        data: {
          name: editName,
          dosage: editDosage,
          stock_count: parseInt(editStockCount, 10) || 0,
          low_stock_threshold: parseInt(editLowStockThreshold, 10) || 5,
          frequency_mode: editFrequencyMode,
          interval_hours:
            editFrequencyMode === "interval"
              ? parseInt(editIntervalHours, 10)
              : null,
          start_time: editStartTime,
          meal_anchor:
            editFrequencyMode === "meal_anchored" ? editMealAnchor : null,
          meal_offset_minutes:
            editFrequencyMode === "meal_anchored"
              ? parseInt(editMealOffsetMinutes, 10)
              : 30,
          pharmacy_name: editPharmacyName.trim() || null,
          pharmacy_phone: editPharmacyPhone.trim() || null,
          image_url: editImageUrl || null,
          pill_color: editPillColor.trim() || null,
          pill_shape: editPillShape.trim() || null,
          pill_size: editPillSize.trim() || null,
          notes: editNotes.trim() || null,
        },
      });

      setEditingMed(null);
    } catch {
      // Toast handled by hook
    }
  };

  // Quick WhatsApp refill launcher
  const openPharmacyWhatsApp = (med: MedicationRow) => {
    let rawPhone = med.pharmacy_phone?.replace(/[^0-9]/g, "") || "";
    if (!rawPhone) return;

    // Format local Egyptian numbers (e.g. 010..., 011...) to international format (2010...) for WhatsApp API
    if (rawPhone.startsWith("0")) {
      rawPhone = "2" + rawPhone;
    } else if (!rawPhone.startsWith("20") && rawPhone.length === 10 && rawPhone.startsWith("1")) {
      rawPhone = "20" + rawPhone;
    }

    const message =
      locale === "ar"
        ? `مرحباً، أود إرسال طلب إعادة تعبئة لدواء: ${med.name} (الجرعة: ${med.dosage}). الكمية المتبقية لدي حالياً: ${med.stock_count} حبات. يرجى تأكيد الطلب.`
        : `Hello, I would like to place a refill order for medication: ${med.name} (Dosage: ${med.dosage}). Remaining stock: ${med.stock_count}. Please confirm.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${rawPhone}?text=${encoded}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const filteredMeds = medications.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Search & Add Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={
              dict.medications?.searchPlaceholder ||
              (locale === "ar" ? "بحث في أدوية الخزانة..." : "Search cabinet...")
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#008080]"
          />
        </div>

        <Link href={`/${locale}/dashboard/${username}/medications/new`}>
          <Button
            variant="primary"
            className="gap-2 bg-[#008080] hover:bg-[#006666] text-white rounded-xl shadow-xs cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>
              {dict.medications?.addMedication ||
                (locale === "ar" ? "إضافة دواء جديد" : "Add Medication")}
            </span>
          </Button>
        </Link>
      </div>

      {/* Grid of Medications */}
      {filteredMeds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#008080] flex items-center justify-center mx-auto font-bold">
            <Pill className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">
            {locale === "ar"
              ? "لا توجد أدوية في خزانة العلاج"
              : "No medications in cabinet"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {locale === "ar"
              ? "قم بإضافة أول دواء لك لمتابعة المواعيد ومخزون العلاج بكل سهولة."
              : "Add your first medication to easily track schedules and stock."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredMeds.map((med) => {
            const isLowStock = med.stock_count <= med.low_stock_threshold;

            const getMedNextScheduledDate = (
              startTimeStr?: string | null,
              frequencyMode?: string,
              intervalHours?: number | null,
            ) => {
              if (!startTimeStr) return new Date().toISOString();
              const parts = startTimeStr.split(":").map(Number);
              const h = parts[0] || 8;
              const m = parts[1] || 0;
              const now = new Date();

              if (
                frequencyMode === "interval" &&
                intervalHours &&
                intervalHours > 0
              ) {
                const candidate = new Date();
                candidate.setHours(h, m, 0, 0);
                while (candidate.getTime() > now.getTime()) {
                  candidate.setTime(
                    candidate.getTime() - intervalHours * 3600 * 1000,
                  );
                }
                while (candidate.getTime() <= now.getTime() + 2 * 60 * 1000) {
                  candidate.setTime(
                    candidate.getTime() + intervalHours * 3600 * 1000,
                  );
                }
                return candidate.toISOString();
              }

              const singleTarget = new Date();
              singleTarget.setHours(h, m, 0, 0);
              if (singleTarget.getTime() <= now.getTime() + 2 * 60 * 1000) {
                singleTarget.setDate(singleTarget.getDate() + 1);
              }
              return singleTarget.toISOString();
            };

            const nextDoseTargetDate = getMedNextScheduledDate(
              med.start_time,
              med.frequency_mode,
              med.interval_hours,
            );

            const hasPillTraits =
              med.pill_color || med.pill_shape || med.pill_size;

            return (
              <div
                key={med.id}
                className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-4 transition-all ${
                  isLowStock
                    ? "border-amber-300 bg-amber-50/20"
                    : "border-slate-200 hover:border-teal-300"
                }`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {med.image_url ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={med.image_url}
                          alt={med.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-[#008080]/10 text-[#008080] flex items-center justify-center font-bold rounded-xl shrink-0">
                        <Pill className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">
                        {med.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-bold text-[#008080] bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                          {med.dosage}
                        </span>
                        <span>•</span>
                        <span>
                          {med.frequency_mode === "interval"
                            ? `${locale === "ar" ? "كل" : "Every"} ${med.interval_hours} ${locale === "ar" ? "ساعات" : "hours"}`
                            : med.frequency_mode === "meal_anchored"
                              ? `${locale === "ar" ? "مرتبط بوجبة" : "Meal"} (${med.meal_anchor})`
                              : `${locale === "ar" ? "وقت محدد" : "Fixed"}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(med)}
                      className="text-slate-400 hover:text-[#008080] p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title={
                        locale === "ar" ? "تعديل الدواء" : "Edit medication"
                      }
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({ id: med.id, name: med.name })
                      }
                      className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title={
                        locale === "ar" ? "حذف الدواء" : "Delete medication"
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Pill Trait Visual Identifier Bar */}
                {hasPillTraits && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <Eye className="w-3.5 h-3.5 text-[#008080] shrink-0" />
                    <span className="font-medium">
                      {locale === "ar" ? "الشكل البصري:" : "Pill Visual:"}{" "}
                      {[med.pill_color, med.pill_shape, med.pill_size]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                  </div>
                )}

                {/* Next Dose Countdown Badge */}
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">
                    {locale === "ar" ? "الجرعة القادمة:" : "Next Dose:"}
                  </span>
                  <CountdownBadge
                    targetDate={nextDoseTargetDate}
                    locale={locale}
                    type="medication"
                  />
                </div>

                {/* Stock Warning & 1-Click WhatsApp Refill */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {locale === "ar" ? "المخزون المتبقي:" : "Stock:"}
                    </span>
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded-full ${
                        isLowStock
                          ? "bg-amber-100 text-amber-900 border border-amber-200"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-100"
                      }`}
                    >
                      {med.stock_count}{" "}
                      {locale === "ar" ? "جرعة / حبة" : "doses"}
                    </span>
                  </div>

                  {isLowStock && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          {(dict.medications?.lowStockWarning ||
                            (locale === "ar"
                              ? "تنبيه نقص المخزون!"
                              : "Low Stock Alert!"))}{" "}
                          ({med.stock_count}{" "}
                          {locale === "ar"
                            ? "جرعات متبقية فقط"
                            : "doses remaining"}
                          )
                        </span>
                      </div>

                      {med.pharmacy_phone ? (
                        <Button
                          size="sm"
                          onClick={() => openPharmacyWhatsApp(med)}
                          className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl py-2 text-xs shadow-2xs"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>
                            {locale === "ar"
                              ? `طلب تعبئة من ${med.pharmacy_name || "الصيدلية"} (واتساب)`
                              : `WhatsApp Refill (${med.pharmacy_name || "Pharmacy"})`}
                          </span>
                        </Button>
                      ) : (
                        <p className="text-[11px] text-amber-800">
                          {locale === "ar"
                            ? "قم بإضافة رقم هاتف الصيدلية في إعدادات التعديل لإتاحة إعادة الطلب بنقرة واحدة."
                            : "Add pharmacy phone number in edit settings for 1-click refills."}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Medication Modal */}
      <Modal
        isOpen={!!editingMed}
        onClose={() => setEditingMed(null)}
        title={locale === "ar" ? "تعديل تفاصيل الدواء" : "Edit Medication"}
      >
        <div className="space-y-4 pt-2">
          <Input
            label={locale === "ar" ? "اسم الدواء" : "Medication Name"}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <Input
            label={locale === "ar" ? "الجرعة" : "Dosage"}
            value={editDosage}
            onChange={(e) => setEditDosage(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={locale === "ar" ? "عدد الحبات الحالي" : "Current Stock"}
              type="number"
              value={editStockCount}
              onChange={(e) => setEditStockCount(e.target.value)}
            />
            <Input
              label={locale === "ar" ? "حد التنبيه للعيانة" : "Low Stock Limit"}
              type="number"
              value={editLowStockThreshold}
              onChange={(e) => setEditLowStockThreshold(e.target.value)}
            />
          </div>

          {/* Photo Upload inside Edit Modal */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#008080]" />
              <span>
                {locale === "ar"
                  ? "تحديث صورة علبة الدواء"
                  : "Update Medication Photo"}
              </span>
            </label>

            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs">
                <Upload className="w-4 h-4 text-[#008080]" />
                <span>
                  {isUploading
                    ? locale === "ar"
                      ? "جاري الرفع..."
                      : "Uploading..."
                    : locale === "ar"
                      ? "اختيار صورة / كاميرا"
                      : "Choose Photo"}
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

            {editImageUrl && (
              <div className="w-20 h-20 relative rounded-lg overflow-hidden border border-slate-300 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={editImageUrl}
                  alt="Medication Box"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Physical Traits text inputs */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#008080]" />
              <span>
                {locale === "ar"
                  ? "الشكل واللون والحجم البصري (كتابة نصية)"
                  : "Physical Pill Traits (Text)"}
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label={locale === "ar" ? "لون الحبة" : "Pill Color"}
                placeholder={locale === "ar" ? "أبيض" : "White"}
                value={editPillColor}
                onChange={(e) => setEditPillColor(e.target.value)}
              />
              <Input
                label={locale === "ar" ? "شكل الحبة" : "Pill Shape"}
                placeholder={locale === "ar" ? "مدورة" : "Round"}
                value={editPillShape}
                onChange={(e) => setEditPillShape(e.target.value)}
              />
              <Input
                label={locale === "ar" ? "حجم الحبة" : "Pill Size"}
                placeholder={locale === "ar" ? "صغيرة" : "Small"}
                value={editPillSize}
                onChange={(e) => setEditPillSize(e.target.value)}
              />
            </div>
          </div>

          {/* Frequency & Timing Edit */}
          <Select
            label={locale === "ar" ? "نظام الجدولة والتكرار" : "Frequency Mode"}
            value={editFrequencyMode}
            onChange={(e) => setEditFrequencyMode(e.target.value)}
            options={[
              {
                value: "interval",
                label: locale === "ar" ? "ساعات متكررة" : "Interval Hours",
              },
              {
                value: "meal_anchored",
                label: locale === "ar" ? "مرتبط بوجبة" : "Meal-Anchored",
              },
              {
                value: "custom_times",
                label: locale === "ar" ? "وقت محدد" : "Fixed Time",
              },
            ]}
          />

          {editFrequencyMode === "interval" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label={
                    locale === "ar" ? "التكرار (كل كم ساعة)" : "Interval (Hours)"
                  }
                  type="number"
                  value={editIntervalHours}
                  onChange={(e) => setEditIntervalHours(e.target.value)}
                />
                <Input
                  label={locale === "ar" ? "وقت الجرعة الأولى" : "Start Time"}
                  type="time"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                />
              </div>

              <IntervalSelector
                startTime={editStartTime}
                intervalHours={parseInt(editIntervalHours, 10) || 8}
                locale={locale}
                onIntervalSelect={(hours) =>
                  setEditIntervalHours(String(hours))
                }
              />
            </div>
          )}

          {editFrequencyMode === "meal_anchored" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label={locale === "ar" ? "الوجبة المرتبطة" : "Anchor Meal"}
                value={editMealAnchor}
                onChange={(e) => setEditMealAnchor(e.target.value)}
                options={[
                  {
                    value: "breakfast",
                    label: locale === "ar" ? "الإفطار" : "Breakfast",
                  },
                  {
                    value: "lunch",
                    label: locale === "ar" ? "الغداء" : "Lunch",
                  },
                  {
                    value: "dinner",
                    label: locale === "ar" ? "العشاء" : "Dinner",
                  },
                ]}
              />
              <Input
                label={
                  locale === "ar"
                    ? "الفارق بعد الوجبة (بالدقائق)"
                    : "Meal Offset (Min)"
                }
                type="number"
                value={editMealOffsetMinutes}
                onChange={(e) => setEditMealOffsetMinutes(e.target.value)}
              />
            </div>
          )}

          {(String(editFrequencyMode) === "custom_times" || String(editFrequencyMode) === "specific_time") && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <Input
                label={locale === "ar" ? "وقت الجرعة المحددة (الساعة)" : "Specific Dose Time"}
                type="time"
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
              />
            </div>
          )}

          {/* Pharmacy contact for WhatsApp refill */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Store className="w-4 h-4 text-[#008080]" />
              <span>
                {locale === "ar"
                  ? "بيانات الصيدلية للطلب عبر الواتساب"
                  : "Pharmacy Phone for WhatsApp Refill"}
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label={locale === "ar" ? "اسم الصيدلية" : "Pharmacy Name"}
                value={editPharmacyName}
                onChange={(e) => setEditPharmacyName(e.target.value)}
              />
              <Input
                label={
                  locale === "ar" ? "رقم هاتف الصيدلية" : "Pharmacy Phone"
                }
                placeholder={
                  locale === "ar" ? "مثال: 01001234567" : "e.g. 01001234567"
                }
                value={editPharmacyPhone}
                onChange={(e) =>
                  setEditPharmacyPhone(
                    e.target.value.replace(/\D/g, "").slice(0, 11)
                  )
                }
                maxLength={11}
                error={
                  editPharmacyPhone &&
                  !/^01[0125]\d{8}$/.test(editPharmacyPhone)
                    ? locale === "ar"
                      ? "يجب أن يتكون الرقم من 11 رقم ويبدأ بـ 010 أو 011 أو 012 أو 015"
                      : "Must be 11 digits starting with 010, 011, 012, or 015"
                    : undefined
                }
                helperText={
                  !editPharmacyPhone
                    ? locale === "ar"
                      ? "رقم مصري مكون من 11 رقم (010, 011, 012, 015)"
                      : "11-digit Egyptian number (010, 011, 012, 015)"
                    : undefined
                }
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setEditingMed(null)}
              className="rounded-xl text-xs cursor-pointer"
            >
              {dict.common?.cancel || (locale === "ar" ? "إلغاء" : "Cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveEdit}
              className="rounded-xl text-xs font-bold bg-[#008080] hover:bg-[#006666] cursor-pointer"
            >
              {dict.common?.save || (locale === "ar" ? "حفظ" : "Save")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMedication(deleteTarget.id);
          }
        }}
        title={locale === "ar" ? "حذف الدواء" : "Delete Medication"}
        description={
          locale === "ar"
            ? "هل أنت تأكد من أنك تريد حذف هذا الدواء؟ لا يمكن التراجع عن هذا الإجراء."
            : "Are you sure you want to delete this medication? This action cannot be undone."
        }
        itemTitle={deleteTarget?.name}
        locale={locale}
      />
    </div>
  );
};
