'use client';

import React from 'react';
import { useLinkedPatientsOverview } from '../hooks/useCaregiver';
import { CaregiverInviteAcceptor } from './CaregiverInviteAcceptor';
import {
  Heart,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Bell,
  User,
  Pill,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

interface FamilyDashboardViewProps {
  dict: any;
  locale: string;
}

export function FamilyDashboardView({
  dict,
  locale,
}: FamilyDashboardViewProps) {
  const t = dict?.caregiver || {};
  const isAr = locale === 'ar';
  const { data: overviews, isLoading, refetch } = useLinkedPatientsOverview();

  const handleNudge = (patientName: string) => {
    toast.success(
      isAr
        ? `تم إرسال إشعار تذكير حنون لـ ${patientName} 💙`
        : `Warm reminder notification sent to ${patientName} 💙`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#008080] to-[#0077B6] rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-white/10 skew-x-12 pointer-events-none" />
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-7 h-7 text-teal-100 fill-teal-100/30" />
          <h2 className="text-xl sm:text-2xl font-bold">
            {t.title ||
              (isAr
                ? 'لوحة الرعاية العائلية (متابعة الأقارب وكبار السن)'
                : 'Family Caregiver Sync (Elderly & Relatives)')}
          </h2>
        </div>
        <p className="text-teal-50 text-sm max-w-2xl leading-relaxed">
          {t.subtitle ||
            (isAr
              ? 'تابع التزام والديك وكبار السن بالأدوية اليومية، وتلقى تنبيهات فورية إذا تأخروا عن تناول أدوية الضغط أو السكر بمقدار 20 دقيقة.'
              : "Monitor your elderly parents' medication schedules and receive instant missed-dose alerts.")}
        </p>
      </div>

      {/* Invite Code Acceptor Card */}
      <CaregiverInviteAcceptor dict={dict} locale={locale} />

      {/* Linked Patients Overview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#008080]" />
              {isAr
                ? 'الأقارب الذين تقوم برعايتهم ومتابعة أدویتهم'
                : 'Relatives You Are Monitoring'}{' '}
              ({overviews?.length || 0})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr
                ? 'هنا تظهر قائمة كبار السن/الأقارب الذين أدخلت أكوادهم لـ متابعتهم'
                : 'List of relatives whose medication schedules you are supervising'}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="text-xs text-[#008080] hover:text-[#006666] font-semibold bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100 transition-colors"
          >
            {t.refreshData || (isAr ? 'تحديث البيانات 🔄' : 'Refresh Data 🔄')}
          </button>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
            {dict?.common?.loading || (isAr ? 'جاري التحميل...' : 'Loading...')}
          </div>
        ) : !overviews || overviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-dashed border-slate-300 text-center space-y-3">
            <User className="w-10 h-10 text-slate-300 mx-auto" />
            <div>
              <h4 className="font-bold text-slate-800 text-sm">
                {isAr
                  ? 'لم تقم بإضافة أي قسيم أو قريب لرعايته حتى الآن'
                  : 'You are not supervising any relatives currently'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
                {isAr
                  ? 'إذا كنت تريد متابعة أدوية والدك/والدتك، اطلب منه كود الربط وأدخله في الخانة أعلاه (إضافة شخص لرعايته).'
                  : 'If you want to supervise a parent, ask for their invite code and enter it above.'}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-amber-700 font-medium">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {isAr
                  ? 'ملاحظة: إذا كنت أنت المريض وتريد أن يتابعك ابنك، فقم بتوليد كود من القسم السفلي ومشاركته معه.'
                  : 'Note: If you are the patient and want a relative to supervise you, generate a code in the section below.'}
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {overviews.map((item, idx) => (
              <div
                key={item.linkId || `${item.patientId}-${idx}`}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6"
              >
                {/* Patient Summary Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-100 text-[#008080] font-bold text-xl flex items-center justify-center">
                      {item.patientName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        {item.patientName}
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-[#008080] border border-teal-100 font-semibold">
                          {item.patientLabel}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.todayDoses ||
                          (isAr ? 'جرعات اليوم' : "Today's Doses")}
                        : {item.takenToday}{' '}
                        {t.takenOfTotal ||
                          (isAr ? 'تم تناولها من أصل' : 'taken of')}{' '}
                        {item.totalToday}
                      </p>
                    </div>
                  </div>

                  {/* Adherence Rate & Nudge */}
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">
                        {t.dailyAdherence ||
                          (isAr ? 'نسبة الالتزام اليومي' : 'Daily Adherence')}
                      </div>
                      <div
                        className={`text-xl font-extrabold ${
                          item.adherencePercentage >= 80
                            ? 'text-emerald-600'
                            : item.adherencePercentage >= 50
                              ? 'text-amber-600'
                              : 'text-rose-600'
                        }`}
                      >
                        {item.adherencePercentage}%
                      </div>
                    </div>

                    <button
                      onClick={() => handleNudge(item.patientName)}
                      className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Bell className="w-4 h-4 text-amber-600" />
                      {t.nudgeButton ||
                        (isAr ? 'تذكير حنون 💙' : 'Warm Reminder 💙')}
                    </button>
                  </div>
                </div>

                {/* Today's Dose Timeline for Patient */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5" />
                    {t.todaySchedule ||
                      (isAr
                        ? 'جدول أدويته لليوم'
                        : "Today's Medication Schedule")}
                  </h5>

                  {item.recentLogs.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400 border border-slate-100">
                      {t.noDosesToday ||
                        (isAr
                          ? 'لا توجد أدوية مجدولة لليوم.'
                          : 'No medications scheduled for today.')}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {item.recentLogs.map((log) => {
                        const isLate =
                          log.status === 'pending' &&
                          new Date(log.scheduled_for).getTime() <
                            Date.now() - 20 * 60 * 1000;

                        return (
                          <div
                            key={log.id}
                            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                              log.status === 'taken'
                                ? 'bg-emerald-50/60 border-emerald-200'
                                : isLate
                                  ? 'bg-rose-50/60 border-rose-200'
                                  : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                {log.medication_name}
                                <span className="text-xs text-slate-500 font-normal">
                                  ({log.dosage})
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {new Date(log.scheduled_for).toLocaleTimeString(
                                  isAr ? 'ar-EG' : 'en-US',
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )}
                              </div>
                            </div>

                            <div>
                              {log.status === 'taken' ? (
                                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{' '}
                                  {t.statusTaken || (isAr ? 'أُخذت' : 'Taken')}
                                </span>
                              ) : isLate ? (
                                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />{' '}
                                  {t.statusLate ||
                                    (isAr ? 'متأخر ⚠️' : 'Late ⚠️')}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium bg-slate-200 text-slate-700">
                                  {t.statusPending ||
                                    (isAr ? 'قيد الانتظار' : 'Pending')}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
