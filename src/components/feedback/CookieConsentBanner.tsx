'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Cookie, ShieldCheck, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';

interface CookieConsentBannerProps {
  locale: 'en' | 'ar';
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ locale }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const consent = localStorage.getItem('sehetak_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (isVisible && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: 0.5, ease: 'back.out(1.4)' }
      );
    }
  }, [isVisible]);

  const handleAcceptAll = () => {
    localStorage.setItem('sehetak_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('sehetak_cookie_consent', 'essential');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      ref={cardRef}
      className="fixed bottom-6 right-6 dir-ltr:right-6 dir-rtl:left-6 z-[9990] max-w-md w-full p-6 bg-slate-900 text-white border-2 border-[#008080] shadow-2xl space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#008080] text-white flex items-center justify-center font-bold shrink-0">
            <Cookie className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-base text-white">
                {locale === 'ar' ? 'إشعار ملفات الكوكيز' : 'Cookie Privacy Policy'}
              </h4>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{locale === 'ar' ? 'جلسات مشفرة وآمنة 100%' : '100% Encrypted & Secure'}</span>
            </span>
          </div>
        </div>

        <button
          onClick={handleEssentialOnly}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        {locale === 'ar'
          ? 'نستخدم الكوكيز الأساسية فقط لتأمين دخولك وحفظ مواعيد الجرعات الطبية. لا نستخدم أي كوكيز تتبع خارجية إطلاقاً.'
          : 'We use essential encrypted cookies to secure your medical session and dose reminders. We never track or share your data.'}
        {' '}
        <Link href={`/${locale}/privacy`} className="underline text-cyan-400 font-bold hover:text-white">
          {locale === 'ar' ? 'اقرأ السياسة الكاملة' : 'Read Full Policy'}
        </Link>
      </p>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
        <Button
          variant="outline"
          size="sm"
          onClick={handleEssentialOnly}
          className="bg-transparent text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white text-xs"
        >
          {locale === 'ar' ? 'الضرورية فقط' : 'Essential Only'}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAcceptAll}
          className="gap-1.5 bg-[#008080] hover:bg-[#006666] text-white font-bold text-xs"
        >
          <Check className="w-4 h-4" />
          <span>{locale === 'ar' ? 'موافق وقبول' : 'Accept & Proceed'}</span>
        </Button>
      </div>
    </div>
  );
};
