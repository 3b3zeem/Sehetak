import React from 'react';
import './globals.css';
import { Providers } from '@/components/providers';
import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://sehetak.app'),
  title: {
    default: 'sehetak - صحتك | المنصة الذكية لإدارة الأدوية والتذكيرات الطبية',
    template: '%s | sehetak - صحتك',
  },
  description:
    'صحتك هي منصة رعاية صحية ذكية تتيح لك متابعة جدول أدوية اليوم، التذكير المباشر عبر تليجرام وإشعارات المتصفح، وتنظيم المواعيد الطبية لضمان الالتزام العلاجي.',
  keywords: [
    'صحتك',
    'Sehatak',
    'تذكير الأدوية',
    'جدول الجرعات',
    'تليجرام بوت',
    'مواعيد الأطباء',
    'الالتزام العلاجي',
    'تطبيق طبي',
    'Medication Companion',
    'Medical Scheduler',
  ],
  authors: [{ name: 'Sehatak Team' }],
  creator: 'Sehatak',
  publisher: 'Sehatak',
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
    title: 'sehetak - صحتك | المنصة الذكية لإدارة الأدوية والتذكيرات الطبية',
    description:
      'متابعة وجدولة الجرعات العلاجية والتنبيهات المباشرة عبر التليجرام وإشعارات المتصفح لراحتك وصحتك.',
    siteName: 'sehetak - صحتك',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'sehetak Social Preview Card',
      },
    ],
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'sehetak - صحتك | المنصة الذكية لإدارة الأدوية والتذكيرات الطبية',
    description:
      'متابعة وجدولة الجرعات العلاجية والتنبيهات المباشرة عبر التليجرام وإشعارات المتصفح لراحتك وصحتك.',
    images: ['/og-image.svg'],
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
