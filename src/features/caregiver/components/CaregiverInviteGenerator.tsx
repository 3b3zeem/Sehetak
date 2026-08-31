'use client';

import React, { useState } from 'react';
import {
  useGenerateInviteCode,
  useMyInviteCodes,
  useDeleteLink,
} from '../hooks/useCaregiver';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import {
  Copy,
  Share2,
  Plus,
  Trash2,
  ShieldCheck,
  HeartHandshake,
  Clock,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface CaregiverInviteGeneratorProps {
  dict: any;
  locale: string;
}

export function CaregiverInviteGenerator({
  dict,
  locale,
}: CaregiverInviteGeneratorProps) {
  const t = dict?.caregiver || {};
  const isAr = locale === 'ar';
  const [label, setLabel] = useState(isAr ? 'الوالد/الوالدة' : 'Parent');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; code: string } | null>(null);

  const { mutate: generateCode, isPending } = useGenerateInviteCode();
  const { data: myCodes, isLoading } = useMyInviteCodes();
  const { mutate: deleteLink, isPending: isDeleting } = useDeleteLink();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    generateCode(label);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(
      isAr ? 'تم نسخ كود الربط إلى الحافظة' : 'Invite code copied to clipboard'
    );
  };

  const shareViaWhatsApp = (code: string) => {
    const text = isAr
      ? `مرحباً، هذا كود الربط العائلي الخاص بي في تطبيق صحتك: *${code}*\nقم بإدخال الكود في تطبيق صحتك لمتابعة مواعيد أدويتي ورعايتي.`
      : `Hello, this is my family invite code on Sehetak app: *${code}*\nEnter this code in Sehetak to monitor my medication schedule.`;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-teal-50 text-[#008080] rounded-xl">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {t.generateTitle ||
              (isAr
                ? 'توليد كود للرعاية العائلية (مشاركته مع ابنك/مرافقك)'
                : 'Share Invite Code with Your Caregiver')}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.generateDesc ||
              (isAr
                ? 'ولّد كود ربط عائلي لمشاركته مع ابنك أو مرافقك ليتمكن من متابعة مواعيد أدويتك وتلقي التنبيهات.'
                : 'Generate an invite code to share with your son/daughter so they can monitor your medications.')}
          </p>
        </div>
      </div>

      {/* Form to Generate Code */}
      <form
        onSubmit={handleGenerate}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={
            t.relationshipPlaceholder ||
            (isAr
              ? 'صلة القرابة (مثال: أمي، أبي، الجد)'
              : 'Relationship (e.g. Mother, Father)')
          }
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent text-sm bg-slate-50/50"
          required
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 bg-[#008080] hover:bg-[#006666] text-white font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {isPending
            ? t.generating || (isAr ? 'جاري التوليد...' : 'Generating...')
            : t.generateButton ||
              (isAr ? 'توليد كود ربط جديد' : 'Generate Invite Code')}
        </button>
      </form>

      {/* Active Codes & Caregivers Supervising You */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-[#008080]" />
            {isAr
              ? 'المرافقون المتابِعون لأدويتك والروابط النشطة'
              : 'Caregivers Monitoring Your Medications'}
          </h4>
        </div>

        {isLoading ? (
          <div className="p-4 text-center text-sm text-slate-400">
            {dict?.common?.loading || (isAr ? 'جاري التحميل...' : 'Loading...')}
          </div>
        ) : !myCodes || myCodes.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-xl text-center text-sm text-slate-500 border border-slate-100">
            {t.noCodes ||
              (isAr
                ? 'لم تقم بتوليد أي كود ربط عائلي حتى الآن.'
                : 'You have not generated any family invite codes yet.')}
          </div>
        ) : (
          myCodes.map((item) => (
            <div
              key={item.id}
              className={`p-4 border rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                item.status === 'active'
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-slate-50/60 border-slate-200'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-lg text-[#008080] tracking-wider">
                    {item.invite_code}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      item.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {item.status === 'active'
                      ? item.caregiver_name
                        ? isAr
                          ? `مربوط ومفعّل مع المرافق: ${item.caregiver_name} ✅`
                          : `Linked & Active with Caregiver: ${item.caregiver_name} ✅`
                        : isAr
                          ? 'مربوط ومفعّل مع مرافق ✅'
                          : 'Linked & Active ✅'
                      : t.pendingLink ||
                        (isAr
                          ? 'في انتظار التفعيل من المرافق ⏳'
                          : 'Awaiting Activation ⏳')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span>
                    {t.relation || (isAr ? 'الوصف' : 'Label')}:{' '}
                    {item.patient_label}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {t.alertAfter || (isAr ? 'تنبيه بعد' : 'Alert after')}{' '}
                    {item.alert_delay_minutes}{' '}
                    {t.minutesDelay || (isAr ? 'دقيقة تأخير' : 'mins delay')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => copyToClipboard(item.invite_code)}
                  className="p-2 text-slate-600 hover:text-[#008080] hover:bg-white border border-slate-200 rounded-lg transition-colors"
                  title={isAr ? 'نسخ الكود' : 'Copy Code'}
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => shareViaWhatsApp(item.invite_code)}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-lg transition-colors"
                  title={isAr ? 'مشاركة عبر واتساب' : 'Share via WhatsApp'}
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: item.id, code: item.invite_code })}
                  className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                  title={isAr ? 'إلغاء وحذف كفالة الرعاية' : 'Delete Care Link'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span>
          {isAr
            ? 'الكود آمن ومشفر برمجياً، وعند حذف الكود يتم إلغاء متابعة المرافق فوراً ومسحه من حسابه.'
            : 'When you delete a link, the caregiver will immediately lose access and it will be removed from their account.'}
        </span>
      </div>

      {/* Delete Link Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteLink(deleteTarget.id);
          }
        }}
        isLoading={isDeleting}
        title={isAr ? 'إلغاء وحذف رابط الرعاية' : 'Cancel & Delete Care Link'}
        description={
          isAr
            ? 'هل أنت تأكد من إلغاء وحذف كود الرعاية هذا؟ بمجرد الحذف، سيتم إلغاء متابعة المرافق لأدويتك فوراً ولن يتمكن من تلقي تنبيهات الإغفال.'
            : 'Are you sure you want to delete this care link? Once deleted, the caregiver will immediately lose access to your medication schedule and alerts.'
        }
        itemTitle={deleteTarget?.code}
        locale={locale as 'ar' | 'en'}
      />
    </div>
  );
}
