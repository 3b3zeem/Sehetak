import React from 'react';
import './globals.css';
import { Providers } from '@/components/providers';
import { Metadata } from 'next';

const siteUrl = 'https://go-sehetak.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Sehetak - صحتك | المنصة الذكية لإدارة الأدوية والتذكيرات الطبية',
    template: '%s | Sehetak - صحتك',
  },
  description:
    'صحتك هي منصة رعاية صحية ذكية تتيح لك متابعة جدول أدوية اليوم، التذكير المباشر عبر تليجرام وإشعارات المتصفح، وتنظيم المواعيد الطبية لضمان الالتزام العلاجي.',
  keywords: [
    'صحتك',
    'Sehetak',
    'تذكير الأدوية',
    'جدول الجرعات',
    'تليجرام بوت',
    'مواعيد الأطباء',
    'الالتزام العلاجي',
    'تطبيق طبي',
    'Medication Companion',
    'Medical Scheduler',
  ],
  authors: [{ name: 'Sehetak Team' }],
  creator: 'Sehetak',
  publisher: 'Sehetak',
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Sehetak - صحتك | المنصة الذكية لإدارة الأدوية والتذكيرات الطبية',
    description:
      'متابعة وجدولة الجرعات العلاجية والتنبيهات المباشرة عبر التليجرام وإشعارات المتصفح لراحتك وصحتك.',
    siteName: 'Sehetak - صحتك',
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Sehetak Social Preview Card',
        type: 'image/png',
      },
    ],
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sehetak - صحتك | المنصة الذكية لإدارة الأدوية والتذكيرات الطبية',
    description:
      'متابعة وجدولة الجرعات العلاجية والتنبيهات المباشرة عبر التليجرام وإشعارات المتصفح لراحتك وصحتك.',
    images: [`${siteUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#fafcff] text-[#0f172a] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
