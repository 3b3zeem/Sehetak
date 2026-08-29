"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  Globe,
  LogOut,
  Pill,
  Home,
  LayoutDashboard,
  User,
  Menu,
  X,
  Calendar,
  Settings,
  Info,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import gsap from "gsap";
import Image from "next/image";
import { NavMenu } from "./NavMenu";
import { MobileLink } from "./mobileLink";

interface NavbarProps {
  locale: "en" | "ar";
  dict: any;
  userProfile?: { username: string; role: "patient" | "admin" } | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  locale,
  dict,
  userProfile,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [isOpen, setIsOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  // GSAP Scroll Direction Hide / Show Header
  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;
      const currentScrollY = window.scrollY;

      // Hide header when scrolling down after threshold, show when scrolling up
      if (currentScrollY > 60 && currentScrollY > lastScrollY.current) {
        gsap.to(headerRef.current, {
          yPercent: -100,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });
      } else if (currentScrollY < lastScrollY.current) {
        gsap.to(headerRef.current, {
          yPercent: 0,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // GSAP Menu Animation on toggle
  useEffect(() => {
    if (!mobileMenuRef.current) return;

    if (isOpen) {
      gsap.fromTo(
        mobileMenuRef.current,
        { height: 0, opacity: 0 },
        {
          height: "auto",
          opacity: 1,
          duration: 0.35,
          ease: "power3.out",
          display: "block",
        },
      );

      if (menuItemsRef.current) {
        const items = menuItemsRef.current.children;
        gsap.fromTo(
          items,
          { y: 15, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.25,
            stagger: 0.05,
            ease: "power2.out",
            delay: 0.1,
          },
        );
      }
    } else {
      gsap.to(mobileMenuRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: "power3.in",
        display: "none",
      });
    }
  }, [isOpen]);

  const toggleLanguage = () => {
    const nextLocale = locale === "en" ? "ar" : "en";
    const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    router.push(newPath || `/${nextLocale}`);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await supabase.auth.signOut();
    toast.success(
      locale === "ar" ? "تم تسجيل الخروج بنجاح" : "Signed out successfully",
    );
    router.push(`/${locale}/login`);
  };

  const dashboardPath = userProfile
    ? `/${locale}/dashboard/${userProfile.username}`
    : `/${locale}/login`;

  const shortName = userProfile?.username
    ? userProfile.username.split("_")[0]
    : "Profile";

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-300 shadow-sm overflow-x-clip"
    >
      <div className="px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo: logo.svg containing Icon on Left & Text on Right */}
        <Link
          href={`/${locale}`}
          className="flex items-center"
        >
          <Image
            src="/logo.svg"
            alt="sehetak"
            width={160}
            height={40}
            className="h-10 w-auto object-contain"
            priority
            draggable={false}
          />
        </Link>

        {/* Desktop Navigation Links with Shared GSAP Sliding Liquid Blob */}
        <NavMenu
          locale={locale}
          dict={dict}
          userProfile={userProfile}
          dashboardPath={dashboardPath}
        />

        {/* Action Controls & Mobile Trigger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-300"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#008080]" />
            <span>{locale === "en" ? "العربية" : "English"}</span>
          </button>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center gap-2">
            {userProfile ? (
              <>
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

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-600 hover:text-red-600 gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{dict.nav?.logout}</span>
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* GSAP Mobile Menu Trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex items-center justify-center w-9 h-9 bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Toggle Mobile Menu"
          >
            {isOpen ? (
              <X className="w-5 h-5 text-red-600" />
            ) : (
              <Menu className="w-5 h-5 text-[#008080]" />
            )}
          </button>
        </div>
      </div>

      {/* Unified GSAP Animated Mobile & Tablet Drawer Menu */}
      <div
        ref={mobileMenuRef}
        className="hidden md:hidden overflow-hidden bg-white border-b border-slate-300 shadow-lg"
      >
        <div
          ref={menuItemsRef}
          className="px-4 pt-3 pb-6 space-y-2 text-sm font-medium text-slate-700"
        >
          <MobileLink
            href={`/${locale}`}
            icon={Home}
            label={dict.nav?.home}
            onClose={() => setIsOpen(false)}
          />
          <MobileLink
            href={`/${locale}/about`}
            icon={Info}
            label={dict.nav?.about}
            onClose={() => setIsOpen(false)}
          />
          <MobileLink
            href={`/${locale}/contact`}
            icon={Mail}
            label={dict.nav?.contact}
            onClose={() => setIsOpen(false)}
          />

          {userProfile ? (
            <>
              <div className="pt-2 pb-1 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                {locale === "ar" ? "القائمة الشخصية" : "Personal Menu"}
              </div>

              <MobileLink
                href={dashboardPath}
                icon={LayoutDashboard}
                label={dict.nav?.dashboard}
                variant="primary"
                onClose={() => setIsOpen(false)}
              />
              <MobileLink
                href={`${dashboardPath}/medications`}
                icon={Pill}
                label={
                  dict.medications?.title ||
                  (locale === "ar" ? "الأدوية" : "Medications")
                }
                onClose={() => setIsOpen(false)}
              />
              <MobileLink
                href={`${dashboardPath}/appointments`}
                icon={Calendar}
                label={
                  dict.appointments?.title ||
                  (locale === "ar" ? "المواعيد" : "Appointments")
                }
                onClose={() => setIsOpen(false)}
              />
              <MobileLink
                href={`${dashboardPath}/settings`}
                icon={Settings}
                label={
                  dict.settings?.title ||
                  (locale === "ar" ? "الإعدادات" : "Settings")
                }
                onClose={() => setIsOpen(false)}
              />

              {userProfile.role === "admin" && (
                <MobileLink
                  href={`/${locale}/dashboard/admin`}
                  icon={Shield}
                  label={dict.nav?.admin}
                  variant="amber"
                  onClose={() => setIsOpen(false)}
                />
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 text-red-700 font-bold hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>{dict.nav?.logout}</span>
              </button>
            </>
          ) : (
            <div className="pt-3 grid grid-cols-2 gap-2">
              <Link href={`/${locale}/login`} onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full justify-center">
                  {dict.nav?.login}
                </Button>
              </Link>
              <Link
                href={`/${locale}/register`}
                onClick={() => setIsOpen(false)}
              >
                <Button variant="primary" className="w-full justify-center">
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
