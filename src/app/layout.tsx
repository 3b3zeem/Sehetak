import React from 'react';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata = {
  title: 'Sehatak - صحتك | Bilingual Medical SaaS',
  description: 'Smart meal-anchored medication companion with instant Telegram bot reminders and Web Push integration.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[#fafcff] text-[#0f172a] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
