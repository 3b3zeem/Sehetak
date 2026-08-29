'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Pill, Calendar, Settings } from 'lucide-react';

interface PatientDashboardTabsProps {
  locale: 'en' | 'ar';
  username: string;
  dict: any;
}

export const PatientDashboardTabs: React.FC<PatientDashboardTabsProps> = ({
  locale,
  username,
  dict,
}) => {
  const pathname = usePathname();

  const basePath = `/${locale}/dashboard/${username}`;

  const tabs = [
    {
      id: 'overview',
      label: dict.nav?.dashboard || (locale === 'ar' ? 'الجدول اليومي' : 'Daily Timeline'),
      href: basePath,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      id: 'medications',
      label: dict.nav?.medications || (locale === 'ar' ? 'صيدليتي' : 'Medication Cabinet'),
      href: `${basePath}/medications`,
      exact: false,
      icon: Pill,
    },
    {
      id: 'appointments',
      label: dict.nav?.appointments || (locale === 'ar' ? 'مواعيد الأطباء' : 'Doctor Visits'),
      href: `${basePath}/appointments`,
      exact: false,
      icon: Calendar,
    },
    {
      id: 'settings',
      label: dict.nav?.settings || (locale === 'ar' ? 'الإعدادات والتنبيهات' : 'Settings'),
      href: `${basePath}/settings`,
      exact: false,
      icon: Settings,
    },
  ];

  return (
    <div className="bg-white border border-slate-300 p-2 mb-6 shadow-2xs">
      <nav className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border outline-none focus-visible:ring-2 focus-visible:ring-[#008080] ${
                isActive
                  ? "bg-[#008080] text-white border-[#008080]"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-[#008080]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
