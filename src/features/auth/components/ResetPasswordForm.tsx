"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useResetPasswordWithOtp } from "../hooks/useAuth";
import { KeyRound, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

interface ResetPasswordFormProps {
  locale: "en" | "ar";
  dict: any;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  locale,
  dict,
}) => {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const resetMutation = useResetPasswordWithOtp(locale, dict);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError(
        dict.auth?.passwordsDoNotMatch ||
          (locale === "ar"
            ? "كلمتا المرور غير متطابقتين"
            : "Passwords do not match")
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        locale === "ar"
          ? "يجب أن تتكون كلمة المرور من 6 خانات على الأقل"
          : "Password must be at least 6 characters"
      );
      return;
    }

    resetMutation.mutate({
      email: email.trim(),
      token: token.trim(),
      newPassword,
    });
  };

  const isAr = locale === "ar";
  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#0077b6] flex items-center justify-center mb-3 border border-sky-100 shadow-sm">
          <KeyRound className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          {dict.auth?.setNewPasswordTitle || (isAr ? "تعيين كلمة المرور الجديدة" : "Set New Password")}
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          {dict.auth?.setNewPasswordSubtitle ||
            (isAr
              ? "أدخل كود التحقق المرسل لبريدك الإلكتروني وكلمة المرور الجديدة"
              : "Enter the code sent to your email and your new password")}
        </p>
      </div>

      {resetMutation.isError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {(resetMutation.error as any)?.message || "Failed to reset password"}
        </div>
      )}

      {passwordError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {passwordError}
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

        <Input
          label={dict.auth?.otpCodeLabel || (isAr ? "كود الاستعادة (6 أرقام)" : "Reset Code (6 Digits)")}
          type="text"
          required
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder={isAr ? "أدخل الكود المرسل" : "e.g. 123456"}
        />

        <Input
          label={dict.auth?.newPasswordLabel || (isAr ? "كلمة المرور الجديدة" : "New Password")}
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
        />

        <Input
          label={dict.auth?.confirmNewPasswordLabel || (isAr ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password")}
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2 bg-[#008080] hover:bg-[#006666]"
          isLoading={resetMutation.isPending}
        >
          {dict.auth?.confirmPasswordReset || (isAr ? "حفظ كلمة المرور الجديدة" : "Update Password")}
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
