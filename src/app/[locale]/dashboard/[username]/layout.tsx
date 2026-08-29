import React from "react";
import { getDictionary, Locale } from "@/lib/i18n";
import { PatientDashboardTabs } from "@/components/layout/patient-dashboard-tabs";

export default async function PatientDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale, username } = await params;
  const currentLocale = locale as Locale;
  const dict = getDictionary(currentLocale);

  return (
    <div className="space-y-6 py-4">
      {/* Dynamic Tab Navigation Bar */}
      <PatientDashboardTabs
        locale={currentLocale}
        username={username}
        dict={dict}
      />

      {/* Main Tab View Content */}
      <div>{children}</div>
    </div>
  );
}
