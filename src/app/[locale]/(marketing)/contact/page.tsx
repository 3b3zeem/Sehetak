import React from 'react';
import { getDictionary, Locale } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: isAr ? 'تواصل معنا | sehetak' : 'Contact Us | sehetak',
    description: isAr
      ? 'تواصل مع فريق منصة صحتك sehetak للاستفسارات والدعم الفني وتلقي المساعدة بشأن التنبيهات الطبية.'
      : 'Get in touch with the sehetak medical support team for any inquiries or technical assistance.',
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900">{dict.marketing?.contactTitle}</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">{dict.marketing?.contactDesc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-lg space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-4">Support & Inquiries</h3>
            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#008080]" />
                <span>support@sehetak.app</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#008080]" />
                <span>+20 (100) 000-0000</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#008080]" />
                <span>Medical Tech District, Cairo, Egypt</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 text-xs text-slate-400">
            Available 24/7 for urgent medication alert support.
          </div>
        </div>

        {/* Contact Form */}
        <form className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-4">
          <Input label="Your Name" required placeholder="Full Name" />
          <Input label="Email Address" type="email" required placeholder="name@example.com" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Message</label>
            <textarea
              rows={4}
              required
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-[#008080] focus:outline-none"
              placeholder="How can we assist you?"
            />
          </div>
          <Button type="submit" variant="primary" className="w-full">
            Send Message
          </Button>
        </form>
      </div>
    </div>
  );
}
