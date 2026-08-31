import React from "react";
import { getDictionary, Locale } from "@/lib/i18n";
import {
  CaregiverInviteGenerator,
  FamilyDashboardView,
} from "@/features/caregiver";

export default async function CaregiverPage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale } = await params;
  const currentLocale = (locale || "ar") as Locale;
  const dict = getDictionary(currentLocale);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* 1. Family Caregiver Overview & Monitoring */}
      <FamilyDashboardView dict={dict} locale={currentLocale} />

      {/* 2. Elder Invite Code Generator Section */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <CaregiverInviteGenerator dict={dict} locale={currentLocale} />
      </div>
    </div>
  );
}
