'use client';

import React, { useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import gsap from 'gsap';

interface ContactAnimatedContentProps {
  dict: any;
}

export const ContactAnimatedContent: React.FC<ContactAnimatedContentProps> = ({ dict }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const infoCardRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Staggered entrance animation
      gsap.from('.contact-animate', {
        y: 25,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power3.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate feedback submission with toast feedback
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        dict.marketing?.contactSuccess || 'Thank you! Your message has been sent successfully.'
      );
      if (formRef.current) formRef.current.reset();
    }, 800);
  };

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto space-y-10 py-8">
      {/* Header */}
      <div className="text-center space-y-3 contact-animate">
        <h1 className="text-3xl font-extrabold text-slate-900">
          {dict.marketing?.contactTitle || 'Get in Touch'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          {dict.marketing?.contactDesc ||
            'Have questions about medication schedules or Telegram bot integration? We are here to help.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info Card */}
        <div
          ref={infoCardRef}
          className="contact-animate bg-slate-900 text-white rounded-2xl p-8 shadow-xl space-y-6 flex flex-col justify-between border border-slate-800"
        >
          <div>
            <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              <span>Support & Inquiries</span>
            </h3>

            <div className="space-y-5 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-3.5 group p-2 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-lg bg-[#008080]/20 text-[#008080] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Email Us</div>
                  <span className="font-medium text-white">support@sehetak.app</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 group p-2 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-lg bg-[#008080]/20 text-[#008080] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Call Support</div>
                  <span className="font-medium text-white">+20 (100) 000-0000</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 group p-2 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-lg bg-[#008080]/20 text-[#008080] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Headquarters</div>
                  <span className="font-medium text-white">Medical Tech District, Cairo, Egypt</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#008080]" />
            <span>Available 24/7 for urgent medication alert support.</span>
          </div>
        </div>

        {/* Contact Form */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="contact-animate bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-4"
        >
          <Input label="Your Name" required placeholder="Full Name" />
          <Input label="Email Address" type="email" required placeholder="name@example.com" />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Message</label>
            <textarea
              rows={4}
              required
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-[#008080] focus:outline-none transition-shadow"
              placeholder="How can we assist you?"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="w-full gap-2 bg-[#008080] hover:bg-[#006666] text-white"
          >
            <Send className="w-4 h-4" />
            <span>Send Message</span>
          </Button>
        </form>
      </div>
    </div>
  );
};
