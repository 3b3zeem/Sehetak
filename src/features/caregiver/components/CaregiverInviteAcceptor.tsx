'use client';

import React, { useState } from 'react';
import { useAcceptInviteCode } from '../hooks/useCaregiver';
import { UserPlus, KeyRound } from 'lucide-react';

interface CaregiverInviteAcceptorProps {
  dict: any;
  locale: string;
}

export function CaregiverInviteAcceptor({
  dict,
  locale,
}: CaregiverInviteAcceptorProps) {
  const t = dict?.caregiver || {};
  const isAr = locale === 'ar';
  const [code, setCode] = useState('');
  const { mutate: acceptCode, isPending } = useAcceptInviteCode();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    acceptCode(code.trim(), {
      onSuccess: () => {
        setCode('');
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-cyan-50 text-[#0077B6] rounded-xl">
          <UserPlus className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {t.acceptTitle ||
              (isAr
                ? 'إضافة شخص لرعايته (كبار السن)'
                : 'Add Elderly Parent / Relative')}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.acceptDesc ||
              (isAr
                ? 'أدخل كود الربط العائلي المكون من 6 أرقام (مثال: SEH-8492) لمتابعة أدويته وتلقي تنبيهات الإغفال.'
                : 'Enter the 6-character family invite code (e.g. SEH-8492) to monitor their schedule and get missed-dose alerts.')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <KeyRound className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={
              t.codePlaceholder ||
              (isAr
                ? 'أدخل كود الربط (مثال: SEH-8492)'
                : 'Enter Invite Code (e.g. SEH-8492)')
            }
            className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:border-transparent font-mono text-sm uppercase tracking-wider bg-slate-50/50"
            maxLength={10}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isPending || !code.trim()}
          className="px-6 py-2.5 bg-[#0077B6] hover:bg-[#005f93] text-white font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
        >
          {isPending
            ? t.accepting ||
              (isAr ? 'جاري التحقق والربط...' : 'Verifying & Linking...')
            : t.acceptButton ||
              (isAr ? 'ربط ومتابعة الرعاية' : 'Link & Monitor Care')}
        </button>
      </form>
    </div>
  );
}
