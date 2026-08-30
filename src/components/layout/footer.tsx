'use client';

import React from 'react';
import Link from 'next/link';
import { Pill } from 'lucide-react';

interface FooterProps {
  locale: 'en' | 'ar';
  dict: any;
}

export const Footer: React.FC<FooterProps> = ({ locale, dict }) => {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 py-12 mt-auto">
      <div className="w-full px-4 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xl font-bold text-white">
            <div className="w-8 h-8 rounded-lg bg-[#008080] text-white flex items-center justify-center">
              <Pill className="w-4 h-4" />
            </div>
            <span>{dict.brand?.name}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {dict.brand?.tagline}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-4">{dict.nav?.home}</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href={`/${locale}`} className="hover:text-white transition-colors">{dict.nav?.home}</Link></li>
            <li><Link href={`/${locale}/about`} className="hover:text-white transition-colors">{dict.nav?.about}</Link></li>
            <li><Link href={`/${locale}/contact`} className="hover:text-white transition-colors">{dict.nav?.contact}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href={`/${locale}/terms`} className="hover:text-white transition-colors">{dict.nav?.terms}</Link></li>
            <li><Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">{dict.nav?.privacy}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-4">Sehetak SaaS</h4>
          <p className="text-xs text-slate-400">
            Medical Compliance Platform with Meal-Anchored Scheduling & Telegram Bot Sync.
          </p>
        </div>
      </div>
      <div className="w-full px-4 sm:px-8 mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {dict.brand?.name}. All rights reserved.
      </div>
    </footer>
  );
};
