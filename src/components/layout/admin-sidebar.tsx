'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Pill, Calendar, Shield } from 'lucide-react';
import { clsx } from 'clsx';

interface AdminSidebarProps {
  locale: 'en' | 'ar';
  dict: any;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ locale, dict }) => {
  const pathname = usePathname();

  const navItems = [
    {
      href: `/${locale}/dashboard/admin`,
      label: dict.admin?.overview || 'Overview',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: `/${locale}/dashboard/admin/users`,
      label: dict.admin?.users || 'User Management',
      icon: Users,
      exact: false,
    },
    {
      href: `/${locale}/dashboard/admin/medications`,
      label: dict.admin?.medications || 'Global Medications',
      icon: Pill,
      exact: false,
    },
    {
      href: `/${locale}/dashboard/admin/appointments`,
      label: dict.admin?.appointments || 'Global Appointments',
      icon: Calendar,
      exact: false,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-white">Admin Control</h3>
          <span className="text-xs text-amber-400 font-medium">System Overseer</span>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all',
                isActive
                  ? 'bg-[#008080] text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
