"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRequestPasswordReset } from "../hooks/useAuth";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";

interface ForgotPasswordFormProps {
  locale: "en" | "ar";
  dict: any;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  locale,
  dict,
}) => {
  const [email, setEmail] = useState("");
  const requestResetMutation = useRequestPasswordReset(locale, dict);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    requestResetMutation.mutate(email);
  };

  const isAr = locale === "ar";
  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#008080] flex items-center justify-center mb-3 border border-teal-100 shadow-sm">
          <Mail className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          {dict.auth?.forgotPasswordTitle || (isAr ? "استعادة كلمة المرور" : "Reset Password")}
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          {dict.auth?.forgotPasswordSubtitle ||
            (isAr
              ? "أدخل بريدك الإلكتروني ليصلك كود استعادة كلمة المرور"
              : "Enter your registered email address to receive a reset code")}
        </p>
      </div>

      {requestResetMutation.isError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {(requestResetMutation.error as any)?.message || "Failed to send reset code"}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={dict.auth?.emailLabel || (isAr ? "البريد الإلكتروني" : "Email Address")}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2 bg-[#008080] hover:bg-[#006666]"
          isLoading={requestResetMutation.isPending}
        >
          {dict.auth?.sendResetCode || (isAr ? "إرسال كود الاستعادة" : "Send Reset Code")}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-600 border-t border-slate-100 pt-4">
        <Link
          href={`/${locale}/login`}
          className="inline-flex items-center gap-1.5 font-bold text-[#008080] hover:underline"
        >
          <BackIcon className="w-3.5 h-3.5" />
          <span>{dict.auth?.backToLogin || (isAr ? "العودة لتسجيل الدخول" : "Back to Login")}</span>
        </Link>
      </div>
    </div>
  );
};
