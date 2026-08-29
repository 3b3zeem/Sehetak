'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Globe, LogOut, Pill, Home, LayoutDashboard, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface NavbarProps {
  locale: 'en' | 'ar';
  dict: any;
  userProfile?: { username: string; role: 'patient' | 'admin' } | null;
}

export const Navbar: React.FC<NavbarProps> = ({ locale, dict, userProfile }) => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'ar' : 'en';
    const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    router.push(newPath || `/${nextLocale}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success(locale === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Signed out successfully');
    router.push(`/${locale}/login`);
  };

  const dashboardPath = userProfile
    ? `/${locale}/dashboard/${userProfile.username}`
    : `/${locale}/login`;

  const shortName = userProfile?.username
    ? userProfile.username.split('_')[0]
    : 'Profile';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2 text-xl font-extrabold text-[#008080]">
          <div className="w-9 h-9 bg-[#008080] text-white flex items-center justify-center font-bold">
            <Pill className="w-5 h-5" />
          </div>
          <span className="tracking-tight">{dict.brand?.name || 'Sehatak'}</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href={`/${locale}`} className="hover:text-[#008080] transition-colors flex items-center gap-1.5">
            <Home className="w-4 h-4" />
            <span>{dict.nav?.home}</span>
          </Link>
          <Link href={`/${locale}/about`} className="hover:text-[#008080] transition-colors">
            {dict.nav?.about}
          </Link>
          <Link href={`/${locale}/contact`} className="hover:text-[#008080] transition-colors">
            {dict.nav?.contact}
          </Link>

          {userProfile && (
            <>
              <Link
                href={dashboardPath}
                className="hover:text-[#008080] transition-colors flex items-center gap-1.5 font-bold text-[#008080]"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{dict.nav?.dashboard}</span>
              </Link>
              {userProfile.role === 'admin' && (
                <Link
                  href={`/${locale}/dashboard/admin`}
                  className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1 hover:bg-amber-200 transition-colors border border-amber-300"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{dict.nav?.admin}</span>
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-300"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#008080]" />
            <span>{locale === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {userProfile ? (
            <div className="flex items-center gap-2">
              {/* Clean, Subtle User Badge Button */}
              <Link href={`${dashboardPath}/settings`}>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-200 hover:text-[#008080] transition-colors cursor-pointer"
                  title="View Settings & Profile"
                >
                  <User className="w-3.5 h-3.5 text-[#008080]" />
                  <span className="capitalize">{shortName}</span>
                </button>
              </Link>

              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-600 hover:text-red-600 gap-1.5">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{dict.nav?.logout}</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href={`/${locale}/login`}>
                <Button variant="outline" size="sm">
                  {dict.nav?.login}
                </Button>
              </Link>
              <Link href={`/${locale}/register`}>
                <Button variant="primary" size="sm">
                  {dict.nav?.register}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
